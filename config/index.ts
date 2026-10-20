import fs from "fs";
import path from "path";
import {
  PUBLIC_DIR,
  loadFile,
  publicAssetExists,
  showPlaceholders,
} from "./files";
import { isExpired } from "./expiry";
import { loadNotes } from "./notes";
import { noteSummarySchema, notesSchema } from "./notesSchema";
import {
  aboutSchema,
  assistantSchema,
  certificationsSchema,
  contactSchema,
  educationSchema,
  experienceSchema,
  heroSchema,
  projectsSchema,
  recommendationsSchema,
  proofSchema,
  siteSchema,
  skillsSchema,
  themeSchema,
  type AppConfig,
  type HeroConfig,
  type PortraitShot,
} from "./schema";

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

const PORTRAIT_DIR = "portrait";
const HOVER_SUFFIX = "-hover";

/** A baked photo by base name, or null when its grid or WebP is missing. */
function portraitShot(base: string): PortraitShot | null {
  const name = encodeURIComponent(base);
  const shot = {
    glyphs: `/${PORTRAIT_DIR}/glyphs/${name}.json`,
    image: `/${PORTRAIT_DIR}/${name}.webp`,
  };
  return publicAssetExists(shot.glyphs) && publicAssetExists(shot.image)
    ? shot
    : null;
}

/** Every baked portrait in file-name order, paired with its hover partner. */
function portraitFrames(): HeroConfig["portrait"]["frames"] {
  try {
    return fs
      .readdirSync(
        /*turbopackIgnore: true*/ path.join(PUBLIC_DIR, PORTRAIT_DIR, "glyphs"),
      )
      .filter((name) => name.endsWith(".json"))
      .map((name) => name.slice(0, -".json".length))
      .filter((base) => !base.endsWith(HOVER_SUFFIX))
      .sort()
      .flatMap((base) => {
        const main = portraitShot(base);
        const hover = portraitShot(`${base}${HOVER_SUFFIX}`);
        if (!main) return [];
        return [hover ? { main, hover } : { main }];
      });
  } catch {
    return [];
  }
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
    hero: (() => {
      const hero = loadFile("sections/hero.json", heroSchema);
      return {
        ...hero,
        portrait: { ...hero.portrait, frames: portraitFrames() },
      };
    })(),
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
    // if a picture exists, so it is dropped rather than rendered as a gap,
    // except where placeholders are on (local development).
    proof: {
      ...proof,
      items: proof.items
        .map((item) => ({
          ...withMissingFlag(item),
          gallery: item.gallery.map(withMissingFlag),
        }))
        .filter(
          (item) =>
            item.project !== undefined ||
            !item.missing ||
            item.gallery.some((shot) => !shot.missing) ||
            showPlaceholders(),
        ),
    },
    experience: {
      ...experience,
      items: experience.items.map(withResolvedPhotos),
    },
    education: { ...education, items: education.items.map(withResolvedPhotos) },
    certifications: {
      ...certifications,
      items: certifications.items.map((item) => ({
        ...withResolvedImage(item),
        expired: isExpired(item.expires ?? null, new Date()),
      })),
    },
    notes: {
      ...loadFile("sections/notes.json", notesSchema),
      // Parsing through the summary schema strips each body off the props.
      posts: loadNotes().map((note) => noteSummarySchema.parse(note)),
    },
    recommendations: (() => {
      const recs = loadFile(
        "sections/recommendations.json",
        recommendationsSchema,
      );
      return {
        ...recs,
        items: recs.items.map((item) => {
          if (!item.photo || publicAssetExists(item.photo)) return item;
          const next = { ...item };
          delete next.photo;
          return next;
        }),
      };
    })(),
    contact: loadFile("sections/contact.json", contactSchema),
    assistant: loadFile("assistant.json", assistantSchema),
  };
}

/** Load only the assistant slice (used by the /api/assistant route). */
export function loadAssistantConfig() {
  return loadFile("assistant.json", assistantSchema);
}

export type { AppConfig } from "./schema";
