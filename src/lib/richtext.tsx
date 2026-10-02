import type { ReactNode } from "react";
import { isExternalHref } from "@/lib/utils";

const TOKEN =
  /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\((?:https?:\/\/|\/)[^)\s]*\))/g;
const LINK = /^\[([^\]]+)\]\(([^)\s]+)\)$/;

/**
 * Render the minimal inline markup allowed in config prose:
 *   **bold**      → <strong> (bright, semibold)
 *   *italic*      → <em>
 *   `code`        → <code>
 *   [text](url)   → <a>, only for http(s) or site-relative URLs
 *
 * Deliberately not a markdown engine — config text is trusted but we still
 * never use dangerouslySetInnerHTML for it.
 */
export function renderInline(text: string): ReactNode[] {
  return text.split(TOKEN).map((part, i) => {
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
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={i}
          className="rounded-xs bg-surface-inset px-1 py-px font-mono text-[0.9em] text-heading"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    const link = LINK.exec(part);
    if (link) {
      const [, label, href = ""] = link;
      return (
        <a
          key={i}
          href={href}
          {...(isExternalHref(href)
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className="text-accent underline decoration-1 underline-offset-[3px] hover:decoration-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {label}
        </a>
      );
    }
    return part;
  });
}
