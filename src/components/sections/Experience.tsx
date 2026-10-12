import type {
  ExperienceConfig,
  LightboxConfig,
  RecommendationsConfig,
} from "@config/schema";
import { recommendationsAbout } from "@/lib/recommendations";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TimelineItem } from "@/components/sections/TimelineItem";

export interface ExperienceProps {
  experience: ExperienceConfig;
  lightbox: LightboxConfig;
  recommendations: RecommendationsConfig;
}

/** Experience: vertical timeline of roles. */
export function Experience({
  experience,
  lightbox,
  recommendations,
}: ExperienceProps) {
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
            recommendations={
              item.id
                ? recommendationsAbout(recommendations.items, {
                    experience: item.id,
                  })
                : []
            }
            recommendationLabels={recommendations}
          />
        ))}
      </div>
    </>
  );
}
