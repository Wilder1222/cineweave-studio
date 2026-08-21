import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { lstat, open, readdir } from "node:fs/promises";
import { basename, join, relative, resolve, sep } from "node:path";

export const REFERENCE_BLOB_DIRECTORY = "reference-blobs";
export const MAX_REFERENCE_IMAGE_BYTES = 64 * 1024 * 1024;
export const MAX_REFERENCE_VIDEO_BYTES = 512 * 1024 * 1024;
export const MAX_REFERENCE_BYTES = MAX_REFERENCE_VIDEO_BYTES;

const digestPattern = /^[0-9a-f]{64}$/;
const blobPattern = /^reference-blobs\/sha256\/[0-9a-f]{2}\/[0-9a-f]{64}\.blob$/;
const extensionSets = {
  png: new Set([".png"]),
  jpeg: new Set([".jpg", ".jpeg"]),
  webp: new Set([".webp"]),
  mp4: new Set([".mp4", ".m4v"]),
  quicktime: new Set([".mov"]),
  webm: new Set([".webm"])
};
const canonicalExtensions = {
  png: ".png",
  jpeg: ".jpg",
  webp: ".webp",
  mp4: ".mp4",
  quicktime: ".mov",
  webm: ".webm"
};
const mp4Brands = new Set(["isom", "iso2", "iso3", "iso4", "iso5", "iso6", "iso7", "iso8", "iso9", "avc1", "mp41", "mp42", "M4V ", "M4VH", "M4VP", "dash", "msdh", "msix", "cmfc", "cmfs"]);
const MAX_REFERENCE_IMAGE_DIMENSION = 65535;
const MAX_REFERENCE_IMAGE_PIXELS = 100_000_000;

function imageDimensions(bytes, format) {
  if (format === "png") {
    if (bytes.length < 24 || bytes.readUInt32BE(8) !== 13 || bytes.toString("ascii", 12, 16) !== "IHDR") return null;
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  }
  if (format === "jpeg") {
    let offset = 2;
    while (offset + 9 < bytes.length) {
      if (bytes[offset] !== 0xff) { offset += 1; continue; }
      while (bytes[offset] === 0xff) offset += 1;
      const marker = bytes[offset];
      offset += 1;
      if (marker === 0xd8 || marker === 0xd9 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      if (offset + 2 > bytes.length) return null;
      const length = bytes.readUInt16BE(offset);
      if (length < 2 || offset + length > bytes.length) return null;
      const isFrame = (marker >= 0xc0 && marker <= 0xc3) || (marker >= 0xc5 && marker <= 0xc7) || (marker >= 0xc9 && marker <= 0xcb) || (marker >= 0xcd && marker <= 0xcf);
      if (isFrame && length >= 7) return { width: bytes.readUInt16BE(offset + 5), height: bytes.readUInt16BE(offset + 3) };
      offset += length;
    }
    return null;
  }
  if (format === "webp") {
    const chunk = bytes.toString("ascii", 12, 16);
    if (chunk === "VP8X" && bytes.length >= 30) {
      return {
        width: 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16),
        height: 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16)
      };
    }
    if (chunk === "VP8 " && bytes.length >= 30 && bytes[23] === 0x9d && bytes[24] === 0x01 && bytes[25] === 0x2a) {
      return { width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff };
    }
    if (chunk === "VP8L" && bytes.length >= 25 && bytes[20] === 0x2f) {
      const bits = bytes.readUInt32LE(21);
      return { width: 1 + (bits & 0x3fff), height: 1 + (bits >> 14 & 0x3fff) };
    }
  }
  return null;
}

