import type { AppConfig, AssistantMode } from "@config/schema";
import type { ResolvedSection } from "@/lib/sections";
import { Section } from "@/components/layout/Section";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";
import { AssistantSection } from "@/components/assistant/AssistantSection";

export interface SectionRendererProps {
  config: AppConfig;
  sections: ResolvedSection[];
  assistantMode: AssistantMode;
  contactViaApi: boolean;
  reducedMotion: boolean;
}

/**
 * Registry-driven renderer: maps each `sections` entry (from site.json) to
 * its component. Reordering or toggling sections is a config edit — this
 * switch is the single place a new section type gets wired in.
 */
export function SectionRenderer({
  config,
  sections,
  assistantMode,
  contactViaApi,
  reducedMotion,
}: SectionRendererProps) {
  const assistantSection = sections.find((s) => s.type === "assistant") ?? null;

  return (
    <>
      {sections.map((section) => {
        const number = section.number ?? "";
        switch (section.type) {
          case "hero":
            return (
              <Hero
                key={section.id}
                sectionId={section.id}
                hero={config.hero}
                site={config.site}
                typing={config.theme.motion.typing}
                reducedMotion={reducedMotion}
                assistantSectionId={assistantSection?.id ?? null}
              />
            );
          case "about":
            return (
              <Section
                key={section.id}
                id={section.id}
                ariaLabel={config.about.label}
                reducedMotion={reducedMotion}
              >
                <About number={number} about={config.about} />
              </Section>
            );
          case "skills":
            return (
              <Section
                key={section.id}
                id={section.id}
                ariaLabel={config.skills.label}
                reducedMotion={reducedMotion}
              >
                <Skills number={number} skills={config.skills} />
              </Section>
            );
          case "projects":
            return (
              <Section
                key={section.id}
                id={section.id}
                ariaLabel={config.projects.label}
                reducedMotion={reducedMotion}
              >
                <Projects number={number} projects={config.projects} />
              </Section>
            );
          case "experience":
            return (
              <Section
                key={section.id}
                id={section.id}
                ariaLabel={config.experience.label}
                reducedMotion={reducedMotion}
              >
                <Experience number={number} experience={config.experience} />
              </Section>
            );
          case "assistant":
            return (
              <Section
                key={section.id}
                id={section.id}
                ariaLabel={config.assistant.label}
                reducedMotion={reducedMotion}
              >
                <AssistantSection
                  number={number}
                  assistant={config.assistant}
                  mode={assistantMode}
                  typing={config.theme.motion.typing}
                  reducedMotion={reducedMotion}
                />
              </Section>
            );
          case "contact":
            return (
              <Section
                key={section.id}
                id={section.id}
                ariaLabel={config.contact.label}
                reducedMotion={reducedMotion}
                className="!pb-contact-bottom"
              >
                <Contact
                  number={number}
                  contact={config.contact}
                  site={config.site}
                  contactViaApi={contactViaApi}
                />
              </Section>
            );
          default:
            return null;
        }
      })}
    </>
  );
}
