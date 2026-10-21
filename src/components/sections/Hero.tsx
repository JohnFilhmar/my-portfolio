import type { HeroConfig, Project, SiteConfig } from "@config/schema";
import { Button } from "@/components/ui/Button";
import { SpanLine } from "@/components/ui/TerminalLines";
import { HeroPortrait } from "@/components/sections/HeroPortrait";
import { SystemIndex } from "@/components/sections/SystemIndex";
import { useAssistantPanel } from "@/providers/AssistantProvider";

export interface HeroProps {
  sectionId: string;
  hero: HeroConfig;
  site: SiteConfig;
  /** Flagship projects for the index under the headline. */
  flagships: Project[];
  /** Show the assistant call to action. */
  assistantEnabled: boolean;
}

/**
 * Hero: role, the one-sentence headline, availability and actions beside a
 * large portrait that bleeds to the page edge (above them on phones), then
 * the system index.
 */
export function Hero({
  sectionId,
  hero,
  site,
  flagships,
  assistantEnabled,
}: HeroProps) {
  const { open: openAssistant } = useAssistantPanel();
  return (
    <header
      id={sectionId}
      className="mx-auto w-full max-w-container scroll-mt-scroll-margin px-container-pad pb-hero-bottom pt-hero-top"
    >
      <div className="grid items-end gap-x-column-gap gap-y-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="md:self-center">
          <p className="m-0 font-mono text-sm text-subtle">{site.role}</p>
          <h1 className="stretch-semi-expanded m-0 mt-4 font-display text-hero font-semibold leading-[1.02] tracking-[-0.02em] text-heading">
            {hero.headline}
          </h1>
          <SpanLine
            spans={hero.statusLine}
            className="mt-5 font-mono text-sm"
          />
          <div className="mt-7 flex flex-wrap gap-3">
            {hero.ctas.map((cta) =>
              cta.action === "assistant" ? (
                assistantEnabled && (
                  <Button
                    key={cta.label}
                    variant={cta.variant}
                    onClick={openAssistant}
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
        </div>
        <HeroPortrait
          portrait={hero.portrait}
          // Phones lead with the portrait; from tablet up it sits beside the text.
          className="-mx-container-pad -order-1 w-[calc(100%+2*var(--space-container-pad))] md:order-none md:ml-auto md:w-[calc(100%+var(--space-container-pad))]"
        />
      </div>

      {flagships.length > 0 && (
        <SystemIndex
          systems={flagships}
          label={hero.indexLabel}
          statusLabels={hero.statusLabels}
          plannedReleaseTemplate={hero.plannedReleaseTemplate}
        />
      )}
    </header>
  );
}
