import { MAX_LEVEL } from "./grid.ts";

/** Block characters from lightest to fullest. A cell inside the silhouette is never blank. */
export const BLOCK_RAMP = "░▒▓█";

/** Starting resolution of a build: the Glyph Portrait Studio's lowest slider values. */
export const RAMP_START = { cols: 40, aspect: 0.4 };

export interface RampStep {
  cols: number;
  rows: number;
}

/**
 * The resolutions a build steps through, from 40 columns at cell aspect 0.40
 * up to the full grid at aspect 1, eased so the coarse start lingers briefly.
 *
 * @param count - Number of steps, at least 2. The last is always the full grid.
 * @param full - Columns of the full grid; a square grid has as many rows.
 * @returns One resolution per step, coarsest first.
 */
export function rampSteps(count: number, full: number): RampStep[] {
  const steps: RampStep[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const eased = t * t * (3 - 2 * t);
    const cols = Math.round(RAMP_START.cols + (full - RAMP_START.cols) * eased);
    const aspect = RAMP_START.aspect + (1 - RAMP_START.aspect) * eased;
    steps.push({ cols, rows: Math.max(1, Math.round(cols * aspect)) });
  }
  return steps;
}

/**
 * Averages a level grid down (or across) to another size. A target cell is
 * empty when most of the source cells it covers are outside the silhouette.
 *
 * @param levels - Source levels from `gridLevels`, -1 for empty cells.
 * @param src - Source grid size.
 * @param out - Target grid size.
 * @returns Target levels, -1 for empty cells.
 */
export function resampleLevels(
  levels: Int8Array,
  src: RampStep,
  out: RampStep,
): Int8Array {
  const result = new Int8Array(out.cols * out.rows);
  for (let r = 0; r < out.rows; r++) {
    const y0 = Math.floor((r * src.rows) / out.rows);
    const y1 = Math.max(y0 + 1, Math.floor(((r + 1) * src.rows) / out.rows));
    for (let c = 0; c < out.cols; c++) {
      const x0 = Math.floor((c * src.cols) / out.cols);
      const x1 = Math.max(x0 + 1, Math.floor(((c + 1) * src.cols) / out.cols));
      let sum = 0;
      let filled = 0;
      let total = 0;
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          const level = levels[y * src.cols + x] ?? -1;
          total++;
          if (level >= 0) {
            sum += level;
            filled++;
          }
        }
      }
      result[r * out.cols + c] =
        filled * 2 > total ? Math.round(sum / filled) : -1;
    }
  }
  return result;
}

/**
 * Renders levels as rows of block characters.
 *
 * @param levels - Levels 0-9, or -1 for empty cells.
 * @param size - Grid size the levels are laid out in.
 * @returns One line per row, joined with newlines.
 */
export function blockText(levels: Int8Array, size: RampStep): string {
  const last = BLOCK_RAMP.length - 1;
  const lines: string[] = [];
  for (let r = 0; r < size.rows; r++) {
    let line = "";
    for (let c = 0; c < size.cols; c++) {
      const level = levels[r * size.cols + c] ?? -1;
      line +=
        level < 0 ? " " : BLOCK_RAMP[Math.round((level / MAX_LEVEL) * last)];
    }
    lines.push(line);
  }
  return lines.join("\n");
}
