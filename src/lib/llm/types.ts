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
  system: string;
  messages: ChatMessage[];
  maxTokens: number;
  signal?: AbortSignal;
}

export interface LLMProvider {
  readonly name: string;
  /** Stream the assistant's reply as plain-text chunks. */
  stream(options: LLMStreamOptions): AsyncGenerator<string, void, unknown>;
}
