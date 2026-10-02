/**
 * Provider-agnostic LLM adapter interface. The API route only talks to this
 * interface, so swapping providers is a matter of adding an adapter and
 * setting LLM_PROVIDER — no route changes.
 */

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface LLMStreamOptions {
  model: string;
  /** Stable across requests, so adapters may cache it. */
  system: string;
  messages: ChatMessage[];
  /** Hard ceiling on output tokens, thinking included where the model thinks. */
  maxTokens: number;
  /** How much reasoning to spend. Short factual answers need little. */
  effort: "low" | "medium" | "high";
  signal?: AbortSignal;
}

export interface LLMProvider {
  readonly name: string;
  /** Stream the assistant's reply as plain-text chunks. */
  stream(options: LLMStreamOptions): AsyncGenerator<string, void, unknown>;
}
