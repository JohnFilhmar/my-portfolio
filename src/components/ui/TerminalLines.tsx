import type { Span } from "@config/schema";
import { cn, toneTextClass } from "@/lib/utils";

/** A run of toned spans on one line (used by terminal cards / status lines). */
export function SpanLine({
  spans,
  className,
}: {
  spans: Span[];
  className?: string;
}) {
  return (
    <p className={cn("m-0", className)}>
      {spans.map((span, i) => (
        <span key={i} className={toneTextClass[span.tone]}>
          {span.text}
        </span>
      ))}
    </p>
  );
}
