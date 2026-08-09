import { z } from "zod";

/**
 * Zod schemas + TypeScript types for every config file under ./config.
 *
 * All site content, structure and theming flows through these schemas —
 * `loadConfig()` (config/index.ts) validates the JSON files against them on
 * every request and throws a descriptive error when something is malformed.
 *
 * Adding a new section type:
 *  1. Add a JSON slice under config/sections/
 *  2. Add its schema + type here and wire it into `loadConfig()`
 *  3. Add the section component under src/components/sections/
 *  4. Register it in the SectionRenderer map and in site.json `sections`
 */

/* ---------------------------------- shared --------------------------------- */

/** Named text tones map to theme color tokens (see src/lib/utils.ts). */
export const toneSchema = z.enum([
  "default",
  "bright",
  "heading",
  "prose",
  "muted",
  "subtle",
  "faint",
  "dim",
  "ghost",
  "accent",
]);
export type Tone = z.infer<typeof toneSchema>;

export const spanSchema = z.object({
  text: z.string(),
  tone: toneSchema.default("default"),
});
export type Span = z.infer<typeof spanSchema>;

const readme = z.string().optional();

/* ---------------------------------- theme ---------------------------------- */

export const themeSchema = z.object({
  _readme: readme,
  mode: z.enum(["dark"]).default("dark"),
  colors: z.object({
    background: z.string(),
    backgroundAlt: z.string(),
    surface: z.string(),
    surfaceAlt: z.string(),
    surfaceInset: z.string(),
    foreground: z.string(),
    heading: z.string(),
    bright: z.string(),
    prose: z.string(),
    muted: z.string(),
    subtle: z.string(),
    faint: z.string(),
    dim: z.string(),
    ghost: z.string(),
    border: z.string(),
    borderMuted: z.string(),
    borderNav: z.string(),
    borderChip: z.string(),
    borderStrong: z.string(),
    borderHover: z.string(),
    dot: z.string(),
    accent: z.string(),
    accentMuted: z.string(),
    accentContrast: z.string(),
    selectionContrast: z.string(),
    success: z.string(),
    warning: z.string(),
    danger: z.string(),
    /** Neutral hover tint for nav links / palette rows. */
    hoverTint: z.string(),
    /** Modal backdrop veil (command palette overlay). */
    overlay: z.string(),
  }),
  fonts: z.object({
    mono: z.string(),
    sans: z.string(),
  }),
  fontSizes: z.record(z.string(), z.string()),
  spacing: z.object({
    containerMax: z.string(),
    containerPad: z.string(),
    sectionY: z.string(),
    heroTop: z.string(),
    heroBottom: z.string(),
    contactBottom: z.string(),
    columnGap: z.string(),
    headerHeight: z.string(),
    scrollMargin: z.string(),
  }),
  radii: z.record(z.string(), z.string()),
  shadows: z.record(z.string(), z.string()),
  motion: z.object({
    durations: z.record(z.string(), z.string()),
    easings: z.record(z.string(), z.string()),
    typing: z.object({
      heroCharMs: z.number().int().positive(),
      bootCharMs: z.number().int().positive(),
      bootLinePauseMs: z.number().int().positive(),
      bootStartDelayMs: z.number().int().nonnegative(),
      chatCharsPerTick: z.number().int().positive(),
      chatTickMs: z.number().int().positive(),
      chatReplyDelayMs: z.number().int().nonnegative(),
    }),
  }),
  terminal: z.object({
    cursorColor: z.string(),
    promptColor: z.string(),
    texture: z.enum(["grid", "scanlines", "none"]).default("grid"),
    textureLine: z.string(),
    /** Line color for the `scanlines` texture (darker than the grid line). */
    scanlineColor: z.string(),
    textureSize: z.string(),
    glow: z.boolean().default(true),
  }),
});
export type ThemeConfig = z.infer<typeof themeSchema>;

/* ----------------------------------- site ---------------------------------- */

export const sectionTypeSchema = z.enum([
  "hero",
  "about",
  "skills",
  "projects",
  "experience",
  "assistant",
  "contact",
]);
export type SectionType = z.infer<typeof sectionTypeSchema>;

export const sectionEntrySchema = z.object({
  type: sectionTypeSchema,
  enabled: z.boolean().default(true),
  /** DOM id / anchor target. Defaults to the section type. */
  id: z.string().optional(),
});
export type SectionEntry = z.infer<typeof sectionEntrySchema>;

export const navItemSchema = z.object({
  label: z.string(),
  href: z.string(),
});
export type NavItem = z.infer<typeof navItemSchema>;

export const socialSchema = z.object({
  label: z.string(),
  href: z.string(),
  icon: z.string().optional(),
});
export type Social = z.infer<typeof socialSchema>;

const paletteActionSchema = z.object({
  label: z.string(),
  hint: z.string().default(""),
});

