import { useEffect, useRef } from "react";
import type { AssistantConfig } from "@config/schema";
import type { AssistantMessage } from "@/hooks/useAssistant";
import { MessageBubble } from "@/components/assistant/MessageBubble";

export interface MessageListProps {
  messages: AssistantMessage[];
  tags: AssistantConfig["messageTags"];
  ariaLabel: string;
  /** Last fully-typed assistant reply, announced once via a hidden region. */
  announcement: string;
}

/**
 * Scrollable chat log; keeps itself pinned to the newest message.
 *
 * The visible log is aria-live="off" so the 3-chars-per-tick typewriter
 * doesn't spam screen readers with fragments; completed replies are
 * announced once through the visually-hidden status region instead.
 */
export function MessageList({
  messages,
  tags,
  ariaLabel,
  announcement,
}: MessageListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <>
      <div
        ref={listRef}
        role="log"
        aria-live="off"
        aria-label={ariaLabel}
        className="flex h-[min(400px,56vh)] flex-col gap-3.5 overflow-y-auto px-[18px] pb-2.5 pt-[18px]"
      >
        {messages.map((message, i) => (
          <MessageBubble key={i} message={message} tags={tags} />
        ))}
      </div>
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </>
  );
}
