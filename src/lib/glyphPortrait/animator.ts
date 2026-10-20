import { GLYPH_RAMP, MAX_LEVEL } from "./grid.ts";

/** Milliseconds before a cell starts scrambling, by its column and row. */
export type DelayFor = (col: number, row: number) => number;

export interface MorphPlan {
  delay: DelayFor;
  /** How long a cell scrambles before it settles, in ms. 0 swaps instantly. */
  scramble: number;
  /** Scramble with dense glyphs, so the change reads as a bright wave. */
  pulse: boolean;
}

export interface AnimatorOptions {
  cols: number;
  rows: number;
  /** Receives a row's full text whenever any cell in it changed. */
  writeRow: (row: number, text: string) => void;
  /** Idle flicker: share of the silhouette re-rolled each tick. 0 turns it off. */
  shimmer?: number;
  random?: () => number;
}

const BLANK = -1;

/**
 * Animates a character grid between portraits. Each cell holds a target level
 * and a time window: before it the cell keeps what it shows, inside it the
 * cell shows random glyphs, after it the cell settles on its target. Once
 * every cell settles, a light shimmer keeps the portrait alive.
 */
export class GlyphAnimator {
  readonly cols: number;
  readonly rows: number;
  private readonly writeRow: AnimatorOptions["writeRow"];
  private readonly random: () => number;
  private readonly shimmer: number;
  private target: Int8Array;
  private readonly shown: Int8Array;
  private readonly startAt: Float64Array;
  private readonly settleAt: Float64Array;
  private readonly active: Uint8Array;
  private readonly dirty: Uint8Array;
  private filled: Int32Array = new Int32Array(0);
  private settledBy = 0;
  /** A morph was started and its final state is not fully written yet. */
  private unsettled = false;
  private pulse = false;

  /**
   * @param options - Grid size, the row writer, and optional shimmer and randomness.
   */
  constructor(options: AnimatorOptions) {
    this.cols = options.cols;
    this.rows = options.rows;
    this.writeRow = options.writeRow;
    this.random = options.random ?? Math.random;
    this.shimmer = options.shimmer ?? 0.004;
    const n = this.cols * this.rows;
    this.target = new Int8Array(n).fill(BLANK);
    this.shown = new Int8Array(n).fill(BLANK);
    this.startAt = new Float64Array(n);
    this.settleAt = new Float64Array(n);
    this.active = new Uint8Array(n);
    this.dirty = new Uint8Array(this.rows).fill(1);
  }

  /**
   * Starts a change to a new portrait. Cells outside both silhouettes stay
   * blank and never scramble.
   *
   * @param levels - One level per cell from `gridLevels`, sized cols × rows.
   * @param now - Current time in ms, on the same clock later passed to `tick`.
   * @param plan - When each cell starts, how long it scrambles, and how.
   * @throws {RangeError} When `levels` does not match the grid size.
   */
  morphTo(levels: Int8Array, now: number, plan: MorphPlan): void {
    if (levels.length !== this.target.length) {
      throw new RangeError("levels do not match the grid size");
    }
    const filled: number[] = [];
    let last = now;
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const i = row * this.cols + col;
        const next = levels[i] ?? BLANK;
        if (next !== BLANK) filled.push(i);
        this.active[i] =
          next !== BLANK || (this.shown[i] ?? BLANK) !== BLANK ? 1 : 0;
        const start = now + plan.delay(col, row);
        const settle = start + plan.scramble * (0.6 + 0.8 * this.random());
        this.startAt[i] = start;
        this.settleAt[i] = settle;
        if (settle > last) last = settle;
      }
    }
    this.target = Int8Array.from(levels);
    this.filled = Int32Array.from(filled);
    this.settledBy = last;
    this.unsettled = true;
    this.pulse = plan.pulse;
  }

  /** True until a tick has written the last morph's final state. */
  isMorphing(): boolean {
    return this.unsettled;
  }

  /**
   * Advances every cell to `now` and writes the rows that changed.
   *
   * @param now - Current time in ms.
   * @returns How many rows were written.
   */
  tick(now: number): number {
    if (this.unsettled) {
      this.stepMorph(now);
      this.unsettled = now < this.settledBy;
    } else this.stepShimmer();
    return this.flush();
  }

  private set(i: number, level: number): void {
    if (this.shown[i] === level) return;
    this.shown[i] = level;
    this.dirty[Math.floor(i / this.cols)] = 1;
  }

  private stepMorph(now: number): void {
    const low = this.pulse ? Math.ceil(MAX_LEVEL / 2) : 1;
    for (let i = 0; i < this.target.length; i++) {
      if (!this.active[i] || now < (this.startAt[i] ?? 0)) continue;
      if (now >= (this.settleAt[i] ?? 0)) this.set(i, this.target[i] ?? BLANK);
      else if (this.random() < 0.5) {
        this.set(i, low + Math.floor(this.random() * (MAX_LEVEL - low + 1)));
      }
    }
  }

  private stepShimmer(): void {
    const count = Math.ceil(this.filled.length * this.shimmer);
    if (count === 0) return;
    for (let k = 0; k < count; k++) {
      const flip =
        this.filled[Math.floor(this.random() * this.filled.length)] ?? 0;
      const level = (this.target[flip] ?? 0) + (this.random() < 0.5 ? -1 : 1);
      this.set(flip, Math.min(MAX_LEVEL, Math.max(0, level)));
      const heal =
        this.filled[Math.floor(this.random() * this.filled.length)] ?? 0;
      this.set(heal, this.target[heal] ?? BLANK);
    }
  }

  private flush(): number {
    let written = 0;
    for (let row = 0; row < this.rows; row++) {
      if (!this.dirty[row]) continue;
      this.dirty[row] = 0;
      let text = "";
      for (let col = 0; col < this.cols; col++) {
        const level = this.shown[row * this.cols + col] ?? BLANK;
        text += level === BLANK ? " " : GLYPH_RAMP[level];
      }
      this.writeRow(row, text);
      written++;
    }
    return written;
  }
}
