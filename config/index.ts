import fs from "fs";
import path from "path";
import type { z } from "zod";
import {
  aboutSchema,
  assistantSchema,
  certificationsSchema,
  contactSchema,
  educationSchema,
  experienceSchema,
  heroSchema,
  projectsSchema,
  proofSchema,
  siteSchema,
  skillsSchema,
  themeSchema,
  type AppConfig,
} from "./schema";

/**
 * Typed config loader. Reads and validates every JSON file under ./config on
 * each call — `getServerSideProps` and the API routes call this per request,
 * which is what makes "edit JSON → refresh" work with no rebuild.
 *
 * Throws a descriptive error (file + zod issues) on invalid config so
 * misconfiguration fails loudly instead of rendering something half-broken.
 */

const CONFIG_DIR = path.join(process.cwd(), "config");
const PUBLIC_DIR = path.join(process.cwd(), "public");

function readJsonFile(relativePath: string): unknown {
  const filePath = path.join(CONFIG_DIR, relativePath);
  let raw: string;
  try {
    raw = fs.readFileSync(filePath, "utf-8");
  } catch (err) {
    throw new Error(
      `[config] Could not read ${relativePath} (expected at ${filePath}): ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(
      `[config] ${relativePath} is not valid JSON: ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
  }
}

function loadFile<S extends z.ZodTypeAny>(
  relativePath: string,
  schema: S,
): z.output<S> {
  const data = readJsonFile(relativePath);
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map(
        (issue) => `  • ${issue.path.join(".") || "(root)"}: ${issue.message}`,
      )
      .join("\n");
    throw new Error(
      `[config] ${relativePath} failed validation:\n${issues}\n` +
        `Fix the file (see config/schema.ts for the expected shape) and refresh.`,
    );
  }
  return result.data;
}

/**
 * True when a config image path points at a file that is really there.
 * Absolute URLs are trusted as-is; everything else must resolve to a file
 * inside ./public. Anything that fails is treated as missing so the site
 * never ships a broken image or an unverifiable claim.
 */
function publicAssetExists(src: string): boolean {
  if (/^https?:\/\//i.test(src)) return true;
  if (!src.startsWith("/")) return false;
  const withoutQuery = src.split(/[?#]/)[0] ?? src;
  let resolved: string;
  try {
    resolved = path.join(PUBLIC_DIR, decodeURIComponent(withoutQuery));
  } catch {
    return false;
  }
  if (resolved !== PUBLIC_DIR && !resolved.startsWith(PUBLIC_DIR + path.sep)) {
    return false;
  }
  try {
    // The path is already pinned inside PUBLIC_DIR by the check above, so the
    // opt-out is safe: without it Turbopack traces the entire project into the
    // standalone server output because it cannot see that scoping itself.
    return fs.statSync(/*turbopackIgnore: true*/ resolved).isFile();
  } catch {
    return false;
  }
}

/**
 * Strip an optional `image` that has no file behind it, keeping the entry.
 * The keys are deleted rather than set to undefined: this config is returned
 * from `getServerSideProps`, which serializes props as JSON, and `undefined`
 * is not valid JSON.
 */
function withResolvedImage<T extends { image?: string; imageAlt?: string }>(
  item: T,
): T {
  if (!item.image || publicAssetExists(item.image)) return item;
  const next = { ...item };
  delete next.image;
  delete next.imageAlt;
  return next;
}

/** Keep a picture slot but record whether its file exists, for placeholders. */
function withMissingFlag<T extends { src: string }>(
  item: T,
): T & { missing: boolean } {
  return { ...item, missing: !publicAssetExists(item.src) };
}

/** Drop the photos of a timeline entry that have no file behind them. */
function withResolvedPhotos<T extends { photos: Array<{ src: string }> }>(
  item: T,
): T {
  const photos = item.photos.filter((photo) => publicAssetExists(photo.src));
  return photos.length === item.photos.length ? item : { ...item, photos };
}

/** Load and validate the complete site configuration. */
export function loadConfig(): AppConfig {
  const projects = loadFile("sections/projects.json", projectsSchema);
  const proof = loadFile("sections/proof.json", proofSchema);
  const about = loadFile("sections/about.json", aboutSchema);
  const experience = loadFile("sections/experience.json", experienceSchema);
  const education = loadFile("sections/education.json", educationSchema);
  const certifications = loadFile(
    "sections/certifications.json",
    certificationsSchema,
  );

  return {
    site: loadFile("site.json", siteSchema),
    theme: loadFile("theme.json", themeSchema),
    hero: loadFile("sections/hero.json", heroSchema),
    about: {
      ...about,
      ...(about.portrait && { portrait: withMissingFlag(about.portrait) }),
    },
    skills: loadFile("sections/skills.json", skillsSchema),
    projects: {
      ...projects,
      items: projects.items.map((item) => ({
        ...item,
        ...(item.cover && { cover: withMissingFlag(item.cover) }),
        shots: item.shots.map(withMissingFlag),
      })),
    },
    // A capture bound to a case study keeps its slot as a placeholder until the
    // file lands. An unbound one is home-page evidence, which is only evidence
    // if the picture exists, so it is dropped rather than rendered as a gap.
    proof: {
      ...proof,
      items: proof.items
        .map(withMissingFlag)
        .filter((item) => item.project !== undefined || !item.missing),
    },
    experience: {
      ...experience,
      items: experience.items.map(withResolvedPhotos),
    },
    education: { ...education, items: education.items.map(withResolvedPhotos) },
    certifications: {
      ...certifications,
      items: certifications.items.map(withResolvedImage),
    },
    contact: loadFile("sections/contact.json", contactSchema),
    assistant: loadFile("assistant.json", assistantSchema),
  };
}

/** Load only the assistant slice (used by the /api/assistant route). */
export function loadAssistantConfig() {
  return loadFile("assistant.json", assistantSchema);
}

export type { AppConfig } from "./schema";
