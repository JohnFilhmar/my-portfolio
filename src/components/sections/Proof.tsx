import { useMemo, useState } from "react";
import type { LightboxConfig, ProofConfig } from "@config/schema";
import { FilterChips } from "@/components/ui/FilterChips";
import { Lightbox } from "@/components/ui/Lightbox";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProofRow } from "@/components/sections/ProofRow";

export interface ProofProps {
  proof: ProofConfig;
  lightbox: LightboxConfig;
}

/**
 * Evidence: filterable grid of captures, each expandable to full size. Only
 * captures not bound to a project show here; bound ones live on their case study.
 */
export function Proof({ proof, lightbox }: ProofProps) {
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
            onOpen={() => setOpenIndex(index)}
          />
        ))}
      </div>

      <Lightbox
        items={visible}
        index={openIndex}
        onIndexChange={setOpenIndex}
        onClose={() => setOpenIndex(null)}
        labels={lightbox}
      />
    </>
  );
}
