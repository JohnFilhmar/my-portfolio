import { useEffect, useRef, type KeyboardEvent } from "react";
import type { AssistantConfig, AssistantMode } from "@config/schema";
import type { UseAssistantResult } from "@/hooks/useAssistant";
import { MAX_MESSAGE_CHARS } from "@/lib/assistant";
import { cn } from "@/lib/utils";

export interface AssistantOverlayProps {
  assistant: AssistantConfig;
  chat: UseAssistantResult;
  mode: AssistantMode | null;
  /** Real AI answers left today; the counter hides when null. */
  remaining: number | null;
  onClose: () => void;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Full-screen assistant over the page. The backdrop blurs the site, while the
 * conversation sits on a solid panel so its text contrast never depends on
 * what is underneath. Esc or the backdrop closes it, focus stays inside while
 * it is open, and the page behind cannot scroll.
 */
export function AssistantOverlay({
  assistant,
  chat,
  mode,
  remaining,
  onClose,
}: AssistantOverlayProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const { messages, busy } = chat;
  const waiting = busy && messages[messages.length - 1]?.text === "";
  const onlyGreeting = messages.every((m) => m.role === "assistant");

  // Esc listens on the document: focus can land on <body> when the element
  // holding it disappears (a used suggestion chip), and Esc must still close.
  useEffect(() => {
    inputRef.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onEscape);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onEscape);
    };
  }, [onClose]);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab" || !dialogRef.current) return;
    const items = [
      ...dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
    ];
    const first = items[0];
    const last = items[items.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="assistant-overlay-title"
      onKeyDown={onKeyDown}
      className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6"
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-overlay backdrop-blur-md"
      />
      <section className="relative flex h-[min(92dvh,880px)] w-full max-w-3xl animate-panel-in flex-col overflow-hidden rounded-t-xl border border-border bg-surface shadow-modal sm:rounded-xl">
        <header className="flex items-start gap-4 border-b border-border px-5 py-4 sm:px-7">
          <div className="min-w-0 flex-1">
            <h2
              id="assistant-overlay-title"
              className="m-0 font-display text-2xl font-semibold tracking-[-0.01em] text-heading"
            >
              {assistant.heading}
            </h2>
            {mode && (
              <p className="m-0 mt-1 font-mono text-xs text-subtle">
                {assistant.badge[mode]}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={assistant.closeLabel}
            className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border border-control-border bg-transparent font-mono text-lg text-heading transition-colors duration-fast hover:bg-hover-tint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <div
          ref={logRef}
          role="log"
          aria-live="off"
          aria-label={assistant.logAriaLabel}
          className="flex-1 overflow-y-auto px-5 sm:px-7"
        >
          {messages.map((message, i) =>
            message.text || i < messages.length - 1 ? (
              <div
                key={i}
                className="grid animate-row-in gap-x-6 gap-y-1.5 border-b border-border py-5 last:border-b-0 sm:grid-cols-[8rem_1fr]"
              >
                <p className="m-0 pt-1 font-mono text-2xs uppercase tracking-[0.08em] text-subtle">
                  {message.role === "assistant"
                    ? assistant.messageTags.assistant
                    : assistant.messageTags.user}
                </p>
                <p
                  className={cn(
                    "m-0 max-w-prose whitespace-pre-wrap text-lg leading-[1.65]",
                    message.role === "assistant"
                      ? "text-prose"
                      : "text-heading",
                  )}
                >
                  {message.text}
                </p>
              </div>
            ) : null,
          )}
          {waiting && (
            <p
              aria-hidden="true"
              className="m-0 flex animate-row-in items-center gap-1.5 py-5 font-mono text-sm text-subtle sm:pl-[calc(8rem+1.5rem)]"
            >
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  className="h-1.5 w-1.5 animate-dot rounded-full bg-subtle"
                  style={{ animationDelay: `${dot * 160}ms` }}
                />
              ))}
            </p>
          )}
          {onlyGreeting && (
            <div className="flex flex-wrap gap-2 pb-6">
              {assistant.suggestedQuestions.map((question, i) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => {
                    chat.ask(question);
                    inputRef.current?.focus();
                  }}
                  style={{ animationDelay: `${120 + i * 50}ms` }}
                  className="animate-row-in cursor-pointer rounded-pill border border-control-border bg-surface-alt px-3.5 py-2 text-left text-sm text-foreground transition-colors duration-fast hover:bg-hover-tint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {question}
                </button>
              ))}
            </div>
          )}
        </div>
        <div role="status" aria-live="polite" className="sr-only">
          {chat.announcement}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            chat.send();
          }}
          className="flex items-center gap-3 border-t border-border px-5 py-3 sm:px-7"
        >
          <input
            ref={inputRef}
            value={chat.input}
            maxLength={MAX_MESSAGE_CHARS}
            onChange={(event) => chat.setInput(event.target.value)}
            aria-label={assistant.inputAriaLabel}
            placeholder={assistant.inputPlaceholder}
            className="min-w-0 flex-1 border-none bg-transparent py-3 text-[16px] text-heading outline-none placeholder:text-subtle"
          />
          <button
            type="submit"
            disabled={chat.busy}
            aria-label={assistant.sendAriaLabel}
            className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border-none bg-accent text-accent-contrast transition-transform duration-fast active:scale-95 disabled:cursor-default disabled:bg-surface-inset disabled:text-faint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <span aria-hidden="true">→</span>
          </button>
        </form>
        <footer className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-border bg-surface-alt px-5 py-2.5 sm:px-7">
          <p className="m-0 text-xs text-subtle">
            {assistant.disclaimer[mode ?? "demo"]}
          </p>
          {remaining !== null && (
            <p className="m-0 font-mono text-xs text-heading">
              {assistant.remainingTemplate.replaceAll("{n}", String(remaining))}
            </p>
          )}
        </footer>
      </section>
    </div>
  );
}
