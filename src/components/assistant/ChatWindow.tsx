import type { AssistantConfig, AssistantMode } from "@config/schema";
import type { UseAssistantResult } from "@/hooks/useAssistant";
import { ChatInput } from "@/components/assistant/ChatInput";
import { MessageList } from "@/components/assistant/MessageList";
import { TerminalWindow } from "@/components/ui/TerminalWindow";

export interface ChatWindowProps {
  assistant: AssistantConfig;
  mode: AssistantMode;
  chat: UseAssistantResult;
}

/** Terminal chat window: title bar with mode badge, log, prompt input. */
export function ChatWindow({ assistant, mode, chat }: ChatWindowProps) {
  return (
    <TerminalWindow
      title={assistant.windowTitle}
      titleRight={
        <span className="rounded-xs border border-accent-border px-[7px] py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-accent">
          {assistant.badge[mode]}
        </span>
      }
    >
      <MessageList
        messages={chat.messages}
        tags={assistant.messageTags}
        ariaLabel={assistant.logAriaLabel}
        announcement={chat.announcement}
      />
      <ChatInput
        assistant={assistant}
        value={chat.input}
        onChange={chat.setInput}
        onSend={chat.send}
        busy={chat.busy}
      />
    </TerminalWindow>
  );
}
