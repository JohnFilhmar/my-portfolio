import type { ProjectsConfig } from "@config/schema";
import { cn } from "@/lib/utils";

export interface ProjectFilterProps {
  projects: ProjectsConfig;
  domains: string[];
  active: string;
  onChange: (domain: string) => void;
}

/** Domain filter chips (aria-pressed toggle buttons). */
export function ProjectFilter({
  projects,
  domains,
  active,
  onChange,
}: ProjectFilterProps) {
  return (
    <div
      role="group"
      aria-label={projects.filterGroupLabel}
      className="mb-[26px] flex flex-wrap gap-2"
    >
      {[projects.filterAllLabel, ...domains].map((domain) => {
        const isActive = active === domain;
        return (
          <button
            key={domain}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(domain)}
            className={cn(
              "cursor-pointer rounded-md border px-[13px] py-[7px] font-mono text-xs transition-colors duration-fast",
              "hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              isActive
                ? "border-accent bg-accent text-accent-contrast"
                : "border-border-chip bg-surface text-subtle",
            )}
          >
            {domain}
          </button>
        );
      })}
    </div>
  );
}
