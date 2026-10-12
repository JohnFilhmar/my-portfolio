/* eslint-disable no-console -- command-line tool: the console is its output. */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { optimizeImages } from "../optimize_images.ts";
import {
  badge,
  diagram,
  person,
  photo,
  screen,
  seeded,
  stampOverlay,
} from "./drawings.ts";
import {
  SAMPLE_BADGES,
  SAMPLE_CERTIFICATIONS,
  SAMPLE_RECOMMENDATIONS,
  SAMPLE_NOTES,
} from "./sample_data.ts";

/**
 * Fills every empty picture and content slot with labelled samples so the
 * whole site can be looked at and tested before the real assets exist.
 *
 *   npm run sample:seed    write samples (only where nothing real exists)
 *   npm run sample:seed -- --real-photos
 *                          use stock photos from picsum.photos for photo slots
 *   npm run sample:clean   remove exactly what seed wrote
 *
 * Clean deletes a file only if it is byte-for-byte what seed wrote, and
 * restores a config file only if it was not edited since, so real assets
 * dropped in while seeded are never lost.
 */

const ROOT = process.cwd();
const STATE_DIR = path.join(ROOT, ".sample-content");
const MANIFEST = path.join(STATE_DIR, "manifest.json");
const CERTS_FILE = path.join(ROOT, "config", "sections", "certifications.json");
const RECS_FILE = path.join(ROOT, "config", "sections", "recommendations.json");

interface Manifest {
  created: Array<{ file: string; sha256: string }>;
  replaced: Array<{ file: string; backup: string; sha256: string }>;
  dirs: string[];
}

const sha = (file: string) =>
  crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const rel = (file: string) => path.relative(ROOT, file);
const publicFile = (url: string) => path.join(ROOT, "public", url);
const assetFor = (url: string, ext: string) =>
  path.join(ROOT, "assets", url.replace(/\.webp$/, `.${ext}`));

function ensureDir(dir: string, manifest: Manifest): void {
  const missing: string[] = [];
  for (let d = dir; !fs.existsSync(d); d = path.dirname(d)) missing.push(d);
  fs.mkdirSync(dir, { recursive: true });
  manifest.dirs.push(...missing.map(rel));
}

/** Every `{ src, aspect }` picture slot in the config, plus note images. */
function pictureSlots(): Array<{ url: string; aspect: string }> {
  const slots: Array<{ url: string; aspect: string }> = [];
  const visit = (value: unknown): void => {
    if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === "object") {
      const { src, aspect } = value as { src?: unknown; aspect?: unknown };
      if (typeof src === "string" && src.endsWith(".webp")) {
        slots.push({
          url: src,
          aspect: typeof aspect === "string" ? aspect : "4/3",
        });
      }
      Object.values(value).forEach(visit);
    }
  };
  const files = [
    ...fs
      .readdirSync(path.join(ROOT, "config", "sections"))
      .map((f) => path.join(ROOT, "config", "sections", f)),
    ...fs
      .readdirSync(path.join(ROOT, "config", "notes"))
      .filter((f) => !f.startsWith("_"))
      .map((f) => path.join(ROOT, "config", "notes", f)),
  ].filter((f) => f.endsWith(".json"));
  for (const file of files) visit(JSON.parse(fs.readFileSync(file, "utf-8")));
  return slots;
}

const REAL_PHOTOS = process.argv.includes("--real-photos");

type SlotKind = "person" | "diagram" | "screen" | "photo";

/** What a slot should show, from its path and shape. */
function kindFor(url: string, w: number, h: number): SlotKind {
  if (url.endsWith("/me.webp")) return "person";
  if (url.includes("architecture")) return "diagram";
  if (url.startsWith("/work/") || url.includes("pipeline") || h > w * 1.3) {
    return "screen";
  }
  return "photo";
}

