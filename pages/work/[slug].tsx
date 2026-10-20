import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import type { AppConfig, Project, ProofItem } from "@config/schema";
import { loadConfig } from "@config/index";
import { getSiteUrl } from "@/lib/env";
import { workPath } from "@/lib/navigation";
import { resolveSections } from "@/lib/sections";
import { buildSeo, pageSeo, type SeoData } from "@/lib/seo";
import { SiteShell } from "@/components/layout/SiteShell";
import { CaseStudy } from "@/components/work/CaseStudy";
import { recommendationsAbout } from "@/lib/recommendations";

interface PageProps {
  config: AppConfig;
  project: Project;
  evidence: ProofItem[];
  next: { id: string; title: string } | null;
  backHref: string;
  seo: SeoData;
}

/** Case study for one flagship project. Any other id is a 404. */
export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  params,
}) => {
  const config = loadConfig();
  const flagships = config.projects.items.filter(
    (item) => item.tier === "flagship",
  );
  const index = flagships.findIndex((item) => item.id === params?.slug);
  const project = flagships[index];
  if (!project) return { notFound: true };

  const after = flagships[(index + 1) % flagships.length];
  const projectsSection = resolveSections(config).find(
    (section) => section.type === "projects",
  );
  const home = buildSeo(config.site, getSiteUrl(config.site.siteUrl));

  return {
    props: {
      config,
      project,
      evidence: config.proof.items.filter(
        (item) => item.project === project.id,
      ),
      next:
        after && after.id !== project.id
          ? { id: after.id, title: after.title }
          : null,
      backHref: projectsSection ? `/#${projectsSection.id}` : "/",
      seo: pageSeo(home, {
        title: `${project.title} case study`,
        description: project.hook,
        path: workPath(project.id),
      }),
    },
  };
};

export default function WorkPage({
  config,
  project,
  evidence,
  next,
  backHref,
  seo,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <SiteShell config={config} seo={seo} path={workPath(project.id)}>
      <CaseStudy
        project={project}
        projects={config.projects}
        evidence={evidence}
        openLabelTemplate={config.proof.openLabelTemplate}
        lightbox={config.site.lightbox}
        backHref={backHref}
        next={next}
        recommendations={recommendationsAbout(config.recommendations.items, {
          project: project.id,
        })}
        recommendationLabels={config.recommendations}
      />
    </SiteShell>
  );
}
