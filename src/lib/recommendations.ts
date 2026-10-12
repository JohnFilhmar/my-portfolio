import type { AppConfig, Recommendation } from "@config/schema";
import { workPath } from "@/lib/navigation";

/**
 * The recommendations about one project or one role, in config order.
 *
 * @param items - All recommendations.
 * @param about - A project id, an experience id, or both.
 * @returns The matching entries; empty when none point at it.
 */
export function recommendationsAbout(
  items: Recommendation[],
  about: { project?: string; experience?: string },
): Recommendation[] {
  return items.filter(
    (item) =>
      (about.project !== undefined && item.project === about.project) ||
      (about.experience !== undefined && item.experience === about.experience),
  );
}

/** Where a project lives: its case study when featured, else its entry on /projects. */
export function projectHref(config: AppConfig, id: string): string | null {
  const project = config.projects.items.find((item) => item.id === id);
  if (!project) return null;
  return project.tier === "flagship" ? workPath(id) : `/projects#${id}`;
}

/**
 * The links a recommendation shows to what it is about, e.g. "on Usapp" and
 * "at YouCode Technologies". Ids that match nothing in the config are skipped.
 *
 * @param rec - The recommendation.
 * @param config - Loaded config, for names and pages.
 * @returns Link text and href pairs, project first.
 */
export function recommendationLinks(
  rec: Recommendation,
  config: AppConfig,
): Array<{ label: string; href: string }> {
  const labels = config.recommendations;
  const links: Array<{ label: string; href: string }> = [];
  if (rec.project) {
    const project = config.projects.items.find(
      (item) => item.id === rec.project,
    );
    const href = projectHref(config, rec.project);
    if (project && href) {
      links.push({
        label: labels.aboutProjectTemplate.replace("{name}", project.title),
        href,
      });
    }
  }
  if (rec.experience) {
    const role = config.experience.items.find(
      (item) => item.id === rec.experience,
    );
    if (role) {
      links.push({
        label: labels.aboutExperienceTemplate.replace("{name}", role.company),
        href: "/#experience",
      });
    }
  }
  return links;
}
