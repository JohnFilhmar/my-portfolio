import type { AssistantConfig, Faq } from "@config/schema";

/**
 * Message-size contract shared by the API route and the client hook, so the
 * client can never produce a request the server rejects for length.
 */
export const MAX_MESSAGE_CHARS = 2000;
export const MAX_HISTORY_ITEM_CHARS = 4000;
export const MAX_HISTORY_ITEMS = 12;

/**
 * Demo-mode intent matching, shared server/client. Scores each FAQ by the
 * total length of its matched intents (longer, more specific keywords win)
 * and returns the best answer, or the fallback when nothing matches.
 */
export function matchIntent(
  message: string,
  faqs: Faq[],
  fallbackMessage: string,
): string {
  const normalized = ` ${message.toLowerCase().replace(/[^a-z0-9\s'-]/g, " ")} `;
  let best: Faq | null = null;
  let bestScore = 0;
  for (const faq of faqs) {
    let score = 0;
    for (const intent of faq.intents) {
      if (normalized.includes(intent.toLowerCase())) score += intent.length;
    }
    if (score > bestScore) {
      bestScore = score;
      best = faq;
    }
  }
  return best ? best.answer : fallbackMessage;
}

/**
 * Build the live-mode system prompt from the config template.
 * Placeholders: {{assistantName}} {{knowledgeBase}} {{faqs}} {{contactHandoff}} {{fallbackMessage}}
 */
export function buildSystemPrompt(assistant: AssistantConfig): string {
  const knowledgeBase = [
    assistant.knowledgeBase.summary,
    ...assistant.knowledgeBase.sections.map(
      (section) => `## ${section.title}\n${section.content}`,
    ),
  ].join("\n\n");

  const faqs = assistant.faqs
    .map((faq) => `Q: ${faq.question}\nA: ${faq.answer}`)
    .join("\n\n");

  return assistant.systemPromptTemplate
    .replaceAll("{{assistantName}}", assistant.assistantName)
    .replaceAll("{{knowledgeBase}}", knowledgeBase)
    .replaceAll("{{faqs}}", faqs)
    .replaceAll("{{contactHandoff}}", assistant.contactHandoff)
    .replaceAll("{{fallbackMessage}}", assistant.fallbackMessage);
}
