import type { ReactNode } from "react";

export interface SectionLabelProps {
  /** Zero-padded section number, e.g. "01". Omit outside the numbered home flow. */
  number?: string;
  label: string;
  /** Right-aligned slot (e.g. the skills legend). */
  right?: ReactNode;
}

/** "01 // about" section header with the horizontal rule. */
export function SectionLabel({ number, label, right }: SectionLabelProps) {
  return (
    <div className="mb-3.5 flex items-center gap-3.5">
      <h2 className="m-0 font-mono text-[13px] font-medium text-accent">
        {number ? `${number} // ${label}` : label}
      </h2>
      <span aria-hidden="true" className="h-px flex-1 bg-border" />
      {right}
    </div>
  );
}
