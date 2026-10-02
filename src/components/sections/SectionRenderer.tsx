import type { AppConfig, AssistantMode } from "@config/schema";
import type { ResolvedSection } from "@/lib/sections";
import { Section } from "@/components/layout/Section";
import { About } from "@/components/sections/About";
import { Certifications } from "@/components/sections/Certifications";
import { Contact } from "@/components/sections/Contact";
import { Education } from "@/components/sections/Education";
import { Experience } from "@/components/sections/Experience";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { Proof } from "@/components/sections/Proof";
import { Skills } from "@/components/sections/Skills";
import { AssistantSection } from "@/components/assistant/AssistantSection";
import { NotesSection } from "@/components/notes/NotesSection";

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
  return (
    <>
      {sections.map((section) => {
        switch (section.type) {
          case "hero":
            return (
              <Hero
                key={section.id}
                sectionId={section.id}
                hero={config.hero}
                site={config.site}
                flagships={config.projects.items.filter(
                  (item) => item.tier === "flagship",
                )}
                assistantEnabled={config.assistant.enabled}
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
                <About about={config.about} education={config.education} />
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
                <Skills skills={config.skills} />
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
                <Projects projects={config.projects} />
              </Section>
            );
          case "proof":
            return (
              <Section
                key={section.id}
                id={section.id}
                ariaLabel={config.proof.label}
                reducedMotion={reducedMotion}
              >
                <Proof proof={config.proof} lightbox={config.site.lightbox} />
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
                <Experience
                  experience={config.experience}
                  lightbox={config.site.lightbox}
                />
              </Section>
            );
          case "education":
            return (
              <Section
                key={section.id}
                id={section.id}
                ariaLabel={config.education.label}
                reducedMotion={reducedMotion}
              >
                <Education
                  education={config.education}
                  lightbox={config.site.lightbox}
                />
              </Section>
            );
          case "certifications":
            return (
              <Section
                key={section.id}
                id={section.id}
                ariaLabel={config.certifications.label}
                reducedMotion={reducedMotion}
              >
                <Certifications certifications={config.certifications} />
              </Section>
            );
          case "notes":
            return (
              <Section
                key={section.id}
                id={section.id}
                ariaLabel={config.notes.label}
                reducedMotion={reducedMotion}
              >
                <NotesSection notes={config.notes} />
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
                  assistant={config.assistant}
                  mode={assistantMode}
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
