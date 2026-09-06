import { useMemo, useState } from "react";
import type { ProjectsConfig } from "@config/schema";
import { FilterChips } from "@/components/ui/FilterChips";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ProjectCard } from "@/components/sections/ProjectCard";

export interface ProjectsProps {
  number: string;
  projects: ProjectsConfig;
}

/** Projects: domain filters + card grid. Domains derive from the items. */
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

  // Stable P-0N indexes come from the item's position in config; in the
  // unfiltered view, `featured: true` projects lead (stable sort).
  const visible = projects.items
    .map((project, index) => ({ project, index }))
    .filter(
      ({ project }) =>
        filter === projects.filterAllLabel ||
        project.domain === filter ||
        project.secondaryDomains.includes(filter),
    )
    .sort((a, b) =>
      filter === projects.filterAllLabel
        ? Number(b.project.featured) - Number(a.project.featured)
        : 0,
    );

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
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-3.5">
        {visible.map(({ project, index }) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={index}
            projects={projects}
          />
        ))}
      </div>
    </>
  );
}
