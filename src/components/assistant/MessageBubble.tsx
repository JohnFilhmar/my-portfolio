import type { AssistantConfig } from "@config/schema";
import type { AssistantMessage } from "@/hooks/useAssistant";
import { cn } from "@/lib/utils";

export interface MessageBubbleProps {
  message: AssistantMessage;
  tags: AssistantConfig["messageTags"];
}

/** One chat message: mono role tag + pre-wrapped text. */
export function MessageBubble({ message, tags }: MessageBubbleProps) {
  const isAssistant = message.role === "assistant";
  return (
    <div>
      <p
        className={cn(
          "m-0 mb-1 font-mono text-[11px]",
          isAssistant ? "text-accent" : "text-dim",
        )}
      >
        {isAssistant ? tags.assistant : tags.user}
      </p>
      <p
        className={cn(
          "m-0 whitespace-pre-wrap text-[14px] leading-[1.65]",
          isAssistant ? "text-foreground" : "text-bright",
        )}
      >
        {message.text}
      </p>
    </div>
  );
}
