import { cn } from "@/lib/utils";

export interface FilterChipsProps {
  /** Accessible name for the button group. */
  groupLabel: string;
  options: string[];
  active: string;
  onChange: (option: string) => void;
  className?: string;
}

/**
 * Single-choice chip row (aria-pressed toggles), shared by the project and
 * evidence grids. Renders nothing when there is only one thing to choose.
 */
export function FilterChips({
  groupLabel,
  options,
  active,
  onChange,
  className,
}: FilterChipsProps) {
  if (options.length < 2) return null;
  return (
    <div
      role="group"
      aria-label={groupLabel}
      className={cn("flex flex-wrap gap-2", className)}
    >
      {options.map((option) => {
        const isActive = active === option;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option)}
            className={cn(
              "cursor-pointer rounded-md border px-[13px] py-[7px] font-mono text-xs transition-colors duration-fast",
              "hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              isActive
                ? "border-accent bg-accent text-accent-contrast"
                : "border-border-chip bg-surface text-subtle",
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
