import type {
  ExperienceItem,
  LightboxConfig,
  Recommendation,
  RecommendationsConfig,
} from "@config/schema";
import { RecommendationCard } from "@/components/recommendations/RecommendationCard";
import { PhotoStrip } from "@/components/ui/PhotoStrip";
import { cn } from "@/lib/utils";

export interface TimelineItemProps {
  item: ExperienceItem;
  presentLabel: string;
  /** Accessible name for this role's photo strip, already interpolated. */
  photosLabel: string;
  lightbox: LightboxConfig;
  /** Recommendations about this role; the first two show under it. */
  recommendations: Recommendation[];
  recommendationLabels: RecommendationsConfig;
}

/** One role: date range column + title, company and bullets. */
export function TimelineItem({
  item,
  presentLabel,
  photosLabel,
  lightbox,
  recommendations,
  recommendationLabels,
}: TimelineItemProps) {
  const current = item.end === null;
  return (
    <div className="grid gap-2 border-t sm:grid-cols-[minmax(92px,130px)_1fr] sm:gap-[clamp(14px,3vw,28px)] border-border-muted py-[22px]">
      <p
        className={cn(
          "m-0 mt-0.5 whitespace-pre-line font-mono text-sm",
          current ? "text-accent" : "text-dim",
        )}
      >
        {item.start} to{"\n"}
        {current ? presentLabel : item.end}
      </p>
      <div>
        <h3 className="m-0 mb-0.5 text-[17.5px] font-semibold text-heading">
          {item.title}
        </h3>
        <p className="m-0 mb-3 font-mono text-sm text-faint">{item.company}</p>
        <ul className="m-0 grid list-none gap-1.5 p-0">
          {item.bullets.map((bullet, i) => (
            <li
              key={i}
              className="flex gap-2.5 text-base leading-relaxed text-prose"
            >
              <span
                aria-hidden="true"
                className="shrink-0 font-mono text-accent"
              >
                -
              </span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
        {recommendations.length > 0 && (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {recommendations.slice(0, 2).map((rec) => (
              <RecommendationCard
                key={rec.id}
                rec={rec}
                labels={recommendationLabels}
                links={[]}
                compact
              />
            ))}
          </div>
        )}
        <PhotoStrip
          photos={item.photos}
          groupLabel={photosLabel}
          labels={lightbox}
        />
      </div>
    </div>
  );
}
