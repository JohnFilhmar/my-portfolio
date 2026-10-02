import type { NavItem } from "@config/schema";

/**
 * Small client-side navigation helpers shared by the nav, hero CTAs,
 * command palette and assistant launcher.
 */

export const ASSISTANT_INPUT_ID = "assistant-chat-input";
/** Route of the standalone assistant page (pages/ask.tsx). */
export const ASK_PATH = "/ask";
/** Route of the notes index (pages/notes/index.tsx). */
export const NOTES_PATH = "/notes";
/** Route of the credentials page (pages/certifications.tsx). */
export const CERTIFICATIONS_PATH = "/certifications";

/** Route of one note (pages/notes/[slug].tsx). */
export function notePath(slug: string): string {
  return `${NOTES_PATH}/${slug}`;
}

/** Route of a flagship project's case study (pages/work/[slug].tsx). */
export function workPath(projectId: string): string {
  return `/work/${projectId}`;
}

/**
 * Section anchors ("#work") only resolve on the home page. Elsewhere they are
 * rewritten to "/#work" so the browser loads home and lands on the section.
 */
export function homeAnchor(href: string, onHome: boolean): string {
  return !onHome && href.startsWith("#") ? `/${href}` : href;
}

/** Header offset for anchored scrolling, read from the theme token. */
function headerOffset(): number {
  if (typeof window === "undefined") return 66;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--space-header-height")
    .trim();
  const parsed = parseInt(raw, 10);
  return (Number.isFinite(parsed) ? parsed : 58) + 8;
}

/** Scroll to a home section, or load home at that section from any other page. */
export function scrollToId(id: string, reduced: boolean): void {
  const el = document.getElementById(id);
  if (!el) {
    window.location.assign(`/#${id}`);
    return;
  }
  const top = el.getBoundingClientRect().top + window.scrollY - headerOffset();
  window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
}

/**
 * Nav links worth showing: section anchors only while that section renders on
 * home, page links unless their page is empty.
 *
 * @param nav - Links from site.json.
 * @param sectionIds - Ids of the sections home actually renders.
 * @param hiddenPaths - Page routes with nothing to show yet.
 * @returns The links in config order.
 */
export function visibleNav(
  nav: NavItem[],
  sectionIds: string[],
  hiddenPaths: string[],
): NavItem[] {
  return nav.filter((item) =>
    item.href.startsWith("#")
      ? sectionIds.includes(item.href.slice(1))
      : !hiddenPaths.includes(item.href),
  );
}
