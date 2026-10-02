import type { Project, ProjectsConfig } from "@config/schema";
import { Card } from "@/components/ui/Card";
import { ImageFrame } from "@/components/ui/ImageFrame";
import { Tag } from "@/components/ui/Tag";
import { isExternalHref } from "@/lib/utils";

export interface ProjectCardProps {
  project: Project;
  projects: ProjectsConfig;
}

/**
 * A `standard` project card: badges, hook, impact line, expandable case study,
 * stack and links. Flagships lead the hero index and have their own page.
 */
export function ProjectCard({ project, projects }: ProjectCardProps) {
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
      {project.cover && (
        <ImageFrame
          src={project.cover.src}
          alt={project.cover.alt}
          aspect="16/9"
          missing={project.cover.missing}
          fallbackLabel={project.title}
          className="border-b border-border-muted"
        />
      )}
      <div className="flex flex-1 flex-col gap-3 px-[22px] pb-[18px] pt-[22px]">
        <div className="flex flex-wrap items-center justify-end gap-2">
          {domains.map((domain) => (
            <Tag key={domain} variant="domain">
              {domain}
            </Tag>
          ))}
        </div>

        <div>
          <h3 className="m-0 mb-[5px] text-[20px] font-bold tracking-[-0.01em] text-heading">
            {project.title}
          </h3>
          <p className="m-0 text-base leading-[1.55] text-muted">
            {project.hook}
          </p>
        </div>

        <p className="m-0 font-mono text-sm text-accent">
          {projects.resultsPrefix}
          {project.results}
        </p>

        <details className="mt-0.5 border-t border-border-muted pt-2.5">
          <summary className="no-marker flex cursor-pointer items-center gap-1.5 font-mono text-sm text-subtle transition-colors duration-fast hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
            {projects.caseStudy.summaryLabel} <span aria-hidden="true">▸</span>
          </summary>
          <div className="grid max-w-prose gap-2.5 pt-3.5 text-md leading-relaxed text-prose">
            <p className="m-0">
              <span className="mb-[3px] block font-mono text-2xs uppercase tracking-[0.08em] text-dim">
                {projects.caseStudy.problemLabel}
              </span>
              {project.problem}
            </p>
            <p className="m-0">
              <span className="mb-[3px] block font-mono text-2xs uppercase tracking-[0.08em] text-dim">
                {projects.caseStudy.roleLabel}
              </span>
              {project.role}
            </p>
            <p className="m-0">
              <span className="mb-[3px] block font-mono text-2xs uppercase tracking-[0.08em] text-dim">
                {projects.caseStudy.decisionsLabel}
              </span>
              {project.highlights.join(" ")}
            </p>
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
