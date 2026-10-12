import { useMemo, useState } from "react";
import type { ProjectsConfig, RecommendationsConfig } from "@config/schema";
import { ProjectEntry } from "@/components/projects/ProjectEntry";
import { FilterChips } from "@/components/ui/FilterChips";
import { recommendationsAbout } from "@/lib/recommendations";

export interface ProjectsListProps {
  projects: ProjectsConfig;
  recommendations: RecommendationsConfig;
  showPlaceholders: boolean;
  reducedMotion: boolean;
}

/** Every project that is not featured, filterable by domain. */
export function ProjectsList({
  projects,
  recommendations,
  showPlaceholders,
  reducedMotion,
}: ProjectsListProps) {
  const rest = useMemo(
    () => projects.items.filter((item) => item.tier !== "flagship"),
    [projects.items],
  );
  const domains = useMemo(
    () => [
      ...new Set(
        rest.flatMap((item) => [item.domain, ...item.secondaryDomains]),
      ),
    ],
    [rest],
  );
  const [filter, setFilter] = useState(projects.filterAllLabel);
  const visible = rest.filter(
    (item) =>
      filter === projects.filterAllLabel ||
      item.domain === filter ||
      item.secondaryDomains.includes(filter),
  );

  return (
    <>
      <FilterChips
        groupLabel={projects.filterGroupLabel}
        options={
          projects.showFilters ? [projects.filterAllLabel, ...domains] : []
        }
        active={filter}
        onChange={setFilter}
        className="mb-4"
      />
      <div key={filter}>
        {visible.map((project) => (
          <ProjectEntry
            key={project.id}
            project={project}
            projects={projects}
            recommendations={recommendationsAbout(recommendations.items, {
              project: project.id,
            })}
            recommendationLabels={recommendations}
            showPlaceholders={showPlaceholders}
            reducedMotion={reducedMotion}
          />
        ))}
      </div>
    </>
  );
}
