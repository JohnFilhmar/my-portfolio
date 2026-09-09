import { useMemo, useState } from "react";
import type { LightboxConfig, ProofConfig } from "@config/schema";
import { FilterChips } from "@/components/ui/FilterChips";
import { Lightbox } from "@/components/ui/Lightbox";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ProofRow } from "@/components/sections/ProofRow";

export interface ProofProps {
  number: string;
  proof: ProofConfig;
  lightbox: LightboxConfig;
}

/** Evidence: filterable grid of captures, each expandable to full size. */
export function Proof({ number, proof, lightbox }: ProofProps) {
  const [filter, setFilter] = useState(proof.filterAllLabel);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const categories = useMemo(() => {
    const seen: string[] = [];
    for (const item of proof.items) {
      if (!seen.includes(item.category)) seen.push(item.category);
    }
    return seen;
  }, [proof.items]);

  const visible = useMemo(
    () =>
      proof.items.filter(
        (item) => filter === proof.filterAllLabel || item.category === filter,
      ),
    [proof.items, proof.filterAllLabel, filter],
  );

  const commandLine = proof.commandLine.replace(
    "{n}",
    String(proof.items.length),
  );

  return (
    <>
      <SectionLabel number={number} label={proof.label} />
      <p className="m-0 mb-4 text-section font-bold tracking-[-0.02em] text-heading">
        {proof.heading}
      </p>
      <p className="m-0 mb-5 max-w-[62ch] text-lg leading-[1.7] text-prose">
        {proof.blurb}
      </p>
      <p className="m-0 mb-[26px] font-mono text-sm text-[var(--terminal-prompt)]">
        {commandLine}
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
