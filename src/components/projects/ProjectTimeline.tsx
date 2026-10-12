import type { Project, ProjectsConfig } from "@config/schema";
import { durationBetween } from "@/lib/dates";
import { cn } from "@/lib/utils";

export interface ProjectTimelineProps {
  timeline: Project["timeline"];
  labels: ProjectsConfig["page"];
  /** Show slots for dates not supplied yet (placeholder mode). */
  showPending: boolean;
}

type Point = { key: string; label: string; date: string | null };

/**
 * A project's life as a track: first line of code, production (or the planned
 * release), and when work wrapped up, with the time from first code to
 * production spelled out. Points without a date only show in placeholder mode.
 */
export function ProjectTimeline({
  timeline,
  labels,
  showPending,
}: ProjectTimelineProps) {
  const t = timeline ?? {};
  const names = labels.timelineLabels;
  const candidates: Point[] = [
    { key: "started", label: names.started, date: t.started ?? null },
    t.plannedRelease && !t.firstRelease
      ? {
          key: "plannedRelease",
          label: names.plannedRelease,
          date: t.plannedRelease,
        }
      : {
          key: "firstRelease",
          label: names.firstRelease,
          date: t.firstRelease ?? null,
        },
    ...(t.ended ? [{ key: "ended", label: names.ended, date: t.ended }] : []),
  ];
  const points = candidates.filter(
    (point) => point.date !== null || showPending,
  );
  if (points.length === 0) return null;

  const duration =
    t.started && t.firstRelease
      ? durationBetween(t.started, t.firstRelease)
      : null;

  return (
    <div>
      <ol className="m-0 grid list-none gap-4 p-0 sm:grid-flow-col sm:auto-cols-fr sm:gap-0">
        {points.map((point, i) => (
          <li key={point.key} className="relative flex gap-3 sm:block sm:pr-4">
            {/* The connecting line runs from each dot to the next one. */}
            {i < points.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute left-[5px] top-3 h-[calc(100%+0.25rem)] w-px bg-border-strong sm:left-3 sm:top-[5px] sm:h-px sm:w-full"
              />
            )}
            <span
              aria-hidden="true"
              className={cn(
                "relative mt-1 h-[11px] w-[11px] shrink-0 rounded-full border-2 sm:mt-0 sm:block",
                point.date
                  ? point.key === "plannedRelease"
                    ? "border-accent bg-surface"
                    : "border-accent bg-accent"
                  : "border-dashed border-border-strong bg-surface",
              )}
            />
            <span className="block sm:mt-2.5">
              <span className="block font-mono text-2xs uppercase tracking-[0.08em] text-subtle">
                {point.label}
              </span>
              <span
                className={cn(
                  "block font-mono text-sm",
                  point.date ? "text-heading" : "text-dim",
                )}
              >
                {point.date ?? labels.pendingDateLabel}
              </span>
            </span>
          </li>
        ))}
      </ol>
      {duration && (
        <p className="m-0 mt-3 font-mono text-xs text-accent">
          {labels.durationTemplate.replace("{d}", duration)}
        </p>
      )}
    </div>
  );
}
