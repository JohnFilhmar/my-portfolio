import { useSyncExternalStore } from "react";
import { currentTheme, setTheme } from "@/lib/themeMode";

export interface ThemeToggleProps {
  /** Accessible name; the button is pressed while the dark theme is on. */
  label: string;
  reducedMotion: boolean;
}

/** Re-reads the theme whenever anything changes `data-theme` on <html>. */
function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

const ICON =
  "col-start-1 row-start-1 transition-[transform,opacity] duration-base ease-standard";

/**
 * Light/dark switch for the header. The icons swap through CSS on the
 * `data-theme` attribute, so they are right from first paint, before React
 * knows which theme the init script picked.
 */
export function ThemeToggle({ label, reducedMotion }: ThemeToggleProps) {
  // null on the server: the init script picks the theme before hydration.
  const isDark = useSyncExternalStore(
    subscribe,
    () => currentTheme() === "dark",
    () => null,
  );

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isDark ?? undefined}
      onClick={(event) => {
        const next = currentTheme() === "dark" ? "light" : "dark";
        const box = event.currentTarget.getBoundingClientRect();
        setTheme(
          next,
          { x: box.left + box.width / 2, y: box.top + box.height / 2 },
          reducedMotion,
        );
      }}
      className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-md border border-control-border bg-surface-alt text-heading transition-colors duration-fast hover:bg-hover-tint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-95"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className={`${ICON} dark:rotate-90 dark:scale-50 dark:opacity-0`}
      >
        <circle cx="12" cy="12" r="4.5" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        className={`${ICON} -rotate-90 scale-50 opacity-0 dark:rotate-0 dark:scale-100 dark:opacity-100`}
      >
        <path d="M20.5 14.2A8.5 8.5 0 1 1 9.8 3.5a6.8 6.8 0 0 0 10.7 10.7Z" />
      </svg>
    </button>
  );
}
