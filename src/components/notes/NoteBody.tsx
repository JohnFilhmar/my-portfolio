import type { NoteBlock } from "@config/notesSchema";
import { renderInline } from "@/lib/richtext";

/** Renders one block of a note body. */
function Block({ block }: { block: NoteBlock }) {
  if (typeof block === "string") {
    return <p className="m-0 mt-6 first:mt-0">{renderInline(block)}</p>;
  }
  switch (block.type) {
    case "heading":
      return (
        <h2 className="m-0 mt-14 font-display text-title font-semibold leading-snug text-heading">
          {block.text}
        </h2>
      );
    case "list": {
      const List = block.ordered ? "ol" : "ul";
      return (
        <List
          className={`m-0 mt-6 pl-6 marker:text-subtle ${block.ordered ? "list-decimal" : "list-disc"}`}
        >
          {block.items.map((item, i) => (
            <li key={i} className="mt-2 pl-1">
              {renderInline(item)}
            </li>
          ))}
        </List>
      );
    }
    case "code":
      return (
        <figure className="m-0 mt-8">
          {block.lang && (
            <figcaption className="mb-2 font-mono text-2xs uppercase tracking-[0.08em] text-subtle">
              {block.lang}
            </figcaption>
          )}
          <pre className="m-0 overflow-x-auto rounded-lg border border-border bg-surface-inset p-4 text-sm leading-relaxed">
            <code className="font-mono text-heading">{block.code}</code>
          </pre>
        </figure>
      );
    case "quote":
      return (
        <blockquote className="m-0 mt-10 border-l-2 border-accent pl-6 font-display text-title leading-snug text-heading">
          {renderInline(block.text)}
        </blockquote>
      );
    case "image":
      return (
        <figure className="m-0 mt-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.src}
            alt={block.alt}
            loading="lazy"
            decoding="async"
            className="block h-auto w-full rounded-lg border border-border"
          />
          {block.caption && (
            <figcaption className="mt-2 font-mono text-xs text-subtle">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
  }
}

/**
 * A note's body, set for reading: one measure, generous leading, and the
 * same type scale as the rest of the site.
 */
export function NoteBody({ body }: { body: NoteBlock[] }) {
  return (
    <div className="max-w-[56ch] text-lg leading-[1.75] text-prose">
      {body.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
}
