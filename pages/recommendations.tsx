import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import type { AppConfig } from "@config/schema";
import { loadConfig } from "@config/index";
import { getSiteUrl } from "@/lib/env";
import { RECOMMENDATIONS_PATH } from "@/lib/navigation";
import { recommendationLinks } from "@/lib/recommendations";
import { buildSeo, pageSeo, type SeoData } from "@/lib/seo";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Section } from "@/components/layout/Section";
import { SiteShell } from "@/components/layout/SiteShell";
import { RecommendationList } from "@/components/recommendations/RecommendationList";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface PageProps {
  config: AppConfig;
  seo: SeoData;
  linksById: Record<string, Array<{ label: string; href: string }>>;
}

/** Recommendations from employers, colleagues, clients and end users. */
export const getServerSideProps: GetServerSideProps<PageProps> = async () => {
  const config = loadConfig();
  const home = buildSeo(config.site, getSiteUrl(config.site.siteUrl));
  const recs = config.recommendations;
  return {
    props: {
      config,
      linksById: Object.fromEntries(
        recs.items.map((rec) => [rec.id, recommendationLinks(rec, config)]),
      ),
      seo: pageSeo(home, {
        title: recs.label,
        description: recs.blurb,
        path: RECOMMENDATIONS_PATH,
      }),
    },
  };
};

export default function RecommendationsPage({
  config,
  seo,
  linksById,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const reducedMotion = useReducedMotion();
  const recs = config.recommendations;
  return (
    <SiteShell config={config} seo={seo} path={RECOMMENDATIONS_PATH}>
      <Section
        id="recommendations"
        ariaLabel={recs.label}
        reducedMotion={reducedMotion}
        className="pt-hero-top"
      >
        <SectionHeading as="h1" className="mb-4">
          {recs.heading}
        </SectionHeading>
        <p className="m-0 mb-8 max-w-[62ch] text-lg leading-[1.7] text-prose">
          {recs.blurb}
        </p>
        <RecommendationList recommendations={recs} linksById={linksById} />
      </Section>
    </SiteShell>
  );
}
