#!/usr/bin/env node

import { readFile, readdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixtureRoot = join(repoRoot, "tests", "fixtures", "evals");

function isObject(value) { return value !== null && typeof value === "object" && !Array.isArray(value); }
function nonEmpty(value) { return typeof value === "string" && value.trim().length > 0; }
function add(errors, condition, message) { if (!condition) errors.push(message); }

function validateModernFixture(file, payload, errors) {
  add(errors, nonEmpty(payload?.suite), `${file}: suite is required`);
  add(errors, nonEmpty(payload?.version), `${file}: version is required`);
  add(errors, nonEmpty(payload?.purpose), `${file}: purpose is required`);
  add(errors, Array.isArray(payload?.cases) && payload.cases.length > 0, `${file}: cases must be a non-empty array`);
  const ids = new Set();
  for (const item of payload?.cases || []) {
    const id = String(item?.id ?? "");
    add(errors, id.length > 0, `${file}: case lacks id`);
    add(errors, !ids.has(id), `${file}: duplicate case id ${id}`);
    ids.add(id);
    add(errors, nonEmpty(item?.prompt), `${file}:${id} prompt is required`);
    add(errors, nonEmpty(item?.mode) || nonEmpty(item?.route), `${file}:${id} needs a mode or route`);
    add(errors, nonEmpty(item?.expectedOutput) || nonEmpty(item?.expectedContract), `${file}:${id} needs expectedOutput or expectedContract`);
    add(errors, Array.isArray(item?.assertions) && item.assertions.length > 0 && item.assertions.every(nonEmpty), `${file}:${id} needs non-empty assertions`);
    if (item?.loads !== undefined) add(errors, Array.isArray(item.loads) && item.loads.every(nonEmpty), `${file}:${id} loads must be a string array when supplied`);
  }
}

function validateLegacyFixture(file, payload, errors) {
  add(errors, nonEmpty(payload?.skill_name), `${file}: skill_name is required`);
  add(errors, Array.isArray(payload?.evals) && payload.evals.length > 0, `${file}: evals must be a non-empty array`);
  const ids = new Set();
  for (const item of payload?.evals || []) {
    const id = String(item?.id ?? "");
    add(errors, id.length > 0, `${file}: legacy eval lacks id`);
    add(errors, !ids.has(id), `${file}: duplicate legacy eval id ${id}`);
    ids.add(id);
    add(errors, nonEmpty(item?.prompt), `${file}:${id} prompt is required`);
    add(errors, nonEmpty(item?.expected_output), `${file}:${id} expected_output is required`);
    if (item?.files !== undefined) add(errors, Array.isArray(item.files), `${file}:${id} files must be an array when supplied`);
  }
}

async function main() {
  const errors = [];
  let modern = 0;
  let legacy = 0;
  let skippedContracts = 0;
  const entries = (await readdir(fixtureRoot, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .sort((left, right) => left.name.localeCompare(right.name));
  for (const entry of entries) {
    const file = entry.name;
    let payload;
    try { payload = JSON.parse(await readFile(join(fixtureRoot, file), "utf8")); }
    catch (error) { errors.push(`${file}: invalid JSON: ${error.message}`); continue; }
    if (payload?.kind === "cineweave_codex_control_benchmark") { skippedContracts += 1; continue; }
    if (isObject(payload) && "suite" in payload) { modern += 1; validateModernFixture(file, payload, errors); continue; }
    if (isObject(payload) && "skill_name" in payload) { legacy += 1; validateLegacyFixture(file, payload, errors); continue; }
    errors.push(`${file}: unrecognized evaluation fixture shape`);
  }
  if (errors.length) {
    console.error(errors.map((item) => `- ${item}`).join("\n"));
    process.exitCode = 1;
    return;
  }
  console.log(`Evaluation fixtures pass: ${modern} modern suites, ${legacy} legacy suite, ${skippedContracts} formal benchmark contract.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 2;
});
