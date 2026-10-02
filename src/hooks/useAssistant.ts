import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AssistantConfig,
  AssistantMode,
  ThemeConfig,
} from "@config/schema";
import {
  MAX_HISTORY_ITEM_CHARS,
  MAX_HISTORY_ITEMS,
  MAX_MESSAGE_CHARS,
} from "@/lib/assistant";
import {
  restoreConversation,
  saveConversation,
  type AssistantMessage,
} from "@/lib/assistantSession";

export type { AssistantMessage };

interface UseAssistantOptions {
  assistant: AssistantConfig;
  typing: ThemeConfig["motion"]["typing"];
  reduced: boolean;
  /** Called with what the server reported on each answer (mode, answers left). */
  onServed?: (served: {
    mode: AssistantMode | null;
    remaining: number | null;
  }) => void;
}

export interface UseAssistantResult {
  messages: AssistantMessage[];
  input: string;
  setInput: (value: string) => void;
  busy: boolean;
  /**
   * The last fully-typed assistant reply, for a visually-hidden live region —
   * screen readers get one announcement per reply instead of a stream of
   * three-character typewriter fragments.
   */
  announcement: string;
  /** Ask an arbitrary question (used by suggested-question chips). */
  ask: (question: string) => void;
  /** Submit the current input value. */
  send: () => void;
}

/**
 * Chat state, streaming and session memory for the assistant.
 *
 * The API streams plain text; incoming chunks land in a buffer and a
 * typewriter "pump" moves them into the last assistant message a few
 * characters per tick. Reduced motion drains the buffer instantly. The
 * conversation lives in sessionStorage, so it follows the visitor across
 * pages in the tab and clears on reload.
 */
export function useAssistant({
  assistant,
  typing,
  reduced,
  onServed,
}: UseAssistantOptions): UseAssistantResult {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    { role: "assistant", text: "" },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const onServedRef = useRef(onServed);
  onServedRef.current = onServed;
  const bufferRef = useRef("");
  const doneRef = useRef(true);
  const targetRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const busyRef = useRef(false);
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  const appendToTarget = useCallback((chunk: string) => {
    const target = targetRef.current;
    setMessages((prev) =>
      prev.map((m, i) => (i === target ? { ...m, text: m.text + chunk } : m)),
    );
  }, []);

  const stopPump = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startPump = useCallback(() => {
    if (timerRef.current !== null) return;
    timerRef.current = window.setInterval(() => {
      if (bufferRef.current.length === 0) {
        if (doneRef.current) {
          stopPump();
          busyRef.current = false;
          setBusy(false);
          const finished = messagesRef.current[targetRef.current];
          if (finished && finished.role === "assistant" && finished.text) {
            setAnnouncement(finished.text);
            saveConversation(messagesRef.current);
          }
        }
        return;
      }
      const take = reducedRef.current
        ? bufferRef.current.length
        : typing.chatCharsPerTick;
      const chunk = bufferRef.current.slice(0, take);
      bufferRef.current = bufferRef.current.slice(take);
      appendToTarget(chunk);
    }, typing.chatTickMs);
  }, [appendToTarget, stopPump, typing.chatCharsPerTick, typing.chatTickMs]);

  /** Instantly finish whatever the pump is currently typing. */
  const flush = useCallback(() => {
    if (bufferRef.current.length > 0) {
      appendToTarget(bufferRef.current);
      bufferRef.current = "";
    }
  }, [appendToTarget]);

  // Restore this tab's conversation, or type the greeting. Runs after
  // hydration so the server and first client render agree. Restart-safe under
  // StrictMode: the cleanup stops the timer and the re-run resumes the buffer.
  const startedRef = useRef(false);
  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      const restored = restoreConversation();
      if (restored) {
        setMessages(restored);
        return stopPump;
      }
      targetRef.current = 0;
      doneRef.current = true;
      bufferRef.current = assistant.greeting;
    }
    startPump();
    return stopPump;
  }, [assistant.greeting, startPump, stopPump]);

  const ask = useCallback(
    (raw: string) => {
      const question = raw.trim();
      if (!question || busyRef.current) return;

      flush();
      busyRef.current = true;
      setBusy(true);
      doneRef.current = false;
      setInput("");

      // Clamp to the API's shared size contract so the request can never be
      // rejected for length (see src/lib/assistant.ts).
      const history = messagesRef.current
        .filter((m) => m.text.length > 0)
        .slice(-MAX_HISTORY_ITEMS)
        .map((m) => ({
          role: m.role,
          content: m.text.slice(0, MAX_HISTORY_ITEM_CHARS),
        }));

      targetRef.current = messagesRef.current.length + 1;
      setMessages((prev) => [
        ...prev,
        { role: "user", text: question },
        { role: "assistant", text: "" },
      ]);
      startPump();

      void (async () => {
        try {
          const res = await fetch("/api/assistant", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: question.slice(0, MAX_MESSAGE_CHARS),
              history,
            }),
          });

          if (!res.ok) {
            // Only ever show config-authored copy in the transcript —
            // raw server error strings stay out of the chat.
            bufferRef.current +=
              res.status === 429
                ? assistant.rateLimitMessage
                : assistant.fallbackMessage;
            return;
          }

          const left = res.headers.get("X-Assistant-Remaining");
          const served = res.headers.get("X-Assistant-Mode");
          onServedRef.current?.({
            mode: served === "demo" || served === "live" ? served : null,
            remaining: left !== null && /^\d+$/.test(left) ? Number(left) : null,
          });

          if (!reducedRef.current && typing.chatReplyDelayMs > 0) {
            await new Promise((r) =>
              window.setTimeout(r, typing.chatReplyDelayMs),
            );
          }

          const reader = res.body?.getReader();
          if (!reader) {
            bufferRef.current += await res.text();
            return;
          }
          const decoder = new TextDecoder();
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            bufferRef.current += decoder.decode(value, { stream: true });
          }
          bufferRef.current += decoder.decode();
        } catch {
          if (bufferRef.current.length === 0) {
            bufferRef.current = assistant.fallbackMessage;
          }
        } finally {
          doneRef.current = true;
          startPump();
        }
      })();
    },
    [
      assistant.fallbackMessage,
      assistant.rateLimitMessage,
      flush,
      startPump,
      typing.chatReplyDelayMs,
    ],
  );

  const send = useCallback(() => ask(input), [ask, input]);

  return { messages, input, setInput, busy, announcement, ask, send };
}
