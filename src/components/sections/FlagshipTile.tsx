import type { Project, ProjectsConfig } from "@config/schema";
import { ImageFrame } from "@/components/ui/ImageFrame";
import { Tag } from "@/components/ui/Tag";
import { workPath } from "@/lib/navigation";
import { cn, formatIndex } from "@/lib/utils";

export interface FlagshipTileProps {
  project: Project;
  /** Index within the full project list, for stable P-0N ids. */
  index: number;
  projects: ProjectsConfig;
  /** Odd tiles put the cover on the right, so the list alternates. */
  flipped: boolean;
}

/**
 * Home teaser for a flagship: cover on one side, the pitch on the other, and
 * the way into its case study. The detail lives on /work/<id>, not here.
 */
export function FlagshipTile({
  project,
  index,
  projects,
  flipped,
}: FlagshipTileProps) {
  const href = workPath(project.id);

  return (
    <article className="grid items-center gap-x-column-gap gap-y-6 md:grid-cols-12">
      {project.cover && (
        // Duplicate of the title link for pointer users; hidden from AT and tab order.
        <a
          href={href}
          tabIndex={-1}
          aria-hidden="true"
          className={cn("block min-w-0 md:col-span-7", flipped && "md:order-2")}
        >
          <ImageFrame
            src={project.cover.src}
            alt=""
            aspect={project.cover.aspect}
            missing={project.cover.missing}
            fallbackLabel={`${project.title} cover`}
            eager={index === 0}
            className="rounded-xl border border-border"
          />
        </a>
      )}

      <div
        className={cn(
          "min-w-0",
          project.cover ? "md:col-span-5" : "md:col-span-12",
          flipped && "md:order-1",
        )}
      >
        <p className="m-0 mb-3 flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-accent">
            {formatIndex(projects.indexPrefix, index)}
          </span>
          {[project.domain, ...project.secondaryDomains].map((domain) => (
            <Tag key={domain} variant="domain">
              {domain}
            </Tag>
          ))}
        </p>
        <h3 className="m-0 text-[clamp(26px,3vw,36px)] font-bold tracking-[-0.02em] text-heading">
          <a
            href={href}
            className="text-heading no-underline hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            {project.title}
          </a>
        </h3>
        <p className="m-0 mt-3 max-w-[48ch] text-lg leading-[1.6] text-muted">
          {project.hook}
        </p>
        <p className="m-0 mt-4 font-mono text-sm leading-relaxed text-accent">
          {projects.resultsPrefix}
          {project.results}
        </p>
        {project.metrics.length > 0 && (
          <dl className="m-0 mt-5 flex flex-wrap gap-x-8 gap-y-3">
            {project.metrics.slice(0, 3).map((metric) => (
              <div key={metric.label} className="flex flex-col-reverse">
                <dt className="font-mono text-xs text-subtle">
                  {metric.label}
                </dt>
                <dd className="m-0 text-2xl font-bold text-heading">
                  {metric.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
        <a
          href={href}
          className="mt-6 inline-block font-mono text-sm text-accent no-underline hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {projects.caseStudy.readLabel}
        </a>
      </div>
    </article>
  );
}
