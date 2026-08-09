import type { AboutConfig } from "@config/schema";
import { Card } from "@/components/ui/Card";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SpanLine } from "@/components/ui/TerminalLines";
import { renderInline } from "@/lib/richtext";

export interface AboutProps {
  number: string;
  about: AboutConfig;
}

/** About: prose column + `$ whoami` terminal card. */
export function About({ number, about }: AboutProps) {
  return (
    <>
      <SectionLabel number={number} label={about.label} />
      <p className="m-0 mb-9 text-section font-bold tracking-[-0.02em] text-heading">
        {about.heading}
      </p>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] items-start gap-column-gap">
        <div className="text-lg leading-[1.75] text-prose">
          {about.paragraphs.map((paragraph, i) => (
            <p key={i} className="m-0 mb-[18px] last:mb-0">
              {renderInline(paragraph)}
            </p>
          ))}
        </div>
        <Card className="font-mono text-[13px] leading-[1.9]">
          {about.terminal.entries.map((entry) => (
            <div key={entry.cmd} className="mb-3.5 last:mb-0">
              <p className="m-0 text-[var(--terminal-prompt)]">$ {entry.cmd}</p>
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
    </>
  );
}
