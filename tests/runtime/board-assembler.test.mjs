import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { assembleBoard } from "../../packages/cineweave-runtime/bin/assemble-board.mjs";

test("board assembler embeds independent tiles and records partial failures", async () => {
  const root = await mkdtemp(join(tmpdir(), "cineweave-board-test-"));
  try {
    await writeFile(join(root, "front.svg"), '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="red"/></svg>', "utf8");
    const manifest = {
      boardId: "board.test",
      canvas: { width: 800, height: 400, padding: 20, gap: 20, labelHeight: 40 },
      layout: { columns: 2, rows: 1 },
      tiles: [
        { id: "front", label: "正面", path: "front.svg" },
        { id: "side", label: "侧面", path: "missing.png", status: "failed" }
      ]
    };
    const manifestPath = join(root, "board.json");
    const outputPath = join(root, "board.svg");
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
    await assert.rejects(() => assembleBoard(manifestPath, outputPath), /Required tile/);
    const result = await assembleBoard(manifestPath, outputPath, { allowPartial: true });
    assert.equal(result.valid, false);
    assert.deepEqual(result.provenance.failedTileIds, ["side"]);
    const svg = await readFile(outputPath, "utf8");
    assert.match(svg, /data:image\/svg\+xml;base64/);
    assert.match(svg, /正面/);
    assert.match(svg, /MISSING: side/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("board assembler rejects duplicate cell occupancy", async () => {
  const root = await mkdtemp(join(tmpdir(), "cineweave-board-collision-"));
  try {
    await writeFile(join(root, "tile.svg"), '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>', "utf8");
    const manifestPath = join(root, "board.json");
    await writeFile(manifestPath, JSON.stringify({
      boardId: "board.collision",
      canvas: { width: 800, height: 400 },
      layout: { columns: 2, rows: 1 },
      tiles: [
        { id: "left", path: "tile.svg", column: 0, row: 0 },
        { id: "right", path: "tile.svg", column: 0, row: 0 }
      ]
    }), "utf8");
    await assert.rejects(() => assembleBoard(manifestPath, join(root, "board.svg")), /Multiple tiles occupy/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test("board assembler rejects fractional grids and invalid explicit cells", async () => {
  const root = await mkdtemp(join(tmpdir(), "cineweave-board-geometry-"));
  try {
    const manifestPath = join(root, "board.json");
    await writeFile(manifestPath, JSON.stringify({
      boardId: "board.geometry",
      canvas: { width: 800, height: 400 },
      layout: { columns: 1.5, rows: 1 },
      tiles: []
    }), "utf8");
    await assert.rejects(() => assembleBoard(manifestPath, join(root, "fractional.svg")), /Invalid board geometry/);

    await writeFile(manifestPath, JSON.stringify({
      boardId: "board.geometry",
      canvas: { width: 800, height: 400 },
      layout: { columns: 1, rows: 1 },
      tiles: [{ id: "tile", column: "0", row: 0, status: "failed" }]
    }), "utf8");
    await assert.rejects(() => assembleBoard(manifestPath, join(root, "cell.svg"), { allowPartial: true }), /column must be an integer/);
  } finally { await rm(root, { recursive: true, force: true }); }
});
