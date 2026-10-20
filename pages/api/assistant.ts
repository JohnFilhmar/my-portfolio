import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { loadAssistantConfig } from "@config/index";
import type { AssistantConfig, AssistantMode } from "@config/schema";
import {
  refundAnswer,
  remainingAnswers,
  reserveAnswer,
  visitorKey,
} from "@/lib/aiQuota";
import {
  FAQ_CONFIDENT_SCORE,
  MAX_HISTORY_ITEM_CHARS,
  MAX_HISTORY_ITEMS,
  MAX_MESSAGE_CHARS,
  bestFaq,
  buildSystemPrompt,
  looksLikeInjection,
  matchIntent,
} from "@/lib/assistant";
import {
  getAssistantEnv,
  resolveAssistantMode,
  type AssistantEnv,
} from "@/lib/env";
import { getProvider, type ChatMessage, type LLMProvider } from "@/lib/llm";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

/**
 * GET  /api/assistant  → { mode, remaining, limit } for this visitor.
 * POST /api/assistant  { message, history? } → plain-text answer stream.
 *
 * A POST passes through gates in order and stops at the first one that
 * answers. Only the last gate calls the model, so the cheap answers cost
 * nothing and only real questions spend the visitor's daily budget:
 *   1. same-origin request, per-IP burst limit, JSON body, strict schema
 *   2. instruction-injection guard  → guardMessage, no model call
 *   3. confident FAQ match          → configured answer, no model call
 *   4. demo mode                    → FAQ match or fallback
 *   5. daily budget (visitor + site) → quotaMessage when spent
 *   6. model call, refunded if it fails before writing anything
 *
 * `X-Assistant-Gate` names the gate that answered and `X-Assistant-Remaining`
 * reports the visitor's answers left in live mode.
 */

export const config = { api: { bodyParser: { sizeLimit: "16kb" } } };

/** Output ceiling for one answer, thinking included. Answers are told to stay under 120 words. */
const MAX_TOKENS = 1024;

const bodySchema = z
  .object({
    message: z
      .string()
      .trim()
      .min(1)
      .transform((s) => s.slice(0, MAX_MESSAGE_CHARS)),
    history: z
      .array(
        z
          .object({
            role: z.enum(["user", "assistant"]),
            content: z
              .string()
              .min(1)
              .transform((s) => s.slice(0, MAX_HISTORY_ITEM_CHARS)),
          })
          .strict(),
      )
      .max(50)
      .optional(),
  })
  .strict();

/** Keep only a short, provider-friendly window that starts with a user turn. */
function sanitizeHistory(
  history: Array<{ role: "user" | "assistant"; content: string }> | undefined,
): ChatMessage[] {
  const recent = (history ?? []).slice(-MAX_HISTORY_ITEMS);
  while (recent.length > 0 && recent[0]?.role !== "user") {
    recent.shift();
  }
  return recent;
}

/** True when the request comes from a page on this same host. */
function isSameOrigin(req: NextApiRequest): boolean {
  const host = req.headers.host;
  const source = req.headers.origin ?? req.headers.referer;
  if (!host || !source) return false;
  try {
    return new URL(source).host === host;
  } catch {
    return false;
  }
}

function sendText(
  res: NextApiResponse,
  gate: string,
  text: string,
  remaining?: number,
): void {
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("X-Assistant-Gate", gate);
  if (remaining !== undefined) {
    res.setHeader("X-Assistant-Remaining", String(remaining));
  }
  res.status(200).send(text);
}

interface Context {
  env: AssistantEnv;
  assistant: AssistantConfig;
  mode: AssistantMode;
}

