import type { AssistantConfig, AssistantMode } from "@config/schema";
import { useAssistantPanel } from "@/providers/AssistantProvider";
import { ChatWindow } from "@/components/assistant/ChatWindow";
import { SuggestedChips } from "@/components/assistant/SuggestedChips";
import { SectionHeading } from "@/components/ui/SectionHeading";

export interface AssistantSectionProps {
  assistant: AssistantConfig;
  mode: AssistantMode;
  /** On its own page the heading is the page's h1 instead of an h2. */
  standalone?: boolean;
}

/**
 * Assistant section: pitch + suggested questions on the left, chat on the
 * right. Shares the page's conversation with the overlay.
 */
export function AssistantSection({
  assistant,
  mode,
  standalone = false,
}: AssistantSectionProps) {
  const { chat } = useAssistantPanel();

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] items-start gap-column-gap">
        <div>
          <SectionHeading as={standalone ? "h1" : "h2"} className="mb-4">
            {assistant.heading}
          </SectionHeading>
          <p className="m-0 mb-3 max-w-[60ch] text-[16px] leading-[1.7] text-prose">
            {assistant.description}
          </p>
          <p className="m-0 mb-6 max-w-[60ch] font-mono text-[12px] leading-[1.7] text-dim">
            {assistant.disclaimer[mode]}
          </p>
          <p className="m-0 mb-2.5 font-mono text-[12px] text-faint">
            {assistant.tryLabel}
          </p>
          <SuggestedChips
            questions={assistant.suggestedQuestions}
            onAsk={chat.ask}
          />
        </div>
        <ChatWindow assistant={assistant} mode={mode} chat={chat} />
      </div>
    </>
  );
}
