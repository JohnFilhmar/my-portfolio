import type { ReactNode } from "react";

/**
 * Render the minimal inline markup allowed in config prose:
 *   **bold**  → <strong> (bright, semibold)
 *   *italic*  → <em>
 *
 * Deliberately not a markdown engine — config text is trusted but we still
 * never use dangerouslySetInnerHTML for it.
 */
export function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={i} className="font-semibold text-bright">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}
