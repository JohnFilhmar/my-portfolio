import type {
  AssistantConfig,
  AssistantMode,
  ThemeConfig,
} from "@config/schema";
import { useAssistant } from "@/hooks/useAssistant";
import { ChatWindow } from "@/components/assistant/ChatWindow";
import { SuggestedChips } from "@/components/assistant/SuggestedChips";
import { SectionLabel } from "@/components/ui/SectionLabel";

export interface AssistantSectionProps {
  number: string;
  assistant: AssistantConfig;
  mode: AssistantMode;
  typing: ThemeConfig["motion"]["typing"];
  reducedMotion: boolean;
}

/** Assistant section: pitch + suggested questions on the left, chat on the right. */
export function AssistantSection({
  number,
  assistant,
  mode,
  typing,
  reducedMotion,
}: AssistantSectionProps) {
  const chat = useAssistant({ assistant, typing, reduced: reducedMotion });

  return (
    <>
      <SectionLabel number={number} label={assistant.label} />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] items-start gap-column-gap">
        <div>
          <p className="m-0 mb-4 text-section font-bold tracking-[-0.02em] text-heading">
            {assistant.heading}
          </p>
          <p className="m-0 mb-3 text-[16px] leading-[1.7] text-prose">
            {assistant.description}
          </p>
          <p className="m-0 mb-6 font-mono text-[12px] leading-[1.7] text-dim">
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
