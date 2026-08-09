import type { AppConfig, SectionType } from "@config/schema";

export interface ResolvedSection {
  type: SectionType;
  /** DOM id / anchor target. */
  id: string;
  /** Zero-padded number ("01"…) — null for the hero, which is unnumbered. */
  number: string | null;
  /** Human label from the section's own config slice — null for the hero. */
  label: string | null;
}

/**
 * Resolve the section registry (site.json `sections`) against the config
 * slices: filters disabled entries, assigns anchor ids and the "01 //"
 * numbering. Used by both the SectionRenderer and the command palette so
 * numbering always matches.
 */
export function resolveSections(config: AppConfig): ResolvedSection[] {
  const labelFor: Record<SectionType, string | null> = {
    hero: null,
    about: config.about.label,
    skills: config.skills.label,
    projects: config.projects.label,
    experience: config.experience.label,
    assistant: config.assistant.label,
    contact: config.contact.label,
  };

  let counter = 0;
  return config.site.sections
    .filter(
      (entry) =>
        entry.enabled &&
        (entry.type !== "assistant" || config.assistant.enabled),
    )
    .map((entry) => {
      const number =
        entry.type === "hero" ? null : String(++counter).padStart(2, "0");
      return {
        type: entry.type,
        id: entry.id ?? entry.type,
        number,
        label: labelFor[entry.type],
      };
    });
}
