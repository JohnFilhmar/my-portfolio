/* eslint-disable no-console -- command-line tool: the console is its output. */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { encodeGlyphGrid } from "../src/lib/glyphPortrait/encode.ts";

/**
 * Originals live in ./assets (kept out of git and the Docker image); the
 * site serves WebP copies from ./public at the same relative path. A phone
 * photo at assets/experience/team.jpg becomes public/experience/team.webp.
 */
const ASSETS_DIR = path.join(process.cwd(), "assets");
const PUBLIC_DIR = path.join(process.cwd(), "public");
const SOURCE = /\.(png|jpe?g|webp|avif|tiff?|gif)$/i;
/** Long edge in pixels: crisp on a 2x screen at the largest size the site shows. */
const MAX_EDGE = 1920;
const QUALITY = 80;
/** Portrait originals also become character grids for the hero's glyph portrait. */
const PORTRAIT_DIR = "portrait";
const GLYPH_DIR = path.join(PUBLIC_DIR, PORTRAIT_DIR, "glyphs");
/** Cells per side. Each one is a DOM character, so this trades detail for frame time. */
const GLYPH_SIZE = 160;

export interface OptimizedImage {
  source: string;
  output: string;
  bytesBefore: number;
  bytesAfter: number;
  skipped: boolean;
}

/** Bakes one portrait into a glyph grid JSON file, one pixel per cell. */
async function bakeGlyphs(source: string, output: string): Promise<void> {
  const { data, info } = await sharp(source)
    .rotate()
    .resize({ width: GLYPH_SIZE, height: GLYPH_SIZE, fit: "inside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const grid = encodeGlyphGrid({
    pixels: data,
    width: info.width,
    height: info.height,
    cols: GLYPH_SIZE,
    rows: GLYPH_SIZE,
  });
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(grid));
}

function listSources(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return listSources(full);
      return SOURCE.test(entry.name) ? [full] : [];
    })
    .sort();
}

/**
 * Converts every original under ./assets to WebP under ./public. Phone photos
 * are turned upright from their EXIF orientation, then all metadata (camera,
 * GPS) is dropped. Portraits in assets/portrait also get a glyph grid in
 * public/portrait/glyphs. Outputs newer than their source are left alone.
 *
 * @param options.force - Re-encode even when the output is up to date.
 * @returns One entry per output (two for a portrait), in source path order.
 */
export async function optimizeImages(
  options: { force?: boolean } = {},
): Promise<OptimizedImage[]> {
  const results: OptimizedImage[] = [];
  for (const source of listSources(ASSETS_DIR)) {
    const relative = path.relative(ASSETS_DIR, source);
    const output = path.join(PUBLIC_DIR, relative.replace(/\.[^.]+$/, ".webp"));
    const before = fs.statSync(source);
    if (path.dirname(relative) === PORTRAIT_DIR) {
      const glyphs = path.join(
        GLYPH_DIR,
        path.basename(relative).replace(/\.[^.]+$/, ".json"),
      );
      const fresh =
        fs.existsSync(glyphs) && fs.statSync(glyphs).mtimeMs >= before.mtimeMs;
      if (!fresh || options.force) await bakeGlyphs(source, glyphs);
      results.push({
        source,
        output: glyphs,
        bytesBefore: before.size,
        bytesAfter: fs.statSync(glyphs).size,
        skipped: fresh && !options.force,
      });
    }
    const upToDate =
      fs.existsSync(output) && fs.statSync(output).mtimeMs >= before.mtimeMs;
    if (upToDate && !options.force) {
      results.push({
        source,
        output,
        bytesBefore: before.size,
        bytesAfter: fs.statSync(output).size,
        skipped: true,
      });
      continue;
    }
    fs.mkdirSync(path.dirname(output), { recursive: true });
    await sharp(source)
      .rotate()
      .resize({
        width: MAX_EDGE,
        height: MAX_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: QUALITY, alphaQuality: 90, effort: 5 })
      .toFile(output);
    results.push({
      source,
      output,
      bytesBefore: before.size,
      bytesAfter: fs.statSync(output).size,
      skipped: false,
    });
  }
  return results;
}

const kb = (bytes: number) => `${Math.round(bytes / 1024)} KB`;

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const results = await optimizeImages({
    force: process.argv.includes("--force"),
  });
  if (results.length === 0) {
    console.log(
      "Nothing in ./assets. Put originals there, e.g. assets/portrait/me.png.",
    );
  }
  for (const r of results) {
    const where = path.relative(process.cwd(), r.output);
    console.log(
      r.skipped
        ? `  up to date  ${where}`
        : `  ${kb(r.bytesBefore).padStart(8)} -> ${kb(r.bytesAfter).padStart(7)}  ${where}`,
    );
  }
}
