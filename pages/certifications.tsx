import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import type { AppConfig } from "@config/schema";
import { loadConfig } from "@config/index";
import { getSiteUrl } from "@/lib/env";
import { CERTIFICATIONS_PATH } from "@/lib/navigation";
import { buildSeo, pageSeo, type SeoData } from "@/lib/seo";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Section } from "@/components/layout/Section";
import { SiteShell } from "@/components/layout/SiteShell";
import { Certifications } from "@/components/sections/Certifications";

interface PageProps {
  config: AppConfig;
  seo: SeoData;
}

/** Every credential from certifications.json, filterable by skill. */
export const getServerSideProps: GetServerSideProps<PageProps> = async () => {
  const config = loadConfig();
  const home = buildSeo(config.site, getSiteUrl(config.site.siteUrl));
  return {
    props: {
      config,
      seo: pageSeo(home, {
        title: config.certifications.label,
        description: config.certifications.blurb,
        path: CERTIFICATIONS_PATH,
      }),
    },
  };
};

export default function CertificationsPage({
  config,
  seo,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const reducedMotion = useReducedMotion();
  return (
    <SiteShell config={config} seo={seo} path={CERTIFICATIONS_PATH}>
      <Section
        id="certifications"
        ariaLabel={config.certifications.label}
        reducedMotion={reducedMotion}
        className="pt-hero-top"
      >
        <Certifications certifications={config.certifications} standalone />
      </Section>
    </SiteShell>
  );
}
