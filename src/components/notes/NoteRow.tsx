import type { CSSProperties } from "react";
import type { NoteSummary } from "@config/notesSchema";
import { Tag } from "@/components/ui/Tag";
import { notePath } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export interface NoteRowProps {
  note: NoteSummary;
  /** `{n}` is replaced with the minutes. */
  minutesTemplate: string;
  /** h2 on /notes, where the page title is the h1; h3 inside a home section. */
  headingLevel?: "h2" | "h3";
  className?: string;
  style?: CSSProperties;
}

/**
 * One note in a list: date, title, summary, tags and reading time. The title
 * links to the post and slides right on hover with an arrow following it.
 */
export function NoteRow({
  note,
  minutesTemplate,
  headingLevel: Heading = "h3",
  className,
  style,
}: NoteRowProps) {
  return (
    <li
      style={style}
      className={cn("border-b border-border-strong py-7", className)}
    >
      <article className="grid gap-x-column-gap gap-y-2 md:grid-cols-[9rem_minmax(0,1fr)_auto]">
        <time
          dateTime={note.date}
          className="font-mono text-sm text-subtle md:pt-1.5"
        >
          {note.date}
        </time>
        <div className="min-w-0">
          <Heading className="m-0 font-display text-title font-semibold leading-snug text-heading">
            <a
              href={notePath(note.slug)}
              className="group inline-flex items-baseline gap-3 text-heading no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              <span className="transition-transform duration-base ease-standard group-hover:translate-x-1.5">
                {note.title}
              </span>
              <span
                aria-hidden="true"
                className="-translate-x-2 text-accent opacity-0 transition-[transform,opacity] duration-base ease-standard group-hover:translate-x-1.5 group-hover:opacity-100"
              >
                →
              </span>
            </a>
          </Heading>
          <p className="m-0 mt-2 max-w-[58ch] text-base leading-relaxed text-muted">
            {note.summary}
          </p>
          {note.tags.length > 0 && (
            <ul className="m-0 mt-3 flex list-none flex-wrap gap-1.5 p-0">
              {note.tags.map((tag) => (
                <li key={tag}>
                  <Tag variant="stack">{tag}</Tag>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="m-0 font-mono text-sm text-subtle md:pt-1.5 md:text-right">
          {minutesTemplate.replaceAll("{n}", String(note.minutes))}
        </p>
      </article>
    </li>
  );
}
