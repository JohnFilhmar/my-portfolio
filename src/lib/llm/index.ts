import { createAnthropicProvider } from "./anthropic";
import type { LLMProvider } from "./types";

export type { ChatMessage, LLMProvider, LLMStreamOptions } from "./types";

const SUPPORTED_PROVIDERS = ["anthropic"] as const;

/**
 * Resolve the configured LLM provider. Add new adapters here:
 * implement `LLMProvider` in a sibling module and add a case below.
 */
export function getProvider(name: string, apiKey: string): LLMProvider {
  switch (name) {
    case "anthropic":
      return createAnthropicProvider(apiKey);
    default:
      throw new Error(
        `[llm] Unknown LLM_PROVIDER "${name}". Supported providers: ${SUPPORTED_PROVIDERS.join(
          ", ",
        )}. Add an adapter in src/lib/llm/ to support more.`,
      );
  }
}
