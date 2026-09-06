import type { EducationConfig, LightboxConfig } from "@config/schema";
import { PhotoStrip } from "@/components/ui/PhotoStrip";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { cn } from "@/lib/utils";

export interface EducationProps {
  number: string;
  education: EducationConfig;
  lightbox: LightboxConfig;
}

/** Education: vertical timeline of schools, mirroring the experience layout. */
export function Education({ number, education, lightbox }: EducationProps) {
  return (
    <>
      <SectionLabel number={number} label={education.label} />
      <p className="m-0 mb-9 text-section font-bold tracking-[-0.02em] text-heading">
        {education.heading}
      </p>
      <div className="grid max-w-[860px] gap-0">
        {education.items.map((item) => {
          const current = item.end === null;
          return (
            <div
              key={`${item.institution}-${item.start}`}
              className="grid grid-cols-[minmax(92px,130px)_1fr] gap-[clamp(14px,3vw,28px)] border-t border-border-muted py-[22px]"
            >
              <p
                className={cn(
                  "m-0 mt-0.5 whitespace-pre-line font-mono text-sm",
                  current ? "text-accent" : "text-dim",
                )}
              >
                {item.start} —{"\n"}
                {current ? education.presentLabel : item.end}
              </p>
              <div>
                <h3 className="m-0 mb-0.5 text-[17.5px] font-semibold text-heading">
                  {item.degree}
                </h3>
                <p className="m-0 font-mono text-sm text-faint">
                  {item.institution}
                </p>
                {item.note ? (
                  <p className="m-0 mt-3 text-base leading-relaxed text-prose">
                    {item.note}
                  </p>
                ) : null}
                <PhotoStrip
                  photos={item.photos}
                  groupLabel={education.photosLabelTemplate.replace(
                    "{name}",
                    item.institution,
                  )}
                  labels={lightbox}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