export const paletteSchema = z.object({
  buttonLabel: z.string().default("⌘K"),
  buttonTitle: z.string().default("Command palette (Cmd/Ctrl + K)"),
  placeholder: z.string(),
  inputAriaLabel: z.string(),
  emptyMessage: z.string(),
  footerHint: z.string(),
  escLabel: z.string().default("esc"),
  gotoPrefix: z.string().default("goto: "),
  openPrefix: z.string().default("open: "),
  actions: z.object({
    askAssistant: paletteActionSchema,
    copyEmail: paletteActionSchema,
    replayBoot: paletteActionSchema,
  }),
});
export type PaletteConfig = z.infer<typeof paletteSchema>;

export const siteSchema = z.object({
  _readme: readme,
  name: z.string(),
  /** Rendered as `user@host:~` in the nav brand and footer. */
  prompt: z.object({ user: z.string(), host: z.string() }),
  role: z.string(),
  tagline: z.string(),
  description: z.string(),
  siteUrl: z.string().url(),
  locale: z.string().default("en_US"),
  contact: z.object({ email: z.string().email() }),
  socials: z.array(socialSchema),
  resume: z.object({ label: z.string(), href: z.string() }),
  nav: z.array(navItemSchema),
  footer: z.object({ note: z.string(), copyright: z.string() }),
  palette: paletteSchema,
  sections: z.array(sectionEntrySchema),
});
export type SiteConfig = z.infer<typeof siteSchema>;

/* ----------------------------------- hero ---------------------------------- */

export const ctaSchema = z.object({
  label: z.string(),
  /** Anchor target, e.g. "#work". Ignored when `action` is set. */
  href: z.string().optional(),
  /** Built-in behaviors. "assistant" scrolls to the assistant and focuses input. */
  action: z.enum(["assistant"]).optional(),
  variant: z.enum(["solid", "outline", "ghost"]).default("outline"),
});
export type Cta = z.infer<typeof ctaSchema>;

export const bootLineSchema = z.object({
  text: z.string(),
  tone: toneSchema.default("default"),
});
export type BootLine = z.infer<typeof bootLineSchema>;

export const heroSchema = z.object({
  _readme: readme,
  promptLine: z.object({ path: z.string(), command: z.string() }),
  /** Accent-colored suffix after the name in the headline (the "." in "Jordan Reyes."). */
  nameSuffix: z.string().default("."),
  ctas: z.array(ctaSchema),
  statusLine: z.array(spanSchema),
  boot: z.object({
    windowTitle: z.string(),
    skipHint: z.string(),
    lines: z.array(bootLineSchema),
  }),
});
export type HeroConfig = z.infer<typeof heroSchema>;

/* ---------------------------------- about ---------------------------------- */

export const terminalLineSchema = z.object({
  /** When true, renders the top-level `philosophy` string in accent tone. */
  philosophy: z.boolean().optional(),
  spans: z.array(spanSchema).optional(),
});
export type TerminalLine = z.infer<typeof terminalLineSchema>;

export const aboutSchema = z.object({
  _readme: readme,
  label: z.string(),
  heading: z.string(),
  /** Supports minimal inline markup: **bold** and *italic*. */
  paragraphs: z.array(z.string()),
  philosophy: z.string(),
  terminal: z.object({
    entries: z.array(
      z.object({
        cmd: z.string(),
        lines: z.array(terminalLineSchema),
      }),
    ),
  }),
});
export type AboutConfig = z.infer<typeof aboutSchema>;

/* ---------------------------------- skills --------------------------------- */

export const skillSchema = z.object({
  name: z.string(),
  /** 1–5. Skills at or above the group file's `coreLevel` get the core-strength treatment. */
  level: z.number().int().min(1).max(5).optional(),
  tags: z.array(z.string()).optional(),
});
export type Skill = z.infer<typeof skillSchema>;

export const skillGroupSchema = z.object({
  id: z.string(),
  label: z.string(),
  blurb: z.string().optional(),
  skills: z.array(skillSchema),
});
export type SkillGroup = z.infer<typeof skillGroupSchema>;

export const skillsSchema = z.object({
  _readme: readme,
  label: z.string(),
  heading: z.string(),
  legend: z.string(),
  coreMarker: z.string().default("▸"),
  coreLevel: z.number().int().min(1).max(5).default(4),
  groups: z.array(skillGroupSchema),
});
export type SkillsConfig = z.infer<typeof skillsSchema>;

/* --------------------------------- projects -------------------------------- */

export const projectLinksSchema = z.object({
  demo: z.string().optional(),
  repo: z.string().optional(),
  writeup: z.string().optional(),
});
export type ProjectLinks = z.infer<typeof projectLinksSchema>;

