import type { Project, ProjectsConfig } from "@config/schema";
import { Card } from "@/components/ui/Card";
import { ImageFrame } from "@/components/ui/ImageFrame";
import { Tag } from "@/components/ui/Tag";
import { cn, formatIndex, isExternalHref } from "@/lib/utils";

export interface ProjectCardProps {
  project: Project;
  /** Index within the full (unfiltered) project list, for stable P-0N ids. */
  index: number;
  projects: ProjectsConfig;
}

/**
 * One project: badges, hook, impact line, expandable case study, stack, links.
 * A `flagship` project gets the same anatomy at a larger size and spells its
 * key decisions out as a list, so the two or three that matter most read
 * differently from the rest at a glance rather than only sorting first.
 */
export function ProjectCard({ project, index, projects }: ProjectCardProps) {
  const flagship = project.tier === "flagship";
  const domains = [project.domain, ...project.secondaryDomains];
  const links = (
    [
      ["demo", project.links.demo],
      ["repo", project.links.repo],
      ["writeup", project.links.writeup],
    ] as const
  ).filter((entry): entry is [keyof ProjectsConfig["linkLabels"], string] =>
    Boolean(entry[1]),
  );

  return (
    <Card
      interactive
      flush
      className="flex flex-col overflow-hidden hover:-translate-y-0.5"
    >
      {project.image && (
        <ImageFrame
          src={project.image}
          alt={project.imageAlt ?? `${project.title} interface`}
          aspect={flagship ? "21/9" : "16/9"}
          fallbackLabel={project.title}
          className="border-b border-border-muted"
        />
      )}
      <div
        className={cn(
          "flex flex-1 flex-col gap-3",
          flagship
            ? "px-[clamp(22px,3vw,34px)] pb-[26px] pt-[30px]"
            : "px-[22px] pb-[18px] pt-[22px]",
        )}
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-accent">
            {formatIndex(projects.indexPrefix, index)}
          </span>
          <span className="flex-1" />
          {domains.map((domain) => (
            <Tag key={domain} variant="domain">
              {domain}
            </Tag>
          ))}
        </div>

        <div>
          <h3
            className={cn(
              "m-0 mb-[5px] font-bold tracking-[-0.01em] text-heading",
              flagship ? "text-[clamp(24px,2.6vw,30px)]" : "text-[20px]",
            )}
          >
            {project.title}
          </h3>
          <p
            className={cn(
              "m-0 leading-[1.55] text-muted",
              flagship ? "max-w-[62ch] text-lg" : "text-base",
            )}
          >
            {project.hook}
          </p>
        </div>

        <p className="m-0 font-mono text-sm text-accent">
          {projects.resultsPrefix}
          {project.results}
        </p>

        {flagship && (
          <ul className="m-0 grid list-none gap-1.5 p-0">
            {project.highlights.map((highlight, i) => (
              <li
                key={i}
                className="flex max-w-[74ch] gap-2.5 text-md leading-relaxed text-prose"
              >
                <span
                  aria-hidden="true"
                  className="shrink-0 font-mono text-accent"
                >
                  -
                </span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        )}

        <details className="mt-0.5 border-t border-border-muted pt-2.5">
          <summary className="no-marker flex cursor-pointer items-center gap-1.5 font-mono text-sm text-subtle transition-colors duration-fast hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            {projects.caseStudy.summaryLabel} <span aria-hidden="true">▸</span>
          </summary>
          <div className="grid gap-2.5 pt-3.5 text-md leading-relaxed text-prose">
            <p className="m-0">
              <span className="mb-[3px] block font-mono text-[11px] uppercase tracking-[0.08em] text-dim">
                {projects.caseStudy.problemLabel}
              </span>
              {project.problem}
            </p>
            <p className="m-0">
              <span className="mb-[3px] block font-mono text-[11px] uppercase tracking-[0.08em] text-dim">
                {projects.caseStudy.roleLabel}
              </span>
              {project.role}
            </p>
            {/* Flagships already list their decisions above the fold. */}
            {!flagship && (
              <p className="m-0">
                <span className="mb-[3px] block font-mono text-[11px] uppercase tracking-[0.08em] text-dim">
                  {projects.caseStudy.decisionsLabel}
                </span>
                {/* The reference renders decisions as prose, like problem/role. */}
                {project.highlights.join(" ")}
              </p>
            )}
          </div>
        </details>

        <ul className="m-0 mt-auto flex list-none flex-wrap gap-1.5 p-0">
          {project.stack.map((tech) => (
            <li key={tech}>
              <Tag variant="stack">{tech}</Tag>
            </li>
          ))}
        </ul>

        {links.length > 0 && (
          <div className="flex gap-3.5">
            {links.map(([kind, href]) => (
              <a
                key={kind}
                href={href}
                {...(isExternalHref(href)
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="font-mono text-sm text-accent no-underline hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {projects.linkLabels[kind]} ↗
              </a>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
