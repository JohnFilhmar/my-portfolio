import type { ExperienceConfig } from "@config/schema";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { TimelineItem } from "@/components/sections/TimelineItem";

export interface ExperienceProps {
  number: string;
  experience: ExperienceConfig;
}

/** Experience: vertical timeline of roles. */
export function Experience({ number, experience }: ExperienceProps) {
  return (
    <>
      <SectionLabel number={number} label={experience.label} />
      <p className="m-0 mb-9 text-section font-bold tracking-[-0.02em] text-heading">
        {experience.heading}
      </p>
      <div className="grid max-w-[860px] gap-0">
        {experience.items.map((item) => (
          <TimelineItem
            key={`${item.company}-${item.start}`}
            item={item}
            presentLabel={experience.presentLabel}
          />
        ))}
      </div>
    </>
  );
}
