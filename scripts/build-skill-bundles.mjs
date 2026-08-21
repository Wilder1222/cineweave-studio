#!/usr/bin/env node

import { cp, mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillsRoot = join(repoRoot, "skills");
const contractRoot = join(repoRoot, "packages", "cineweave-contracts");
const manifestPath = join(contractRoot, "contracts", "manifest.json");

function parseArgs(args) {
  const result = { check: false, out: join(repoRoot, ".build", "skills") };
  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (value === "--check") result.check = true;
    else if (value === "--out" && args[index + 1]) { result.out = resolve(args[index + 1]); index += 1; }
    else throw new Error(`Usage: node scripts/build-skill-bundles.mjs [--check] [--out <directory>]`);
  }
  return result;
}

async function listDirectories(path) {
  const entries = await readdir(path, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory() && !entry.name.startsWith(".")).map((entry) => entry.name).sort();
}

async function listMarkdown(path) {
  const entries = await readdir(path, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const current = join(path, entry.name);
    if (entry.isDirectory()) files.push(...await listMarkdown(current));
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(current);
  }
  return files;
}

function schemaRefs(value, refs = []) {
  if (Array.isArray(value)) {
    for (const item of value) schemaRefs(item, refs);
    return refs;
  }
  if (!value || typeof value !== "object") return refs;
  if (typeof value.$ref === "string" && !value.$ref.startsWith("#")) {
    const document = value.$ref.split("#", 1)[0];
    if (document.endsWith(".schema.json")) {
      if (/^[a-z][a-z0-9+.-]*:/i.test(document) || document.startsWith("/")) {
        throw new Error(`External schema reference is not bundleable: ${value.$ref}`);
      }
      refs.push(document);
    }
  }
  for (const child of Object.values(value)) schemaRefs(child, refs);
  return refs;
}

async function copySchemaTree(sourcePath, destination, copied = new Set()) {
  const absolute = resolve(sourcePath);
  if (copied.has(absolute)) return;
  copied.add(absolute);
  const text = await readFile(absolute, "utf8");
  await writeFile(join(destination, basename(absolute)), text, "utf8");
  const refs = schemaRefs(JSON.parse(text));
  for (const ref of refs) await copySchemaTree(resolve(dirname(absolute), ref), destination, copied);
}

function transformMarkdown(text) {
  return text
    .replaceAll("../../../packages/cineweave-contracts/recipes/", "../resources/recipes/")
    .replaceAll("../../../packages/cineweave-contracts/schemas/", "../resources/contracts/")
    .replaceAll("../../packages/cineweave-contracts/recipes/", "resources/recipes/")
    .replaceAll("../../packages/cineweave-contracts/schemas/", "resources/contracts/");
}

function localTargets(markdown) {
  const targets = [];
  const linkPattern = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  for (const match of markdown.matchAll(linkPattern)) {
    const target = match[1].replace(/^<|>$/g, "");
    if (!target || target.startsWith("#") || /^[a-z][a-z0-9+.-]*:/i.test(target)) continue;
    targets.push(decodeURIComponent(target.split("#", 1)[0]));
  }
  return targets;
}

async function buildSkillBundles(outputRoot) {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const contracts = new Map((manifest.contracts || []).map((item) => [item.kind, item]));
  const skills = await listDirectories(skillsRoot);
  await mkdir(outputRoot, { recursive: true });
  const results = [];

  for (const skillName of skills) {
    const source = join(skillsRoot, skillName);
    const output = join(outputRoot, skillName);
    const contractIndexPath = join(source, "contracts.json");
    if (!existsSync(contractIndexPath)) throw new Error(`${skillName} is missing contracts.json`);
    await cp(source, output, { recursive: true });
    const contractIndex = JSON.parse(await readFile(contractIndexPath, "utf8"));
    const requestedKinds = contractIndex.contractKinds || [];
    const resourceRoot = join(output, "resources", "contracts");
    await mkdir(resourceRoot, { recursive: true });
    await cp(join(contractRoot, "recipes"), join(output, "resources", "recipes"), { recursive: true });
    const copied = new Set();
    const index = [];
    for (const kind of requestedKinds) {
      const contract = contracts.get(kind);
      if (!contract) throw new Error(`${skillName} references unknown contract kind ${kind}`);
      const sourceSchema = join(contractRoot, contract.schema);
      await copySchemaTree(sourceSchema, resourceRoot, copied);
      index.push({ kind, schema: basename(contract.schema), owner: contract.owner });
    }
    await writeFile(join(resourceRoot, "index.json"), `${JSON.stringify({ package: `cineweave-contracts@${manifest.version}`, contracts: index }, null, 2)}\n`, "utf8");
    for (const markdownPath of await listMarkdown(output)) {
      const text = await readFile(markdownPath, "utf8");
      await writeFile(markdownPath, transformMarkdown(text), "utf8");
    }
    results.push({ skillName, output, contracts: index.length });
  }
  return results;
}

async function verifyBundle(outputRoot) {
  const errors = [];
  for (const skillName of await listDirectories(outputRoot)) {
    const root = join(outputRoot, skillName);
    const skillPath = join(root, "SKILL.md");
    const indexPath = join(root, "resources", "contracts", "index.json");
    if (!existsSync(skillPath) || !existsSync(indexPath)) { errors.push(`${skillName} bundle is incomplete`); continue; }
    const skillText = await readFile(skillPath, "utf8");
    if (skillText.includes("packages/cineweave-contracts")) errors.push(`${skillName} bundle retains a repository contract path`);
    const index = JSON.parse(await readFile(indexPath, "utf8"));
    for (const contract of index.contracts || []) {
      if (!existsSync(join(root, "resources", "contracts", contract.schema))) errors.push(`${skillName} lacks bundled schema ${contract.schema}`);
    }
    for (const markdownPath of await listMarkdown(root)) {
      const markdown = await readFile(markdownPath, "utf8");
      if (markdown.includes("packages/cineweave-contracts")) errors.push(`${skillName} bundle has an external contract path in ${relative(root, markdownPath)}`);
      for (const target of localTargets(markdown)) {
        try { await stat(resolve(dirname(markdownPath), target)); }
        catch { errors.push(`${skillName} bundle has a missing local link ${relative(root, markdownPath)} -> ${target}`); }
      }
    }
  }
  if (errors.length) throw new Error(errors.join("\n"));
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.check) {
    const temporary = await mkdtemp(join(tmpdir(), "cineweave-v2-skill-bundles-"));
    try {
      const result = await buildSkillBundles(temporary);
      await verifyBundle(temporary);
      console.log(`Built and verified ${result.length} standalone Skill bundles.`);
    } finally {
      await rm(temporary, { recursive: true, force: true });
    }
    return;
  }
  const target = resolve(options.out);
  if (!target.startsWith(repoRoot) || target === repoRoot || target === skillsRoot) throw new Error("Bundle output must be a dedicated directory inside this repository");
  await rm(target, { recursive: true, force: true });
  const result = await buildSkillBundles(target);
  await verifyBundle(target);
  console.log(JSON.stringify({ output: relative(repoRoot, target), bundles: result }, null, 2));
}

main().catch((error) => { console.error(error instanceof Error ? error.stack || error.message : String(error)); process.exitCode = 2; });
