#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { initProject, listArtifacts, putArtifact, readStrictJson, recordApproval, verifyProject } from "../src/artifact-store.mjs";
import { sha256Canonical } from "../src/canonical-json.mjs";

function parseArgs(values) {
  const positional = [];
  const flags = {};
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (!value.startsWith("--")) positional.push(value);
    else {
      const key = value.slice(2);
      const next = values[index + 1];
      if (!next || next.startsWith("--")) flags[key] = true;
      else { flags[key] = next; index += 1; }
    }
  }
  return { positional, flags };
}

function usage() {
  return [
    "cineweave-studio init <project> --id <project-id> --name <name>",
    "cineweave-studio hash <json-file>",
    "cineweave-studio put <project> <json-file> --id <id> [--kind <kind>] [--version <n>]",
    "cineweave-studio approve <project> <artifact-envelope> --decision approved|rejected --actor <name> [--rationale <text>]",
    "cineweave-studio list <project>",
    "cineweave-studio verify <project>"
  ].join("\n");
}

async function main() {
  const [command, ...rest] = process.argv.slice(2);
  const { positional, flags } = parseArgs(rest);
  if (command === "init") {
    if (!positional[0]) throw new Error(usage());
    console.log(JSON.stringify(await initProject(resolve(positional[0]), { projectId: flags.id, name: flags.name }), null, 2));
    return;
  }
  if (command === "hash") {
    if (!positional[0]) throw new Error(usage());
    console.log(sha256Canonical(await readStrictJson(resolve(positional[0]))));
    return;
  }
  if (command === "put") {
    if (!positional[0] || !positional[1] || !flags.id) throw new Error(usage());
    const payload = await readStrictJson(resolve(positional[1]));
    const result = await putArtifact(resolve(positional[0]), payload, {
      id: flags.id,
      kind: flags.kind || payload.kind,
      version: flags.version ? Number(flags.version) : 1,
      status: flags.status,
      createdBy: flags["created-by"]
    });
    console.log(JSON.stringify(result.envelope, null, 2));
    return;
  }
  if (command === "approve") {
    if (!positional[0] || !positional[1] || !flags.decision || !flags.actor) throw new Error(usage());
    const envelope = await readStrictJson(resolve(positional[1]));
    const result = await recordApproval(resolve(positional[0]), envelope.artifactRef, {
      decision: flags.decision,
      actor: flags.actor,
      rationale: flags.rationale
    });
    console.log(JSON.stringify(result.record, null, 2));
    return;
  }
  if (command === "list") {
    if (!positional[0]) throw new Error(usage());
    const artifacts = await listArtifacts(resolve(positional[0]));
    console.log(JSON.stringify(artifacts.map(({ path, envelope }) => ({ path, artifactRef: envelope.artifactRef, status: envelope.status })), null, 2));
    return;
  }
  if (command === "verify") {
    if (!positional[0]) throw new Error(usage());
    const report = await verifyProject(resolve(positional[0]));
    console.log(JSON.stringify(report, null, 2));
    if (!report.valid) process.exitCode = 1;
    return;
  }
  throw new Error(usage());
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 2; });
}
