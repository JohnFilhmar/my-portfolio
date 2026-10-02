import type { AssistantConfig } from "@config/schema";
import { ASK_PATH } from "@/lib/navigation";

export interface AssistantLauncherProps {
  assistant: AssistantConfig;
}

/** Floating pill that opens the standalone assistant page. */
export function AssistantLauncher({ assistant }: AssistantLauncherProps) {
  return (
    <a
      href={ASK_PATH}
      aria-label={assistant.launcher.ariaLabel}
      className="fixed bottom-[18px] right-[18px] z-[60] whitespace-nowrap rounded-pill border border-accent-halo bg-surface px-4 py-2.5 font-mono text-sm text-accent no-underline shadow-float transition-colors duration-fast hover:bg-accent hover:text-accent-contrast focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent"
    >
      <span
        aria-hidden="true"
        className="mr-2 inline-block h-[7px] w-[7px] animate-pulse-dot rounded-full bg-accent"
      />
      {assistant.launcher.label}
    </a>
  );
}
