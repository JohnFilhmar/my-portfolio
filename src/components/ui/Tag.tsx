import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type TagVariant = "default" | "core" | "stack" | "domain";

export interface TagProps {
  variant?: TagVariant;
  className?: string;
  children: ReactNode;
}

const variantClass: Record<TagVariant, string> = {
  // Skill tag (regular)
  default:
    "rounded-sm border border-border-chip bg-surface-inset px-2.5 py-1 text-xs text-subtle",
  // Skill tag flagged as core strength
  core: "rounded-sm border border-accent-border bg-accent-soft px-2.5 py-1 text-xs text-accent",
  // Project stack chip
  stack:
    "rounded-sm border border-border-muted bg-surface-inset px-2 py-[3px] text-xs text-faint",
  // Project domain badge
  domain:
    "rounded-xs border border-border-chip px-[7px] py-0.5 text-2xs uppercase tracking-[0.06em] text-faint",
};

/** Small mono label chip; variants cover skills, stack and domain badges. */
export function Tag({ variant = "default", className, children }: TagProps) {
  return (
    <span className={cn("font-mono", variantClass[variant], className)}>
      {children}
    </span>
  );
}
