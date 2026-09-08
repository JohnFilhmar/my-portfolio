import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { loadAssistantConfig } from "@config/index";
import {
  MAX_HISTORY_ITEM_CHARS,
  MAX_HISTORY_ITEMS,
  MAX_MESSAGE_CHARS,
  buildSystemPrompt,
  matchIntent,
} from "@/lib/assistant";
import { getAssistantEnv, resolveAssistantMode } from "@/lib/env";
import { getProvider, type ChatMessage, type LLMProvider } from "@/lib/llm";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

/**
 * POST /api/assistant  { message, history? }
 *
 * One interface for the client; the route decides live-vs-demo internally:
 *  - live (ASSISTANT_MODE=live, or auto + LLM_API_KEY): streams an LLM reply
 *    through the provider adapter. The key never leaves the server.
 *  - demo (no key / ASSISTANT_MODE=demo): answers from config/assistant.json
 *    via intent matching — never an empty or broken reply.
 *
 * The response is a plain-text stream either way; `X-Assistant-Mode` reports
 * which path served it. Oversized text is truncated, never rejected, so a
 * chatty visitor always gets an answer instead of a validation error.
 */

const bodySchema = z.object({
  message: z
    .string()
    .trim()
    .min(1)
    .transform((s) => s.slice(0, MAX_MESSAGE_CHARS)),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z
          .string()
          .min(1)
          .transform((s) => s.slice(0, MAX_HISTORY_ITEM_CHARS)),
      }),
    )
    .transform((items) => items.slice(-MAX_HISTORY_ITEMS * 2))
    .optional(),
});

const MAX_TOKENS = 1024;

/** Keep only a sane, provider-friendly window: capped, starting with "user". */
function sanitizeHistory(
  history: Array<{ role: "user" | "assistant"; content: string }> | undefined,
): ChatMessage[] {
  const recent = (history ?? []).slice(-MAX_HISTORY_ITEMS);
  while (recent.length > 0 && recent[0]?.role !== "user") {
    recent.shift();
  }
  return recent;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  const ip = getClientIp(req.headers, req.socket.remoteAddress);

  let assistant;
  let mode;
  let env;
  try {
    env = getAssistantEnv();
    assistant = loadAssistantConfig();
    mode = resolveAssistantMode(env);
  } catch (err) {
    // Fail loudly server-side with the detailed message; keep the client
    // response generic so paths/schema internals never leak.
    console.error("[api/assistant] configuration error:", err);
    res.status(500).json({
      error: "The assistant is misconfigured. Check the server logs.",
    });
    return;
  }

  if (!assistant.enabled) {
    res.status(404).json({ error: "Assistant is disabled." });
    return;
  }

  const rate = checkRateLimit(`assistant:${ip}`, env.rateLimitPerMinute);
  if (!rate.ok) {
    res.setHeader("Retry-After", String(rate.retryAfterSeconds));
    res.status(429).json({ error: assistant.rateLimitMessage });
    return;
  }

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body." });
    return;
  }

  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Assistant-Mode", mode);

  if (mode === "demo") {
    const answer = matchIntent(
      parsed.data.message,
      assistant.faqs,
      assistant.fallbackMessage,
    );
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.status(200).send(answer);
    return;
  }

  // Live mode. resolveAssistantMode guarantees the key exists here.
  const apiKey = env.apiKey;
  if (!apiKey) {
    res.status(500).json({ error: "LLM_API_KEY is missing for live mode." });
    return;
  }

  // Provider misconfiguration (e.g. unknown LLM_PROVIDER) is a loud 500,
  // not a silent downgrade to demo answers.
  let provider: LLMProvider;
  try {
    provider = getProvider(env.provider, apiKey);
  } catch (err) {
    console.error("[api/assistant] provider error:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Unknown LLM provider.",
    });
    return;
  }

  const messages: ChatMessage[] = [
    ...sanitizeHistory(parsed.data.history),
    { role: "user", content: parsed.data.message },
  ];

  // Stop the upstream LLM stream if the visitor disconnects mid-reply.
  const abort = new AbortController();
  res.once("close", () => {
    if (!res.writableEnded) abort.abort();
  });

  let wrote = false;
  try {
    const stream = provider.stream({
      model: env.model,
      system: buildSystemPrompt(assistant),
      messages,
      maxTokens: MAX_TOKENS,
      signal: abort.signal,
    });

    for await (const chunk of stream) {
      if (!wrote) {
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.status(200);
        wrote = true;
      }
      res.write(chunk);
    }
    if (!wrote) {
      // Model produced no text at all — keep the contract: never empty.
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.status(200);
      res.write(assistant.fallbackMessage);
    }
    res.end();
  } catch (err) {
    if (abort.signal.aborted) {
      // Visitor disconnected mid-reply — nothing to salvage.
      res.end();
      return;
    }
    console.error("[api/assistant] live mode failed:", err);
    if (!wrote) {
      // Nothing streamed yet: degrade gracefully to the demo answer so the
      // visitor still gets a useful reply.
      const answer = matchIntent(
        parsed.data.message,
        assistant.faqs,
        assistant.fallbackMessage,
      );
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("X-Assistant-Mode", "demo");
      res.status(200).send(answer);
      return;
    }
    // Mid-stream failure: close out with the configured contact handoff.
    res.write(`\n\n${assistant.contactHandoff}`);
    res.end();
  }
}
