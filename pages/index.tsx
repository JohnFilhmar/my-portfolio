import { useMemo } from "react";
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
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { SiteShell } from "@/components/layout/SiteShell";
import { SectionRenderer } from "@/components/sections/SectionRenderer";

interface PageProps {
  config: AppConfig;
  assistantMode: AssistantMode;
  contactViaApi: boolean;
  seo: SeoData;
}

/**
 * Home is server-rendered from config: every file under ./config is read and
 * validated per request, so editing one shows up on refresh.
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
  const sections = useMemo(() => resolveSections(config), [config]);

  return (
    <SiteShell config={config} seo={seo} path="/">
      <SectionRenderer
        config={config}
        sections={sections}
        assistantMode={assistantMode}
        contactViaApi={contactViaApi}
        reducedMotion={reducedMotion}
      />
    </SiteShell>
  );
}
