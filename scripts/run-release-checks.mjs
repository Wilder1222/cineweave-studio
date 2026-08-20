#!/usr/bin/env node

import { mkdtemp, readFile, readdir, writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve, relative } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { validateDocument } from "./validate-output.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const failures = []; const warnings = [];
const fail = (message) => failures.push(message); const warn = (message) => warnings.push(message); const pass = (message) => console.log(`PASS ${message}`);

async function walk(path) {
  const result = [];
  for (const entry of await readdir(path, { withFileTypes: true })) {
    if ([".git", "node_modules"].includes(entry.name)) continue;
    const full = join(path, entry.name);
    if (entry.isDirectory()) result.push(...await walk(full)); else result.push(full);
  }
  return result;
}

async function checkJson() {
  const files = (await walk(repoRoot)).filter((path) => path.endsWith(".json"));
  for (const path of files) try { JSON.parse(await readFile(path, "utf8")); } catch (error) { fail(`invalid JSON ${relative(repoRoot, path)}: ${error.message}`); }
  if (!failures.length) pass(`${files.length} JSON files parse`);
}

async function checkNodeSyntax() {
  const files = (await walk(join(repoRoot, "scripts"))).filter((path) => path.endsWith(".mjs"));
  for (const path of files) {
    const result = spawnSync(process.execPath, ["--check", path], { encoding: "utf8" });
    if (result.status !== 0) fail(`Node syntax failed ${relative(repoRoot, path)}: ${(result.stderr || result.stdout).trim()}`);
  }
  if (!failures.some((item) => item.includes("Node syntax"))) pass(`${files.length} Node scripts parse`);
}

async function checkManifestContracts() {
  const manifest = JSON.parse(await readFile(join(repoRoot, "contracts/manifest.json"), "utf8"));
  const plugin = JSON.parse(await readFile(join(repoRoot, ".codex-plugin/plugin.json"), "utf8"));
  if (manifest.version !== "1.1.0" || plugin.version !== "1.1.0") fail("manifest and plugin versions must both be 1.1.0"); else pass("plugin and contract manifest version are 1.1.0");

  const kinds = new Set();
  for (const item of manifest.contracts) {
    if (kinds.has(item.kind)) fail(`duplicate contract kind in manifest: ${item.kind}`); kinds.add(item.kind);
    const schemaPath = join(repoRoot, item.schema); const examplePath = join(repoRoot, item.example);
    if (!existsSync(schemaPath)) { fail(`missing schema: ${item.schema}`); continue; }
    if (!existsSync(examplePath)) { fail(`missing example: ${item.example}`); continue; }
    const result = await validateDocument(schemaPath, examplePath);
    if (!result.valid) fail(`${item.example} does not validate: ${result.errors.join("; ")}`); else pass(`${item.kind} schema/example`);
  }

  const ownership = new Map();
  for (const skill of manifest.skills) {
    const skillPath = join(repoRoot, "skills", skill.name, "SKILL.md");
    if (!existsSync(skillPath)) { fail(`missing Skill: ${skill.name}`); continue; }
    const text = await readFile(skillPath, "utf8");
    if (!text.includes(`name: ${skill.name}`)) fail(`${skill.name} frontmatter name mismatch`);
    for (const route of skill.owns) {
      if (ownership.has(route)) fail(`route ${route} owned by both ${ownership.get(route)} and ${skill.name}`); ownership.set(route, skill.name);
      if (!text.includes(`\`${route}\``) && !text.includes(route)) fail(`${skill.name} does not document owned route ${route}`);
    }
  }
  if (!failures.some((item) => item.includes("route")) && ownership.size) pass(`${ownership.size} routes have one owner`);
  const requiredSkills = ["cineweave-director", "cineweave-character", "cineweave-scene", "cineweave-production"];
  for (const name of requiredSkills) if (!existsSync(join(repoRoot, "skills", name, "agents/openai.yaml"))) fail(`missing OpenAI interface for ${name}`);
  if (!failures.some((item) => item.includes("OpenAI interface"))) pass("all four Skills expose interface metadata");
}

async function checkRecipeCatalog() {
  const catalog = JSON.parse(await readFile(join(repoRoot, "recipes/catalog.json"), "utf8"));
  if (catalog.version !== "1.1.0") fail("recipe catalog version must be 1.1.0");
  const ids = new Set();
  for (const item of catalog.recipes || []) {
    if (ids.has(item.recipeId)) fail(`duplicate recipe ID: ${item.recipeId}`); ids.add(item.recipeId);
    const path = join(repoRoot, item.path);
    if (!existsSync(path)) { fail(`missing recipe: ${item.path}`); continue; }
    const result = await validateDocument(join(repoRoot, catalog.schema), path);
    if (!result.valid) fail(`${item.path} does not validate: ${result.errors.join("; ")}`);
  }
  if (!failures.some((item) => item.includes("recipe"))) pass(`${ids.size} built-in AssetRecipes validate`);
}

async function runScript(label, script, args = []) {
  const result = spawnSync(process.execPath, [join(repoRoot, script), ...args], { encoding: "utf8" });
  process.stdout.write(result.stdout || ""); process.stderr.write(result.stderr || "");
  if (result.status !== 0) fail(`${label} failed`); else pass(label);
}

