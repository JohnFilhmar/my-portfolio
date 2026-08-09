import Anthropic from "@anthropic-ai/sdk";
import type { LLMProvider, LLMStreamOptions } from "./types";

/**
 * Default adapter: Anthropic (Claude) via the official SDK, streaming.
 * The API key stays server-side; this module is only ever imported from
 * the API route.
 */
export function createAnthropicProvider(apiKey: string): LLMProvider {
  const client = new Anthropic({ apiKey });

  return {
    name: "anthropic",
    async *stream(options: LLMStreamOptions) {
      const stream = client.messages.stream(
        {
          model: options.model,
          max_tokens: options.maxTokens,
          system: options.system,
          messages: options.messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
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
