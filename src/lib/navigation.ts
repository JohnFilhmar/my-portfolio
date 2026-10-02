/**
 * Small client-side navigation helpers shared by the nav, hero CTAs,
 * command palette and assistant launcher.
 */

export const ASSISTANT_INPUT_ID = "assistant-chat-input";

/** Header offset for anchored scrolling, read from the theme token. */
function headerOffset(): number {
  if (typeof window === "undefined") return 66;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--space-header-height")
    .trim();
  const parsed = parseInt(raw, 10);
  return (Number.isFinite(parsed) ? parsed : 58) + 8;
}

export function scrollToId(id: string, reduced: boolean): void {
  const el = document.getElementById(id);
  if (!el) return;
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
