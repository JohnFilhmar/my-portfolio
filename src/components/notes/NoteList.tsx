import { useMemo, useState } from "react";
import type { NotesConfig } from "@config/notesSchema";
import { NoteRow } from "@/components/notes/NoteRow";
import { FilterChips } from "@/components/ui/FilterChips";
import { sharedValues } from "@/lib/utils";

export interface NoteListProps {
  notes: NotesConfig;
}

/**
 * Every published note with a tag filter. Changing the filter remounts the
 * list, so the rows that match cascade in again.
 */
export function NoteList({ notes }: NoteListProps) {
  const all = notes.allTagsLabel;
  const tags = useMemo(
    () => [all, ...sharedValues(notes.posts.map((post) => post.tags))],
    [all, notes.posts],
  );
  const [active, setActive] = useState(all);
  const shown =
    active === all
      ? notes.posts
      : notes.posts.filter((post) => post.tags.includes(active));

  if (notes.posts.length === 0) {
    return (
      <p className="m-0 border-y-2 border-heading py-10 font-mono text-sm text-subtle">
        {notes.emptyMessage}
      </p>
    );
  }

  return (
    <>
      <FilterChips
        groupLabel={notes.filterLabel}
        options={tags}
        active={active}
        onChange={setActive}
        className="mb-6"
      />
      <ul key={active} className="m-0 list-none border-t-2 border-heading p-0">
        {shown.map((post, i) => (
          <NoteRow
            key={post.slug}
            note={post}
            minutesTemplate={notes.minutesTemplate}
            headingLevel="h2"
            className="animate-row-in"
            style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
          />
        ))}
      </ul>
    </>
  );
}
