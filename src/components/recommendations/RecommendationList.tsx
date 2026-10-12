import { useMemo, useState } from "react";
import type { RecommendationsConfig } from "@config/schema";
import { RecommendationCard } from "@/components/recommendations/RecommendationCard";
import { FilterChips } from "@/components/ui/FilterChips";

export interface RecommendationListProps {
  recommendations: RecommendationsConfig;
  /** Links per recommendation id, resolved on the server from the config. */
  linksById: Record<string, Array<{ label: string; href: string }>>;
}

/**
 * Every recommendation, filterable by how the person knows the work. The
 * filter only appears once there are at least two kinds to choose from.
 */
export function RecommendationList({
  recommendations,
  linksById,
}: RecommendationListProps) {
  const { items, relationshipLabels, allLabel } = recommendations;
  const kinds = useMemo(
    () => [...new Set(items.map((item) => item.relationship))],
    [items],
  );
  const [active, setActive] = useState(allLabel);

  if (items.length === 0) {
    return (
      <p className="m-0 border-y-2 border-heading py-10 font-mono text-sm text-subtle">
        {recommendations.emptyMessage}
      </p>
    );
  }

  const shown =
    active === allLabel
      ? items
      : items.filter(
          (item) => relationshipLabels[item.relationship] === active,
        );

  return (
    <>
      <FilterChips
        groupLabel={recommendations.filterLabel}
        options={[allLabel, ...kinds.map((kind) => relationshipLabels[kind])]}
        active={active}
        onChange={setActive}
        className="mb-6"
      />
      <ul
        key={active}
        className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(100%,380px),1fr))] gap-4 p-0"
      >
        {shown.map((rec, i) => (
          <li
            key={rec.id}
            className="animate-row-in"
            style={{ animationDelay: `${Math.min(i, 8) * 50}ms` }}
          >
            <RecommendationCard
              rec={rec}
              labels={recommendations}
              links={linksById[rec.id] ?? []}
            />
          </li>
        ))}
      </ul>
    </>
  );
}
