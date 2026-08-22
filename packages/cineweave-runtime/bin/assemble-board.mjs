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

function exactTaskKey(recipeRunId, taskId) { return `${recipeRunId}/${taskId}`; }

function normalizeBoardManifest(manifest) {
  if (!manifest?.boardPlan) return manifest;
  const plan = manifest.boardPlan;
  const outputs = new Map();
  for (const output of manifest.taskOutputs || []) {
    const key = exactTaskKey(output?.recipeRunId, output?.taskId);
    if (outputs.has(key)) throw new Error(`Duplicate task output: ${key}`);
    outputs.set(key, output || {});
  }
  const recipeRunIds = new Set((plan.recipeRuns || []).map((run) => run?.recipeRunId));
  const declaredTaskKeys = new Set((plan.recipeRuns || []).flatMap((run) => (run?.taskIds || []).map((taskId) => exactTaskKey(run.recipeRunId, taskId))));
  const tiles = [];
  for (const placement of plan.tilePlacements || []) {
    if (!recipeRunIds.has(placement?.recipeRunId)) throw new Error(`Plan placement uses unknown recipe run: ${placement?.recipeRunId}`);
    const key = exactTaskKey(placement?.recipeRunId, placement?.taskId);
    if (!declaredTaskKeys.has(key)) throw new Error(`Plan placement uses undeclared task: ${key}`);
    const output = outputs.get(key) || {};
    tiles.push({
      id: placement.tileId,
      label: placement.label,
      path: output.path,
      status: output.status,
      fit: placement.fit,
      required: placement.required,
      regionId: placement.regionId,
      row: placement.row,
      column: placement.column,
      recipeRunId: placement.recipeRunId,
      taskId: placement.taskId
    });
  }
  return {
    boardId: manifest.boardId || plan.boardPlanId,
    canvas: plan.canvas,
    layout: { regions: plan.regions },
    tiles
  };
}

function normalizeRegions(layout, width, height, gap, labelHeight) {
  const regions = Array.isArray(layout?.regions) ? layout.regions : null;
  if (!regions) return null;
  const result = new Map();
  for (const region of regions) {
    if (!region?.regionId || result.has(region.regionId)) throw new Error(`Region IDs must be present and unique: ${region?.regionId || "<missing>"}`);
    const values = [region.x, region.y, region.width, region.height, region.rows, region.columns].map(Number);
    if (!values.every(Number.isFinite) || region.width <= 0 || region.height <= 0 || region.x < 0 || region.y < 0 || region.x + region.width > 1.000000001 || region.y + region.height > 1.000000001 || !Number.isSafeInteger(region.rows) || !Number.isSafeInteger(region.columns) || region.rows < 1 || region.columns < 1) throw new Error(`Invalid board region: ${region?.regionId || "<missing>"}`);
    const regionWidth = width * region.width;
    const regionHeight = height * region.height;
    const cellWidth = (regionWidth - gap * (region.columns - 1)) / region.columns;
    const cellHeight = (regionHeight - gap * (region.rows - 1)) / region.rows;
    const regionLabelHeight = region.labelPolicy === "none" ? 0 : labelHeight;
    if (cellWidth <= 0 || cellHeight <= regionLabelHeight) throw new Error(`Board region has no usable image area: ${region.regionId}`);
    result.set(region.regionId, { ...region, x: width * region.x, y: height * region.y, cellWidth, cellHeight, imageHeight: cellHeight - regionLabelHeight, labelHeight: regionLabelHeight });
  }
  const values = [...result.values()];
  for (let left = 0; left < values.length; left += 1) for (let right = left + 1; right < values.length; right += 1) {
    const a = values[left]; const b = values[right];
    const overlaps = a.x < b.x + b.width * width && a.x + a.width * width > b.x && a.y < b.y + b.height * height && a.y + a.height * height > b.y;
    if (overlaps) throw new Error(`Board regions overlap: ${a.regionId}/${b.regionId}`);
  }
  return result;
}

