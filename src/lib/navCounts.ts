import type { AppConfig, SectionType } from "@config/schema";
import {
  CERTIFICATIONS_PATH,
  NOTES_PATH,
  PROJECTS_PATH,
  RECOMMENDATIONS_PATH,
} from "@/lib/navigation";
import type { ResolvedSection } from "@/lib/sections";

/**
 * How many entries each collection link leads to, keyed by nav href, for the
 * small counts beside nav links. Links to single places (about, contact, the
 * assistant) get no entry, and neither does an empty collection.
 *
 * @param config - The loaded site config.
 * @param sections - Home sections as resolved, so anchors match their ids.
 * @returns Counts by href, e.g. `{ "#work": 11, "/notes": 4 }`.
 */
export function navCounts(
  config: AppConfig,
  sections: ResolvedSection[],
): Record<string, number> {
  const bySection: Partial<Record<SectionType, number>> = {
    projects: config.projects.items.length,
    proof: config.proof.items.filter((item) => item.project === undefined)
      .length,
    experience: config.experience.items.length,
    education: config.education.items.length,
    certifications: config.certifications.items.length,
    notes: config.notes.posts.length,
  };
  const counts: Record<string, number> = {};
  for (const section of sections) {
    const count = bySection[section.type];
    if (count) counts[`#${section.id}`] = count;
  }
  if (config.certifications.items.length > 0) {
    counts[CERTIFICATIONS_PATH] = config.certifications.items.length;
  }
  if (config.notes.posts.length > 0) {
    counts[NOTES_PATH] = config.notes.posts.length;
  }
  const others = config.projects.items.filter(
    (item) => item.tier !== "flagship",
  ).length;
  if (others > 0) counts[PROJECTS_PATH] = others;
  if (config.recommendations.items.length > 0) {
    counts[RECOMMENDATIONS_PATH] = config.recommendations.items.length;
  }
  return counts;
}
