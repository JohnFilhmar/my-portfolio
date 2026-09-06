import { useMemo, useState } from "react";
import type { Project, ProjectsConfig } from "@config/schema";
import { FilterChips } from "@/components/ui/FilterChips";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ProjectCard } from "@/components/sections/ProjectCard";
import { ProjectRow } from "@/components/sections/ProjectRow";

export interface ProjectsProps {
  number: string;
  projects: ProjectsConfig;
}

interface IndexedProject {
  project: Project;
  /** Position in the full config list, so P-0N ids never shift. */
  index: number;
}

/**
 * Projects, grouped by the `tier` each one is given in config: flagships take
 * the full width, standard projects share the card grid, and everything else
 * collapses into expandable rows. Filtering narrows all three groups at once
 * and any group with nothing in it renders nothing.
 */
export function Projects({ number, projects }: ProjectsProps) {
  const [filter, setFilter] = useState(projects.filterAllLabel);

  const domains = useMemo(() => {
    const seen: string[] = [];
    for (const item of projects.items) {
      for (const domain of [item.domain, ...item.secondaryDomains]) {
        if (!seen.includes(domain)) seen.push(domain);
      }
    }
    return seen;
  }, [projects.items]);

  const visible: IndexedProject[] = projects.items
    .map((project, index) => ({ project, index }))
    .filter(
      ({ project }) =>
        filter === projects.filterAllLabel ||
        project.domain === filter ||
        project.secondaryDomains.includes(filter),
    );

  const byTier = (tier: Project["tier"]) =>
    visible.filter(({ project }) => project.tier === tier);
  const flagships = byTier("flagship");
  const standard = byTier("standard");
  const compact = byTier("compact");

  return (
    <>
      <SectionLabel number={number} label={projects.label} />
      <p className="m-0 mb-6 text-section font-bold tracking-[-0.02em] text-heading">
        {projects.heading}
      </p>

      <FilterChips
        groupLabel={projects.filterGroupLabel}
        options={
          projects.showFilters ? [projects.filterAllLabel, ...domains] : []
        }
        active={filter}
        onChange={setFilter}
        className="mb-[26px]"
      />

      {flagships.length > 0 && (
        <div className="mb-3.5 grid gap-3.5">
          {flagships.map(({ project, index }) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              projects={projects}
            />
          ))}
        </div>
      )}

      {standard.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-3.5">
          {standard.map(({ project, index }) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              projects={projects}
            />
          ))}
        </div>
      )}

      {compact.length > 0 && (
        <div className="mt-7">
          {compact.map(({ project, index }) => (
            <ProjectRow
              key={project.id}
              project={project}
              index={index}
              projects={projects}
            />
          ))}
        </div>
      )}
    </>
  );
}
