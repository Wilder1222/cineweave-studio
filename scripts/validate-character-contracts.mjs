#!/usr/bin/env node

// v0.6 compatibility entrypoint. It preserves both documented modes:
// --self-test and <schema.json> <payload.json>.
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
let status = 2;
if (args.length === 1 && args[0] === "--self-test") {
  status = spawnSync(process.execPath, [resolve(scriptDir, "validate-v1-semantics.mjs"), "--character-self-test"], { stdio: "inherit" }).status ?? 1;
} else if (args.length === 2) {
  const structural = spawnSync(process.execPath, [resolve(scriptDir, "validate-output.mjs"), ...args], { stdio: "inherit" });
  if (structural.status === 0) {
    status = spawnSync(process.execPath, [resolve(scriptDir, "validate-v1-semantics.mjs"), args[1]], { stdio: "inherit" }).status ?? 1;
  } else status = structural.status ?? 1;
} else {
  console.error("Usage: node scripts/validate-character-contracts.mjs --self-test | <schema.json> <payload.json>");
}
process.exitCode = status;
