import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { chmod, lstat, mkdtemp, mkdir, readFile, readdir, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { initProject, putArtifact, verifyProject } from "../../packages/cineweave-runtime/src/artifact-store.mjs";
import { buildArtifactGraph } from "../../packages/cineweave-runtime/src/artifact-graph.mjs";
import { exportProjectBundle, importProjectBundle } from "../../packages/cineweave-runtime/src/project-bundle.mjs";
import { ingestReferenceAsset, verifyReferenceAsset } from "../../packages/cineweave-runtime/src/reference-assets.mjs";
import { resolveReferenceBlob, sniffReferenceMedia } from "../../packages/cineweave-runtime/src/reference-media.mjs";

const png = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64");
const jpegHeader = Buffer.from("ffd8ffc00011080001000103011100021100031100", "hex");

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "cineweave-reference-"));
  const project = join(root, "project");
  const image = join(root, "portrait.png");
  await writeFile(image, png);
  await initProject(project, { projectId: "project.reference-test", name: "Reference test", createdAt: "2026-08-22T00:00:00.000Z" });
  return { root, project, image };
}

test("reference ingestion stores non-executable content-addressed bytes and deduplicates", async () => {
  const { project, image } = await fixture();
  if (process.platform !== "win32") await chmod(image, 0o755);
  const first = await ingestReferenceAsset(project, image, { sourceClass: "user_upload", createdAt: "2026-08-22T00:01:00.000Z" });
  assert.equal(first.duplicate, false);
  assert.equal(first.envelope.payload.kind, "cineweave_codex_reference_asset");
  assert.equal(first.envelope.payload.media.mediaKind, "image");
  assert.equal(first.envelope.payload.media.technical.probeLevel, "signature_and_dimensions");
  assert.equal(first.envelope.payload.media.technical.width, 1);
  assert.equal(first.envelope.payload.media.technical.height, 1);
  assert.equal(first.envelope.payload.source.sourceLocatorStored, false);
  assert.equal(first.envelope.payload.source.originalFilenameStored, false);
  assert.equal(first.envelope.payload.rights.status, "unknown");
  assert.equal(first.envelope.payload.safety.decoderInvoked, false);
  assert.doesNotMatch(JSON.stringify(first.envelope.payload), /portrait\.png|cineweave-reference-/);
  const blobPath = resolveReferenceBlob(project, first.envelope.payload.blob.relativePath);
  assert.deepEqual(await readFile(blobPath), png);
  if (process.platform !== "win32") assert.equal((await lstat(blobPath)).mode & 0o111, 0);

  const duplicate = await ingestReferenceAsset(project, image, { sourceClass: "user_upload", createdAt: "2026-08-22T00:02:00.000Z" });
  assert.equal(duplicate.duplicate, true);
  assert.deepEqual(duplicate.envelope.artifactRef, first.envelope.artifactRef);

  const secondSource = await ingestReferenceAsset(project, image, { sourceClass: "local_file", createdAt: "2026-08-22T00:03:00.000Z" });
  assert.equal(secondSource.duplicate, false);
  assert.notEqual(secondSource.envelope.artifactRef.id, first.envelope.artifactRef.id);
  assert.equal(secondSource.envelope.payload.blob.relativePath, first.envelope.payload.blob.relativePath);
  const report = await verifyProject(project);
  assert.equal(report.valid, true, report.errors.join("\n"));
  assert.equal(report.referenceBlobs, 1);
});

test("reference extension aliases normalize before immutable identity is claimed", async () => {
  const { root, project } = await fixture();
  const jpg = join(root, "portrait.jpg");
  const jpeg = join(root, "portrait.jpeg");
  await writeFile(jpg, jpegHeader);
  await writeFile(jpeg, jpegHeader);
  const first = await ingestReferenceAsset(project, jpg, { createdAt: "2026-08-22T00:01:00.000Z" });
  const alias = await ingestReferenceAsset(project, jpeg, { createdAt: "2026-08-22T00:02:00.000Z" });
  assert.equal(first.envelope.payload.media.sourceExtension, ".jpg");
  assert.equal(alias.duplicate, true);
  assert.deepEqual(alias.envelope.artifactRef, first.envelope.artifactRef);
  const report = await verifyProject(project);
  assert.equal(report.valid, true, report.errors.join("\n"));
  assert.equal(report.referenceBlobs, 1);
});

