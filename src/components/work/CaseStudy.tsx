import { RecommendationCard } from "@/components/recommendations/RecommendationCard";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useMemo, useState, type ReactNode } from "react";
import type {
  LightboxConfig,
  Project,
  ProjectsConfig,
  ProofItem,
  Recommendation,
  RecommendationsConfig,
} from "@config/schema";
import { ImageFrame } from "@/components/ui/ImageFrame";
import { Lightbox, type LightboxItem } from "@/components/ui/Lightbox";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Tag } from "@/components/ui/Tag";
import { ProofRow } from "@/components/sections/ProofRow";
import { CaseHeader } from "@/components/work/CaseHeader";
import { ShotGrid } from "@/components/work/ShotGrid";
import { workPath } from "@/lib/navigation";
import { cn } from "@/lib/utils";

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
  /** Recommendations about this project. */
  recommendations: Recommendation[];
  recommendationLabels: RecommendationsConfig;
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
  recommendations,
  recommendationLabels,
}: CaseStudyProps) {
  const labels = projects.caseStudy;
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const reducedMotion = useReducedMotion();

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

  return (
    <article className="mx-auto w-full max-w-container px-container-pad pb-section-y pt-hero-top">
      <CaseHeader project={project} projects={projects} backHref={backHref} />

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
              <dd className="m-0 mt-1 font-display text-section font-semibold tracking-[-0.02em] text-heading">
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
                reducedMotion={reducedMotion}
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

      {recommendations.length > 0 && (
        <Block
          label={recommendationLabels.linkedHeading}
          className="mt-section-y"
        >
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {recommendations.map((rec) => (
              <RecommendationCard
                key={rec.id}
                rec={rec}
                labels={recommendationLabels}
                links={[]}
              />
            ))}
          </div>
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
            <span className="font-display text-section font-semibold tracking-[-0.02em] text-heading group-hover:underline">
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
