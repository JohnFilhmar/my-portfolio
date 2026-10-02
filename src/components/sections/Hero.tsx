import type { HeroConfig, SiteConfig, ThemeConfig } from "@config/schema";
import { Button } from "@/components/ui/Button";
import { SpanLine } from "@/components/ui/TerminalLines";
import { TerminalWindow } from "@/components/ui/TerminalWindow";
import { TypedText } from "@/components/ui/TypedText";
import { goToAssistant } from "@/lib/navigation";
import { toneTextClass } from "@/lib/utils";

export interface HeroProps {
  sectionId: string;
  hero: HeroConfig;
  site: SiteConfig;
  typing: ThemeConfig["motion"]["typing"];
  reducedMotion: boolean;
  /** Anchor id of the assistant section (CTA target), if enabled. */
  assistantSectionId: string | null;
}

/** Hero: typed intro on the left, profile terminal on the right. */
export function Hero({
  sectionId,
  hero,
  site,
  typing,
  reducedMotion,
  assistantSectionId,
}: HeroProps) {
  return (
    <header
      id={sectionId}
      className="mx-auto grid w-full max-w-container scroll-mt-scroll-margin grid-cols-[repeat(auto-fit,minmax(min(100%,330px),1fr))] items-center gap-column-gap px-container-pad pb-hero-bottom pt-hero-top"
    >
      <div>
        <p className="m-0 mb-[18px] font-mono text-[13px] text-accent">
          {hero.promptLine.path} <span className="text-dim">$</span>{" "}
          {hero.promptLine.command}
        </p>
        <h1 className="m-0 mb-3 text-hero font-bold leading-[1.02] tracking-[-0.025em] text-heading">
          {site.name}
          <span className="text-accent">{hero.nameSuffix}</span>
        </h1>
        <p className="m-0 mb-5 font-mono text-role-line text-accent">
          {site.role}
        </p>
        <TypedText
          text={site.tagline}
          charMs={typing.heroCharMs}
          startDelayMs={typing.bootStartDelayMs}
          instant={reducedMotion}
          className="m-0 mb-7 min-h-[3.4em] max-w-[54ch] text-tagline leading-[1.65] text-muted"
        />
        <div className="mb-[26px] flex flex-wrap gap-3">
          {hero.ctas.map((cta) =>
            cta.action === "assistant" ? (
              assistantSectionId && (
                <Button
                  key={cta.label}
                  variant={cta.variant}
                  onClick={() =>
                    goToAssistant(assistantSectionId, reducedMotion)
                  }
                >
                  {cta.label}
                </Button>
              )
            ) : (
              <Button
                key={cta.label}
                variant={cta.variant}
                href={cta.href ?? "#"}
              >
                {cta.label}
              </Button>
            ),
          )}
        </div>
        <SpanLine spans={hero.statusLine} className="font-mono text-[12px]" />
      </div>

      <TerminalWindow title={hero.boot.windowTitle}>
        <div className="px-5 pb-5 pt-[18px] font-mono text-[13px] leading-[1.85]">
          {hero.boot.lines.map((line, i) => (
            <p
              key={i}
              className={`m-0 whitespace-pre-wrap ${toneTextClass[line.tone]}`}
            >
              {line.text}
            </p>
          ))}
        </div>
      </TerminalWindow>
    </header>
  );
}
