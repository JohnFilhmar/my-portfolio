import type { ProofItem } from "@config/schema";
import { Carousel } from "@/components/ui/Carousel";
import { ImageFrame } from "@/components/ui/ImageFrame";
import { Tag } from "@/components/ui/Tag";
import { cn, isExternalHref } from "@/lib/utils";

export interface ProofRowProps {
  item: ProofItem;
  /** Accessible name for the expand button. `{title}` is replaced. */
  openLabelTemplate: string;
  /** Odd rows put the picture on the right, so the page alternates. */
  flipped: boolean;
  /** First row loads eagerly; the rest wait until they are scrolled to. */
  eager: boolean;
  reducedMotion: boolean;
  /** Opens the picture at `src` full size. */
  onOpen: (src: string) => void;
}

/** Ratio below this reads as a portrait shot (a phone, or a tall panel). */
const PORTRAIT_RATIO = 0.9;

function aspectRatio(aspect: string): number {
  const [w, h] = aspect.split("/");
  const width = Number(w);
  const height = Number(h);
  if (!Number.isFinite(width) || !Number.isFinite(height) || height === 0) {
    return 1;
  }
  return width / height;
}

/**
 * One artifact as a full-width editorial row: the capture on one side, the
 * claim and the address it can be checked against on the other, sides swapping
 * down the page. Portrait captures are held to a narrower column so a phone
 * screenshot cannot stretch the row to twice the height of its neighbours.
 */
export function ProofRow({
  item,
  openLabelTemplate,
  flipped,
  eager,
  reducedMotion,
  onOpen,
}: ProofRowProps) {
  const slides = [
    { src: item.src, alt: item.alt, missing: item.missing },
    ...item.gallery,
  ];
  const portrait = aspectRatio(item.aspect) < PORTRAIT_RATIO;
  const host = item.href?.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <article className="grid items-center gap-x-column-gap gap-y-6 md:grid-cols-2">
      <div className={cn("min-w-0", flipped && "md:order-2")}>
        {item.gallery.length > 0 ? (
          <Carousel
            slides={slides}
            aspect={item.aspect}
            label={item.caption}
            reducedMotion={reducedMotion}
            onOpen={(i) => {
              const slide = slides[i];
              if (slide) onOpen(slide.src);
            }}
          />
        ) : (
          <div
            className={cn(
              "overflow-hidden rounded-xl border border-border bg-surface shadow-window",
              portrait && "mx-auto max-w-[320px]",
            )}
          >
            {item.missing ? (
              <ImageFrame
                src={item.src}
                alt={item.alt}
                aspect={item.aspect}
                fallbackLabel={item.caption}
                missing
              />
            ) : (
              <button
                type="button"
                onClick={() => onOpen(item.src)}
                aria-label={openLabelTemplate.replace("{title}", item.title)}
                className="block w-full cursor-zoom-in border-none bg-transparent p-0 transition duration-base hover:opacity-95 focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
              >
                <ImageFrame
                  src={item.src}
                  alt={item.alt}
                  aspect={item.aspect}
                  eager={eager}
                  fit={portrait ? "contain" : "cover"}
                  fallbackLabel={item.title}
                />
              </button>
            )}
          </div>
        )}
      </div>

      <div className={cn("min-w-0", flipped && "md:order-1")}>
        <h3 className="m-0 mb-3 text-[clamp(20px,2.2vw,26px)] font-bold tracking-[-0.01em] text-heading">
          {item.caption}
        </h3>
        <Tag variant="domain" className="mb-3 inline-block">
          {item.category}
        </Tag>
        {item.blurb && (
          <p className="m-0 mb-3 max-w-[46ch] text-lg leading-[1.6] text-prose">
            {item.blurb}
          </p>
        )}
        {item.meta && (
          <p className="m-0 font-mono text-sm text-dim">{item.meta}</p>
        )}
        {item.href && host && (
          <a
            href={item.href}
            {...(isExternalHref(item.href)
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className="mt-3 inline-block font-mono text-sm text-accent no-underline hover:underline focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {host} ↗
          </a>
        )}
      </div>
    </article>
  );
}
