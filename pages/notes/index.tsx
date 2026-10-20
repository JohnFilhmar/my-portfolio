import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import type { AppConfig } from "@config/schema";
import { loadConfig } from "@config/index";
import { getSiteUrl } from "@/lib/env";
import { NOTES_PATH } from "@/lib/navigation";
import { buildSeo, pageSeo, type SeoData } from "@/lib/seo";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { NoteList } from "@/components/notes/NoteList";
import { Section } from "@/components/layout/Section";
import { SiteShell } from "@/components/layout/SiteShell";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface PageProps {
  config: AppConfig;
  seo: SeoData;
}

/** Every published note, newest first, with a tag filter. */
export const getServerSideProps: GetServerSideProps<PageProps> = async () => {
  const config = loadConfig();
  const home = buildSeo(config.site, getSiteUrl(config.site.siteUrl));
  return {
    props: {
      config,
      seo: pageSeo(home, {
        title: config.notes.label,
        description: config.notes.blurb,
        path: NOTES_PATH,
        noindex: config.notes.posts.length === 0,
      }),
    },
  };
};

export default function NotesPage({
  config,
  seo,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const reducedMotion = useReducedMotion();
  return (
    <SiteShell config={config} seo={seo} path={NOTES_PATH}>
      <Section
        id="notes"
        ariaLabel={config.notes.label}
        reducedMotion={reducedMotion}
        className="pt-hero-top"
      >
        <SectionHeading as="h1" className="mb-4">
          {config.notes.heading}
        </SectionHeading>
        <p className="m-0 mb-10 max-w-[62ch] text-lg leading-[1.7] text-prose">
          {config.notes.blurb}
        </p>
        <NoteList notes={config.notes} />
      </Section>
    </SiteShell>
  );
}
