import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { initProject, putArtifact, recordApproval, verifyProject } from "../../packages/cineweave-runtime/src/artifact-store.mjs";
import { BUNDLE_MANIFEST_NAME, exportProjectBundle, importProjectBundle, verifyProjectBundle } from "../../packages/cineweave-runtime/src/project-bundle.mjs";
import { sha256Bytes, sha256Canonical } from "../../packages/cineweave-runtime/src/canonical-json.mjs";

const createdAt = "2026-08-21T09:00:00.000Z";

test("project bundle export and import preserve immutable records and execution bytes", async () => {
  const sandbox = await mkdtemp(join(tmpdir(), "cineweave-bundle-roundtrip-"));
  try {
    const source = join(sandbox, "source-project");
    const bundle = join(sandbox, "transfer-bundle");
    const target = join(sandbox, "target-project");
    await initProject(source, { projectId: "project.bundle-roundtrip", createdAt });
    const artifact = await putArtifact(source, { kind: "example_contract", value: "preserved" }, { id: "artifact.bundle", version: 1, createdAt });
    await recordApproval(source, artifact.envelope.artifactRef, { decision: "approved", actor: "reviewer", decidedAt: createdAt });
    const outputPath = join(source, ".cineweave", "executions", "request.bundle", "frame.svg");
    await mkdir(join(source, ".cineweave", "executions", "request.bundle"), { recursive: true });
    await writeFile(outputPath, "<svg xmlns=\"http://www.w3.org/2000/svg\"></svg>", "utf8");

    const exported = await exportProjectBundle(source, bundle, { createdAt });
    assert.equal(exported.manifest.summary.artifactEnvelopeCount, 1);
    assert.equal(exported.manifest.summary.approvalRecordCount, 1);
    assert.equal(exported.manifest.summary.executionOutputCount, 1);
    assert.equal(exported.manifest.summary.referenceBlobCount, 0);
    assert.equal(exported.manifest.contentPolicy.containsReferenceMedia, false);
    assert.equal((await verifyProjectBundle(bundle)).valid, true);

    const imported = await importProjectBundle(bundle, target);
    assert.equal(imported.verification.valid, true);
    assert.deepEqual(await verifyProject(target), await verifyProject(source));
    assert.deepEqual(await readFile(join(target, ".cineweave", "project.json")), await readFile(join(source, ".cineweave", "project.json")));
    assert.deepEqual(await readFile(join(target, ".cineweave", "executions", "request.bundle", "frame.svg")), await readFile(outputPath));
    await assert.rejects(() => importProjectBundle(bundle, target), /already has a \.cineweave store/);
    await assert.rejects(() => exportProjectBundle(source, bundle), /destination already exists/);
  } finally { await rm(sandbox, { recursive: true, force: true }); }
});

test("bundle verification rejects tampered bytes and unexpected files", async () => {
  const sandbox = await mkdtemp(join(tmpdir(), "cineweave-bundle-tamper-"));
  try {
    const source = join(sandbox, "source-project");
    const bundle = join(sandbox, "transfer-bundle");
    await initProject(source, { projectId: "project.bundle-tamper", createdAt });
    await putArtifact(source, { kind: "example_contract", value: 1 }, { id: "artifact.bundle-tamper", version: 1, createdAt });
    const exported = await exportProjectBundle(source, bundle, { createdAt });
    const artifactEntry = exported.manifest.entries.find((entry) => entry.category === "artifact_envelope");
    await writeFile(join(bundle, ...artifactEntry.path.split("/")), "tampered", "utf8");
    await assert.rejects(() => verifyProjectBundle(bundle), /verification failed/);

    await rm(bundle, { recursive: true, force: true });
    await exportProjectBundle(source, bundle, { createdAt });
    await writeFile(join(bundle, "unexpected.txt"), "not listed", "utf8");
    await assert.rejects(() => verifyProjectBundle(bundle), /Unexpected file/);
  } finally { await rm(sandbox, { recursive: true, force: true }); }
});

test("bundle parser rejects path escape, backslash and duplicate entry attempts", async () => {
  const sandbox = await mkdtemp(join(tmpdir(), "cineweave-bundle-path-"));
  try {
    const source = join(sandbox, "source-project");
    const bundle = join(sandbox, "transfer-bundle");
    await initProject(source, { projectId: "project.bundle-path", createdAt });
    await exportProjectBundle(source, bundle, { createdAt });
    const manifestPath = join(bundle, BUNDLE_MANIFEST_NAME);
    const original = JSON.parse(await readFile(manifestPath, "utf8"));

    const escaped = structuredClone(original);
    escaped.entries[0].path = "store/../project.json";
    await writeFile(manifestPath, JSON.stringify(escaped, null, 2), "utf8");
    await assert.rejects(() => verifyProjectBundle(bundle), /Unsafe bundle entry path/);

    const backslash = structuredClone(original);
    backslash.entries[0].path = "store\\project.json";
    await writeFile(manifestPath, JSON.stringify(backslash, null, 2), "utf8");
    await assert.rejects(() => verifyProjectBundle(bundle), /Unsafe bundle entry path/);

    const duplicate = structuredClone(original);
    duplicate.entries.push(structuredClone(duplicate.entries[0]));
    await writeFile(manifestPath, JSON.stringify(duplicate, null, 2), "utf8");
    await assert.rejects(() => verifyProjectBundle(bundle), /Duplicate bundle entry path|entries must be sorted/);
  } finally { await rm(sandbox, { recursive: true, force: true }); }
});

