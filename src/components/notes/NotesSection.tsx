import type { NotesConfig } from "@config/notesSchema";
import { NoteRow } from "@/components/notes/NoteRow";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { NOTES_PATH } from "@/lib/navigation";

export interface NotesSectionProps {
  notes: NotesConfig;
}

/** Home section: the newest notes and a link to the rest. */
export function NotesSection({ notes }: NotesSectionProps) {
  return (
    <>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <SectionHeading className="m-0">{notes.latestHeading}</SectionHeading>
        <a
          href={NOTES_PATH}
          className="font-mono text-sm text-accent underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {notes.allLabel} →
        </a>
      </div>
      <ul className="m-0 list-none border-t-2 border-heading p-0">
        {notes.posts.slice(0, notes.latestCount).map((post) => (
          <NoteRow
            key={post.slug}
            note={post}
            minutesTemplate={notes.minutesTemplate}
          />
        ))}
      </ul>
    </>
  );
}
