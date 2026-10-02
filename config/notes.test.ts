import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, before, test } from "node:test";

// CONFIG_DIR is read from the working directory when config/files.ts loads,
// so point it at a throwaway tree before importing the loader.
const root = fs.mkdtempSync(path.join(os.tmpdir(), "notes-loader-"));
const notesDir = path.join(root, "config", "notes");
const original = process.cwd();

const post = (date: string, extra: Record<string, unknown> = {}) =>
  JSON.stringify({
    title: `Post from ${date}`,
    date,
    summary: "Summary.",
    body: ["word ".repeat(450)],
    ...extra,
  });

let loader: typeof import("./notes.ts");

before(async () => {
  fs.mkdirSync(notesDir, { recursive: true });
  fs.writeFileSync(path.join(notesDir, "older-post.json"), post("2026-01-05"));
  fs.writeFileSync(path.join(notesDir, "newer-post.json"), post("2026-03-09"));
  fs.writeFileSync(
    path.join(notesDir, "unfinished.json"),
    post("2026-04-01", { draft: true }),
  );
  fs.writeFileSync(path.join(notesDir, "_template.json"), post("2026-05-01"));
  process.chdir(root);
  loader = await import("./notes.ts");
});

after(() => {
  process.chdir(original);
  fs.rmSync(root, { recursive: true, force: true });
});

test("publishes posts newest first, skipping drafts and templates", () => {
  const notes = loader.loadNotes();
  assert.deepEqual(
    notes.map((note) => note.slug),
    ["newer-post", "older-post"],
  );
  assert.equal(notes[0]?.minutes, 2);
});

test("a slug outside the plain lowercase form never reaches the file system", () => {
  for (const slug of [
    "../site",
    "..\\site",
    "Newer-Post",
    "newer-post.json",
    "",
    "a/b",
  ]) {
    assert.equal(loader.loadNote(slug), null, slug);
  }
  assert.equal(loader.loadNote("unfinished"), null);
  assert.equal(loader.loadNote("newer-post")?.title, "Post from 2026-03-09");
});
