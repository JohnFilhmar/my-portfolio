import assert from "node:assert/strict";
import { test } from "node:test";
import { encodeGlyphGrid } from "./encode.ts";
import { glyphGridSchema, gridLevels } from "./grid.ts";
import {
  BLOCK_RAMP,
  RAMP_START,
  blockText,
  rampSteps,
  resampleLevels,
} from "./resample.ts";

/** A 4×4 RGBA image: a transparent left half, a grey-to-white right half. */
function cutout(): Uint8Array {
  const px = new Uint8Array(4 * 4 * 4);
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      const i = (y * 4 + x) * 4;
      const v = x < 2 ? 0 : 80 + y * 55;
      px.set([v, v, v, x < 2 ? 0 : 255], i);
    }
  }
  return px;
}

test("encodes a cut-out bottom-centered, keeping transparency as empty cells", () => {
  const grid = encodeGlyphGrid({
    pixels: cutout(),
    width: 4,
    height: 4,
    cols: 6,
    rows: 5,
  });
  assert.equal(glyphGridSchema.safeParse(grid).success, true);
  assert.equal(grid.lines[0], "      ", "padding row above the image");
  for (const line of grid.lines.slice(1)) assert.match(line, /^   [0-9]{2} $/);
  const levels = gridLevels(grid);
  assert.ok(
    (levels[4 * 6 + 3] ?? 0) > (levels[1 * 6 + 3] ?? 0),
    "brighter rows are denser",
  );
});

test("keys out the corner color of an opaque photo", () => {
  const px = new Uint8Array(8 * 8 * 4);
  for (let i = 0; i < 64; i++) px.set([30, 140, 60, 255], i * 4);
  for (const i of [27, 28, 35, 36]) px.set([240, 220, 200, 255], i * 4);
  const grid = encodeGlyphGrid({
    pixels: px,
    width: 8,
    height: 8,
    cols: 8,
    rows: 8,
  });
  const filled = grid.lines.join("").replace(/ /g, "").length;
  assert.equal(filled, 4);
});

test("rejects a grid whose lines do not match its size", () => {
  assert.equal(
    glyphGridSchema.safeParse({ cols: 2, rows: 1, lines: ["123"] }).success,
    false,
  );
});

test("the ramp starts at 40 columns and aspect 0.40 and ends on the full grid", () => {
  const steps = rampSteps(12, 160);
  assert.deepEqual(steps[0], {
    cols: RAMP_START.cols,
    rows: Math.round(RAMP_START.cols * RAMP_START.aspect),
  });
  assert.deepEqual(steps.at(-1), { cols: 160, rows: 160 });
  for (let i = 1; i < steps.length; i++) {
    assert.ok(
      (steps[i]?.cols ?? 0) >= (steps[i - 1]?.cols ?? 0),
      "never coarser",
    );
  }
});

test("resampling keeps the silhouette and averages its levels", () => {
  // 4×2: left half empty, right half levels 2 and 6.
  const levels = Int8Array.from([-1, -1, 2, 6, -1, -1, 2, 6]);
  const half = resampleLevels(
    levels,
    { cols: 4, rows: 2 },
    { cols: 2, rows: 1 },
  );
  assert.deepEqual([...half], [-1, 4]);
  const same = resampleLevels(
    levels,
    { cols: 4, rows: 2 },
    { cols: 4, rows: 2 },
  );
  assert.deepEqual([...same], [...levels]);
});

test("block text never leaves a silhouette cell blank", () => {
  const text = blockText(Int8Array.from([-1, 0, 9, 5]), { cols: 2, rows: 2 });
  const [top, bottom] = text.split("\n");
  assert.equal(top, ` ${BLOCK_RAMP[0]}`);
  assert.equal(bottom?.[0], BLOCK_RAMP.at(-1));
  assert.notEqual(bottom?.[1], " ");
});
