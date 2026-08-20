#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

function usage() {
  console.error("Usage: node scripts/migrate-v0.6-to-v1.mjs <input.json> --out <copy.json> --report <report.json> [--schema <schema.json>]");
}

function sha(value) {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function parseArgs(args) {
  const result = { input: args[0] };
  for (let index = 1; index < args.length; index += 2) {
    const flag = args[index];
    const value = args[index + 1];
    if (!["--out", "--report", "--schema"].includes(flag) || !value) throw new Error(`Invalid argument: ${flag || "missing"}`);
    result[flag.slice(2)] = value;
  }
  return result;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!options.input || !options.out || !options.report) {
    usage();
    process.exitCode = 2;
    return;
  }
  const inputPath = resolve(options.input);
  const outPath = resolve(options.out);
  const reportPath = resolve(options.report);
  if (inputPath === outPath) throw new Error("Migration refuses to overwrite the source file");

  const sourceText = await readFile(inputPath, "utf8");
  const source = JSON.parse(sourceText);
  const migrated = structuredClone(source);
  const changes = [];
  const warnings = [];
  const blockingIssues = [];

  if (migrated.contractVersion === undefined) {
    migrated.contractVersion = "1.0.0";
    changes.push("add contractVersion=1.0.0 to migrated copy");
  } else if (migrated.contractVersion !== "1.0.0") {
    warnings.push(`source contractVersion ${migrated.contractVersion} is retained for review; no unsupported fact migration was attempted`);
  }

  if (["locked", "active"].includes(source.status) && ["cineweave_codex_character_spec", "cineweave_codex_character_appearance_state", "cineweave_codex_scene_spec", "cineweave_codex_scene_state"].includes(source.kind)) {
    warnings.push("source is active/locked; import the copy as a new version and never overwrite the original asset");
  }
  if (source.kind === "cineweave_codex_image_prompt" && !source.sceneBinding) warnings.push("v0.6 image prompt has no SceneBinding; it remains valid but scene continuity is not machine-explicit");
  if (source.kind === "cineweave_codex_storyboard_sequence" && !(source.shots || []).some((shot) => shot.sceneBinding)) warnings.push("v0.6 storyboard has no SceneBinding; it remains valid but scene continuity is not machine-explicit");

  const outputText = stableJson(migrated);
  await writeFile(outPath, outputText, "utf8");

  let targetSchemaChecked = false;
  if (options.schema) {
    const validatorPath = fileURLToPath(new URL("./validate-output.mjs", import.meta.url));
    const validation = spawnSync(process.execPath, [validatorPath, resolve(options.schema), outPath], { encoding: "utf8" });
    targetSchemaChecked = validation.status === 0;
    if (!targetSchemaChecked) blockingIssues.push((validation.stderr || validation.stdout || "target schema validation failed").trim());
  }

  const sourceVersion = source.contractVersion || (/v?(\d+\.\d+\.\d+)/.exec(source?.skillReceipt?.ref || "")?.[1]) || "0.6.x-or-earlier";
  const report = {
    kind: "cineweave_contract_migration_report",
    sourceVersion,
    targetVersion: "1.0.0",
    payloadKind: source.kind || "unknown",
    sourceHash: sha(sourceText),
    outputHash: sha(outputText),
    changes,
    preservedFields: ["all supplied facts", "asset IDs and versions", "skillReceipt", "rights", "Observation IDs", "provenance"],
    warnings,
    blockingIssues,
    validation: { sourceUnmodified: true, noFactsInvented: true, targetSchemaChecked },
  };
  await writeFile(reportPath, stableJson(report), "utf8");
  console.log(JSON.stringify({ migratedCopy: outPath, report: reportPath, targetSchemaChecked, blockingIssues: blockingIssues.length }, null, 2));
  if (blockingIssues.length) process.exitCode = 2;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 2;
});
