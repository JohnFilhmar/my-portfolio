import fs from "fs";
import path from "path";
import type { z } from "zod";

/**
 * Typed config loader. Reads and validates every JSON file under ./config on
 * each call. `getServerSideProps` and the API routes call this per request,
 * which is what makes "edit JSON → refresh" work with no rebuild.
 *
 * Throws a descriptive error (file + zod issues) on invalid config so
 * misconfiguration fails loudly instead of rendering something half-broken.
 */

export const CONFIG_DIR = path.join(process.cwd(), "config");
export const PUBLIC_DIR = path.join(process.cwd(), "public");

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

/**
 * Read one JSON file under ./config and validate it.
 *
 * @param relativePath - Path inside ./config, e.g. "sections/hero.json".
 * @param schema - Zod schema the file must satisfy.
 * @returns The parsed, defaulted data.
 * @throws When the file is missing, is not JSON, or fails validation.
 */
export function loadFile<S extends z.ZodTypeAny>(
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
export function publicAssetExists(src: string): boolean {
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
