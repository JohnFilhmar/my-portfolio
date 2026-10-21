import type { SkillsConfig } from "@config/schema";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";

export interface SkillsProps {
  skills: SkillsConfig;
}

/**
 * Skills: technical groups as cards of chips, each chip carrying its
 * evidence note, then the soft skills with the proof behind each one.
 */
export function Skills({ skills }: SkillsProps) {
  return (
    <>
      <SectionHeading className="mb-3">{skills.heading}</SectionHeading>
      <p className="m-0 mb-9 font-mono text-xs text-dim">{skills.legend}</p>
      {/* Phones swipe through the groups instead of scrolling past all nine. */}
      <div
        role="region"
        aria-label={skills.heading}
        tabIndex={0}
        className="no-scrollbar -mx-container-pad flex items-start snap-x snap-mandatory scroll-px-container-pad gap-3.5 overflow-x-auto px-container-pad md:mx-0 md:grid md:items-stretch md:grid-cols-[repeat(auto-fit,minmax(min(100%,310px),1fr))] md:overflow-visible md:px-0 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-accent"
      >
        {skills.groups.map((group) => (
          <Card
            key={group.id}
            interactive
            className="w-[85%] shrink-0 snap-start sm:w-[60%] md:w-auto"
          >
            <h3 className="m-0 mb-1.5 font-mono text-md font-semibold text-bright">
              {group.label}
            </h3>
            {group.blurb && (
              <p className="m-0 mb-3.5 hidden text-md text-faint md:block">
                {group.blurb}
              </p>
            )}
            <ul className="m-0 flex list-none flex-wrap gap-[7px] p-0">
              {group.skills.map((skill) => {
                const core =
                  skill.level !== undefined && skill.level >= skills.coreLevel;
                return (
                  <li key={skill.name}>
                    <Tag
                      variant={core ? "core" : "default"}
                      className="inline-flex flex-wrap items-baseline gap-x-1.5"
                    >
                      {core ? `${skills.coreMarker} ${skill.name}` : skill.name}
                      {skill.note && (
                        <span className="text-2xs text-dim">{skill.note}</span>
                      )}
                    </Tag>
                  </li>
                );
              })}
            </ul>
          </Card>
        ))}
      </div>

      {skills.soft.length > 0 && (
        <>
          <h3 className="stretch-semi-expanded m-0 mb-5 mt-14 font-display text-title font-semibold text-heading">
            {skills.softHeading}
          </h3>
          <dl className="m-0 grid gap-x-8 gap-y-5 md:grid-cols-2">
            {skills.soft.map((item) => (
              <div
                key={item.name}
                className="border-l-2 border-accent-border pl-4"
              >
                <dt className="font-mono text-sm font-semibold text-bright">
                  {item.name}
                </dt>
                <dd className="m-0 mt-1 text-md leading-relaxed text-muted">
                  {item.evidence}
                </dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </>
  );
}
