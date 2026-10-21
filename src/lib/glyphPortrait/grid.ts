import { z } from "zod";

/** Highest density level a cell can hold; levels are stored as digits 0-9. */
export const MAX_LEVEL = 9;

/**
 * A portrait baked into a character grid by `npm run images`. Each line holds
 * one row: a space for a cell outside the silhouette, else a digit 0-9 giving
 * its density level.
 */
export const glyphGridSchema = z
  .object({
    cols: z.number().int().positive(),
    rows: z.number().int().positive(),
    lines: z.array(z.string().regex(/^[ 0-9]*$/)),
  })
  .refine(
    (grid) =>
      grid.lines.length === grid.rows &&
      grid.lines.every((line) => line.length === grid.cols),
    { message: "lines must be exactly rows × cols" },
  );

export type GlyphGrid = z.infer<typeof glyphGridSchema>;

/**
 * Flattens a grid into one level per cell, row by row.
 *
 * @param grid - A validated grid.
 * @returns Levels 0-9, or -1 for a cell outside the silhouette.
 */
export function gridLevels(grid: GlyphGrid): Int8Array {
  const levels = new Int8Array(grid.cols * grid.rows);
  grid.lines.forEach((line, row) => {
    for (let col = 0; col < grid.cols; col++) {
      const ch = line.charCodeAt(col);
      levels[row * grid.cols + col] = ch === 32 ? -1 : ch - 48;
    }
  });
  return levels;
}
