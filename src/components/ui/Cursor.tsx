import { cn } from "@/lib/utils";

export interface CursorProps {
  /** Visual size preset matching the design's three cursor placements. */
  size?: "nav" | "boot" | "text";
  className?: string;
}

const sizeClass: Record<NonNullable<CursorProps["size"]>, string> = {
  nav: "ml-[5px] h-[15px] w-2 align-[-2px]",
  boot: "h-3.5 w-2",
  text: "ml-0.5 h-[1.1em] w-[9px] align-[-0.18em]",
};

/** Blinking terminal block cursor. Decorative — always aria-hidden. */
export function Cursor({ size = "boot", className }: CursorProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block animate-blink bg-[var(--terminal-cursor)]",
        sizeClass[size],
        className,
      )}
    />
  );
}
