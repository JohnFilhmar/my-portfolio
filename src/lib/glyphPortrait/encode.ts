import { MAX_LEVEL, type GlyphGrid } from "./grid.ts";

/**
 * Tone settings, from the Glyph Portrait Studio's "Portrait" preset minus
 * equalization: on a light outfit it spends the density range on the clothes
 * and flattens the face.
 */
export interface GlyphTone {
  /** -50 to 150. Spreads tones away from mid grey. */
  contrast: number;
  /** 0 to 1. Blends in histogram equalization, which brings out faces. */
  equalize: number;
  /** Above 1 darkens mid tones, below 1 lightens them. */
  gamma: number;
  /** 0 to 0.6. Lowest density inside the silhouette, so black hair stays visible. */
  floor: number;
}

export const PORTRAIT_TONE: GlyphTone = {
  contrast: 20,
  equalize: 0,
  gamma: 1,
  floor: 0.18,
};

export interface EncodeInput {
  /** RGBA bytes, one pixel per cell. */
  pixels: Uint8Array;
  width: number;
  height: number;
  /** Grid size. The image sits bottom-centered in it, padded with empty cells. */
  cols: number;
  rows: number;
  tone?: GlyphTone;
}

const KEY_TOLERANCE = 18;
const KEY_SOFTNESS = 12;

const smooth = (a: number, b: number, x: number): number => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Mean color of the four corner patches: the backdrop of an opaque photo. */
function cornerKey(px: Uint8Array, w: number, h: number): number[] {
  const pw = Math.max(1, Math.round(w / 14));
  const ph = Math.max(1, Math.round(h / 14));
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;
  for (const [x0, y0] of [
    [0, 0],
    [w - pw, 0],
    [0, h - ph],
    [w - pw, h - ph],
  ] as const) {
    for (let y = y0; y < y0 + ph; y++) {
      for (let x = x0; x < x0 + pw; x++) {
        const i = (y * w + x) * 4;
        r += px[i] ?? 0;
        g += px[i + 1] ?? 0;
        b += px[i + 2] ?? 0;
        count++;
      }
    }
  }
  return [r / count, g / count, b / count];
}

/**
 * Turns an image into a glyph grid: luminance with contrast, equalization and
 * gamma, quantized to density levels. A cut-out keeps its transparency as the
 * silhouette; a fully opaque photo has its corner color keyed out instead.
 *
 * @param input - Pixels, their size, the grid size, and optional tone.
 * @returns A grid of `cols` × `rows` cells.
 * @throws {RangeError} When the image is larger than the grid.
 */
export function encodeGlyphGrid(input: EncodeInput): GlyphGrid {
  const { pixels: px, width: w, height: h, cols, rows } = input;
  const tone = input.tone ?? PORTRAIT_TONE;
  if (w > cols || h > rows) {
    throw new RangeError(`image ${w}×${h} does not fit a ${cols}×${rows} grid`);
  }
  const n = w * h;
  let opaque = true;
  for (let i = 0; i < n && opaque; i++) opaque = (px[i * 4 + 3] ?? 0) >= 250;
  const key = opaque ? cornerKey(px, w, h) : null;

  const lum = new Float32Array(n);
  const alpha = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const r = px[i * 4] ?? 0;
    const g = px[i * 4 + 1] ?? 0;
    const b = px[i * 4 + 2] ?? 0;
    let a = (px[i * 4 + 3] ?? 0) / 255;
    if (key) {
      const dist =
        Math.hypot(r - (key[0] ?? 0), g - (key[1] ?? 0), b - (key[2] ?? 0)) /
        4.41;
      a *= smooth(KEY_TOLERANCE, KEY_TOLERANCE + KEY_SOFTNESS, dist);
    }
    alpha[i] = a;
    const l = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    lum[i] = Math.min(
      1,
      Math.max(0, (l - 0.5) * (1 + tone.contrast / 100) + 0.5),
    );
  }

  if (tone.equalize > 0) {
    const hist = new Float64Array(256);
    let total = 0;
    for (let i = 0; i < n; i++) {
      if ((alpha[i] ?? 0) > 0.5) {
        const bin = Math.round((lum[i] ?? 0) * 255);
        hist[bin] = (hist[bin] ?? 0) + 1;
        total++;
      }
    }
    if (total > 0) {
      const cdf = new Float32Array(256);
      let acc = 0;
      for (let v = 0; v < 256; v++) {
        acc += hist[v] ?? 0;
        cdf[v] = acc / total;
      }
      for (let i = 0; i < n; i++) {
        const l = lum[i] ?? 0;
        lum[i] =
          l * (1 - tone.equalize) +
          (cdf[Math.round(l * 255)] ?? 0) * tone.equalize;
      }
    }
  }

  const offX = Math.floor((cols - w) / 2);
  const offY = rows - h;
  const lines: string[] = [];
  for (let row = 0; row < rows; row++) {
    let line = "";
    for (let col = 0; col < cols; col++) {
      const x = col - offX;
      const y = row - offY;
      const i = y * w + x;
      if (x < 0 || x >= w || y < 0 || (alpha[i] ?? 0) <= 0.5) {
        line += " ";
        continue;
      }
      const l = Math.max(Math.pow(lum[i] ?? 0, tone.gamma), tone.floor);
      line += String(
        Math.min(MAX_LEVEL, Math.max(0, Math.round(l * MAX_LEVEL))),
      );
    }
    lines.push(line);
  }
  return { cols, rows, lines };
}