function detectIsoBmff(bytes) {
  if (bytes.length < 16 || bytes.toString("ascii", 4, 8) !== "ftyp") return null;
  const declaredSize = bytes.readUInt32BE(0);
  if (declaredSize !== 0 && (declaredSize < 16 || declaredSize > bytes.length)) throw new Error("ISO-BMFF ftyp box is malformed or exceeds the bounded probe");
  const majorBrand = bytes.toString("ascii", 8, 12);
  if (majorBrand === "qt  ") return { format: "quicktime", mediaKind: "video", mediaType: "video/quicktime" };
  const end = declaredSize === 0 ? bytes.length : declaredSize;
  const compatibleBrands = [];
  for (let offset = 16; offset + 4 <= end; offset += 4) compatibleBrands.push(bytes.toString("ascii", offset, offset + 4));
  if (!mp4Brands.has(majorBrand) && !compatibleBrands.some((brand) => mp4Brands.has(brand))) throw new Error(`ISO-BMFF brand ${JSON.stringify(majorBrand)} is not an allow-listed MP4/M4V video brand`);
  return { format: "mp4", mediaKind: "video", mediaType: "video/mp4" };
}

function hasWebmDocType(bytes) {
  const limit = Math.min(bytes.length, 4096);
  for (let offset = 4; offset + 4 < limit; offset += 1) {
    if (bytes[offset] !== 0x42 || bytes[offset + 1] !== 0x82) continue;
    const first = bytes[offset + 2];
    let width = 1;
    let marker = 0x80;
    while (width <= 8 && (first & marker) === 0) { width += 1; marker >>= 1; }
    if (width > 8 || offset + 2 + width > limit) continue;
    let length = first & (marker - 1);
    for (let index = 1; index < width; index += 1) length = length * 256 + bytes[offset + 2 + index];
    const start = offset + 2 + width;
    if (length === 4 && start + length <= limit && bytes.toString("ascii", start, start + length).toLowerCase() === "webm") return true;
  }
  return false;
}

export function sniffReferenceMedia(bytes, extension) {
  let detected = null;
  if (bytes.length >= 24 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    detected = { format: "png", mediaKind: "image", mediaType: "image/png" };
  } else if (bytes.length >= 12 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    detected = { format: "jpeg", mediaKind: "image", mediaType: "image/jpeg" };
  } else if (bytes.length >= 30 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") {
    detected = { format: "webp", mediaKind: "image", mediaType: "image/webp" };
  } else if (bytes.length >= 12 && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3 && hasWebmDocType(bytes)) {
    detected = { format: "webm", mediaKind: "video", mediaType: "video/webm" };
  } else {
    detected = detectIsoBmff(bytes);
  }
  if (!detected) throw new Error("Reference media signature is unsupported; allowed formats are PNG, JPEG, WebP, MP4/M4V, MOV and WebM");
  const normalizedExtension = String(extension || "").toLowerCase();
  if (!extensionSets[detected.format]?.has(normalizedExtension)) throw new Error(`Reference extension ${normalizedExtension || "<none>"} does not match detected ${detected.format} content`);
  if (detected.mediaKind === "image") {
    const dimensions = imageDimensions(bytes, detected.format);
    if (!dimensions || !Number.isSafeInteger(dimensions.width) || !Number.isSafeInteger(dimensions.height) || dimensions.width < 1 || dimensions.height < 1) {
      throw new Error(`Could not verify ${detected.format} image dimensions from the bounded header probe`);
    }
    if (dimensions.width > MAX_REFERENCE_IMAGE_DIMENSION || dimensions.height > MAX_REFERENCE_IMAGE_DIMENSION || dimensions.width * dimensions.height > MAX_REFERENCE_IMAGE_PIXELS) throw new Error("Reference image dimensions exceed the safety limit");
    return { ...detected, ...dimensions, probeLevel: "signature_and_dimensions" };
  }
  return { ...detected, probeLevel: "container_signature_only" };
}

export function canonicalReferenceExtension(format) {
  const extension = canonicalExtensions[format];
  if (!extension) throw new TypeError(`Unsupported reference media format: ${format}`);
  return extension;
}

export async function readReferenceHeader(path, maximum = 8 * 1024 * 1024) {
  const handle = await open(path, "r");
  try {
    const info = await handle.stat();
    const length = Math.min(info.size, maximum);
    const bytes = Buffer.alloc(length);
    const { bytesRead } = await handle.read(bytes, 0, length, 0);
    return bytes.subarray(0, bytesRead);
  } finally {
    await handle.close();
  }
}

