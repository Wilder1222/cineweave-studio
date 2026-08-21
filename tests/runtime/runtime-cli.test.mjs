import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { initProject, putArtifact, recordApproval } from "../../packages/cineweave-runtime/src/artifact-store.mjs";

const cli = resolve("packages/cineweave-runtime/bin/cineweave.mjs");
const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64");

function run(args) {
  return spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" });
}

test("runtime CLI exposes graph, stale, gate and verified bundle transfer", async () => {
  const sandbox = await mkdtemp(join(tmpdir(), "cineweave-runtime-cli-"));
  try {
    const source = join(sandbox, "source");
    const bundle = join(sandbox, "bundle");
    const target = join(sandbox, "target");
    await initProject(source, { projectId: "project.runtime-cli", createdAt: "2026-08-21T10:00:00.000Z" });
    const artifact = await putArtifact(source, { kind: "example_contract", value: 1 }, { id: "artifact.runtime-cli", version: 1, createdAt: "2026-08-21T10:00:00.000Z" });

    const graph = run(["graph", source]);
    assert.equal(graph.status, 0, graph.stderr);
    assert.equal(JSON.parse(graph.stdout).summary.artifactCount, 1);
    const stale = run(["stale", source]);
    assert.equal(stale.status, 0, stale.stderr);
    assert.equal(JSON.parse(stale.stdout).staleReferenceCount, 0);

    const blocked = run(["gate", source, artifact.path]);
    assert.equal(blocked.status, 3, blocked.stderr);
    assert.equal(JSON.parse(blocked.stdout).gate.allowed, false);
    await recordApproval(source, artifact.envelope.artifactRef, { decision: "approved", actor: "reviewer", decidedAt: "2026-08-21T10:01:00.000Z" });
    const allowed = run(["gate", source, artifact.path]);
    assert.equal(allowed.status, 0, allowed.stderr);
    assert.equal(JSON.parse(allowed.stdout).gate.allowed, true);

    const referencePath = join(sandbox, "reference.png");
    await writeFile(referencePath, png);
    const ingested = run(["reference-ingest", source, referencePath]);
    assert.equal(ingested.status, 0, ingested.stderr);
    const ingestedBody = JSON.parse(ingested.stdout);
    assert.equal(ingestedBody.envelope.payload.kind, "cineweave_codex_reference_asset");
    assert.equal(ingestedBody.envelope.payload.rights.status, "unknown");
    const listed = run(["list", source]);
    assert.equal(listed.status, 0, listed.stderr);
    const referenceEnvelope = JSON.parse(listed.stdout).find((item) => item.artifactRef.kind === "cineweave_codex_reference_asset");
    assert(referenceEnvelope?.path);
    const referenceVerified = run(["reference-verify", source, referenceEnvelope.path]);
    assert.equal(referenceVerified.status, 0, referenceVerified.stderr);
    assert.equal(JSON.parse(referenceVerified.stdout).verification.valid, true);

    const exported = run(["export", source, bundle]);
    assert.equal(exported.status, 0, exported.stderr);
    const verified = run(["bundle-verify", bundle]);
    assert.equal(verified.status, 0, verified.stderr);
    assert.equal(JSON.parse(verified.stdout).valid, true);
    const imported = run(["import", bundle, target]);
    assert.equal(imported.status, 0, imported.stderr);
    assert.equal(JSON.parse(imported.stdout).verification.valid, true);
  } finally { await rm(sandbox, { recursive: true, force: true }); }
});
