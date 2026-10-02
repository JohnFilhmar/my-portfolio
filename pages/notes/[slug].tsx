import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import type { AppConfig } from "@config/schema";
import type { Note, NoteSummary } from "@config/notesSchema";
import { loadConfig } from "@config/index";
import { loadNote } from "@config/notes";
import { getSiteUrl } from "@/lib/env";
import { NOTES_PATH, notePath } from "@/lib/navigation";
import { buildSeo, pageSeo, type SeoData } from "@/lib/seo";
import { NoteBody } from "@/components/notes/NoteBody";
import { SiteShell } from "@/components/layout/SiteShell";
import { Tag } from "@/components/ui/Tag";

type Neighbour = Pick<NoteSummary, "slug" | "title"> | null;

interface PageProps {
  config: AppConfig;
  note: Note;
  newer: Neighbour;
  older: Neighbour;
  seo: SeoData;
}

/** One note. Drafts, templates and unknown slugs are a 404. */
export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  params,
}) => {
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const note = loadNote(slug);
  if (!note) return { notFound: true };

  const config = loadConfig();
  const posts = config.notes.posts;
  const index = posts.findIndex((post) => post.slug === slug);
  const pick = (post: NoteSummary | undefined): Neighbour =>
    post ? { slug: post.slug, title: post.title } : null;
  const home = buildSeo(config.site, getSiteUrl(config.site.siteUrl));

  return {
    props: {
      config,
      note,
      newer: pick(posts[index - 1]),
      older: pick(posts[index + 1]),
      seo: pageSeo(home, {
        title: note.title,
        description: note.summary,
        path: notePath(slug),
      }),
    },
  };
};

const NEIGHBOUR_LINK =
  "group block py-6 no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export default function NotePage({
  config,
  note,
  newer,
  older,
  seo,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { notes } = config;
  return (
    <SiteShell config={config} seo={seo} path={notePath(note.slug)}>
      <article className="mx-auto w-full max-w-container px-container-pad pb-section-y pt-hero-top">
        <a
          href={NOTES_PATH}
          className="font-mono text-sm text-accent underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          ← {notes.backLabel}
        </a>

        <header className="mt-10 animate-row-in">
          <p className="m-0 flex flex-wrap gap-x-4 font-mono text-sm text-subtle">
            <time dateTime={note.date}>{note.date}</time>
            <span>
              {notes.minutesTemplate.replaceAll("{n}", String(note.minutes))}
            </span>
          </p>
          <h1 className="stretch-semi-expanded m-0 mt-4 max-w-[22ch] font-display text-hero font-semibold leading-[1.04] tracking-[-0.02em] text-heading">
            {note.title}
          </h1>
        </header>
        <p
          className="m-0 mt-6 max-w-[52ch] animate-row-in text-tagline leading-relaxed text-prose"
          style={{ animationDelay: "80ms" }}
        >
          {note.summary}
        </p>
        {note.tags.length > 0 && (
          <ul className="m-0 mt-5 flex list-none flex-wrap gap-1.5 p-0">
            {note.tags.map((tag) => (
              <li key={tag}>
                <Tag variant="stack">{tag}</Tag>
              </li>
            ))}
          </ul>
        )}

        <div
          className="mt-12 animate-row-in border-t-2 border-heading pt-10"
          style={{ animationDelay: "160ms" }}
        >
          <NoteBody body={note.body} />
        </div>

        {(newer || older) && (
          <nav
            aria-label={notes.label}
            className="mt-16 grid border-t border-border-strong md:grid-cols-2 md:gap-x-column-gap"
          >
            <div>
              {newer && (
                <a href={notePath(newer.slug)} className={NEIGHBOUR_LINK}>
                  <span className="font-mono text-sm text-subtle">
                    ← {notes.newerLabel}
                  </span>
                  <span className="mt-1 block font-display text-title font-semibold text-heading transition-transform duration-base ease-standard group-hover:-translate-x-1">
                    {newer.title}
                  </span>
                </a>
              )}
            </div>
            <div className="md:text-right">
              {older && (
                <a href={notePath(older.slug)} className={NEIGHBOUR_LINK}>
                  <span className="font-mono text-sm text-subtle">
                    {notes.olderLabel} →
                  </span>
                  <span className="mt-1 block font-display text-title font-semibold text-heading transition-transform duration-base ease-standard group-hover:translate-x-1">
                    {older.title}
                  </span>
                </a>
              )}
            </div>
          </nav>
        )}
      </article>
    </SiteShell>
  );
}
