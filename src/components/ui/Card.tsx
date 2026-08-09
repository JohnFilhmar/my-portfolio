import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds the hover border treatment used by skill/project cards. */
  interactive?: boolean;
  /** Removes the default padding (used when the card manages its own). */
  flush?: boolean;
}

/** Surface panel: rounded, bordered, dark. */
export function Card({
  interactive = false,
  flush = false,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      {...rest}
      className={cn(
        "rounded-xl border border-border bg-surface",
        !flush && "px-[22px] py-5",
        interactive && "transition duration-base hover:border-border-hover",
        className,
      )}
    >
      {children}
    </div>
  );
}