test("bundle export rejects symbolic links when the platform permits creating them", async (context) => {
  const sandbox = await mkdtemp(join(tmpdir(), "cineweave-bundle-link-"));
  try {
    const source = join(sandbox, "source-project");
    const bundle = join(sandbox, "transfer-bundle");
    await initProject(source, { projectId: "project.bundle-link", createdAt });
    const approvals = join(source, ".cineweave", "approvals");
    await mkdir(approvals, { recursive: true });
    try {
      await symlink(join(source, ".cineweave", "project.json"), join(approvals, `${"a".repeat(64)}.json`), "file");
    } catch (error) {
      if (["EPERM", "EACCES", "ENOTSUP"].includes(error?.code)) { context.skip("platform does not permit an unprivileged symlink fixture"); return; }
      throw error;
    }
    await assert.rejects(() => exportProjectBundle(source, bundle), /Symbolic links are not allowed/);
  } finally { await rm(sandbox, { recursive: true, force: true }); }
});

test("bundle integrity alone cannot bypass staged project semantic verification", async () => {
  const sandbox = await mkdtemp(join(tmpdir(), "cineweave-bundle-semantic-"));
  try {
    const source = join(sandbox, "source-project");
    const bundle = join(sandbox, "transfer-bundle");
    const target = join(sandbox, "target-project");
    await initProject(source, { projectId: "project.bundle-semantic", createdAt });
    await exportProjectBundle(source, bundle, { createdAt });
    const manifestPath = join(bundle, BUNDLE_MANIFEST_NAME);
    const projectPath = join(bundle, "store", "project.json");
    const project = JSON.parse(await readFile(projectPath, "utf8"));
    project.kind = "forged_project_manifest";
    const projectBytes = Buffer.from(`${JSON.stringify(project, null, 2)}\n`, "utf8");
    await writeFile(projectPath, projectBytes);

    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    const entry = manifest.entries.find((item) => item.path === "store/project.json");
    entry.contentHash = sha256Bytes(projectBytes);
    entry.byteLength = projectBytes.byteLength;
    manifest.sourceProject.projectManifestHash = entry.contentHash;
    manifest.summary.totalBytes = manifest.entries.reduce((total, item) => total + item.byteLength, 0);
    manifest.bundleHash = sha256Canonical({
      bundleFormatVersion: manifest.bundleFormatVersion,
      sourceProject: manifest.sourceProject,
      purpose: manifest.purpose,
      contentPolicy: manifest.contentPolicy,
      storeDirectory: manifest.storeDirectory,
      entries: manifest.entries,
      summary: manifest.summary
    });
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    assert.equal((await verifyProjectBundle(bundle)).valid, true);
    await assert.rejects(() => importProjectBundle(bundle, target), /Imported project verification failed.*project kind/i);
  } finally { await rm(sandbox, { recursive: true, force: true }); }
});

test("V2.5 bundles carry a V2.2 project without rewriting its manifest", async () => {
  const sandbox = await mkdtemp(join(tmpdir(), "cineweave-bundle-v22-"));
  try {
    const source = join(sandbox, "source-project");
    const bundle = join(sandbox, "transfer-bundle");
    const target = join(sandbox, "target-project");
    await mkdir(join(source, ".cineweave"), { recursive: true });
    const legacy = {
      kind: "cineweave_project_manifest",
      contractVersion: "2.2.0",
      projectId: "project.bundle-v22",
      name: "V2.2 Bundle",
      createdAt,
      runtimeVersion: "2.2.0",
      storage: { mode: "local_immutable", artifactDirectory: "artifacts", approvalDirectory: "approvals" }
    };
    await writeFile(join(source, ".cineweave", "project.json"), `${JSON.stringify(legacy, null, 2)}\n`, "utf8");
    await exportProjectBundle(source, bundle, { createdAt });
    await importProjectBundle(bundle, target);
    assert.deepEqual(JSON.parse(await readFile(join(target, ".cineweave", "project.json"), "utf8")), legacy);
  } finally { await rm(sandbox, { recursive: true, force: true }); }
});

test("runtime continues to verify and import legacy V2.3.1 bundle manifests", async () => {
  const sandbox = await mkdtemp(join(tmpdir(), "cineweave-bundle-v231-"));
  try {
    const source = join(sandbox, "source-project");
    const bundle = join(sandbox, "transfer-bundle");
    const target = join(sandbox, "target-project");
    await initProject(source, { projectId: "project.bundle-v231", createdAt });
    await exportProjectBundle(source, bundle, { createdAt });
    const manifestPath = join(bundle, BUNDLE_MANIFEST_NAME);
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    manifest.contractVersion = "2.3.1";
    manifest.bundleFormatVersion = "1.0.0";
    delete manifest.contentPolicy.containsReferenceMedia;
    delete manifest.summary.referenceBlobCount;
    manifest.bundleHash = sha256Canonical({
      bundleFormatVersion: manifest.bundleFormatVersion,
      sourceProject: manifest.sourceProject,
      purpose: manifest.purpose,
      contentPolicy: manifest.contentPolicy,
      storeDirectory: manifest.storeDirectory,
      entries: manifest.entries,
      summary: manifest.summary
    });
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
    assert.equal((await verifyProjectBundle(bundle)).valid, true);
    const imported = await importProjectBundle(bundle, target);
    assert.equal(imported.verification.valid, true);
  } finally { await rm(sandbox, { recursive: true, force: true }); }
});
