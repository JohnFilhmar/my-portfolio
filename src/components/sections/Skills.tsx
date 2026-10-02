import type { SkillsConfig } from "@config/schema";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";

export interface SkillsProps {
  skills: SkillsConfig;
}

/** Skills: grid of group cards with core-strength tags. */
export function Skills({ skills }: SkillsProps) {
  return (
    <>
      <SectionHeading className="mb-3">{skills.heading}</SectionHeading>
      <p className="m-0 mb-9 font-mono text-xs text-dim">{skills.legend}</p>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,310px),1fr))] gap-3.5">
        {skills.groups.map((group) => (
          <Card key={group.id} interactive>
            <h3 className="m-0 mb-1.5 font-mono text-md font-semibold text-bright">
              {group.label}
            </h3>
            {group.blurb && (
              <p className="m-0 mb-3.5 text-md text-faint">{group.blurb}</p>
            )}
            <ul className="m-0 flex list-none flex-wrap gap-[7px] p-0">
              {group.skills.map((skill) => {
                const core =
                  skill.level !== undefined && skill.level >= skills.coreLevel;
                return (
                  <li key={skill.name}>
                    <Tag variant={core ? "core" : "default"}>
                      {core ? `${skills.coreMarker} ${skill.name}` : skill.name}
                    </Tag>
                  </li>
                );
              })}
            </ul>
          </Card>
        ))}
      </div>
    </>
  );
}
