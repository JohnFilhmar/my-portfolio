import { useMemo, useState, type ReactNode } from "react";
import type {
  LightboxConfig,
  Project,
  ProjectsConfig,
  ProofItem,
} from "@config/schema";
import { ImageFrame } from "@/components/ui/ImageFrame";
import { Lightbox, type LightboxItem } from "@/components/ui/Lightbox";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Tag } from "@/components/ui/Tag";
import { ProofRow } from "@/components/sections/ProofRow";
import { ShotGrid } from "@/components/work/ShotGrid";
import { workPath } from "@/lib/navigation";
import { cn, isExternalHref } from "@/lib/utils";

export interface CaseStudyProps {
  project: Project;
  /** Shared labels and link copy from projects.json. */
  projects: ProjectsConfig;
  /** Captures bound to this project in proof.json, placeholders included. */
  evidence: ProofItem[];
  openLabelTemplate: string;
  lightbox: LightboxConfig;
  /** Where "all work" goes: the projects section on home, e.g. "/#work". */
  backHref: string;
  /** The flagship after this one, wrapping around; null when it is the only one. */
  next: { id: string; title: string } | null;
}

function Block({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section aria-label={label} className={cn("min-w-0", className)}>
      <SectionLabel label={label} />
      {children}
    </section>
  );
}

/**
 * A flagship project's case study: what it is, the problem, my role, the
 * decisions that shaped it, the stack, measured results when there are any,
 * then the evidence and screens. Every picture slot without a file renders a
 * placeholder, and only real pictures open in the full-size viewer.
 */
export function CaseStudy({
  project,
  projects,
  evidence,
  openLabelTemplate,
  lightbox,
  backHref,
  next,
}: CaseStudyProps) {
  const labels = projects.caseStudy;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const viewable = useMemo<LightboxItem[]>(
    () => [
      ...evidence.filter((item) => !item.missing),
      ...project.shots
        .filter((shot) => !shot.missing)
        .map((shot) => ({
          id: shot.src,
          src: shot.src,
          alt: shot.alt,
          title: shot.caption || project.title,
          caption: shot.caption,
          meta: "",
          aspect: shot.aspect,
        })),
    ],
    [evidence, project.shots, project.title],
  );
  const openById = (id: string) => {
    const index = viewable.findIndex((item) => item.id === id);
    if (index >= 0) setOpenIndex(index);
  };

  const links = (
    [
      ["demo", project.links.demo],
      ["repo", project.links.repo],
      ["writeup", project.links.writeup],
    ] as const
  ).filter((entry): entry is [keyof ProjectsConfig["linkLabels"], string] =>
    Boolean(entry[1]),
  );

  return (
    <article className="mx-auto w-full max-w-container px-container-pad pb-section-y pt-hero-top">
      <a
        href={backHref}
        className="font-mono text-sm text-subtle no-underline hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {labels.backLabel}
      </a>

      <header className="mt-8 grid gap-x-column-gap gap-y-6 md:grid-cols-12 md:items-end">
        <div className="md:col-span-8">
          <h1 className="m-0 text-hero font-bold leading-[1.02] tracking-[-0.025em] text-heading">
            {project.title}
          </h1>
          <p className="m-0 mt-5 max-w-[56ch] text-tagline leading-[1.6] text-muted">
            {project.hook}
          </p>
        </div>
        <div className="grid gap-3 md:col-span-4">
          <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
            {[project.domain, ...project.secondaryDomains].map((domain) => (
              <li key={domain}>
                <Tag variant="domain">{domain}</Tag>
              </li>
            ))}
          </ul>
          <p className="m-0 font-mono text-sm leading-relaxed text-accent">
            {projects.resultsPrefix}
            {project.results}
          </p>
          {links.length > 0 && (
            <div className="flex gap-3.5">
              {links.map(([kind, href]) => (
                <a
                  key={kind}
                  href={href}
                  {...(isExternalHref(href)
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="font-mono text-sm text-accent no-underline hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {projects.linkLabels[kind]} ↗
                </a>
              ))}
            </div>
          )}
        </div>
      </header>

      {project.cover && (
        <ImageFrame
          src={project.cover.src}
          alt={project.cover.alt}
          aspect={project.cover.aspect}
          missing={project.cover.missing}
          fallbackLabel={`${project.title} cover`}
          eager
          className="mt-12 rounded-xl border border-border"
        />
      )}

      {project.metrics.length > 0 && (
        <dl className="m-0 mt-12 grid grid-cols-2 gap-x-column-gap gap-y-8 md:grid-cols-4">
          {project.metrics.map((metric) => (
            <div key={metric.label}>
              <dt className="font-mono text-sm text-subtle">{metric.label}</dt>
              <dd className="m-0 mt-1 text-section font-bold tracking-[-0.02em] text-heading">
                {metric.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-section-y grid gap-x-column-gap gap-y-14 md:grid-cols-12">
        <Block label={labels.problemLabel} className="md:col-span-7">
          <p className="m-0 max-w-prose text-lg leading-[1.75] text-prose">
            {project.problem}
          </p>
        </Block>
        <Block label={labels.roleLabel} className="md:col-span-5">
          <p className="m-0 max-w-prose text-lg leading-[1.75] text-prose">
            {project.role}
          </p>
        </Block>
        <Block label={labels.decisionsLabel} className="md:col-span-7">
          <ol className="m-0 grid list-none gap-4 p-0">
            {project.highlights.map((highlight, i) => (
              <li
                key={i}
                className="grid max-w-prose grid-cols-[2.5rem_1fr] text-md leading-relaxed text-prose"
              >
                <span aria-hidden="true" className="font-mono text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{highlight}</span>
              </li>
            ))}
          </ol>
        </Block>
        <Block label={labels.stackLabel} className="md:col-span-5">
          <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
            {project.stack.map((tech) => (
              <li key={tech}>
                <Tag variant="stack">{tech}</Tag>
              </li>
            ))}
          </ul>
        </Block>
      </div>

      {evidence.length > 0 && (
        <Block label={labels.evidenceLabel} className="mt-section-y">
          <div className="mt-6 grid gap-[clamp(40px,6vw,72px)]">
            {evidence.map((item, index) => (
              <ProofRow
                key={item.id}
                item={item}
                openLabelTemplate={openLabelTemplate}
                flipped={index % 2 === 1}
                eager={false}
                onOpen={() => openById(item.id)}
              />
            ))}
          </div>
        </Block>
      )}

      {project.shots.length > 0 && (
        <Block label={labels.screensLabel} className="mt-section-y">
          <ShotGrid
            shots={project.shots}
            openLabelTemplate={openLabelTemplate}
            onOpen={openById}
          />
        </Block>
      )}

      {next && (
        <nav
          aria-label={labels.nextLabel}
          className="mt-section-y border-t border-border pt-8"
        >
          <a
            href={workPath(next.id)}
            className="group inline-grid gap-1 no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          >
            <span className="font-mono text-sm text-subtle">
              {labels.nextLabel}
            </span>
            <span className="text-section font-bold tracking-[-0.02em] text-heading group-hover:text-accent">
              {next.title} →
            </span>
          </a>
        </nav>
      )}

      <Lightbox
        items={viewable}
        index={openIndex}
        onIndexChange={setOpenIndex}
        onClose={() => setOpenIndex(null)}
        labels={lightbox}
      />
    </article>
  );
}
