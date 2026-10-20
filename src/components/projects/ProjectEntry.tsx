import type {
  Project,
  ProjectsConfig,
  Recommendation,
  RecommendationsConfig,
} from "@config/schema";
import { ProjectTimeline } from "@/components/projects/ProjectTimeline";
import { RecommendationCard } from "@/components/recommendations/RecommendationCard";
import { Carousel } from "@/components/ui/Carousel";
import { Tag } from "@/components/ui/Tag";
import { cn, isExternalHref } from "@/lib/utils";

export interface ProjectEntryProps {
  project: Project;
  projects: ProjectsConfig;
  recommendations: Recommendation[];
  recommendationLabels: RecommendationsConfig;
  /** Keep empty image slots and undated timeline points (local development). */
  showPlaceholders: boolean;
  reducedMotion: boolean;
}

const LABEL =
  "mb-1.5 block font-mono text-2xs uppercase tracking-[0.08em] text-subtle";

/**
 * One project on /projects: its pictures beside the story. Badges say what
 * kind of work it was and whether an NDA limits the detail; the timeline runs
 * from first line of code to production; results, stack, links and what
 * people said about it follow.
 */
export function ProjectEntry({
  project,
  projects,
  recommendations,
  recommendationLabels,
  showPlaceholders,
  reducedMotion,
}: ProjectEntryProps) {
  const page = projects.page;
  const shots = project.shots.filter(
    (shot) => showPlaceholders || !shot.missing,
  );
  const links = (["demo", "repo", "writeup"] as const).flatMap((kind) => {
    const href = project.links[kind];
    return href ? [{ kind, href }] : [];
  });

  return (
    <article
      id={project.id}
      className="grid scroll-mt-scroll-margin gap-x-column-gap gap-y-8 border-t border-border-strong py-12 lg:grid-cols-12"
    >
      {shots.length > 0 && (
        <div className="min-w-0 lg:col-span-5">
          <Carousel
            slides={shots.map((shot) => ({
              src: shot.src,
              alt: shot.alt,
              missing: shot.missing,
            }))}
            aspect={shots[0]?.aspect ?? "16/10"}
            label={page.galleryLabel.replace("{title}", project.title)}
            reducedMotion={reducedMotion}
          />
        </div>
      )}

      <div
        className={cn(
          "min-w-0",
          shots.length > 0 ? "lg:col-span-7" : "lg:col-span-12 lg:max-w-4xl",
        )}
      >
        <div className="mb-4 flex flex-wrap gap-2">
          {project.context && (
            <Tag variant="domain">{page.contextLabels[project.context]}</Tag>
          )}
          {project.nda && <Tag variant="verified">{page.ndaLabel}</Tag>}
          {[project.domain, ...project.secondaryDomains].map((domain) => (
            <Tag key={domain} variant="domain">
              {domain}
            </Tag>
          ))}
        </div>

        <h2 className="stretch-semi-expanded m-0 font-display text-title font-semibold leading-snug text-heading">
          {project.title}
        </h2>
        <p className="m-0 mt-2 max-w-[60ch] text-lg leading-relaxed text-prose">
          {project.hook}
        </p>

        <div className="mt-6">
          <ProjectTimeline
            timeline={project.timeline}
            labels={page}
            showPending={showPlaceholders}
          />
        </div>

        {project.nda && (
          <p className="m-0 mt-5 max-w-[60ch] border-l-2 border-accent pl-3 text-sm text-subtle">
            {page.ndaNote}
          </p>
        )}

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <p className="m-0 text-base leading-relaxed text-prose">
            <span className={LABEL}>{projects.caseStudy.problemLabel}</span>
            {project.problem}
          </p>
          <p className="m-0 text-base leading-relaxed text-prose">
            <span className={LABEL}>{projects.caseStudy.roleLabel}</span>
            {project.role}
          </p>
        </div>

        {project.highlights.length > 0 && (
          <div className="mt-6">
            <span className={LABEL}>{projects.caseStudy.decisionsLabel}</span>
            <ul className="m-0 grid max-w-[64ch] list-none gap-2 p-0">
              {project.highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="flex gap-3 text-base leading-relaxed text-prose"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2.5 h-px w-3 shrink-0 bg-accent"
                  />
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        )}

        {project.metrics.length > 0 && (
          <dl className="m-0 mt-6 flex flex-wrap gap-x-10 gap-y-4">
            {project.metrics.map((metric) => (
              <div key={metric.label}>
                <dt className="font-mono text-2xs uppercase tracking-[0.08em] text-subtle">
                  {metric.label}
                </dt>
                <dd className="m-0 font-display text-title font-semibold text-heading">
                  {metric.value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        <p className="m-0 mt-5 max-w-[64ch] font-mono text-sm text-accent">
          {projects.resultsPrefix}
          {project.results}
        </p>

        <ul
          className="m-0 mt-5 flex list-none flex-wrap gap-1.5 p-0"
          aria-label={projects.caseStudy.stackLabel}
        >
          {project.stack.map((tech) => (
            <li key={tech}>
              <Tag variant="stack">{tech}</Tag>
            </li>
          ))}
        </ul>

        {links.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-4">
            {links.map(({ kind, href }) => (
              <a
                key={kind}
                href={href}
                {...(isExternalHref(href)
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="font-mono text-sm text-accent underline underline-offset-4 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {projects.linkLabels[kind]} ↗
              </a>
            ))}
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="mt-8">
            <span className={LABEL}>{recommendationLabels.linkedHeading}</span>
            <div className="grid gap-3 md:grid-cols-2">
              {recommendations.slice(0, 2).map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  rec={rec}
                  labels={recommendationLabels}
                  links={[]}
                  compact
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
