import assert from "node:assert/strict";
import { test } from "node:test";
import { GlyphAnimator } from "./animator.ts";
import { encodeGlyphGrid } from "./encode.ts";
import { GLYPH_RAMP, glyphGridSchema, gridLevels } from "./grid.ts";

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

test("builds up to the target, then shimmers without leaving the silhouette", () => {
  const rows: string[] = ["", ""];
  const animator = new GlyphAnimator({
    cols: 3,
    rows: 2,
    writeRow: (row, text) => (rows[row] = text),
    random: () => 0.25,
    shimmer: 0.5,
  });
  const levels = Int8Array.from([-1, 9, 0, 5, -1, 9]);
  animator.morphTo(levels, 0, {
    delay: (col) => col * 100,
    scramble: 200,
    pulse: false,
  });
  animator.tick(0);
  assert.equal(
    rows[0],
    "   ",
    "nothing has started at t=0 except column 0, which is blank",
  );
  animator.tick(1000);
  assert.equal(animator.isMorphing(), false);
  assert.deepEqual(rows, [
    ` ${GLYPH_RAMP[9]}${GLYPH_RAMP[0]}`,
    `${GLYPH_RAMP[5]} ${GLYPH_RAMP[9]}`,
  ]);
  animator.tick(1100);
  assert.equal(rows[0]?.[0], " ");
  assert.equal(rows[1]?.[1], " ");
});

test("an instant change lands even when the first tick comes late", () => {
  const rows: string[] = [""];
  const animator = new GlyphAnimator({
    cols: 2,
    rows: 1,
    writeRow: (r, t) => (rows[r] = t),
    shimmer: 0,
  });
  animator.morphTo(Int8Array.from([9, 2]), 0, {
    delay: () => 0,
    scramble: 0,
    pulse: false,
  });
  animator.tick(5000);
  assert.equal(rows[0], `${GLYPH_RAMP[9]}${GLYPH_RAMP[2]}`);
  assert.equal(animator.isMorphing(), false);
});
