import fs from "fs";
import path from "path";
import type { z } from "zod";
import {
  aboutSchema,
  assistantSchema,
  contactSchema,
  educationSchema,
  experienceSchema,
  heroSchema,
  projectsSchema,
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

/** Load and validate the complete site configuration. */
export function loadConfig(): AppConfig {
  return {
    site: loadFile("site.json", siteSchema),
    theme: loadFile("theme.json", themeSchema),
    hero: loadFile("sections/hero.json", heroSchema),
    about: loadFile("sections/about.json", aboutSchema),
    skills: loadFile("sections/skills.json", skillsSchema),
    projects: loadFile("sections/projects.json", projectsSchema),
    experience: loadFile("sections/experience.json", experienceSchema),
    education: loadFile("sections/education.json", educationSchema),
    contact: loadFile("sections/contact.json", contactSchema),
    assistant: loadFile("assistant.json", assistantSchema),
  };
}

/** Load only the assistant slice (used by the /api/assistant route). */
export function loadAssistantConfig() {
  return loadFile("assistant.json", assistantSchema);
}

export type { AppConfig } from "./schema";
