import type { HeroConfig, Project, SiteConfig } from "@config/schema";
import { Button } from "@/components/ui/Button";
import { SpanLine } from "@/components/ui/TerminalLines";
import { SystemIndex } from "@/components/sections/SystemIndex";
import { goToAssistant } from "@/lib/navigation";

export interface HeroProps {
  sectionId: string;
  hero: HeroConfig;
  site: SiteConfig;
  /** Flagship projects for the index under the headline. */
  flagships: Project[];
  reducedMotion: boolean;
  /** Anchor id of the assistant section (CTA target), if it is on the page. */
  assistantSectionId: string | null;
}

/** Hero: role, the one-sentence headline, availability, actions, then the system index. */
export function Hero({
  sectionId,
  hero,
  site,
  flagships,
  reducedMotion,
  assistantSectionId,
}: HeroProps) {
  return (
    <header
      id={sectionId}
      className="mx-auto w-full max-w-container scroll-mt-scroll-margin px-container-pad pb-hero-bottom pt-hero-top"
    >
      <p className="m-0 font-mono text-sm text-subtle">{site.role}</p>
      <h1 className="stretch-semi-expanded m-0 mt-4 font-display text-hero font-semibold leading-[1.02] tracking-[-0.02em] text-heading">
        {hero.headline}
      </h1>
      <SpanLine spans={hero.statusLine} className="mt-5 font-mono text-sm" />
      <div className="mt-7 flex flex-wrap gap-3">
        {hero.ctas.map((cta) =>
          cta.action === "assistant" ? (
            assistantSectionId && (
              <Button
                key={cta.label}
                variant={cta.variant}
                onClick={() => goToAssistant(assistantSectionId, reducedMotion)}
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

      {flagships.length > 0 && (
        <SystemIndex
          systems={flagships}
          label={hero.indexLabel}
          statusLabels={hero.statusLabels}
        />
      )}
    </header>
  );
}