export async function hashFile(path) {
  const hash = createHash("sha256");
  let byteLength = 0;
  for await (const chunk of createReadStream(path)) { hash.update(chunk); byteLength += chunk.length; }
  return { contentHash: `sha256:${hash.digest("hex")}`, byteLength };
}

export function referenceBlobRelativePath(contentHash) {
  const digest = String(contentHash || "").replace(/^sha256:/, "");
  if (!digestPattern.test(digest)) throw new TypeError("Reference content hash must be a lowercase SHA-256 hash");
  return `${REFERENCE_BLOB_DIRECTORY}/sha256/${digest.slice(0, 2)}/${digest}.blob`;
}

export function assertReferenceBlobRelativePath(value) {
  if (typeof value !== "string" || !blobPattern.test(value)) throw new TypeError(`Invalid reference blob path: ${value}`);
  const digest = basename(value, ".blob");
  if (!value.includes(`/sha256/${digest.slice(0, 2)}/`)) throw new TypeError(`Reference blob shard does not match its digest: ${value}`);
  return value;
}

export function resolveReferenceBlob(projectRoot, relativePath) {
  const safe = assertReferenceBlobRelativePath(relativePath);
  const store = resolve(projectRoot, ".cineweave");
  const absolute = resolve(store, ...safe.split("/"));
  if (!absolute.startsWith(`${store}${sep}`)) throw new Error("Reference blob escapes the project store");
  return absolute;
}

export async function verifyReferenceBlob(projectRoot, payload) {
  if (payload?.kind !== "cineweave_codex_reference_asset") throw new TypeError("Expected a ReferenceAsset payload");
  const relativePath = assertReferenceBlobRelativePath(payload?.blob?.relativePath);
  const absolutePath = resolveReferenceBlob(projectRoot, relativePath);
  const info = await lstat(absolutePath);
  if (info.isSymbolicLink() || !info.isFile()) throw new Error(`Reference blob must be a regular non-link file: ${relativePath}`);
  if (process.platform !== "win32" && (info.mode & 0o111) !== 0) throw new Error(`Reference blob must not have executable permission bits: ${relativePath}`);
  const { contentHash, byteLength } = await hashFile(absolutePath);
  if (contentHash !== payload.media?.contentHash || contentHash !== payload.blob?.contentHash) throw new Error(`Reference blob hash mismatch: ${relativePath}`);
  if (byteLength !== payload.media?.byteLength || byteLength !== payload.blob?.byteLength) throw new Error(`Reference blob byte length mismatch: ${relativePath}`);
  if (referenceBlobRelativePath(contentHash) !== relativePath) throw new Error(`Reference blob path is not content-addressed correctly: ${relativePath}`);
  const media = sniffReferenceMedia(await readReferenceHeader(absolutePath), payload.media?.sourceExtension);
  if (media.format !== payload.media.format || media.mediaKind !== payload.media.mediaKind || media.mediaType !== payload.media.mediaType) throw new Error(`Reference blob media metadata mismatch: ${relativePath}`);
  if (media.mediaKind === "image" && (media.width !== payload.media.technical?.width || media.height !== payload.media.technical?.height)) throw new Error(`Reference blob dimensions mismatch: ${relativePath}`);
  return { valid: true, relativePath, contentHash, byteLength, media };
}

export async function listReferenceBlobFiles(projectRoot) {
  const store = resolve(projectRoot, ".cineweave");
  const root = join(store, REFERENCE_BLOB_DIRECTORY);
  try {
    const info = await lstat(root);
    if (info.isSymbolicLink() || !info.isDirectory()) throw new Error(`Reference blob root must be a real directory: ${root}`);
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
  const files = [];
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const current = join(directory, entry.name);
      const info = await lstat(current);
      if (info.isSymbolicLink()) throw new Error(`Symbolic links are not allowed in reference storage: ${current}`);
      if (info.isDirectory()) await visit(current);
      else if (info.isFile()) files.push(current);
      else throw new Error(`Unsupported filesystem entry in reference storage: ${current}`);
    }
  }
  await visit(root);
  return files.sort((left, right) => left.localeCompare(right)).map((path) => relative(store, path).split(sep).join("/"));
}