export const projectSchema = z.object({
  id: z.string(),
  title: z.string(),
  hook: z.string(),
  problem: z.string(),
  role: z.string(),
  stack: z.array(z.string()),
  highlights: z.array(z.string()),
  results: z.string(),
  links: projectLinksSchema.default({}),
  domain: z.string(),
  secondaryDomains: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
});
export type Project = z.infer<typeof projectSchema>;

export const projectsSchema = z.object({
  _readme: readme,
  label: z.string(),
  heading: z.string(),
  showFilters: z.boolean().default(true),
  filterAllLabel: z.string().default("all"),
  filterGroupLabel: z.string().default("Filter projects by domain"),
  indexPrefix: z.string().default("P-"),
  resultsPrefix: z.string().default("▲ "),
  caseStudy: z.object({
    summaryLabel: z.string(),
    problemLabel: z.string(),
    roleLabel: z.string(),
    decisionsLabel: z.string(),
  }),
  linkLabels: z.object({
    demo: z.string().default("demo"),
    repo: z.string().default("repo"),
    writeup: z.string().default("write-up"),
  }),
  items: z.array(projectSchema),
});
export type ProjectsConfig = z.infer<typeof projectsSchema>;

/* -------------------------------- experience ------------------------------- */

export const experienceItemSchema = z.object({
  company: z.string(),
  title: z.string(),
  start: z.string(),
  /** null / omitted = current role (rendered with `presentLabel` in accent). */
  end: z.string().nullable().default(null),
  bullets: z.array(z.string()),
});
export type ExperienceItem = z.infer<typeof experienceItemSchema>;

export const experienceSchema = z.object({
  _readme: readme,
  label: z.string(),
  heading: z.string(),
  presentLabel: z.string().default("now"),
  items: z.array(experienceItemSchema),
});
export type ExperienceConfig = z.infer<typeof experienceSchema>;

/* --------------------------------- contact --------------------------------- */

export const contactSchema = z.object({
  _readme: readme,
  label: z.string(),
  heading: z.string(),
  blurb: z.string(),
  form: z.object({
    commandLine: z.string(),
    commandComment: z.string(),
    nameLabel: z.string(),
    namePlaceholder: z.string(),
    emailLabel: z.string().default("your email"),
    emailPlaceholder: z.string().default("ada@example.com"),
    messageLabel: z.string(),
    messagePlaceholder: z.string(),
    submitLabel: z.string(),
    /** `{{name}}` is replaced with the visitor's name. */
    subjectTemplate: z.string(),
    sentMessage: z.string(),
    errorMessage: z.string(),
  }),
});
export type ContactConfig = z.infer<typeof contactSchema>;

/* -------------------------------- assistant -------------------------------- */

export const faqSchema = z.object({
  /** Keywords/phrases matched (case-insensitively) against the visitor's message. */
  intents: z.array(z.string()).min(1),
  question: z.string(),
  answer: z.string(),
});
export type Faq = z.infer<typeof faqSchema>;

export const assistantSchema = z.object({
  _readme: readme,
  enabled: z.boolean().default(true),
  label: z.string(),
  heading: z.string(),
  description: z.string(),
  assistantName: z.string(),
  windowTitle: z.string(),
  badge: z.object({ demo: z.string(), live: z.string() }),
  disclaimer: z.object({ demo: z.string(), live: z.string() }),
  tryLabel: z.string(),
  inputPrompt: z.string().default("$"),
  inputPlaceholder: z.string(),
  inputAriaLabel: z.string(),
  logAriaLabel: z.string(),
  sendLabel: z.string(),
  sendAriaLabel: z.string(),
  launcher: z.object({ label: z.string(), ariaLabel: z.string() }),
  messageTags: z.object({ assistant: z.string(), user: z.string() }),
  greeting: z.string(),
  /**
   * System prompt for live mode. Supported placeholders:
   * {{assistantName}} {{knowledgeBase}} {{faqs}} {{contactHandoff}} {{fallbackMessage}}
   */
  systemPromptTemplate: z.string(),
  knowledgeBase: z.object({
    summary: z.string(),
    sections: z.array(z.object({ title: z.string(), content: z.string() })),
  }),
  faqs: z.array(faqSchema),
  suggestedQuestions: z.array(z.string()).min(1),
  fallbackMessage: z.string(),
  /** Shown in the chat when the per-IP rate limit is hit. */
  rateLimitMessage: z.string(),
  contactHandoff: z.string(),
});
export type AssistantConfig = z.infer<typeof assistantSchema>;

/* ------------------------------- full config ------------------------------- */

export interface AppConfig {
  site: SiteConfig;
  theme: ThemeConfig;
  hero: HeroConfig;
  about: AboutConfig;
  skills: SkillsConfig;
  projects: ProjectsConfig;
  experience: ExperienceConfig;
  contact: ContactConfig;
  assistant: AssistantConfig;
}

/** Runtime assistant mode, resolved server-side from env. */
export type AssistantMode = "demo" | "live";
