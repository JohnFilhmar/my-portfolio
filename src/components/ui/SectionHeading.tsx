import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SectionHeadingProps {
  /** h2 inside the home flow; h1 when the section is a page of its own. */
  as?: "h1" | "h2";
  /** Spacing below, e.g. "mb-4". Defaults to "mb-8". */
  className?: string;
  children: ReactNode;
}

/** A section's title, set in the display face. */
export function SectionHeading({
  as: Tag = "h2",
  className,
  children,
}: SectionHeadingProps) {
  return (
    <Tag
      className={cn(
        "m-0 mb-8 font-display text-section font-semibold leading-[1.05] tracking-[-0.02em] text-heading",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
