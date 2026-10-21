import type { HeroConfig, ProjectsConfig } from "@config/schema";
import { ImageFrame } from "@/components/ui/ImageFrame";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tag } from "@/components/ui/Tag";
import { PROJECTS_PATH, workPath } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export interface ProjectsProps {
  projects: ProjectsConfig;
  statusLabels: HeroConfig["statusLabels"];
}

/**
 * Home "work" section: only the featured projects, as cards that open their
 * case studies, and one link to /projects for everything else.
 */
export function Projects({ projects, statusLabels }: ProjectsProps) {
  const featured = projects.items.filter((item) => item.tier === "flagship");
  const others = projects.items.length - featured.length;
  const page = projects.page;

  return (
    <>
      <SectionHeading className="mb-8">{projects.heading}</SectionHeading>

      <ul className="m-0 grid list-none gap-5 p-0 md:grid-cols-2 xl:grid-cols-3">
        {featured.map((project) => (
          // An odd card out on the two-column tablet grid spans the row.
          <li
            key={project.id}
            className="md:last:odd:col-span-2 xl:last:odd:col-span-1"
          >
            <a
              href={workPath(project.id)}
              className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface text-inherit no-underline transition-[transform,border-color] duration-base ease-standard hover:-translate-y-1 hover:border-border-hover focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {project.cover && (
                <ImageFrame
                  src={project.cover.src}
                  alt={project.cover.alt}
                  aspect="16/10"
                  missing={project.cover.missing}
                  fallbackLabel={project.title}
                  className="border-b border-border-muted"
                />
              )}
              <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
                {project.status && (
                  <span className="inline-flex items-center gap-2 font-mono text-xs text-heading">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "h-2 w-2 rounded-full",
                        project.status === "live"
                          ? "bg-signal"
                          : "border border-heading",
                      )}
                    />
                    {statusLabels[project.status]}
                    {project.timeline?.plannedRelease && (
                      <span className="text-subtle">
                        · {project.timeline.plannedRelease}
                      </span>
                    )}
                  </span>
                )}
                <h3 className="stretch-semi-expanded m-0 font-display text-title font-semibold leading-snug text-heading">
                  {project.title}
                </h3>
                <p className="m-0 flex-1 text-base leading-relaxed text-muted">
                  {project.hook}
                </p>
                <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
                  {project.stack.slice(0, 5).map((tech) => (
                    <li key={tech}>
                      <Tag variant="stack">{tech}</Tag>
                    </li>
                  ))}
                </ul>
                <span className="font-mono text-sm text-accent transition-transform duration-base ease-standard group-hover:translate-x-1">
                  {page.caseStudyLabel}
                </span>
              </div>
            </a>
          </li>
        ))}
      </ul>

      {others > 0 && (
        <a
          href={PROJECTS_PATH}
          className="mt-8 inline-block font-mono text-sm text-accent underline underline-offset-4 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {page.allLinkTemplate.replace("{n}", String(others))}
        </a>
      )}
    </>
  );
}
