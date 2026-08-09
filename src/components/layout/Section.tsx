import type { ReactNode } from "react";
import { useReveal } from "@/hooks/useReveal";
import { cn } from "@/lib/utils";

export interface SectionProps {
  id: string;
  ariaLabel: string;
  /** Disable the reveal-on-scroll animation (reduced motion). */
  reducedMotion?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Page section: anchor target, fluid vertical rhythm, scroll margin for the
 * sticky header, and reveal-on-scroll as progressive enhancement.
 */
export function Section({
  id,
  ariaLabel,
  reducedMotion = false,
  className,
  children,
}: SectionProps) {
  const { ref, style } = useReveal<HTMLElement>(reducedMotion);
  return (
    <section
      id={id}
      ref={ref}
      style={style}
      aria-label={ariaLabel}
      className={cn(
        "mx-auto w-full max-w-container scroll-mt-scroll-margin px-container-pad py-section-y",
        className,
      )}
    >
      {children}
    </section>
  );
}
