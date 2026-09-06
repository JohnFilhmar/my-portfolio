import { useMemo, useState } from "react";
import type { LightboxConfig, ProofConfig } from "@config/schema";
import { FilterChips } from "@/components/ui/FilterChips";
import { Lightbox } from "@/components/ui/Lightbox";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ProofTile } from "@/components/sections/ProofTile";

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

      {/* Wider than the project grid on purpose: a 1440px capture shrunk into
          a 340px card is unreadable, which defeats the point of showing it. */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-start gap-3.5">
        {visible.map((item, index) => (
          <ProofTile
            key={item.id}
            item={item}
            openLabelTemplate={proof.openLabelTemplate}
            eager={index < 2}
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
