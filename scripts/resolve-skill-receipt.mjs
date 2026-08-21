#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { dirname, relative, resolve, sep } from "node:path";

const execFileAsync = promisify(execFile);

function usage() {
  console.error("Usage: node scripts/resolve-skill-receipt.mjs [repo-root] [skill-file] [--allow-dirty]");
}

async function git(repoRoot, args) {
  const result = await execFileAsync("git", ["-C", repoRoot, ...args], { windowsHide: true });
  return result.stdout.trim();
}

function normalizeRepository(remote) {
  const value = remote.trim();
  if (value.startsWith("git@github.com:")) return `https://github.com/${value.slice("git@github.com:".length).replace(/\.git$/i, "")}`;
  return value.replace(/\.git\/?$/i, "");
}

async function listSkillFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const absolutePath = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listSkillFiles(absolutePath));
    else if (entry.isFile()) files.push(absolutePath);
  }
  return files;
}

async function hashSkillBundle(skillRoot) {
  const files = await listSkillFiles(skillRoot);
  if (!files.length) throw new Error(`skill bundle is empty: ${skillRoot}`);
  const manifest = ["cineweave-skill-bundle-v2\n"];
  for (const file of files.sort()) {
    const relativePath = relative(skillRoot, file).split(sep).join("/");
    const digest = createHash("sha256").update(await readFile(file)).digest("hex");
    manifest.push(`${relativePath}\0${digest}\n`);
  }
  return `sha256:${createHash("sha256").update(manifest.join(""), "utf8").digest("hex")}`;
}

async function resolveRef(repoRoot, commit) {
  try {
    return await git(repoRoot, ["symbolic-ref", "--short", "HEAD"]);
  } catch {
    try {
      return await git(repoRoot, ["describe", "--tags", "--exact-match", commit]);
    } catch {
      return `detached:${commit.slice(0, 12)}`;
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const allowDirty = args.includes("--allow-dirty");
  const positional = args.filter((arg) => arg !== "--allow-dirty");
  if (positional.length > 2) {
    usage();
    process.exitCode = 2;
    return;
  }

  const repoRoot = resolve(positional[0] ?? process.cwd());
  const skillFile = resolve(repoRoot, positional[1] ?? "skills/cineweave-director/SKILL.md");

  try {
    const status = await git(repoRoot, ["status", "--porcelain"]);
    if (status && !allowDirty) throw new Error("skill repository is dirty; commit the loaded Skill or pass --allow-dirty for local diagnostics");
    const remote = normalizeRepository(await git(repoRoot, ["remote", "get-url", "origin"]));
    const commit = await git(repoRoot, ["rev-parse", "HEAD"]);
    const ref = await resolveRef(repoRoot, commit);
    const contentHash = await hashSkillBundle(dirname(skillFile));

    if (!/^https:\/\/(www\.)?github\.com\/[^/]+\/[^/]+$/.test(remote)) throw new Error(`origin is not a GitHub HTTPS repository: ${remote}`);
    if (!/^[0-9a-f]{40}$/i.test(commit)) throw new Error(`HEAD is not a full Git commit: ${commit}`);

    console.log(JSON.stringify({
      repository: remote,
      ref,
      commit,
      contentHash,
      installedBy: "codex-environment",
      usedAt: new Date().toISOString()
    }, null, 2));
  } catch (error) {
    console.error(JSON.stringify({
      valid: false,
      error: {
        code: "SKILL_RECEIPT_UNAVAILABLE",
        message: error instanceof Error ? error.message : String(error)
      }
    }, null, 2));
    process.exitCode = 2;
  }
}

main();
