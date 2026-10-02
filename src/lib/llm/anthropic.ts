import Anthropic from "@anthropic-ai/sdk";
import type { LLMProvider, LLMStreamOptions } from "./types";

/** Model that re-answers in the same call if the primary model declines. */
const REFUSAL_FALLBACK_MODEL = "claude-opus-4-8";

/**
 * Default adapter: Anthropic (Claude) via the official SDK, streaming.
 * The API key stays server-side; this module is only ever imported from
 * the API route.
 *
 * The system prompt (knowledge base + rules) is identical on every request,
 * so it is sent as a cached block: repeat questions pay cache-read rates for
 * it instead of full input price. A policy decline is re-run once on the
 * fallback model inside the same call.
 */
export function createAnthropicProvider(apiKey: string): LLMProvider {
  const client = new Anthropic({ apiKey });

  return {
    name: "anthropic",
    async *stream(options: LLMStreamOptions) {
      const stream = client.beta.messages.stream(
        {
          model: options.model,
          max_tokens: options.maxTokens,
          output_config: { effort: options.effort },
          system: [
            {
              type: "text",
              text: options.system,
              cache_control: { type: "ephemeral" },
            },
          ],
          messages: options.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          betas: ["server-side-fallback-2026-06-01"],
          fallbacks: [{ model: REFUSAL_FALLBACK_MODEL }],
        },
        { signal: options.signal },
      );

      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          yield event.delta.text;
        }
      }
    },
  };
}
