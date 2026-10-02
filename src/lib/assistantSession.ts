import { z } from "zod";

/** One line of the assistant transcript. */
export interface AssistantMessage {
  role: "assistant" | "user";
  text: string;
}

const STORAGE_KEY = "assistant:conversation";
/** The navigation entry outlives client-side page changes, so check it once. */
let reloadChecked = false;
const storedSchema = z
  .array(z.object({ role: z.enum(["assistant", "user"]), text: z.string() }))
  .max(200);

/**
 * This tab's saved conversation. A reload starts fresh (and clears it);
 * moving between pages keeps it.
 *
 * @returns The saved messages, or null on reload, first visit, blocked
 *   storage or anything that fails validation.
 */
export function restoreConversation(): AssistantMessage[] | null {
  try {
    if (!reloadChecked) {
      reloadChecked = true;
      const nav = performance.getEntriesByType("navigation")[0];
      if (nav instanceof PerformanceNavigationTiming && nav.type === "reload") {
        sessionStorage.removeItem(STORAGE_KEY);
        return null;
      }
    }
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = storedSchema.safeParse(JSON.parse(raw));
    return parsed.success && parsed.data.length > 0 ? parsed.data : null;
  } catch {
    return null;
  }
}

/**
 * Save the conversation for the rest of this tab's session.
 *
 * @param messages - The full transcript. Silently skipped when storage is blocked or full.
 */
export function saveConversation(messages: AssistantMessage[]): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // The conversation simply won't survive a page change.
  }
}
