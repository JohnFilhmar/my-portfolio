/**
 * Small client-side navigation helpers shared by the nav, hero CTAs,
 * command palette and assistant launcher.
 */

export const ASSISTANT_INPUT_ID = "assistant-chat-input";
/** Route of the standalone assistant page (pages/ask.tsx). */
export const ASK_PATH = "/ask";

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

/** Scroll to the assistant section and focus its input. */
export function goToAssistant(sectionId: string, reduced: boolean): void {
  scrollToId(sectionId, reduced);
  window.setTimeout(
    () => {
      document
        .getElementById(ASSISTANT_INPUT_ID)
        ?.focus({ preventScroll: true });
    },
    reduced ? 50 : 550,
  );
}
