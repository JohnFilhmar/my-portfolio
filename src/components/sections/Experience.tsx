import type { ExperienceConfig, LightboxConfig } from "@config/schema";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TimelineItem } from "@/components/sections/TimelineItem";

export interface ExperienceProps {
  experience: ExperienceConfig;
  lightbox: LightboxConfig;
}

/** Experience: vertical timeline of roles. */
export function Experience({ experience, lightbox }: ExperienceProps) {
  return (
    <>
      <SectionHeading className="mb-9">{experience.heading}</SectionHeading>
      <div className="grid max-w-[860px] gap-0">
        {experience.items.map((item) => (
          <TimelineItem
            key={`${item.company}-${item.start}`}
            item={item}
            presentLabel={experience.presentLabel}
            photosLabel={experience.photosLabelTemplate.replace(
              "{name}",
              item.company,
            )}
            lightbox={lightbox}
          />
        ))}
      </div>
    </>
  );
}
