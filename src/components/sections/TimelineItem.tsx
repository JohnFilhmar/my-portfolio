import type { ExperienceItem } from "@config/schema";
import { cn } from "@/lib/utils";

export interface TimelineItemProps {
  item: ExperienceItem;
  presentLabel: string;
}

/** One role: date range column + title, company and bullets. */
export function TimelineItem({ item, presentLabel }: TimelineItemProps) {
  const current = item.end === null;
  return (
    <div className="grid grid-cols-[minmax(92px,130px)_1fr] gap-[clamp(14px,3vw,28px)] border-t border-border-muted py-[22px]">
      <p
        className={cn(
          "m-0 mt-0.5 whitespace-pre-line font-mono text-sm",
          current ? "text-accent" : "text-dim",
        )}
      >
        {item.start} —{"\n"}
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
      </div>
    </div>
  );
}
