import { useMemo, useState } from "react";
import type { CertificationsConfig } from "@config/schema";
import { CertificationCard } from "@/components/sections/CertificationCard";
import { FilterChips } from "@/components/ui/FilterChips";
import { SectionHeading } from "@/components/ui/SectionHeading";

export interface CertificationsProps {
  certifications: CertificationsConfig;
  /**
   * On /certifications the heading is the page's h1, a skill filter appears
   * and an empty list shows `emptyMessage`.
   */
  standalone?: boolean;
}

/**
 * Credentials, presented as records rather than badges: issuer, dates and the
 * credential number are printed plainly and the verify link points at the
 * issuer's own page, so an employer can check an entry without asking.
 */
export function Certifications({
  certifications,
  standalone = false,
}: CertificationsProps) {
  const all = certifications.allSkillsLabel;
  const skills = useMemo(
    () => [
      all,
      ...new Set(certifications.items.flatMap((item) => item.skills)),
    ],
    [all, certifications.items],
  );
  const [active, setActive] = useState(all);
  const shown =
    active === all
      ? certifications.items
      : certifications.items.filter((item) => item.skills.includes(active));

  return (
    <>
      <SectionHeading as={standalone ? "h1" : "h2"} className="mb-4">
        {certifications.heading}
      </SectionHeading>
      <p className="m-0 mb-7 max-w-[62ch] text-lg leading-[1.7] text-prose">
        {certifications.blurb}
      </p>

      {standalone && certifications.items.length === 0 && (
        <p className="m-0 border-y-2 border-heading py-10 font-mono text-sm text-subtle">
          {certifications.emptyMessage}
        </p>
      )}
      {standalone && (
        <FilterChips
          groupLabel={certifications.filterLabel}
          options={skills}
          active={active}
          onChange={setActive}
          className="mb-6"
        />
      )}

      <ul
        key={active}
        className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] items-start gap-3.5 p-0"
      >
        {shown.map((item, i) => (
          <li
            key={item.id}
            className="h-full animate-row-in"
            style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
          >
            <CertificationCard
              item={item}
              labels={certifications}
              headingLevel={standalone ? "h2" : "h3"}
            />
          </li>
        ))}
      </ul>
    </>
  );
}
