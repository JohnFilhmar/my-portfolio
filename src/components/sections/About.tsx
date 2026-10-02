import type { AboutConfig, EducationConfig } from "@config/schema";
import { ImageFrame } from "@/components/ui/ImageFrame";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { renderInline } from "@/lib/richtext";
import { cn } from "@/lib/utils";

export interface AboutProps {
  about: AboutConfig;
  /** Summarised into one line, so education needs no section of its own. */
  education: EducationConfig;
}

/** About: portrait beside the prose, closed by a one-line education summary. */
export function About({ about, education }: AboutProps) {
  const { portrait } = about;
  const schooling = education.items
    .map(
      (item) =>
        `${item.degree}, ${item.institution} (${item.end ?? education.presentLabel})`,
    )
    .join(" · ");

  return (
    <>
      <SectionHeading className="mb-9">{about.heading}</SectionHeading>
      <div className="grid items-start gap-x-column-gap gap-y-8 md:grid-cols-12">
        {portrait && (
          <ImageFrame
            src={portrait.src}
            alt={portrait.alt}
            aspect={portrait.aspect}
            missing={portrait.missing}
            fallbackLabel="portrait"
            fit="contain"
            className="mx-auto max-w-80 rounded-xl border border-border md:col-span-4 md:max-w-none"
          />
        )}
        <div className={cn(portrait ? "md:col-span-8" : "md:col-span-12")}>
          <div className="text-lg leading-[1.75] text-prose">
            {about.paragraphs.map((paragraph, i) => (
              <p key={i} className="m-0 mb-[18px] max-w-xl last:mb-0">
                {renderInline(paragraph)}
              </p>
            ))}
          </div>
          {schooling && (
            <p className="m-0 mt-6 max-w-prose font-mono text-sm leading-relaxed text-subtle">
              <span className="text-heading">{about.educationLabel}</span>{" "}
              {schooling}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
