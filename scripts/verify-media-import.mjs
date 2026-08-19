#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { basename, extname, resolve } from "node:path";

function usage() {
  console.error("Usage: node scripts/verify-media-import.mjs <image-file> --world-id <id> --render-plan-ref <ref> --receipt <receipt.json> [--shot-id <id>] [--media-type still|storyboard_frame|keyframe_candidate] [--source codex_interactive|user_upload|external_adapter]");
}

function argValue(args, name, required = true) {
  const index = args.indexOf(name);
  if (index === -1) {
    if (required) throw new Error(`missing ${name}`);
    return undefined;
  }
  const value = args[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${name} requires a value`);
  return value;
}

function detectFormat(bytes, fileName) {
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpeg";
  if (bytes.length >= 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") return "webp";
  const extension = extname(fileName).slice(1).toLowerCase();
  return extension === "jpg" ? "jpeg" : extension;
}

function detectDimensions(bytes, format) {
  if (format === "png" && bytes.length >= 24) return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  if (format === "webp" && bytes.length >= 30 && bytes.toString("ascii", 12, 16) === "VP8X") {
    const width = 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16);
    const height = 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16);
    return { width, height };
  }
  if (format === "jpeg") {
    let offset = 2;
    while (offset + 9 < bytes.length) {
      if (bytes[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = bytes[offset + 1];
      if (marker === 0xd8 || marker === 0xd9) {
        offset += 2;
        continue;
      }
      const length = bytes.readUInt16BE(offset + 2);
      if (length < 2 || offset + length + 2 > bytes.length) break;
      const isFrame = marker >= 0xc0 && marker <= 0xc3 || marker >= 0xc5 && marker <= 0xc7 || marker >= 0xc9 && marker <= 0xcb || marker >= 0xcd && marker <= 0xcf;
      if (isFrame) return { width: bytes.readUInt16BE(offset + 7), height: bytes.readUInt16BE(offset + 5) };
      offset += length + 2;
    }
  }
  return null;
}

async function main() {
  const args = process.argv.slice(2);
  const imagePath = args[0];
  if (!imagePath) {
    usage();
    process.exitCode = 2;
    return;
  }

  try {
    const worldId = argValue(args, "--world-id");
    const renderPlanRef = argValue(args, "--render-plan-ref");
    const receiptPath = argValue(args, "--receipt");
    const shotId = argValue(args, "--shot-id", false);
    const mediaType = argValue(args, "--media-type", false) ?? "keyframe_candidate";
    const source = argValue(args, "--source", false) ?? "user_upload";
    if (!["still", "storyboard_frame", "keyframe_candidate"].includes(mediaType)) throw new Error("--media-type is unsupported");
    if (!["codex_interactive", "user_upload", "external_adapter"].includes(source)) throw new Error("--source is unsupported");

    const resolvedPath = resolve(imagePath);
    const fileInfo = await stat(resolvedPath);
    if (!fileInfo.isFile()) throw new Error("image path is not a file");
    const bytes = await readFile(resolvedPath);
    const fileName = basename(resolvedPath);
    const format = detectFormat(bytes, fileName);
    if (!["png", "jpeg", "webp"].includes(format)) throw new Error("only png, jpeg and webp media are supported");
    const dimensions = detectDimensions(bytes, format);
    if (!dimensions || dimensions.width < 1 || dimensions.height < 1) throw new Error("could not detect image dimensions");
    const contentHash = `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
    const receipt = JSON.parse(await readFile(resolve(receiptPath), "utf8"));
    if (!receipt || typeof receipt !== "object" || Array.isArray(receipt)) throw new Error("receipt file must contain a JSON object");

    const mediaId = `media-${contentHash.slice(-16)}`;
    const result = {
      kind: "cineweave_codex_media_import",
      worldId,
      ...(shotId ? { shotId } : {}),
      renderPlanRef,
      skillReceipt: receipt,
      status: "draft",
      media: [{
        mediaId,
        mediaType,
        fileName,
        format,
        byteSize: bytes.length,
        contentHash,
        width: dimensions.width,
        height: dimensions.height,
        source
      }],
      verification: {
        fileExists: true,
        contentHashPresent: true,
        dimensionsDetected: true,
        privateUrlAbsent: true,
        status: "verified"
      },
      importContract: {
        source,
        statusOnCreation: "draft",
        nextAction: "Bind the verified Draft media to the Candidate, review continuity, then explicitly lock it as a Keyframe."
      }
    };
    const receiptText = JSON.stringify(receipt);
    if (!receipt.repository || !receipt.ref || !/^[0-9a-f]{7,64}$/i.test(receipt.commit ?? "") || /owner\/repository|placeholder|40-character-git-sha|sha256:<[^>]+>/i.test(receiptText)) {
      throw new Error("receipt must contain a real repository, ref, Git commit and must not be a fixture placeholder");
    }
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(JSON.stringify({ valid: false, error: error instanceof Error ? error.message : String(error) }, null, 2));
    process.exitCode = 2;
  }
}

main();
