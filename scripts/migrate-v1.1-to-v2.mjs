#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

function usage() { console.error("Usage: node scripts/migrate-v1.1-to-v2.mjs <input.json> --out <copy.json> --report <report.json> [--schema <schema.json>]"); }
function sha(value) { return `sha256:${createHash("sha256").update(value).digest("hex")}`; }
function stableJson(value) { return `${JSON.stringify(value, null, 2)}\n`; }
function parseArgs(args) {
  const result = { input: args[0] };
  for (let index = 1; index < args.length; index += 2) {
    const flag = args[index]; const value = args[index + 1];
    if (!["--out", "--report", "--schema"].includes(flag) || !value) throw new Error(`Invalid argument: ${flag || "missing"}`);
    result[flag.slice(2)] = value;
  }
  return result;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (!options.input || !options.out || !options.report) { usage(); process.exitCode = 2; return; }
  const inputPath = resolve(options.input); const outPath = resolve(options.out); const reportPath = resolve(options.report);
  if (inputPath === outPath) throw new Error("Migration refuses to overwrite the source file");

  const sourceText = await readFile(inputPath, "utf8");
  const source = JSON.parse(sourceText); const migrated = structuredClone(source);
  const changes = []; const warnings = []; const blockingIssues = [];
  const sourceVersion = source.contractVersion || (/v?(\d+\.\d+\.\d+)/.exec(source?.skillReceipt?.ref || "")?.[1]) || "1.1.x-or-earlier";

  if (migrated.contractVersion !== "2.0.0") {
    migrated.contractVersion = "2.0.0";
    changes.push(`set contractVersion=2.0.0 on migrated copy (source ${sourceVersion})`);
  }
  if (["locked", "active"].includes(source.status)) warnings.push("source is active/locked; import the copy as a new version and never overwrite the original asset");
  if (!source.productionContext && ["cineweave_codex_image_prompt", "cineweave_codex_render_plan"].includes(source.kind)) warnings.push("production refs were not invented; create AssetRecipe, ControlChannelSet, EvidenceBundle, CapabilityProfile and LicenseProfile separately");
  if (!source.interactionConstraints && source.kind === "cineweave_codex_storyboard_sequence") warnings.push("interaction constraints were not invented; bind contacts and prop continuity only from supplied evidence");
  if (source.kind === "cineweave_codex_character_appearance_state" && !source.styling) warnings.push("legacy free-text construction was preserved; structured makeup/hair/costume fields require a human-reviewed new version");

  const outputText = stableJson(migrated); await writeFile(outPath, outputText, "utf8");
  let targetSchemaChecked = false;
  if (options.schema) {
    const validatorPath = fileURLToPath(new URL("./validate-output.mjs", import.meta.url));
    const validation = spawnSync(process.execPath, [validatorPath, resolve(options.schema), outPath], { encoding: "utf8" });
    targetSchemaChecked = validation.status === 0;
    if (!targetSchemaChecked) blockingIssues.push((validation.stderr || validation.stdout || "target schema validation failed").trim());
  }
  const report = {
    kind: "cineweave_contract_migration_report", contractVersion: "2.0.0", sourceVersion, targetVersion: "2.0.0", payloadKind: source.kind || "unknown",
    sourceHash: sha(sourceText), outputHash: sha(outputText), changes,
    preservedFields: ["all supplied facts", "asset IDs and versions", "skillReceipt", "rights and LicenseProfile refs", "Observation IDs", "provenance"],
    warnings, blockingIssues, validation: { sourceUnmodified: true, noFactsInvented: true, targetSchemaChecked },
  };
  await writeFile(reportPath, stableJson(report), "utf8");
  console.log(JSON.stringify({ migratedCopy: outPath, report: reportPath, targetSchemaChecked, blockingIssues: blockingIssues.length }, null, 2));
  if (blockingIssues.length) process.exitCode = 2;
}

main().catch((error) => { console.error(error instanceof Error ? error.stack || error.message : String(error)); process.exitCode = 2; });
