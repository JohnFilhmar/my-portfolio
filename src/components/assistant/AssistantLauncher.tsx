import type { AssistantConfig } from "@config/schema";
import { ASK_PATH } from "@/lib/navigation";

export interface AssistantLauncherProps {
  assistant: AssistantConfig;
}

/**
 * Floating button that opens the standalone assistant page: a round chat
 * icon on phones, where a labelled pill would cover content, and the
 * labelled pill from the `sm` breakpoint up. Clears the home indicator on
 * notched phones.
 */
export function AssistantLauncher({ assistant }: AssistantLauncherProps) {
  return (
    <a
      href={ASK_PATH}
      aria-label={assistant.launcher.ariaLabel}
      className="fixed bottom-[max(--spacing(4.5),env(safe-area-inset-bottom))] right-4.5 z-60 grid size-12 place-items-center whitespace-nowrap rounded-full border border-accent-halo bg-surface font-mono text-sm text-accent no-underline shadow-float transition-colors duration-fast hover:bg-accent hover:text-accent-contrast focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent sm:block sm:size-auto sm:rounded-pill sm:px-4 sm:py-2.5"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-5 sm:hidden"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4H6.5A2.5 2.5 0 0 1 4 13.5z" />
        <path d="M8.5 9.5h.01M12 9.5h.01M15.5 9.5h.01" strokeWidth="2.5" />
      </svg>
      <span className="hidden sm:inline">{assistant.launcher.label}</span>
    </a>
  );
}