function drawingFor(url: string, w: number, h: number): string {
  switch (kindFor(url, w, h)) {
    case "person":
      return person(w, h, url, {
        skin: "#c69277",
        hair: "#231c18",
        shirt: "#2b3f57",
        backdrop: "#9fb4c6",
      });
    case "diagram":
      return diagram(w, h, url);
    case "screen":
      return screen(w, h, url);
    case "photo":
      return photo(w, h, url);
  }
}

/** A stock photo from picsum.photos for the slot, or null when offline. */
async function stockPhoto(url: string, w: number, h: number) {
  try {
    const res = await fetch(
      `https://picsum.photos/seed/${url.replace(/[^a-z0-9]+/gi, "-")}/${w}/${h}.jpg`,
      { signal: AbortSignal.timeout(20_000) },
    );
    if (!res.ok) return null;
    return await sharp(Buffer.from(await res.arrayBuffer()))
      .composite([{ input: Buffer.from(stampOverlay(w, h, url)) }])
      .toBuffer();
  } catch {
    return null;
  }
}

async function render(
  source: string | Buffer,
  file: string,
  manifest: Manifest,
) {
  ensureDir(path.dirname(file), manifest);
  const image = sharp(
    typeof source === "string" ? Buffer.from(source) : source,
  );
  await (
    file.endsWith(".jpg") ? image.jpeg({ quality: 92 }) : image.png()
  ).toFile(file);
  manifest.created.push({ file: rel(file), sha256: sha(file) });
}

async function seed(): Promise<void> {
  if (fs.existsSync(MANIFEST)) {
    throw new Error(
      "Samples are already seeded. Run `npm run sample:clean` first.",
    );
  }
  const manifest: Manifest = { created: [], replaced: [], dirs: [] };
  ensureDir(STATE_DIR, manifest);
  const publicBefore = (url: string) => fs.existsSync(publicFile(url));

  // Notes and credentials first, so their picture slots get drawn below.
  for (const [slug, note] of Object.entries(SAMPLE_NOTES)) {
    const file = path.join(ROOT, "config", "notes", `${slug}.json`);
    if (fs.existsSync(file)) continue;
    fs.writeFileSync(file, `${JSON.stringify(note, null, 2)}\n`);
    manifest.created.push({ file: rel(file), sha256: sha(file) });
  }
  // Lists that are still empty get samples; real entries are never touched.
  for (const [file, samples] of [
    [CERTS_FILE, SAMPLE_CERTIFICATIONS],
    [RECS_FILE, SAMPLE_RECOMMENDATIONS],
  ] as const) {
    const data = JSON.parse(fs.readFileSync(file, "utf-8")) as {
      items: unknown[];
    };
    if (data.items.length > 0) continue;
    const backup = path.join(STATE_DIR, path.basename(file));
    fs.copyFileSync(file, backup);
    data.items = [...samples];
    fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
    manifest.replaced.push({
      file: rel(file),
      backup: rel(backup),
      sha256: sha(file),
    });
  }

  // Originals go in ./assets, as a real upload would; a few deliberately
  // miss their slot's ratio, the way real photos do.
  const wanted = new Map<string, string>();
  for (const { url, aspect } of pictureSlots()) {
    if (publicBefore(url) || wanted.has(url)) continue;
    const [aw = 4, ah = 3] = aspect.split("/").map(Number);
    let ratio = aw / ah;
    if (seeded(url)() < 0.2) ratio = 1 / ratio;
    const long = 2400;
    const [w, h] =
      ratio >= 1
        ? [long, Math.round(long / ratio)]
        : [Math.round(long * ratio), long];
    const ext =
      url.includes("/experience/") ||
      url.includes("/education/") ||
      url.endsWith("/me.webp")
        ? "jpg"
        : "png";
    wanted.set(url, ext);
    const stock =
      REAL_PHOTOS && kindFor(url, w, h) === "photo"
        ? await stockPhoto(url, w, h)
        : null;
    await render(stock ?? drawingFor(url, w, h), assetFor(url, ext), manifest);
  }
  for (const [url, initials] of Object.entries(SAMPLE_BADGES)) {
    if (publicBefore(url)) continue;
    await render(badge(600, url, initials), assetFor(url, "png"), manifest);
  }
  const portraitDir = path.join(ROOT, "public", "portrait");
  const hasPortrait =
    fs.existsSync(portraitDir) &&
    fs
      .readdirSync(portraitDir)
      .some((f) => /\.(png|jpe?g|webp|avif)$/i.test(f));
  if (!hasPortrait) {
    const cut = (skin: string, hair: string, shirt: string) =>
      person(2400, 2400, "portrait", { skin, hair, shirt });
    await render(
      cut("#c69277", "#231c18", "#2b3f57"),
      path.join(ROOT, "assets", "portrait", "sample-01.png"),
      manifest,
    );
    await render(
      cut("#b07a5c", "#16110e", "#8c2f2a"),
      path.join(ROOT, "assets", "portrait", "sample-02.png"),
      manifest,
    );
    // An opaque, non-square photo: what people upload when they skip the cut-out.
    await render(
      person(1800, 2250, "portrait/sample-03", {
        skin: "#d1a184",
        hair: "#3a2a20",
        shirt: "#e8e2d6",
        backdrop: "#6f8a5a",
      }),
      path.join(ROOT, "assets", "portrait", "sample-03.jpg"),
      manifest,
    );
  }

  // Then the WebP copies the pipeline writes from them, and the folders it
  // had to create for them.
  const publicDir = path.join(ROOT, "public");
  const before = new Set(walk(publicDir));
  const dirsBefore = new Set(walk(publicDir, true));
  const results = await optimizeImages();
  for (const r of results) {
    if (!before.has(r.output)) {
      manifest.created.push({ file: rel(r.output), sha256: sha(r.output) });
    }
  }
  for (const dir of walk(publicDir, true)) {
    if (!dirsBefore.has(dir)) manifest.dirs.push(rel(dir));
  }
  fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(
    `Seeded ${manifest.created.length} files and ${manifest.replaced.length} config file(s). Restart the server to serve new images.`,
  );
}

