import type { AssistantConfig } from "@config/schema";
import { goToAssistant } from "@/lib/navigation";

export interface AssistantLauncherProps {
  assistant: AssistantConfig;
  sectionId: string;
  reducedMotion: boolean;
}

/** Floating pill that jumps to the assistant and focuses its input. */
export function AssistantLauncher({
  assistant,
  sectionId,
  reducedMotion,
}: AssistantLauncherProps) {
  return (
    <button
      type="button"
      onClick={() => goToAssistant(sectionId, reducedMotion)}
      aria-label={assistant.launcher.ariaLabel}
      className="fixed bottom-[18px] right-[18px] z-[60] cursor-pointer rounded-pill border border-accent-halo bg-launcher-veil px-4 py-2.5 font-mono text-sm text-accent shadow-float backdrop-blur transition-colors duration-fast hover:bg-accent hover:text-accent-contrast focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent"
    >
      <span
        aria-hidden="true"
        className="mr-2 inline-block h-[7px] w-[7px] animate-pulse-dot rounded-full bg-accent"
      />
      {assistant.launcher.label}
    </button>
  );
}