function loadContext(res: NextApiResponse): Context | null {
  try {
    const env = getAssistantEnv();
    return {
      env,
      assistant: loadAssistantConfig(),
      mode: resolveAssistantMode(env),
    };
  } catch (err) {
    // Detail goes to the server log only; the client sees nothing internal.
    console.error("[api/assistant] configuration error:", err);
    res.status(500).json({ error: "The assistant is unavailable right now." });
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST" && req.method !== "GET") {
    res.setHeader("Allow", "GET, POST");
    res.status(405).json({ error: "Method not allowed." });
    return;
  }
  res.setHeader("Cache-Control", "no-store");

  const ctx = loadContext(res);
  if (!ctx) return;
  const { env, assistant, mode } = ctx;

  if (!assistant.enabled) {
    res.status(404).json({ error: "Assistant is disabled." });
    return;
  }
  if (!isSameOrigin(req)) {
    res.status(403).json({ error: "Forbidden." });
    return;
  }

  const ip = getClientIp(req.headers, req.socket.remoteAddress);
  const rate = checkRateLimit(`assistant:${ip}`, env.rateLimitPerMinute);
  if (!rate.ok) {
    res.setHeader("Retry-After", String(rate.retryAfterSeconds));
    res.status(429).json({ error: assistant.rateLimitMessage });
    return;
  }

  const key = visitorKey(ip, req.headers["user-agent"]);
  const limits = { perVisitor: env.llmQuota, perSite: env.dailyLlmCap };

  if (req.method === "GET") {
    res.status(200).json({
      mode,
      remaining: mode === "live" ? remainingAnswers(key, limits) : null,
      limit: env.llmQuota,
    });
    return;
  }

  if (!req.headers["content-type"]?.includes("application/json")) {
    res.status(415).json({ error: "Send JSON." });
    return;
  }
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body." });
    return;
  }
  const { message, history } = parsed.data;
  res.setHeader("X-Assistant-Mode", mode);

  if (looksLikeInjection(message)) {
    sendText(res, "guard", assistant.guardMessage);
    return;
  }

  const faq = bestFaq(message, assistant.faqs);
  if (faq && faq.score >= FAQ_CONFIDENT_SCORE) {
    sendText(res, "faq", faq.faq.answer);
    return;
  }

  if (mode === "demo") {
    sendText(
      res,
      "demo",
      matchIntent(message, assistant.faqs, assistant.fallbackMessage),
    );
    return;
  }

  const apiKey = env.apiKey;
  if (!apiKey) {
    console.error("[api/assistant] live mode without LLM_API_KEY");
    res.status(500).json({ error: "The assistant is unavailable right now." });
    return;
  }

  const remaining = reserveAnswer(key, limits);
  if (remaining === null) {
    sendText(
      res,
      "quota",
      assistant.quotaMessage.replaceAll("{limit}", String(env.llmQuota)),
      0,
    );
    return;
  }

  let provider: LLMProvider;
  try {
    provider = getProvider(env.provider, apiKey);
  } catch (err) {
    refundAnswer(key);
    console.error("[api/assistant] provider error:", err);
    res.status(500).json({ error: "The assistant is unavailable right now." });
    return;
  }

  const messages: ChatMessage[] = [
    ...sanitizeHistory(history),
    { role: "user", content: message },
  ];

  // Stop the upstream stream (and its billing) if the visitor disconnects.
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
      effort: "low",
      signal: abort.signal,
    });

    for await (const chunk of stream) {
      if (!wrote) {
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        res.setHeader("X-Assistant-Gate", "model");
        res.setHeader("X-Assistant-Remaining", String(remaining));
        res.status(200);
        wrote = true;
      }
      res.write(chunk);
    }
    if (!wrote) {
      // No text at all (for example a declined request): keep the contract.
      sendText(res, "model", assistant.fallbackMessage, remaining);
      return;
    }
    res.end();
  } catch (err) {
    if (abort.signal.aborted) {
      res.end();
      return;
    }
    console.error("[api/assistant] live mode failed:", err);
    if (!wrote) {
      // Nothing streamed: the budget is given back and the visitor still
      // gets a useful configured answer.
      refundAnswer(key);
      sendText(
        res,
        "demo",
        matchIntent(message, assistant.faqs, assistant.fallbackMessage),
        remaining + 1,
      );
      return;
    }
    res.write(`\n\n${assistant.contactHandoff}`);
    res.end();
  }
}
