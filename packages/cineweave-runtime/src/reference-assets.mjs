import { randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import { existsSync } from "node:fs";
import { link, lstat, mkdir, open, unlink } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { pipeline } from "node:stream/promises";
import { findArtifact, findArtifactByVersion, putArtifact, readStrictJson } from "./artifact-store.mjs";
import {
  MAX_REFERENCE_BYTES,
  MAX_REFERENCE_IMAGE_BYTES,
  MAX_REFERENCE_VIDEO_BYTES,
  canonicalReferenceExtension,
  hashFile,
  readReferenceHeader,
  referenceBlobRelativePath,
  resolveReferenceBlob,
  sniffReferenceMedia,
  verifyReferenceBlob
} from "./reference-media.mjs";

const sourceClasses = new Set(["user_upload", "local_file", "generated_output", "external_download"]);

function assertMaxBytes(value) {
  if (value === undefined) return MAX_REFERENCE_BYTES;
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 1 || number > MAX_REFERENCE_BYTES) throw new TypeError(`maxBytes must be a positive integer no greater than ${MAX_REFERENCE_BYTES}`);
  return number;
}

async function openStableRegularFile(path) {
  const before = await lstat(path);
  if (before.isSymbolicLink() || !before.isFile()) throw new Error("Reference source must be a regular non-link file");
  const handle = await open(path, "r");
  try {
    const opened = await handle.stat();
    if (!opened.isFile()) throw new Error("Opened reference source is not a regular file");
    const deviceChanged = before.dev !== 0 && opened.dev !== 0 && before.dev !== opened.dev;
    const inodeChanged = before.ino !== 0 && opened.ino !== 0 && before.ino !== opened.ino;
    if (deviceChanged || inodeChanged || before.size !== opened.size) throw new Error("Reference source changed while it was being opened");
    return { handle, info: opened };
  } catch (error) {
    await handle.close();
    throw error;
  }
}

function assetPayload(contentHash, byteLength, media, sourceClass) {
  const digest = contentHash.slice("sha256:".length);
  const relativePath = referenceBlobRelativePath(contentHash);
  const technical = {
    probeLevel: media.probeLevel,
    ...(media.mediaKind === "image" ? { width: media.width, height: media.height } : {})
  };
  return {
    kind: "cineweave_codex_reference_asset",
    contractVersion: "2.4.0",
    assetId: `reference.${sourceClass}.${digest}`,
    version: 1,
    status: "ingested",
    label: `${media.mediaKind}-reference-${digest.slice(0, 12)}`,
    media: {
      mediaKind: media.mediaKind,
      mediaType: media.mediaType,
      format: media.format,
      sourceExtension: media.sourceExtension,
      byteLength,
      contentHash,
      technical
    },
    blob: {
      storageMode: "project_content_addressed",
      relativePath,
      byteLength,
      contentHash
    },
    source: {
      sourceClass,
      sourceLocatorStored: false,
      originalFilenameStored: false,
      importCreatesRights: false
    },
    provenance: {
      byteBinding: "sha256_full_asset",
      contentCredentials: {
        status: "not_checked",
        trust: "unknown"
      },
      digitalSourceType: "unknown"
    },
    rights: {
      status: "unknown",
      assetOwnership: "unknown",
      generationUse: "unknown",
      redistribution: "unknown",
      trainingUse: "unknown",
      likenessConsent: "unknown",
      requiresSeparateLicenseProfile: true
    },
    privacy: {
      originalBytesRetained: true,
      embeddedMetadata: "preserved_uninspected",
      locationMetadata: "not_inspected",
      sourcePathStored: false,
      reviewRequired: true
    },
    safety: {
      extensionAllowlisted: true,
      signatureMatched: true,
      decoderInvoked: false,
      activeContentExecuted: false,
      malwareScan: "not_run",
      handlingStatus: "stored_non_executable"
    }
  };
}

