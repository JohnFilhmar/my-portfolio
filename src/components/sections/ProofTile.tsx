import type { ProofItem } from "@config/schema";
import { ImageFrame } from "@/components/ui/ImageFrame";
import { Tag } from "@/components/ui/Tag";
import { isExternalHref } from "@/lib/utils";

export interface ProofTileProps {
  item: ProofItem;
  /** Accessible name for the expand button. `{title}` is replaced. */
  openLabelTemplate: string;
  /** First row loads eagerly; everything below the fold waits. */
  eager: boolean;
  onOpen: () => void;
}

/**
 * One artifact, framed as a terminal window: the title bar carries the file
 * name, the body is the picture, and the caption below carries the claim and
 * the address it can be checked against. The picture itself is the button, so
 * the whole tile stays one tab stop.
 */
export function ProofTile({
  item,
  openLabelTemplate,
  eager,
  onOpen,
}: ProofTileProps) {
  return (
    <figure className="group m-0 overflow-hidden rounded-xl border border-border bg-surface shadow-window transition duration-base hover:-translate-y-0.5 hover:border-border-hover">
      <div className="flex items-center gap-2 border-b border-border bg-surface-alt px-3.5 py-[9px]">
        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-dot" />
        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-dot" />
        <span
          aria-hidden="true"
          className="h-2 w-2 rounded-full bg-accent-dot"
        />
        <span className="ml-1 truncate font-mono text-2xs text-dim">
          {item.title}
        </span>
        <span className="flex-1" />
        <Tag variant="domain">{item.category}</Tag>
      </div>

      <button
        type="button"
        onClick={onOpen}
        aria-label={openLabelTemplate.replace("{title}", item.title)}
        className="relative block w-full cursor-zoom-in border-none bg-transparent p-0 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
      >
        <ImageFrame
          src={item.src}
          alt={item.alt}
          aspect={item.aspect}
          eager={eager}
          fallbackLabel={item.title}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-2.5 top-2.5 rounded-xs border border-border-strong bg-launcher-veil px-1.5 py-0.5 font-mono text-2xs text-subtle opacity-0 transition-opacity duration-fast group-hover:opacity-100 group-focus-within:opacity-100"
        >
          ⤢
        </span>
      </button>

      <figcaption className="border-t border-border-muted px-[18px] py-3.5">
        <p className="m-0 text-base leading-snug text-bright">{item.caption}</p>
        {item.meta && (
          <p className="m-0 mt-1 font-mono text-2xs text-dim">{item.meta}</p>
        )}
        {item.href && (
          <a
            href={item.href}
            {...(isExternalHref(item.href)
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className="mt-2 inline-block font-mono text-sm text-accent no-underline hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {item.href.replace(/^https?:\/\//, "")} ↗
          </a>
        )}
      </figcaption>
    </figure>
  );
}
