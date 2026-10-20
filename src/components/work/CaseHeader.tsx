import type { Project, ProjectsConfig } from "@config/schema";
import { Tag } from "@/components/ui/Tag";
import { isExternalHref } from "@/lib/utils";

export interface CaseHeaderProps {
  project: Project;
  /** Shared labels and link copy from projects.json. */
  projects: ProjectsConfig;
  /** Where the back link goes: the projects section on home, e.g. "/#work". */
  backHref: string;
}

/** Top of a case study: back link, title as the page h1, hook, domains, results and links. */
export function CaseHeader({ project, projects, backHref }: CaseHeaderProps) {
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
    <>
      <a
        href={backHref}
        className="font-mono text-sm text-subtle no-underline hover:text-accent focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {projects.caseStudy.backLabel}
      </a>

      <header className="mt-8 grid gap-x-column-gap gap-y-6 md:grid-cols-12 md:items-end">
        <div className="md:col-span-8">
          <h1 className="stretch-semi-expanded m-0 font-display text-hero font-semibold leading-[1.02] tracking-[-0.02em] text-heading">
            {project.title}
          </h1>
          <p className="m-0 mt-5 max-w-[56ch] text-tagline leading-[1.6] text-muted">
            {project.hook}
          </p>
        </div>
        <div className="grid gap-3 md:col-span-4">
          <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
            {[project.domain, ...project.secondaryDomains].map((domain) => (
              <li key={domain}>
                <Tag variant="domain">{domain}</Tag>
              </li>
            ))}
          </ul>
          <p className="m-0 font-mono text-sm leading-relaxed text-accent">
            {projects.resultsPrefix}
            {project.results}
          </p>
          {links.length > 0 && (
            <div className="flex gap-3.5">
              {links.map(([kind, href]) => (
                <a
                  key={kind}
                  href={href}
                  {...(isExternalHref(href)
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="font-mono text-sm text-accent no-underline hover:underline focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {projects.linkLabels[kind]} ↗
                </a>
              ))}
            </div>
          )}
        </div>
      </header>
    </>
  );
}
