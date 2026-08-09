import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TerminalWindowProps {
  title: string;
  /** Right-aligned slot in the title bar (badge, hint, …). */
  titleRight?: ReactNode;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
}

/** macOS-style terminal chrome: traffic dots, title bar, dark body. */
export function TerminalWindow({
  title,
  titleRight,
  className,
  onClick,
  children,
}: TerminalWindowProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-surface shadow-window",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-border bg-surface-alt px-3.5 py-[11px]">
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-dot" />
        <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-dot" />
        <span
          aria-hidden="true"
          className="h-2.5 w-2.5 rounded-full bg-accent-dot"
        />
        <span className="ml-1.5 font-mono text-xs text-dim">{title}</span>
        <span className="flex-1" />
        {titleRight}
      </div>
      {children}
    </div>
  );
}
