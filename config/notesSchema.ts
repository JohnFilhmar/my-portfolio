import { z } from "zod";

/**
 * One block of a note's body. A plain string is a paragraph; the objects
 * cover headings, lists, code, quotes and pictures. Inline text supports
 * **bold**, *italic*, `code` and [links](https://...).
 */
export const noteBlockSchema = z.union([
  z.string(),
  z.object({ type: z.literal("heading"), text: z.string() }),
  z.object({
    type: z.literal("list"),
    ordered: z.boolean().default(false),
    items: z.array(z.string()).min(1),
  }),
  z.object({
    type: z.literal("code"),
    lang: z.string().default(""),
    code: z.string(),
  }),
  z.object({ type: z.literal("quote"), text: z.string() }),
  z.object({
    type: z.literal("image"),
    /** Under ./public. The block is dropped if the file is absent. */
    src: z.string(),
    alt: z.string(),
    caption: z.string().optional(),
  }),
]);
export type NoteBlock = z.infer<typeof noteBlockSchema>;

/** A post as written in config/notes/<slug>.json. */
export const noteSchema = z.object({
  _readme: z.string().optional(),
  title: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "use YYYY-MM-DD"),
  summary: z.string(),
  tags: z.array(z.string()).default([]),
  /** Drafts stay off the site until set to false. */
  draft: z.boolean().default(false),
  body: z.array(noteBlockSchema).min(1),
});

/** A published note with its slug (the file name) and reading time. */
export const publishedNoteSchema = noteSchema
  .omit({ _readme: true, draft: true })
  .extend({ slug: z.string(), minutes: z.number().int().positive() });
export type Note = z.infer<typeof publishedNoteSchema>;

/** What the list, the home section and the nav need: everything but the body. */
export const noteSummarySchema = publishedNoteSchema.omit({ body: true });
export type NoteSummary = z.infer<typeof noteSummarySchema>;

/** Copy for the notes pages and home section (config/sections/notes.json). */
export const notesSchema = z.object({
  _readme: z.string().optional(),
  label: z.string(),
  heading: z.string(),
  blurb: z.string(),
  /** Heading of the home section that shows the latest notes. */
  latestHeading: z.string(),
  latestCount: z.number().int().positive().default(3),
  allLabel: z.string().default("All notes"),
  backLabel: z.string().default("All notes"),
  emptyMessage: z.string(),
  filterLabel: z.string().default("Filter notes by tag"),
  allTagsLabel: z.string().default("all"),
  /** `{n}` is replaced with the minutes. */
  minutesTemplate: z.string().default("{n} min read"),
  newerLabel: z.string().default("Newer"),
  olderLabel: z.string().default("Older"),
  /** Filled by the loader, newest first. */
  posts: z.array(noteSummarySchema).default([]),
});
export type NotesConfig = z.infer<typeof notesSchema>;
