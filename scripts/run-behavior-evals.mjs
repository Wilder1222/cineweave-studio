#!/usr/bin/env node

import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const casePath = join(repoRoot, "tests", "behavior", "cases.json");
const manifestPath = join(repoRoot, "packages", "cineweave-contracts", "contracts", "manifest.json");

function usage() {
  console.error("Usage: node scripts/run-behavior-evals.mjs --validate | --grade <results-dir> [--case <id>]");
}

function add(errors, condition, message) {
  if (!condition) errors.push(message);
}

async function loadDefinitions() {
  const suite = JSON.parse(await readFile(casePath, "utf8"));
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  return { suite, manifest };
}

function validateDefinitions(suite, manifest) {
  const errors = [];
  const knownSkills = new Set((manifest.skills || []).map((skill) => skill.name));
  const routeOwners = new Map();
  for (const skill of manifest.skills || []) {
    for (const route of skill.owns || []) routeOwners.set(route, skill.name);
  }
  const contractOwners = new Map((manifest.contracts || []).map((item) => [item.kind, item.owner]));
  const declaredCategories = new Set(suite.categories || []);
  const requiredCategories = ["direct", "indirect", "incomplete", "negative", "edge"];
  for (const category of requiredCategories) add(errors, declaredCategories.has(category), `missing declared category ${category}`);

  const ids = new Set();
  const coveredCategories = new Set();
  const positiveBySkill = new Map([...knownSkills].map((name) => [name, 0]));
  const negativeBySkill = new Map([...knownSkills].map((name) => [name, 0]));

  for (const item of suite.cases || []) {
    add(errors, typeof item.id === "string" && item.id.length > 0, "case lacks ID");
    add(errors, !ids.has(item.id), `duplicate case ${item.id}`);
    ids.add(item.id);
    add(errors, declaredCategories.has(item.category), `${item.id} has unknown category ${item.category}`);
    coveredCategories.add(item.category);
    add(errors, knownSkills.has(item.targetSkill), `${item.id} has unknown targetSkill ${item.targetSkill}`);
    add(errors, knownSkills.has(item.expectedSkill), `${item.id} has unknown expectedSkill ${item.expectedSkill}`);
    add(errors, routeOwners.get(item.expectedRoute) === item.expectedSkill, `${item.id} route ${item.expectedRoute} is not owned by ${item.expectedSkill}`);
    add(errors, typeof item.request === "string" && item.request.trim().length >= 12, `${item.id} request is too short`);
    add(errors, Array.isArray(item.mustProduce), `${item.id} mustProduce must be an array`);
    add(errors, Array.isArray(item.mustNotProduce), `${item.id} mustNotProduce must be an array`);
    add(errors, Array.isArray(item.behaviorAssertions) && item.behaviorAssertions.length > 0, `${item.id} lacks behavior assertions`);
    for (const kind of [...(item.mustProduce || []), ...(item.mustNotProduce || [])]) {
      add(errors, contractOwners.has(kind), `${item.id} references unknown contract ${kind}`);
    }
    for (const kind of item.mustProduce || []) {
      add(errors, contractOwners.get(kind) === item.expectedSkill, `${item.id} expects ${item.expectedSkill} to produce ${kind}, owned by ${contractOwners.get(kind)}`);
    }
    if (item.expectedSkill === item.targetSkill) positiveBySkill.set(item.targetSkill, positiveBySkill.get(item.targetSkill) + 1);
    if ((item.mustNotActivate || []).includes(item.targetSkill)) negativeBySkill.set(item.targetSkill, negativeBySkill.get(item.targetSkill) + 1);
    for (const skill of item.mustNotActivate || []) add(errors, knownSkills.has(skill), `${item.id} excludes unknown Skill ${skill}`);
  }

  for (const category of requiredCategories) add(errors, coveredCategories.has(category), `no behavior case covers ${category}`);
  for (const skill of knownSkills) {
    add(errors, positiveBySkill.get(skill) > 0, `${skill} lacks a positive activation case`);
    add(errors, negativeBySkill.get(skill) > 0, `${skill} lacks a negative activation case`);
  }
  return errors;
}

async function gradeResults(suite, directory, selectedId) {
  const definitions = new Map((suite.cases || []).map((item) => [item.id, item]));
  const selected = selectedId ? [definitions.get(selectedId)] : [...definitions.values()];
  if (selected.some((item) => !item)) throw new Error(`Unknown case: ${selectedId}`);
  const errors = [];
  let passed = 0;
  for (const item of selected) {
    const path = join(directory, `${item.id}.json`);
    if (!existsSync(path)) { errors.push(`${item.id}: missing result ${path}`); continue; }
    let result;
    try { result = JSON.parse(await readFile(path, "utf8")); }
    catch (error) { errors.push(`${item.id}: invalid result JSON: ${error.message}`); continue; }
    const activated = new Set(result.activatedSkills || []);
    const contracts = new Set(result.contractKinds || []);
    const assertions = new Set(result.behaviorAssertionsPassed || []);
    const local = [];
    add(local, result.caseId === item.id, "caseId mismatch");
    add(local, activated.has(item.expectedSkill), `did not activate ${item.expectedSkill}`);
    for (const skill of item.mustNotActivate || []) add(local, !activated.has(skill), `unexpectedly activated ${skill}`);
    add(local, result.route === item.expectedRoute, `route ${result.route} != ${item.expectedRoute}`);
    for (const kind of item.mustProduce || []) add(local, contracts.has(kind), `missing contract ${kind}`);
    for (const kind of item.mustNotProduce || []) add(local, !contracts.has(kind), `forbidden contract ${kind}`);
    for (const assertion of item.behaviorAssertions || []) add(local, assertions.has(assertion), `ungraded assertion: ${assertion}`);
    if (local.length) errors.push(`${item.id}: ${local.join("; ")}`);
    else passed += 1;
  }
  return { passed, total: selected.length, errors };
}

async function main() {
  const args = process.argv.slice(2);
  const validateOnly = args.includes("--validate");
  const gradeAt = args.indexOf("--grade");
  const caseAt = args.indexOf("--case");
  if (!validateOnly && gradeAt < 0) { usage(); process.exitCode = 1; return; }

  const { suite, manifest } = await loadDefinitions();
  const definitionErrors = validateDefinitions(suite, manifest);
  if (definitionErrors.length) {
    console.error(definitionErrors.map((item) => `- ${item}`).join("\n"));
    process.exitCode = 1;
    return;
  }
  console.log(`Behavior definitions pass: ${(suite.cases || []).length} cases across ${(manifest.skills || []).length} Skills and ${(suite.categories || []).length} categories.`);
  if (validateOnly && gradeAt < 0) return;

  const directoryArg = args[gradeAt + 1];
  if (!directoryArg) { usage(); process.exitCode = 1; return; }
  const directory = resolve(directoryArg);
  const selectedId = caseAt >= 0 ? args[caseAt + 1] : undefined;
  const grade = await gradeResults(suite, directory, selectedId);
  if (grade.errors.length) {
    console.error(grade.errors.map((item) => `- ${item}`).join("\n"));
    process.exitCode = 1;
    return;
  }
  console.log(`Behavior results pass: ${grade.passed}/${grade.total} cases.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 2;
});
