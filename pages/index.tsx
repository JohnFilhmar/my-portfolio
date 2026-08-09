import { useMemo, useState } from "react";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import type { AppConfig, AssistantMode } from "@config/schema";
import { loadConfig } from "@config/index";
import {
  getAssistantEnv,
  getContactEndpoint,
  getSiteUrl,
  getSmtpConfig,
  resolveAssistantMode,
} from "@/lib/env";
import { buildSeo, type SeoData } from "@/lib/seo";
import { resolveSections } from "@/lib/sections";
import { textureStyle } from "@/lib/theme";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Seo } from "@/components/layout/Seo";
import { ThemeTokens } from "@/components/layout/ThemeTokens";
import { AssistantLauncher } from "@/components/assistant/AssistantLauncher";
import { SectionRenderer } from "@/components/sections/SectionRenderer";

interface PageProps {
  config: AppConfig;
  assistantMode: AssistantMode;
  contactViaApi: boolean;
  seo: SeoData;
}

/**
 * The whole site is one server-rendered page: config is read and validated
 * per request, so editing any file under ./config shows up on refresh.
 */
export const getServerSideProps: GetServerSideProps<PageProps> = async () => {
  const config = loadConfig();
  const assistantMode = resolveAssistantMode(getAssistantEnv());
  return {
    props: {
      config,
      assistantMode,
      contactViaApi: getSmtpConfig() !== null || getContactEndpoint() !== null,
      seo: buildSeo(config.site, getSiteUrl(config.site.siteUrl)),
    },
  };
};

export default function Home({
  config,
  assistantMode,
  contactViaApi,
  seo,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const reducedMotion = useReducedMotion();
  const [paletteOpen, setPaletteOpen] = useState(false);

  const sections = useMemo(() => resolveSections(config), [config]);
  const assistantSection = sections.find((s) => s.type === "assistant");
  const texture = textureStyle(config.theme);

  return (
    <>
      <Seo seo={seo} themeColor={config.theme.colors.background} />
      <ThemeTokens theme={config.theme} />

      <div className="relative min-h-screen">
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
          <Header
            site={config.site}
            sections={sections}
            onOpenPalette={() => setPaletteOpen(true)}
          />
          <main>
            <SectionRenderer
              config={config}
              sections={sections}
              assistantMode={assistantMode}
              contactViaApi={contactViaApi}
              reducedMotion={reducedMotion}
            />
          </main>
          <Footer site={config.site} sections={sections} />

          {assistantSection && (
            <AssistantLauncher
              assistant={config.assistant}
              sectionId={assistantSection.id}
              reducedMotion={reducedMotion}
            />
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
