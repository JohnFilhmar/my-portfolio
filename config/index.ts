import fs from "fs";
import path from "path";
import { PUBLIC_DIR, loadFile, publicAssetExists } from "./files";
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
  proofSchema,
  siteSchema,
  skillsSchema,
  themeSchema,
  type AppConfig,
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
const IMAGE_FILE = /\.(png|jpe?g|webp|avif)$/i;

/** Every image in public/portrait as a public URL, sorted by file name. */
function portraitImages(): string[] {
  try {
    return fs
      .readdirSync(
        /*turbopackIgnore: true*/ path.join(PUBLIC_DIR, PORTRAIT_DIR),
      )
      .filter((name) => IMAGE_FILE.test(name))
      .sort()
      .map((name) => `/${PORTRAIT_DIR}/${encodeURIComponent(name)}`);
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
        portrait: { ...hero.portrait, images: portraitImages() },
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
      items: certifications.items.map((item) => ({
        ...withResolvedImage(item),
        expired: isExpired(item.expires, new Date()),
      })),
    },
    notes: {
      ...loadFile("sections/notes.json", notesSchema),
      // Parsing through the summary schema strips each body off the props.
      posts: loadNotes().map((note) => noteSummarySchema.parse(note)),
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
