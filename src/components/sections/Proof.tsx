import { useMemo, useState } from "react";
import type { LightboxConfig, ProofConfig } from "@config/schema";
import { FilterChips } from "@/components/ui/FilterChips";
import { Lightbox, type LightboxItem } from "@/components/ui/Lightbox";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProofRow } from "@/components/sections/ProofRow";

export interface ProofProps {
  proof: ProofConfig;
  lightbox: LightboxConfig;
  reducedMotion: boolean;
}

/**
 * Evidence: filterable grid of captures, each expandable to full size. Only
 * captures not bound to a project show here; bound ones live on their case study.
 */
export function Proof({ proof, lightbox, reducedMotion }: ProofProps) {
  const [filter, setFilter] = useState(proof.filterAllLabel);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const unbound = useMemo(
    () => proof.items.filter((item) => item.project === undefined),
    [proof.items],
  );

  const categories = useMemo(() => {
    const seen: string[] = [];
    for (const item of unbound) {
      if (!seen.includes(item.category)) seen.push(item.category);
    }
    return seen;
  }, [unbound]);

  const visible = useMemo(
    () =>
      unbound.filter(
        (item) => filter === proof.filterAllLabel || item.category === filter,
      ),
    [unbound, proof.filterAllLabel, filter],
  );

  // Every real picture of every visible row, in order, for the full-size
  // viewer; `firstSlide[i]` is where row i's pictures start in that list.
  const { slides, firstSlide } = useMemo(() => {
    const all: LightboxItem[] = [];
    const starts: number[] = [];
    for (const item of visible) {
      starts.push(all.length);
      const shots = [
        { src: item.src, alt: item.alt, missing: item.missing },
        ...item.gallery,
      ];
      shots.forEach((shot, k) => {
        if (shot.missing) return;
        all.push({
          ...item,
          id: `${item.id}-${k}`,
          src: shot.src,
          alt: shot.alt,
        });
      });
    }
    return { slides: all, firstSlide: starts };
  }, [visible]);

  return (
    <>
      <SectionHeading className="mb-4">{proof.heading}</SectionHeading>
      <p className="m-0 mb-5 max-w-[62ch] text-lg leading-[1.7] text-prose">
        {proof.blurb}
      </p>

      <FilterChips
        groupLabel={proof.filterGroupLabel}
        options={
          proof.showFilters && categories.length > 1
            ? [proof.filterAllLabel, ...categories]
            : []
        }
        active={filter}
        onChange={(next) => {
          setFilter(next);
          setOpenIndex(null);
        }}
        className="mb-[26px]"
      />

      {/* Full-width rows with the picture alternating sides. A capture only
          works as evidence if it is big enough to read. */}
      <div className="grid gap-[clamp(40px,6vw,72px)]">
        {visible.map((item, index) => (
          <ProofRow
            key={item.id}
            item={item}
            openLabelTemplate={proof.openLabelTemplate}
            flipped={index % 2 === 1}
            eager={index === 0}
            reducedMotion={reducedMotion}
            onOpen={(src) => {
              const at = slides.findIndex(
                (slide, k) =>
                  k >= (firstSlide[index] ?? 0) && slide.src === src,
              );
              if (at >= 0) setOpenIndex(at);
            }}
          />
        ))}
      </div>

      <Lightbox
        items={slides}
        index={openIndex}
        onIndexChange={setOpenIndex}
        onClose={() => setOpenIndex(null)}
        labels={lightbox}
      />
    </>
  );
}
