import { useMemo, useState } from "react";
import type { Project, ProjectsConfig } from "@config/schema";
import { FilterChips } from "@/components/ui/FilterChips";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectCard } from "@/components/sections/ProjectCard";
import { ProjectRow } from "@/components/sections/ProjectRow";

export interface ProjectsProps {
  projects: ProjectsConfig;
}

/**
 * Everything that is not a flagship (flagships lead the hero index and have
 * their own pages): standard projects share the card grid, compact ones
 * collapse into expandable rows. Filtering narrows both groups at once and an
 * empty group renders nothing.
 */
export function Projects({ projects }: ProjectsProps) {
  const [filter, setFilter] = useState(projects.filterAllLabel);
  const rest = useMemo(
    () => projects.items.filter((item) => item.tier !== "flagship"),
    [projects.items],
  );

  const domains = useMemo(() => {
    const seen: string[] = [];
    for (const item of rest) {
      for (const domain of [item.domain, ...item.secondaryDomains]) {
        if (!seen.includes(domain)) seen.push(domain);
      }
    }
    return seen;
  }, [rest]);

  const visible: Project[] = rest.filter(
    (project) =>
      filter === projects.filterAllLabel ||
      project.domain === filter ||
      project.secondaryDomains.includes(filter),
  );
  const standard = visible.filter((project) => project.tier === "standard");
  const compact = visible.filter((project) => project.tier === "compact");

  return (
    <>
      <SectionHeading className="mb-6">{projects.heading}</SectionHeading>

      <FilterChips
        groupLabel={projects.filterGroupLabel}
        options={
          projects.showFilters ? [projects.filterAllLabel, ...domains] : []
        }
        active={filter}
        onChange={setFilter}
        className="mb-[26px]"
      />

      {standard.length > 0 && (
        <div className="mb-10 grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-3.5">
          {standard.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              projects={projects}
            />
          ))}
        </div>
      )}

      {compact.length > 0 && (
        <div>
          {compact.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              projects={projects}
            />
          ))}
        </div>
      )}
    </>
  );
}
