#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function fail(errors, condition, message) { if (!condition) errors.push(message); }

function validateDag(workflow, errors) {
  const steps = workflow.steps || [];
  const ids = new Set(steps.map((step) => step.stepId));
  const lookup = new Map(steps.map((step) => [step.stepId, step]));
  const visiting = new Set(); const visited = new Set();
  const visit = (id) => {
    if (visiting.has(id)) return false;
    if (visited.has(id)) return true;
    visiting.add(id);
    for (const dependency of lookup.get(id)?.dependsOn || []) {
      if (!ids.has(dependency) || !visit(dependency)) return false;
    }
    visiting.delete(id); visited.add(id); return true;
  };
  for (const id of ids) fail(errors, visit(id), `workflow ${workflow.workflowId} must be acyclic`);
}

async function main() {
  const activation = JSON.parse(await readFile(resolve(repoRoot, "tests/activation/skill-selection.json"), "utf8"));
  const composition = JSON.parse(await readFile(resolve(repoRoot, "tests/workflow/composition-cases.json"), "utf8"));
  const manifest = JSON.parse(await readFile(resolve(repoRoot, "packages/cineweave-contracts/contracts/manifest.json"), "utf8"));
  const knownSkills = new Set((manifest.skills || []).map((skill) => skill.name));
  const errors = [];
  const activationIds = new Set();
  for (const test of activation.cases || []) {
    fail(errors, !activationIds.has(test.id), `duplicate activation case ${test.id}`); activationIds.add(test.id);
    fail(errors, knownSkills.has(test.entrySkill), `${test.id} references unknown entry Skill ${test.entrySkill}`);
    if (test.mode === "standalone") {
      fail(errors, test.entrySkill !== "cineweave", `${test.id} standalone case must enter through a specialist`);
      fail(errors, !(test.mustNotRequire || []).includes(test.entrySkill), `${test.id} cannot forbid its own entry Skill`);
    }
    if (test.mode === "router") for (const skill of test.requiresSpecialists || []) fail(errors, knownSkills.has(skill) && skill !== "cineweave", `${test.id} has invalid routed specialist ${skill}`);
  }
  for (const test of composition.cases || []) {
    const workflow = JSON.parse(await readFile(resolve(repoRoot, test.workflowExample), "utf8"));
    validateDag(workflow, errors);
    const steps = new Set((workflow.steps || []).map((step) => step.skill));
    const outputs = new Set((workflow.outputs || []).map((output) => output.contractKind));
    for (const skill of test.requiresSkills || []) fail(errors, steps.has(skill), `${test.id} lacks composed Skill ${skill}`);
    for (const output of test.requiresOutputs || []) fail(errors, outputs.has(output), `${test.id} lacks output ${output}`);
  }
  if (errors.length) { console.error(errors.map((error) => `- ${error}`).join("\n")); process.exitCode = 1; return; }
  console.log(`V2 activation and workflow tests pass: ${(activation.cases || []).length} activation cases, ${(composition.cases || []).length} composition cases.`);
}

main().catch((error) => { console.error(error instanceof Error ? error.stack || error.message : String(error)); process.exitCode = 2; });
