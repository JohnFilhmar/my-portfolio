import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import type { AppConfig } from "@config/schema";
import { showPlaceholders } from "@config/files";
import { loadConfig } from "@config/index";
import { getSiteUrl } from "@/lib/env";
import { PROJECTS_PATH } from "@/lib/navigation";
import { buildSeo, pageSeo, type SeoData } from "@/lib/seo";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Section } from "@/components/layout/Section";
import { SiteShell } from "@/components/layout/SiteShell";
import { ProjectsList } from "@/components/projects/ProjectsList";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface PageProps {
  config: AppConfig;
  seo: SeoData;
  placeholders: boolean;
}

/** Every project that is not featured on the home page. */
export const getServerSideProps: GetServerSideProps<PageProps> = async () => {
  const config = loadConfig();
  const home = buildSeo(config.site, getSiteUrl(config.site.siteUrl));
  const page = config.projects.page;
  return {
    props: {
      config,
      placeholders: showPlaceholders(),
      seo: pageSeo(home, {
        title: page.label,
        description: page.blurb || page.heading,
        path: PROJECTS_PATH,
      }),
    },
  };
};

export default function ProjectsPage({
  config,
  seo,
  placeholders,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const reducedMotion = useReducedMotion();
  const page = config.projects.page;
  return (
    <SiteShell config={config} seo={seo} path={PROJECTS_PATH}>
      <Section
        id="projects"
        ariaLabel={page.label}
        reducedMotion={reducedMotion}
        className="pt-hero-top"
      >
        <SectionHeading as="h1" className="mb-4">
          {page.heading}
        </SectionHeading>
        {page.blurb && (
          <p className="m-0 mb-8 max-w-[62ch] text-lg leading-[1.7] text-prose">
            {page.blurb}
          </p>
        )}
        <ProjectsList
          projects={config.projects}
          recommendations={config.recommendations}
          showPlaceholders={placeholders}
          reducedMotion={reducedMotion}
        />
      </Section>
    </SiteShell>
  );
}
