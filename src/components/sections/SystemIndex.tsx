import type { HeroConfig, Project } from "@config/schema";
import { workPath } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export interface SystemIndexProps {
  /** Flagship projects, in config order. */
  systems: Project[];
  label: string;
  statusLabels: HeroConfig["statusLabels"];
}

function hostOf(href: string): string {
  return href.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

/**
 * The hero's signature: every flagship as a full-width row with its name set
 * large and expanded, its honest status, and the live address it runs at. The
 * name opens the case study; the address opens the running system.
 */
export function SystemIndex({
  systems,
  label,
  statusLabels,
}: SystemIndexProps) {
  return (
    <section aria-labelledby="system-index-label" className="mt-16">
      <h2
        id="system-index-label"
        className="m-0 border-b-2 border-heading pb-3 font-mono text-sm font-medium text-heading"
      >
        {label}
      </h2>
      <ul className="m-0 list-none p-0">
        {systems.map((system) => {
          const live = system.status === "live";
          return (
            <li key={system.id} className="border-b border-border-strong py-6">
              <a
                href={workPath(system.id)}
                className="group block no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                {/* Breaks only between words: "JMS E-TALYER" must never split at its hyphen. */}
                <span className="stretch-expanded block font-display text-index font-extrabold uppercase leading-[0.92] tracking-[-0.01em] text-heading transition-transform duration-fast group-hover:translate-x-2">
                  {system.title.split(" ").map((word, i) => (
                    <span key={i}>
                      {i > 0 && " "}
                      <span className="whitespace-nowrap">{word}</span>
                    </span>
                  ))}
                </span>
              </a>
              <div className="mt-3 grid gap-x-column-gap gap-y-3 md:grid-cols-12 md:items-start">
                <p className="m-0 max-w-[52ch] text-base leading-relaxed text-muted md:col-span-8">
                  {system.hook}
                </p>
                <div className="grid gap-1.5 font-mono text-sm md:col-span-4 md:justify-items-end md:text-right">
                  {system.status && (
                    <span className="inline-flex items-center gap-2 text-heading">
                      <span
                        aria-hidden="true"
                        className={cn(
                          "h-2 w-2 rounded-full",
                          live ? "bg-signal" : "border border-heading",
                        )}
                      />
                      {statusLabels[system.status]}
                    </span>
                  )}
                  {system.links.demo && (
                    <a
                      href={system.links.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-subtle underline-offset-4 hover:text-heading hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      {hostOf(system.links.demo)} ↗
                    </a>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
