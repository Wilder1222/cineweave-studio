#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseJsonStrict, sha256Bytes, sha256Canonical } from "../src/canonical-json.mjs";

const mimeTypes = new Map([[".png", "image/png"], [".jpg", "image/jpeg"], [".jpeg", "image/jpeg"], [".webp", "image/webp"], [".svg", "image/svg+xml"]]);
const escapeXml = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");

function parseArgs(values) {
  const flags = {};
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (!value.startsWith("--")) throw new Error("Usage: assemble-board --manifest <board.json> --out <board.svg> [--allow-partial]");
    const key = value.slice(2);
    const next = values[index + 1];
    if (!next || next.startsWith("--")) flags[key] = true;
    else { flags[key] = next; index += 1; }
  }
  return flags;
}

export async function assembleBoard(manifestPath, outputPath, options = {}) {
  const absoluteManifest = resolve(manifestPath);
  const manifest = parseJsonStrict(await readFile(absoluteManifest, "utf8"));
  const canvas = manifest.canvas || {};
  const width = Number(canvas.width || 1600);
  const height = Number(canvas.height || 1200);
  const padding = Number(canvas.padding ?? 48);
  const gap = Number(canvas.gap ?? 24);
  const labelHeight = Number(canvas.labelHeight ?? 52);
  const labelFontSize = Number(canvas.labelFontSize ?? 24);
  const columns = Number(manifest.layout?.columns || 1);
  const rows = Number(manifest.layout?.rows || Math.ceil((manifest.tiles || []).length / columns));
  if (![width, height, padding, gap, labelHeight, labelFontSize, columns, rows].every(Number.isFinite) || width <= 0 || height <= 0 || padding < 0 || gap < 0 || labelHeight < 0 || labelFontSize <= 0 || !Number.isSafeInteger(columns) || !Number.isSafeInteger(rows) || columns < 1 || rows < 1) throw new Error("Invalid board geometry");
  const cellWidth = (width - padding * 2 - gap * (columns - 1)) / columns;
  const cellHeight = (height - padding * 2 - gap * (rows - 1)) / rows;
  if (cellWidth <= 0 || cellHeight <= labelHeight) throw new Error("Board cells have no usable image area");
  if ((manifest.tiles || []).length > columns * rows) throw new Error("Board has more tiles than grid cells");
  const imageHeight = Math.max(1, cellHeight - labelHeight);
  const elements = [`<rect width="100%" height="100%" fill="${escapeXml(canvas.background || "#111722")}"/>`];
  const provenanceTiles = [];
  const failedTileIds = [];
  const tileIds = new Set();
  const occupiedCells = new Set();

  for (let index = 0; index < (manifest.tiles || []).length; index += 1) {
    const tile = manifest.tiles[index];
    if (!tile?.id || tileIds.has(tile.id)) throw new Error(`Tile IDs must be present and unique: ${tile?.id || "<missing>"}`);
    tileIds.add(tile.id);
    if (Object.hasOwn(tile, "column") && !Number.isSafeInteger(tile.column)) throw new Error(`Tile ${tile.id} column must be an integer`);
    if (Object.hasOwn(tile, "row") && !Number.isSafeInteger(tile.row)) throw new Error(`Tile ${tile.id} row must be an integer`);
    const column = Number.isSafeInteger(tile.column) ? tile.column : index % columns;
    const row = Number.isSafeInteger(tile.row) ? tile.row : Math.floor(index / columns);
    if (column < 0 || column >= columns || row < 0 || row >= rows) throw new Error(`Tile ${tile.id} is outside the board grid`);
    const cellKey = `${column},${row}`;
    if (occupiedCells.has(cellKey)) throw new Error(`Multiple tiles occupy board cell ${cellKey}`);
    occupiedCells.add(cellKey);
    const x = padding + column * (cellWidth + gap);
    const y = padding + row * (cellHeight + gap);
    const sourcePath = tile.path ? resolve(dirname(absoluteManifest), tile.path) : null;
    const extension = sourcePath ? extname(sourcePath).toLowerCase() : "";
    const mime = mimeTypes.get(extension);
    const available = tile.status !== "failed" && sourcePath && mime && existsSync(sourcePath);
    if (!available) {
      failedTileIds.push(tile.id);
      if (!options.allowPartial) throw new Error(`Required tile is missing or failed: ${tile.id}`);
      elements.push(`<rect x="${x}" y="${y}" width="${cellWidth}" height="${imageHeight}" rx="8" fill="#251b22" stroke="#ff6b7a" stroke-width="2"/>`);
      elements.push(`<text x="${x + cellWidth / 2}" y="${y + imageHeight / 2}" text-anchor="middle" fill="#ffb3bb" font-family="sans-serif" font-size="24">MISSING: ${escapeXml(tile.id)}</text>`);
      provenanceTiles.push({ id: tile.id, status: "failed", sourcePath: tile.path || null, contentHash: null });
    } else {
      const bytes = await readFile(sourcePath);
      const data = `data:${mime};base64,${bytes.toString("base64")}`;
      elements.push(`<rect x="${x}" y="${y}" width="${cellWidth}" height="${imageHeight}" rx="8" fill="${escapeXml(tile.background || "#0a0d12")}"/>`);
      elements.push(`<image href="${data}" x="${x}" y="${y}" width="${cellWidth}" height="${imageHeight}" preserveAspectRatio="xMidYMid ${tile.fit === "cover" ? "slice" : "meet"}"/>`);
      provenanceTiles.push({ id: tile.id, status: "ready", sourcePath: tile.path, contentHash: sha256Bytes(bytes) });
    }
    elements.push(`<text x="${x + cellWidth / 2}" y="${y + imageHeight + labelHeight * 0.68}" text-anchor="middle" fill="${escapeXml(canvas.labelColor || "#f4f7fb")}" font-family="sans-serif" font-size="${labelFontSize}">${escapeXml(tile.label || tile.id)}</text>`);
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${elements.join("")}</svg>\n`;
  const absoluteOutput = resolve(outputPath);
  await mkdir(dirname(absoluteOutput), { recursive: true });
  await writeFile(absoluteOutput, svg, "utf8");
  const provenance = {
    kind: "cineweave_board_provenance",
    contractVersion: "2.2.0",
    boardId: manifest.boardId,
    manifestHash: sha256Canonical(manifest),
    boardHash: sha256Bytes(Buffer.from(svg, "utf8")),
    failedTileIds,
    tiles: provenanceTiles
  };
  await writeFile(`${absoluteOutput}.provenance.json`, `${JSON.stringify(provenance, null, 2)}\n`, "utf8");
  return { output: absoluteOutput, provenance, valid: failedTileIds.length === 0 };
}

async function main() {
  const flags = parseArgs(process.argv.slice(2));
  if (!flags.manifest || !flags.out) throw new Error("Usage: assemble-board --manifest <board.json> --out <board.svg> [--allow-partial]");
  const result = await assembleBoard(flags.manifest, flags.out, { allowPartial: flags["allow-partial"] === true });
  console.log(JSON.stringify(result.provenance, null, 2));
  if (!result.valid) process.exitCode = 3;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 2; });
}
