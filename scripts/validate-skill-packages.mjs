#!/usr/bin/env node

import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const skillsRoot = join(repoRoot, "skills");
const manifest = JSON.parse(await readFile(join(repoRoot, "packages", "cineweave-contracts", "contracts", "manifest.json"), "utf8"));
const errors = [];

function frontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return null;
  const values = {};
  for (const line of match[1].split(/\r?\n/)) {
    const item = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (item) values[item[1]] = item[2].replace(/^['"]|['"]$/g, "");
  }
  return values;
}

const directories = (await readdir(skillsRoot, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
const declared = (manifest.skills || []).map((skill) => skill.name).sort();
if (JSON.stringify(directories) !== JSON.stringify(declared)) errors.push("Skill directories and contract manifest skills differ");

for (const name of directories) {
  const root = join(skillsRoot, name);
  const skillPath = join(root, "SKILL.md");
  const agentPath = join(root, "agents", "openai.yaml");
  const contractPath = join(root, "contracts.json");
  for (const path of [skillPath, agentPath, contractPath]) if (!existsSync(path)) errors.push(`${name} is missing ${path.slice(root.length + 1)}`);
  if (!existsSync(skillPath)) continue;
  const text = await readFile(skillPath, "utf8");
  const metadata = frontmatter(text);
  if (!metadata) errors.push(`${name} has invalid YAML frontmatter`);
  else {
    if (metadata.name !== name) errors.push(`${name} frontmatter name does not match its folder`);
    if (!metadata.description || metadata.description.length < 30) errors.push(`${name} needs a discriminating description`);
    for (const key of Object.keys(metadata)) if (!["name", "description"].includes(key)) errors.push(`${name} has unsupported frontmatter key ${key}`);
  }
  if (!/^[a-z0-9-]{1,64}$/.test(name)) errors.push(`${name} is not a valid Skill name`);
  if ((text.match(/\S+/g) || []).length > 5000) errors.push(`${name}/SKILL.md exceeds the 5000-word progressive-disclosure ceiling`);
  if (/\[(?:TO|DO|FIX|ME|T|BD)\b/i.test(text) || /\b(?:TO|DO|FIX|ME|T|BD)\b/.test(text)) errors.push(`${name} contains an unfinished placeholder`);
  if (/CineWeave Web stores/.test(text)) errors.push(`${name} claims a Web runtime that is not part of the Skill package`);
  if (existsSync(agentPath)) {
    const yaml = await readFile(agentPath, "utf8");
    for (const field of ["display_name", "short_description", "default_prompt"]) if (!new RegExp(`^\\s*${field}:`, "m").test(yaml)) errors.push(`${name} agents/openai.yaml lacks ${field}`);
    if (!yaml.includes(`$${name}`)) errors.push(`${name} default_prompt must explicitly mention $${name}`);
  }
  if (existsSync(contractPath)) {
    const index = JSON.parse(await readFile(contractPath, "utf8"));
    if (index.contractPackage !== `cineweave-contracts@${manifest.version}`) errors.push(`${name} contracts.json is not bound to package ${manifest.version}`);
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Skill package validation passed: ${directories.length} focused, discoverable Skills.`);
}