test("bounded signature probes reject non-video ISO-BMFF, non-WebM EBML and oversized image headers", () => {
  const mp4 = Buffer.alloc(24);
  mp4.writeUInt32BE(24, 0);
  mp4.write("ftyp", 4, "ascii");
  mp4.write("isom", 8, "ascii");
  mp4.write("isom", 16, "ascii");
  assert.equal(sniffReferenceMedia(mp4, ".mp4").format, "mp4");

  const avif = Buffer.from(mp4);
  avif.write("avif", 8, "ascii");
  avif.write("avif", 16, "ascii");
  assert.throws(() => sniffReferenceMedia(avif, ".mp4"), /not an allow-listed MP4/);

  const webm = Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0x42, 0x82, 0x84, 0x77, 0x65, 0x62, 0x6d, 0x00]);
  assert.equal(sniffReferenceMedia(webm, ".webm").format, "webm");
  const matroska = Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0x42, 0x82, 0x88, 0x6d, 0x61, 0x74, 0x72, 0x6f, 0x73, 0x6b, 0x61]);
  assert.throws(() => sniffReferenceMedia(matroska, ".webm"), /signature is unsupported/);

  const hugePng = Buffer.alloc(24);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(hugePng);
  hugePng.writeUInt32BE(13, 8);
  hugePng.write("IHDR", 12, "ascii");
  hugePng.writeUInt32BE(20000, 16);
  hugePng.writeUInt32BE(10000, 20);
  assert.throws(() => sniffReferenceMedia(hugePng, ".png"), /dimensions exceed/);
  assert.throws(() => sniffReferenceMedia(Buffer.from("<svg></svg>"), ".svg"), /signature is unsupported/);
});

test("reference observations become exact ArtifactGraph dependencies", async () => {
  const { project, image } = await fixture();
  const asset = await ingestReferenceAsset(project, image, { sourceClass: "user_upload", createdAt: "2026-08-22T00:01:00.000Z" });
  const observation = await putArtifact(project, {
    kind: "cineweave_codex_reference_observation",
    assetRef: asset.envelope.artifactRef,
    selector: { type: "full_asset" },
    role: "style"
  }, { kind: "cineweave_codex_reference_observation", id: "observation.style", version: 1, createdAt: "2026-08-22T00:02:00.000Z" });
  const graph = await buildArtifactGraph(project, { rootArtifactRef: observation.envelope.artifactRef, direction: "dependencies" });
  assert.equal(graph.edges.length, 1);
  assert.equal(graph.edges[0].status, "resolved");
  assert.deepEqual({ ...graph.edges[0].targetArtifactRef }, { ...asset.envelope.artifactRef });
});

test("reference ingestion rejects mismatched extensions, size limits and links", async (t) => {
  const { root, project, image } = await fixture();
  const mismatched = join(root, "portrait.jpg");
  await writeFile(mismatched, png);
  await assert.rejects(() => ingestReferenceAsset(project, mismatched), /does not match detected png content/);
  await assert.rejects(() => ingestReferenceAsset(project, image, { maxBytes: png.length - 1 }), /byte length/);
  assert.deepEqual((await readdir(join(project, ".cineweave", "reference-blobs"))).filter((name) => name.startsWith(".incoming-")), []);
  const linked = join(root, "linked.png");
  try { await symlink(image, linked); }
  catch { t.skip("platform does not permit an unprivileged symlink fixture"); return; }
  await assert.rejects(() => ingestReferenceAsset(project, linked), /regular non-link file/);
});

test("reference verification detects tampering and orphaned blobs", async () => {
  const { project, image } = await fixture();
  const asset = await ingestReferenceAsset(project, image, { createdAt: "2026-08-22T00:01:00.000Z" });
  const blobPath = resolveReferenceBlob(project, asset.envelope.payload.blob.relativePath);
  await writeFile(blobPath, Buffer.from("tampered"));
  await assert.rejects(() => verifyReferenceAsset(project, asset.envelope.artifactRef), /hash mismatch|byte length mismatch/);
  const tamperedReport = await verifyProject(project);
  assert.equal(tamperedReport.valid, false);
  assert(tamperedReport.errors.some((message) => /Reference blob/.test(message)));

  const other = await fixture();
  const orphanRelative = "reference-blobs/sha256/22/2222222222222222222222222222222222222222222222222222222222222222.blob";
  const orphan = resolveReferenceBlob(other.project, orphanRelative);
  await mkdir(dirname(orphan), { recursive: true });
  await writeFile(orphan, png);
  const orphanReport = await verifyProject(other.project);
  assert.equal(orphanReport.valid, false);
  assert(orphanReport.errors.some((message) => /Orphaned reference blob/.test(message)));
});

test("project bundles preserve verified reference bytes", async () => {
  const { root, project, image } = await fixture();
  const asset = await ingestReferenceAsset(project, image, { createdAt: "2026-08-22T00:01:00.000Z" });
  const bundle = join(root, "bundle");
  const imported = join(root, "imported");
  const exported = await exportProjectBundle(project, bundle, { createdAt: "2026-08-22T00:02:00.000Z" });
  assert.equal(exported.manifest.bundleFormatVersion, "1.1.0");
  assert.equal(exported.manifest.contentPolicy.containsReferenceMedia, true);
  assert.equal(exported.manifest.summary.referenceBlobCount, 1);
  await importProjectBundle(bundle, imported);
  const importedBlob = resolveReferenceBlob(imported, asset.envelope.payload.blob.relativePath);
  assert.equal(existsSync(importedBlob), true);
  assert.deepEqual(await readFile(importedBlob), png);
  const report = await verifyProject(imported);
  assert.equal(report.valid, true, report.errors.join("\n"));
});
