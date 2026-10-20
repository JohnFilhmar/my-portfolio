import type { AssistantConfig } from "@config/schema";
import { MAX_MESSAGE_CHARS } from "@/lib/assistant";
import { ASSISTANT_INPUT_ID } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export interface ChatInputProps {
  assistant: AssistantConfig;
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  busy: boolean;
}

/** Terminal prompt input row: `$` prefix, text input, send button. */
export function ChatInput({
  assistant,
  value,
  onChange,
  onSend,
  busy,
}: ChatInputProps) {
  return (
    <div className="flex items-center gap-2.5 border-t border-border bg-surface-alt px-3.5 py-3">
      <span aria-hidden="true" className="font-mono text-[13px] text-accent">
        {assistant.inputPrompt}
      </span>
      <input
        id={ASSISTANT_INPUT_ID}
        value={value}
        maxLength={MAX_MESSAGE_CHARS}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          // Ignore Enter that commits an IME composition.
          if (e.key === "Enter" && !e.nativeEvent.isComposing) onSend();
        }}
        aria-label={assistant.inputAriaLabel}
        placeholder={assistant.inputPlaceholder}
        className="min-w-0 flex-1 border-none bg-transparent py-1.5 font-mono text-[16px] text-bright caret-accent outline-hidden placeholder:text-dim"
      />
      <button
        type="button"
        onClick={onSend}
        disabled={busy}
        aria-label={assistant.sendAriaLabel}
        className={cn(
          "cursor-pointer rounded-md border-none bg-accent px-[13px] py-2 font-mono text-sm text-accent-contrast transition duration-fast",
          "hover:brightness-110 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bright",
          busy && "cursor-default opacity-45",
        )}
      >
        {assistant.sendLabel}
      </button>
    </div>
  );
}