export async function assembleBoard(manifestPath, outputPath, options = {}) {
  const absoluteManifest = resolve(manifestPath);
  const sourceManifest = parseJsonStrict(await readFile(absoluteManifest, "utf8"));
  const manifest = normalizeBoardManifest(sourceManifest);
  const canvas = manifest.canvas || {};
  const width = Number(canvas.width || 1600);
  const height = Number(canvas.height || 1200);
  const padding = Number(canvas.padding ?? 48);
  const gap = Number(canvas.gap ?? 24);
  const labelHeight = Number(canvas.labelHeight ?? 52);
  const labelFontSize = Number(canvas.labelFontSize ?? 24);
  const regions = normalizeRegions(manifest.layout, width, height, gap, labelHeight);
  const columns = Number(manifest.layout?.columns || 1);
  const rows = Number(manifest.layout?.rows || Math.ceil((manifest.tiles || []).length / columns));
  if (![width, height, padding, gap, labelHeight, labelFontSize].every(Number.isFinite) || width <= 0 || height <= 0 || padding < 0 || gap < 0 || labelHeight < 0 || labelFontSize <= 0) throw new Error("Invalid board geometry");
  if (!regions && (!Number.isFinite(columns) || !Number.isFinite(rows) || !Number.isSafeInteger(columns) || !Number.isSafeInteger(rows) || columns < 1 || rows < 1)) throw new Error("Invalid board geometry");
  const cellWidth = regions ? null : (width - padding * 2 - gap * (columns - 1)) / columns;
  const cellHeight = regions ? null : (height - padding * 2 - gap * (rows - 1)) / rows;
  if (!regions && (cellWidth <= 0 || cellHeight <= labelHeight)) throw new Error("Board cells have no usable image area");
  if (!regions && (manifest.tiles || []).length > columns * rows) throw new Error("Board has more tiles than grid cells");
  const imageHeight = regions ? null : Math.max(1, cellHeight - labelHeight);
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
    const region = regions ? regions.get(tile.regionId) : null;
    if (regions && !region) throw new Error(`Tile ${tile.id} uses unknown board region: ${tile.regionId || "<missing>"}`);
    const column = Number.isSafeInteger(tile.column) ? tile.column : index % columns;
    const row = Number.isSafeInteger(tile.row) ? tile.row : Math.floor(index / columns);
    const activeColumns = region?.columns || columns;
    const activeRows = region?.rows || rows;
    if (column < 0 || column >= activeColumns || row < 0 || row >= activeRows) throw new Error(`Tile ${tile.id} is outside the board grid`);
    const cellKey = `${region?.regionId || "grid"},${column},${row}`;
    if (occupiedCells.has(cellKey)) throw new Error(`Multiple tiles occupy board cell ${cellKey}`);
    occupiedCells.add(cellKey);
    const activeCellWidth = region?.cellWidth || cellWidth;
    const activeImageHeight = region?.imageHeight || imageHeight;
    const activeLabelHeight = region?.labelHeight ?? labelHeight;
    const x = region ? region.x + column * (activeCellWidth + gap) : padding + column * (activeCellWidth + gap);
    const y = region ? region.y + row * (region.cellHeight + gap) : padding + row * (cellHeight + gap);
    const sourcePath = tile.path ? resolve(dirname(absoluteManifest), tile.path) : null;
    const extension = sourcePath ? extname(sourcePath).toLowerCase() : "";
    const mime = mimeTypes.get(extension);
    const available = tile.status !== "failed" && sourcePath && mime && existsSync(sourcePath);
    if (!available) {
      failedTileIds.push(tile.id);
      if (tile.required !== false && !options.allowPartial) throw new Error(`Required tile is missing or failed: ${tile.id}`);
      elements.push(`<rect x="${x}" y="${y}" width="${activeCellWidth}" height="${activeImageHeight}" rx="8" fill="#251b22" stroke="#ff6b7a" stroke-width="2"/>`);
      elements.push(`<text x="${x + activeCellWidth / 2}" y="${y + activeImageHeight / 2}" text-anchor="middle" fill="#ffb3bb" font-family="sans-serif" font-size="24">MISSING: ${escapeXml(tile.id)}</text>`);
      provenanceTiles.push({ id: tile.id, status: "failed", sourcePath: tile.path || null, contentHash: null, ...(tile.recipeRunId ? { recipeRunId: tile.recipeRunId, taskId: tile.taskId, regionId: tile.regionId } : {}) });
    } else {
      const bytes = await readFile(sourcePath);
      const data = `data:${mime};base64,${bytes.toString("base64")}`;
      elements.push(`<rect x="${x}" y="${y}" width="${activeCellWidth}" height="${activeImageHeight}" rx="8" fill="${escapeXml(tile.background || "#0a0d12")}"/>`);
      elements.push(`<image href="${data}" x="${x}" y="${y}" width="${activeCellWidth}" height="${activeImageHeight}" preserveAspectRatio="xMidYMid ${tile.fit === "cover" ? "slice" : "meet"}"/>`);
      provenanceTiles.push({ id: tile.id, status: "ready", sourcePath: tile.path, contentHash: sha256Bytes(bytes), ...(tile.recipeRunId ? { recipeRunId: tile.recipeRunId, taskId: tile.taskId, regionId: tile.regionId } : {}) });
    }
    if (activeLabelHeight > 0) elements.push(`<text x="${x + activeCellWidth / 2}" y="${y + activeImageHeight + activeLabelHeight * 0.68}" text-anchor="middle" fill="${escapeXml(canvas.labelColor || "#f4f7fb")}" font-family="sans-serif" font-size="${labelFontSize}">${escapeXml(tile.label || tile.id)}</text>`);
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${elements.join("")}</svg>\n`;
  const absoluteOutput = resolve(outputPath);
  await mkdir(dirname(absoluteOutput), { recursive: true });
  await writeFile(absoluteOutput, svg, "utf8");
  const provenance = {
    kind: "cineweave_board_provenance",
    contractVersion: "2.5.0",
    boardId: manifest.boardId,
    manifestHash: sha256Canonical(sourceManifest),
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
