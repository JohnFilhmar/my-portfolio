import type { Project, ProjectsConfig } from "@config/schema";
import { Tag } from "@/components/ui/Tag";
import { formatIndex, isExternalHref } from "@/lib/utils";

export interface ProjectRowProps {
  project: Project;
  /** Index within the full (unfiltered) project list, for stable P-0N ids. */
  index: number;
  projects: ProjectsConfig;
}

/**
 * A compact project: one scannable row that opens its full case study in
 * place. Everything a card shows is still here, it just starts folded, so the
 * smaller projects stay readable without competing with the flagships.
 */
export function ProjectRow({ project, index, projects }: ProjectRowProps) {
  const links = (
    [
      ["demo", project.links.demo],
      ["repo", project.links.repo],
      ["writeup", project.links.writeup],
    ] as const
  ).filter((entry): entry is [keyof ProjectsConfig["linkLabels"], string] =>
    Boolean(entry[1]),
  );

  // A row is only scannable while it stays one line, so take the first clause
  // of the impact line and cap it. The full text is in the expanded panel.
  const firstClause = project.results.split(/[·.]/)[0]?.trim() ?? "";
  const status =
    firstClause.length > 56
      ? `${firstClause.slice(0, 55).trimEnd()}…`
      : firstClause;

  return (
    <details className="group border-t border-border-muted last:border-b">
      <summary className="no-marker flex cursor-pointer flex-wrap items-baseline gap-x-3 gap-y-1 py-3.5 transition-colors duration-fast hover:bg-hover-tint focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent">
        <span className="font-mono text-xs text-accent">
          {formatIndex(projects.indexPrefix, index)}
        </span>
        <span className="text-base font-semibold text-heading">
          {project.title}
        </span>
        <span className="font-mono text-2xs uppercase tracking-[0.06em] text-dim">
          {project.domain}
        </span>
        <span className="flex-1" />
        <span className="font-mono text-sm text-accent">
          {projects.resultsPrefix}
          {status}
        </span>
        <span
          aria-hidden="true"
          className="font-mono text-sm text-dim transition-transform duration-fast group-open:rotate-90"
        >
          ▸
        </span>
      </summary>

      <div className="grid gap-2.5 pb-4 pl-0 text-md leading-relaxed text-prose sm:pl-[52px]">
        <p className="m-0 text-base text-muted">{project.hook}</p>
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
        <p className="m-0">
          <span className="mb-[3px] block font-mono text-[11px] uppercase tracking-[0.08em] text-dim">
            {projects.caseStudy.decisionsLabel}
          </span>
          {project.highlights.join(" ")}
        </p>
        <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
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
    </details>
  );
}