export async function ingestReferenceAsset(projectRoot, filePath, options = {}) {
  const project = resolve(projectRoot);
  const store = join(project, ".cineweave");
  const projectManifest = await readStrictJson(join(store, "project.json"));
  if (projectManifest.contractVersion !== "2.4.0" || projectManifest.runtimeVersion !== "2.4.0" || projectManifest.storage?.referenceBlobDirectory !== "reference-blobs") {
    throw new Error("Reference ingestion requires a project initialized by the V2.4 runtime; legacy projects remain readable but are not mutated");
  }
  const sourceClass = options.sourceClass || "user_upload";
  if (!sourceClasses.has(sourceClass)) throw new TypeError(`Unsupported reference source class: ${sourceClass}`);
  const maximum = assertMaxBytes(options.maxBytes);
  const source = resolve(filePath);
  const { handle, info } = await openStableRegularFile(source);
  if (info.size < 1 || info.size > maximum) { await handle.close(); throw new Error(`Reference byte length must be between 1 and ${maximum}`); }
  const temporary = join(store, "reference-blobs", `.incoming-${randomUUID().toLowerCase()}`);
  await mkdir(join(store, "reference-blobs"), { recursive: true, mode: 0o700 });
  try {
    try {
      await pipeline(handle.createReadStream({ autoClose: false }), createWriteStream(temporary, { flags: "wx", mode: 0o600 }));
    } finally {
      await handle.close();
    }
    const copiedInfo = await lstat(temporary);
    if (copiedInfo.isSymbolicLink() || !copiedInfo.isFile() || copiedInfo.size !== info.size) throw new Error("Reference copy verification failed");
    const sourceExtension = extname(source).toLowerCase();
    const detectedMedia = sniffReferenceMedia(await readReferenceHeader(temporary), sourceExtension);
    const media = { ...detectedMedia, sourceExtension: canonicalReferenceExtension(detectedMedia.format) };
    const mediaLimit = media.mediaKind === "image" ? MAX_REFERENCE_IMAGE_BYTES : MAX_REFERENCE_VIDEO_BYTES;
    if (copiedInfo.size > mediaLimit) throw new Error(`${media.mediaKind} reference exceeds the ${mediaLimit}-byte media limit`);
    const { contentHash, byteLength } = await hashFile(temporary);
    const payload = assetPayload(contentHash, byteLength, media, sourceClass);
    const destination = resolveReferenceBlob(project, payload.blob.relativePath);
    await mkdir(dirname(destination), { recursive: true, mode: 0o700 });
    if (!existsSync(destination)) {
      try { await link(temporary, destination); }
      catch (error) { if (error?.code !== "EEXIST" && !existsSync(destination)) throw error; }
    }
    await verifyReferenceBlob(project, payload);
    const existing = await findArtifactByVersion(project, payload.kind, payload.assetId, payload.version);
    if (existing) {
      if (existing.envelope.payload.media?.contentHash !== contentHash || existing.envelope.payload.source?.sourceClass !== sourceClass) throw new Error("Existing ReferenceAsset identity does not match the ingested bytes");
      const verification = await verifyReferenceBlob(project, existing.envelope.payload);
      return { duplicate: true, envelope: existing.envelope, verification };
    }
    const stored = await putArtifact(project, payload, {
      kind: payload.kind,
      id: payload.assetId,
      version: payload.version,
      status: "draft",
      createdAt: options.createdAt,
      createdBy: options.createdBy || "cineweave-reference-ingest"
    });
    const verification = await verifyReferenceBlob(project, stored.envelope.payload);
    return { duplicate: false, envelope: stored.envelope, verification };
  } finally {
    await unlink(temporary).catch(() => {});
  }
}

export async function verifyReferenceAsset(projectRoot, artifactRef) {
  const stored = await findArtifact(resolve(projectRoot), artifactRef);
  const verification = await verifyReferenceBlob(resolve(projectRoot), stored.envelope.payload);
  return { artifactRef: stored.envelope.artifactRef, verification };
}
