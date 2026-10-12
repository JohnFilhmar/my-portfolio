import type { Recommendation, RecommendationsConfig } from "@config/schema";
import { Tag } from "@/components/ui/Tag";
import { cn, isExternalHref } from "@/lib/utils";

export interface RecommendationCardProps {
  rec: Recommendation;
  labels: RecommendationsConfig;
  /** What it is about, e.g. "on Usapp" → the case study. */
  links: Array<{ label: string; href: string }>;
  /** Smaller type and no links, for showing under a project or role. */
  compact?: boolean;
  className?: string;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * One recommendation: the words first, then who said them, how they know the
 * work, and what it is about, with the source to check it where one exists.
 */
export function RecommendationCard({
  rec,
  labels,
  links,
  compact = false,
  className,
}: RecommendationCardProps) {
  return (
    <figure
      className={cn(
        "m-0 flex h-full flex-col gap-5 rounded-xl border border-border bg-surface",
        compact ? "p-5" : "p-6 sm:p-7",
        className,
      )}
    >
      <blockquote
        className={cn(
          "m-0 flex-1 text-prose",
          compact ? "text-base leading-relaxed" : "text-lg leading-[1.65]",
        )}
      >
        <span
          aria-hidden="true"
          className="mr-1 font-display text-title leading-none text-accent"
        >
          “
        </span>
        {rec.quote}
      </blockquote>

      <figcaption className="flex items-center gap-3.5">
        {rec.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={rec.photo}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-11 w-11 shrink-0 rounded-full border border-border object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface-inset font-mono text-sm text-heading"
          >
            {initials(rec.name)}
          </span>
        )}
        <span className="min-w-0">
          <span className="block font-semibold text-heading">{rec.name}</span>
          <span className="block text-sm text-subtle">
            {rec.organization ? `${rec.role}, ${rec.organization}` : rec.role}
          </span>
        </span>
      </figcaption>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs">
        <Tag variant="domain">
          {labels.relationshipLabels[rec.relationship]}
        </Tag>
        {rec.date && <span className="text-subtle">{rec.date}</span>}
        {!compact &&
          links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-accent underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {link.label}
            </a>
          ))}
        {rec.sourceHref && (
          <a
            href={rec.sourceHref}
            {...(isExternalHref(rec.sourceHref)
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className="text-accent underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {labels.sourceLabel} ↗
          </a>
        )}
      </div>
    </figure>
  );
}