async function checkBackwardCompatibility() {
  const temp = await mkdtemp(join(tmpdir(), "cineweave-v11-compat-"));
  try {
    const appearance = JSON.parse(await readFile(join(repoRoot, "examples/character-appearance-state.json"), "utf8"));
    appearance.contractVersion = "1.0.0"; delete appearance.styling;
    const appearancePath = join(temp, "appearance-v10.json"); await writeFile(appearancePath, JSON.stringify(appearance, null, 2));
    const appearanceResult = await validateDocument(join(repoRoot, "schemas/character-appearance-state.schema.json"), appearancePath);
    if (!appearanceResult.valid) fail(`v1.0 appearance compatibility failed: ${appearanceResult.errors.join("; ")}`);

    const image = JSON.parse(await readFile(join(repoRoot, "examples/v1-integrated-image-prompt.json"), "utf8"));
    image.contractVersion = "1.0.0"; delete image.productionContext; delete image.promptBlocks.sceneInteraction; delete image.validation.productionContextResolved; delete image.validation.interactionConstraintsResolved;
    if (image.sceneBinding) { delete image.sceneBinding.interactionConstraints; delete image.sceneBinding.interactionConstraintSetRef; }
    const imagePath = join(temp, "image-v10.json"); await writeFile(imagePath, JSON.stringify(image, null, 2));
    const imageResult = await validateDocument(join(repoRoot, "schemas/image-prompt-output.schema.json"), imagePath);
    if (!imageResult.valid) fail(`v1.0 image compatibility failed: ${imageResult.errors.join("; ")}`);

    const v06 = structuredClone(image); delete v06.contractVersion; delete v06.sceneBinding;
    for (const key of ["sceneGeography", "sceneArchitecture", "sceneMaterials", "sceneLighting", "sceneAtmosphere", "spatialContinuity"]) delete v06.promptBlocks[key];
    delete v06.validation.sceneBindingResolved; delete v06.validation.crossSkillReceiptsChecked;
    const v06Path = join(temp, "image-v06.json"); await writeFile(v06Path, JSON.stringify(v06, null, 2));
    const v06Result = await validateDocument(join(repoRoot, "schemas/image-prompt-output.schema.json"), v06Path);
    if (!v06Result.valid) fail(`v0.6-style image compatibility failed: ${v06Result.errors.join("; ")}`);

    if (!failures.some((item) => item.includes("compatibility failed"))) pass("v1.0 and v0.6-style payloads remain valid");
  } finally { await rm(temp, { recursive: true, force: true }); }
}

async function checkMigration() {
  const temp = await mkdtemp(join(tmpdir(), "cineweave-v11-migrate-"));
  try {
    const source = JSON.parse(await readFile(join(repoRoot, "examples/character-appearance-state.json"), "utf8"));
    source.contractVersion = "1.0.0"; delete source.styling;
    const input = join(temp, "source.json"); const out = join(temp, "migrated.json"); const report = join(temp, "report.json");
    await writeFile(input, JSON.stringify(source, null, 2));
    const result = spawnSync(process.execPath, [join(repoRoot, "scripts/migrate-v1-to-v1.1.mjs"), input, "--out", out, "--report", report, "--schema", join(repoRoot, "schemas/character-appearance-state.schema.json")], { encoding: "utf8" });
    if (result.status !== 0) fail(`migration smoke test failed: ${(result.stderr || result.stdout).trim()}`);
    else {
      const migrated = JSON.parse(await readFile(out, "utf8")); const migrationReport = JSON.parse(await readFile(report, "utf8"));
      if (migrated.contractVersion !== "1.1.0" || migrationReport.targetVersion !== "1.1.0" || migrationReport.validation.targetSchemaChecked !== true) fail("migration did not produce a schema-checked v1.1 copy");
      else pass("v1.0-to-v1.1 migration creates a non-destructive schema-checked copy");
    }
  } finally { await rm(temp, { recursive: true, force: true }); }
}

async function checkSecurity() {
  const files = await walk(repoRoot); const textFiles = files.filter((path) => /\.(?:json|md|mjs|yaml|yml)$/.test(path));
  const patterns = [
    [/(?:api[_-]?key|access[_-]?token|secret)["'\s]*[:=]["'\s]*[A-Za-z0-9_-]{20,}/i, "possible secret"],
    [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, "private key"],
    [/https?:\/\/[^\s"')]+\?(?:[^\s"')]*)(?:token|signature|sig|expires)=/i, "signed URL"],
    [/(?:^|["'\s])\/(?:Users|home)\/[^\s"']+/m, "private absolute path"],
    [new RegExp(`\\b(?:${["TO", "DO"].join("")}|${["FIX", "ME"].join("")}|${["T", "BD"].join("")})\\b`), "unfinished placeholder"],
  ];
  for (const path of textFiles) {
    const content = await readFile(path, "utf8");
    for (const [pattern, label] of patterns) if (pattern.test(content)) fail(`${label} in ${relative(repoRoot, path)}`);
  }
  if (!failures.some((item) => ["possible secret", "private key", "signed URL", "private absolute path", "unfinished placeholder"].some((label) => item.includes(label)))) pass("security, privacy and placeholder scan");
}

async function main() {
  await checkJson(); await checkNodeSyntax(); await checkManifestContracts(); await checkRecipeCatalog();
  await runScript("v1.1 semantic positive and negative tests", "scripts/validate-v1-semantics.mjs", ["--self-test"]);
  await runScript("ControlBench cross-contract tests", "scripts/validate-control-bench.mjs", ["--self-test"]);
  await checkBackwardCompatibility(); await checkMigration(); await checkSecurity();
  for (const warning of warnings) console.warn(`WARN ${warning}`);
  if (failures.length) { console.error(`\nRelease checks failed (${failures.length}):`); for (const item of failures) console.error(`- ${item}`); process.exitCode = 1; return; }
  console.log("\nCineWeave Creative Skills v1.1 release checks passed.");
}

main().catch((error) => { console.error(error instanceof Error ? error.stack || error.message : String(error)); process.exitCode = 1; });
