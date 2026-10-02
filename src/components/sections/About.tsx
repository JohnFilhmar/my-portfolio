import type { AboutConfig, EducationConfig } from "@config/schema";
import { Card } from "@/components/ui/Card";
import { ImageFrame } from "@/components/ui/ImageFrame";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SpanLine } from "@/components/ui/TerminalLines";
import { renderInline } from "@/lib/richtext";
import { cn } from "@/lib/utils";

export interface AboutProps {
  number: string;
  about: AboutConfig;
  /** Summarised into one line, so education needs no section of its own. */
  education: EducationConfig;
}

/** About: portrait, prose with a one-line education summary, `$ whoami` card. */
export function About({ number, about, education }: AboutProps) {
  const { portrait } = about;
  const schooling = education.items
    .map(
      (item) =>
        `${item.degree}, ${item.institution} (${item.end ?? education.presentLabel})`,
    )
    .join(" · ");

  return (
    <>
      <SectionLabel number={number} label={about.label} />
      <p className="m-0 mb-9 text-section font-bold tracking-[-0.02em] text-heading">
        {about.heading}
      </p>
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
              <span className="text-accent">{about.educationLabel}</span>{" "}
              {schooling}
            </p>
          )}
          <Card className="mt-8 font-mono text-[13px] leading-[1.9]">
            {about.terminal.entries.map((entry) => (
              <div key={entry.cmd} className="mb-3.5 last:mb-0">
                <p className="m-0 text-[var(--terminal-prompt)]">
                  $ {entry.cmd}
                </p>
                {entry.lines.map((line, i) =>
                  line.philosophy ? (
                    <p key={i} className="m-0 text-accent">
                      {about.philosophy}
                    </p>
                  ) : (
                    <SpanLine key={i} spans={line.spans ?? []} />
                  ),
                )}
              </div>
            ))}
          </Card>
        </div>
      </div>
    </>
  );
}
