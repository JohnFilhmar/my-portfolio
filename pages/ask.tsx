import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import type { AppConfig, AssistantMode } from "@config/schema";
import { loadConfig } from "@config/index";
import { getAssistantEnv, getSiteUrl, resolveAssistantMode } from "@/lib/env";
import { ASK_PATH } from "@/lib/navigation";
import { buildSeo, pageSeo, type SeoData } from "@/lib/seo";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { AssistantSection } from "@/components/assistant/AssistantSection";
import { Section } from "@/components/layout/Section";
import { SiteShell } from "@/components/layout/SiteShell";

interface PageProps {
  config: AppConfig;
  assistantMode: AssistantMode;
  seo: SeoData;
}

/** The AI assistant on its own page. A 404 when the assistant is disabled. */
export const getServerSideProps: GetServerSideProps<PageProps> = async () => {
  const config = loadConfig();
  if (!config.assistant.enabled) return { notFound: true };
  const home = buildSeo(config.site, getSiteUrl(config.site.siteUrl));
  return {
    props: {
      config,
      assistantMode: resolveAssistantMode(getAssistantEnv()),
      seo: pageSeo(home, {
        title: config.assistant.label,
        description: config.assistant.description,
        path: ASK_PATH,
      }),
    },
  };
};

export default function AskPage({
  config,
  assistantMode,
  seo,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const reducedMotion = useReducedMotion();
  return (
    <SiteShell config={config} seo={seo} path={ASK_PATH} hideLauncher>
      <Section
        id="assistant"
        ariaLabel={config.assistant.label}
        reducedMotion={reducedMotion}
        className="pt-hero-top"
      >
        <AssistantSection
          assistant={config.assistant}
          mode={assistantMode}
          typing={config.theme.motion.typing}
          reducedMotion={reducedMotion}
          standalone
        />
      </Section>
    </SiteShell>
  );
}
