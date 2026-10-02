import { useMemo, useState, type ReactNode } from "react";
import type { AppConfig } from "@config/schema";
import type { SeoData } from "@/lib/seo";
import { resolveSections } from "@/lib/sections";
import { textureStyle } from "@/lib/theme";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { AssistantLauncher } from "@/components/assistant/AssistantLauncher";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Seo } from "@/components/layout/Seo";
import { ThemeTokens } from "@/components/layout/ThemeTokens";

/** Target for the keyboard skip link and the main landmark. */
const MAIN_ID = "main";

export interface SiteShellProps {
  config: AppConfig;
  seo: SeoData;
  /** Current route, e.g. "/" or "/work/usapp". Nav anchors resolve against home. */
  path: string;
  /** Hide the floating assistant pill, e.g. on the assistant page itself. */
  hideLauncher?: boolean;
  children: ReactNode;
}

/**
 * Chrome shared by every page: theme tokens, skip link, header, main
 * landmark, footer, assistant pill and command palette. Sections are always
 * resolved from the home registry, so the nav and palette point at the same
 * targets wherever they are opened.
 */
export function SiteShell({
  config,
  seo,
  path,
  hideLauncher = false,
  children,
}: SiteShellProps) {
  const reducedMotion = useReducedMotion();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const sections = useMemo(() => resolveSections(config), [config]);
  const texture = textureStyle(config.theme);

  return (
    <>
      <Seo seo={seo} themeColor={config.theme.colors.background} />
      <ThemeTokens theme={config.theme} />

      <div className="relative min-h-dvh">
        {/* Fixed background texture + accent glow (decorative). */}
        {texture && (
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-0"
            style={texture}
          />
        )}
        {config.theme.terminal.glow && (
          <div
            aria-hidden="true"
            className="bg-accent-glow pointer-events-none fixed inset-0 z-0"
          />
        )}

        <div className="relative z-10">
          <a
            href={`#${MAIN_ID}`}
            className="skip-link rounded-lg border border-accent bg-surface px-[13px] py-2 font-mono text-sm text-accent no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {config.site.a11y.skipToContentLabel}
          </a>
          <Header
            site={config.site}
            sections={sections}
            path={path}
            onOpenPalette={() => setPaletteOpen(true)}
          />
          <main
            id={MAIN_ID}
            tabIndex={-1}
            aria-label={config.site.a11y.mainLandmarkLabel}
            className="scroll-mt-scroll-margin focus:outline-none"
          >
            {children}
          </main>
          <Footer site={config.site} sections={sections} path={path} />

          {config.assistant.enabled && !hideLauncher && (
            <AssistantLauncher assistant={config.assistant} />
          )}

          <CommandPalette
            config={config}
            sections={sections}
            open={paletteOpen}
            onOpenChange={setPaletteOpen}
            reducedMotion={reducedMotion}
          />
        </div>
      </div>
    </>
  );
}