/** Every file under `dir`, or every folder when `folders` is set. */
function walk(dir: string, folders = false): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (!e.isDirectory()) return folders ? [] : [full];
    return folders ? [full, ...walk(full, true)] : walk(full);
  });
}

function clean(): void {
  if (!fs.existsSync(MANIFEST)) {
    console.log("Nothing to clean: no samples are seeded.");
    return;
  }
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf-8")) as Manifest;
  const kept: string[] = [];
  let backupNeeded = false;
  for (const { file, sha256 } of manifest.created) {
    const full = path.join(ROOT, file);
    if (!fs.existsSync(full)) continue;
    if (sha(full) === sha256) fs.unlinkSync(full);
    else kept.push(file);
  }
  for (const { file, backup, sha256 } of manifest.replaced) {
    const full = path.join(ROOT, file);
    if (sha(full) === sha256) {
      fs.copyFileSync(path.join(ROOT, backup), full);
    } else {
      kept.push(`${file} (edited since seeding; original kept at ${backup})`);
      backupNeeded = true;
    }
  }
  // Deepest first, and only directories seed created that are now empty.
  for (const dir of [...manifest.dirs].sort((a, b) => b.length - a.length)) {
    const full = path.join(ROOT, dir);
    if (fs.existsSync(full) && fs.readdirSync(full).length === 0)
      fs.rmdirSync(full);
  }
  // A kept picture is yours now; only a config backup still needs the folder.
  if (!backupNeeded) fs.rmSync(STATE_DIR, { recursive: true, force: true });
  console.log(
    kept.length === 0
      ? "Removed every sample."
      : `Removed the samples. Kept files changed since seeding:\n  ${kept.join("\n  ")}`,
  );
}

const command = process.argv[2];
if (command === "seed") await seed();
else if (command === "clean") clean();
else console.log("Usage: npm run sample:seed | npm run sample:clean");
