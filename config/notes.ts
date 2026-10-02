import fs from "fs";
import path from "path";
import { CONFIG_DIR, loadFile, publicAssetExists } from "./files.ts";
import { noteSchema, type Note, type NoteBlock } from "./notesSchema.ts";

const NOTES_DIR = "notes";
/** Doubles as the guard that keeps a URL slug inside config/notes. */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const WORDS_PER_MINUTE = 220;

function blockText(block: NoteBlock): string {
  if (typeof block === "string") return block;
  switch (block.type) {
    case "list":
      return block.items.join(" ");
    case "code":
      return block.code;
    case "image":
      return "";
    default:
      return block.text;
  }
}

function readNote(slug: string): { note: Note; draft: boolean } | null {
  if (!SLUG.test(slug)) return null;
  const file = path.join(CONFIG_DIR, NOTES_DIR, `${slug}.json`);
  if (!fs.existsSync(/*turbopackIgnore: true*/ file)) return null;
  const { draft, body, title, date, summary, tags } = loadFile(
    `${NOTES_DIR}/${slug}.json`,
    noteSchema,
  );
  const shown = body.filter(
    (block) =>
      typeof block === "string" ||
      block.type !== "image" ||
      publicAssetExists(block.src),
  );
  const words = shown
    .map(blockText)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return {
    draft,
    note: {
      slug,
      title,
      date,
      summary,
      tags,
      body: shown,
      minutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
    },
  };
}

/**
 * Every published note in config/notes, newest first. Files whose name
 * starts with "_" are templates and are skipped, as are drafts.
 *
 * @returns Full notes including bodies; an empty array when the folder is missing.
 * @throws When a note file name is not a lowercase slug, or a note fails validation.
 */
export function loadNotes(): Note[] {
  let names: string[];
  try {
    names = fs.readdirSync(
      /*turbopackIgnore: true*/ path.join(CONFIG_DIR, NOTES_DIR),
    );
  } catch {
    return [];
  }
  const notes: Note[] = [];
  for (const name of names) {
    if (!name.endsWith(".json") || name.startsWith("_")) continue;
    const slug = name.slice(0, -".json".length);
    if (!SLUG.test(slug)) {
      throw new Error(
        `[config] notes/${name}: name the file in lowercase words joined by hyphens, e.g. "zero-downtime-deploys.json".`,
      );
    }
    const read = readNote(slug);
    if (read && !read.draft) notes.push(read.note);
  }
  return notes.sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * One published note by slug, for its own page.
 *
 * @param slug - From the URL. Anything that is not a plain lowercase slug returns null.
 * @returns The note, or null when it is missing, a draft or a template.
 */
export function loadNote(slug: string): Note | null {
  const read = readNote(slug);
  return read && !read.draft ? read.note : null;
}
