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

/**
 * A picture attached to any section. `src` is a root-relative path under
 * ./public; the config loader drops entries whose file is not there, so a
 * placeholder can sit in config until the real photo exists.
 */
export const mediaItemSchema = z.object({
  src: z.string(),
  /** Describe what the picture shows, not that it is a picture. */
  alt: z.string(),
  caption: z.string().default(""),
  /** CSS aspect-ratio, e.g. "4/3" for photos or "9/16" for phone shots. */
  aspect: z.string().default("4/3"),
});
export type MediaItem = z.infer<typeof mediaItemSchema>;

/** Copy for the full-size viewer, shared by every section that opens one. */
export const lightboxSchema = z.object({
  closeLabel: z.string().default("close"),
  prevLabel: z.string().default("previous"),
  nextLabel: z.string().default("next"),
  /** `{i}` = 1-based position, `{n}` = total. */
  counterTemplate: z.string().default("{i}/{n}"),
  hint: z.string().default("← → navigate · esc close"),
  visitLabel: z.string().default("open live"),
});
export type LightboxConfig = z.infer<typeof lightboxSchema>;

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
  "proof",
  "experience",
  "education",
  "certifications",
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

/** Social / search metadata. All optional with sensible defaults. */
export const seoSchema = z
  .object({
    /** Open Graph / Twitter card image. Root-relative or absolute URL. 1200×630. */
    image: z.string().default("/og.png"),
    /** Accessible description of the card image. Falls back to the page title. */
    imageAlt: z.string().default(""),
    /** e.g. "@yourhandle" — enables twitter:site / twitter:creator when set. */
    twitterHandle: z.string().optional(),
    /** Optional keyword hints (low SEO weight, but harmless). */
    keywords: z.array(z.string()).default([]),
  })
  .default({});
export type SeoMeta = z.infer<typeof seoSchema>;

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
  seo: seoSchema,
  socials: z.array(socialSchema),
  resume: z.object({ label: z.string(), href: z.string() }),
  nav: z.array(navItemSchema),
  footer: z.object({ note: z.string(), copyright: z.string() }),
  /** One viewer, one set of labels, wherever a picture opens full size. */
  lightbox: lightboxSchema.default({}),
  /** Interface strings that belong to no single section. */
  a11y: z
    .object({
      skipToContentLabel: z.string().default("skip to content"),
      mainLandmarkLabel: z.string().default("Main content"),
      scrollProgressLabel: z.string().default("Reading progress"),
    })
    .default({}),
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
  /**
   * Visual weight, not ordering. `flagship` gets a full-width card, `standard`
   * a card in the grid, `compact` a single expandable row. Keep flagships to
   * two or three: the point of the tier is that most projects are not one.
   */
  tier: z.enum(["flagship", "standard", "compact"]).default("standard"),
  /**
   * Optional screenshot shown at the top of the card. Root-relative path under
   * ./public — dropped automatically by the loader when the file is absent, so
   * a card never renders a broken image.
   */
  image: z.string().optional(),
  imageAlt: z.string().optional(),
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

/* ---------------------------------- proof ---------------------------------- */

export const proofItemSchema = z.object({
  id: z.string(),
  /** Root-relative path under ./public, e.g. "/proof/usapp-home.png". */
  src: z.string(),
  /** Describe what the picture shows, not that it is a picture. */
  alt: z.string(),
  /** Rendered in the tile's title bar, so keep it filename-shaped. */
  title: z.string(),
  caption: z.string(),
  /** Filter category — free text, the section derives the chip list from it. */
  category: z.string(),
  /** Verifiable one-liner under the caption: capture date, host, environment. */
  meta: z.string().default(""),
  /** Optional link to the running system this was captured from. */
  href: z.string().optional(),
  /** CSS aspect-ratio for the frame, e.g. "16/10" or "9/16" for phone shots. */
  aspect: z.string().default("16/10"),
});
export type ProofItem = z.infer<typeof proofItemSchema>;

export const proofSchema = z.object({
  _readme: readme,
  label: z.string(),
  heading: z.string(),
  blurb: z.string(),
  /** Terminal line above the grid. `{n}` is replaced with the item count. */
  commandLine: z.string().default("$ ls -la ~/proof/"),
  showFilters: z.boolean().default(true),
  filterAllLabel: z.string().default("all"),
  filterGroupLabel: z.string().default("Filter evidence by kind"),
  /** Accessible name for a tile button. `{title}` is replaced. */
  openLabelTemplate: z.string().default("Open {title} full size"),
  items: z.array(proofItemSchema),
});
export type ProofConfig = z.infer<typeof proofSchema>;

/* -------------------------------- experience ------------------------------- */

export const experienceItemSchema = z.object({
  company: z.string(),
  title: z.string(),
  start: z.string(),
  /** null / omitted = current role (rendered with `presentLabel` in accent). */
  end: z.string().nullable().default(null),
  bullets: z.array(z.string()),
  /** Photos from this role. The strip hides itself when none of them exist. */
  photos: z.array(mediaItemSchema).default([]),
});
export type ExperienceItem = z.infer<typeof experienceItemSchema>;

export const experienceSchema = z.object({
  _readme: readme,
  label: z.string(),
  heading: z.string(),
  presentLabel: z.string().default("now"),
  /** Accessible name for a role's photo strip. `{name}` = the company. */
  photosLabelTemplate: z.string().default("Photos from {name}"),
  items: z.array(experienceItemSchema),
});
export type ExperienceConfig = z.infer<typeof experienceSchema>;

/* -------------------------------- education -------------------------------- */

export const educationItemSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  start: z.string(),
  /** null / omitted = ongoing (rendered with `presentLabel` in accent). */
  end: z.string().nullable().default(null),
  /** Optional one-line note, e.g. a shift of program or an honour. */
  note: z.string().optional(),
  /** Graduation and campus photos. Same strip as the experience timeline. */
  photos: z.array(mediaItemSchema).default([]),
});
export type EducationItem = z.infer<typeof educationItemSchema>;

export const educationSchema = z.object({
  _readme: readme,
  label: z.string(),
  heading: z.string(),
  presentLabel: z.string().default("now"),
  /** Accessible name for an entry's photo strip. `{name}` = the institution. */
  photosLabelTemplate: z.string().default("Photos from {name}"),
  items: z.array(educationItemSchema),
});
export type EducationConfig = z.infer<typeof educationSchema>;

/* ----------------------------- certifications ------------------------------ */

export const certificationSchema = z.object({
  id: z.string(),
  name: z.string(),
  issuer: z.string(),
  /** Free-form so "2025", "Mar 2025" and "2025-03" all work. */
  issued: z.string(),
  /** null / omitted = the credential does not expire. */
  expires: z.string().nullable().default(null),
  /** Printed verbatim as the credential's checksum line. */
  credentialId: z.string().optional(),
  /** Public verification URL from the issuer. Drives the "verified" chip. */
  verifyUrl: z.string().optional(),
  /** Badge or certificate scan under ./public. Dropped if the file is absent. */
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  /** What the credential actually covers. */
  skills: z.array(z.string()).default([]),
});
export type Certification = z.infer<typeof certificationSchema>;

export const certificationsSchema = z.object({
  _readme: readme,
  label: z.string(),
  heading: z.string(),
  blurb: z.string(),
  issuedLabel: z.string().default("issued"),
  expiresLabel: z.string().default("expires"),
  neverExpiresLabel: z.string().default("no expiry"),
  credentialLabel: z.string().default("id"),
  verifyLabel: z.string().default("verify"),
  /** Chip shown when the entry carries a public verification URL. */
  verifiedLabel: z.string().default("verifiable"),
  items: z.array(certificationSchema),
});
export type CertificationsConfig = z.infer<typeof certificationsSchema>;

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
    /** Button label while a message is sending. */
    sendingLabel: z.string().default("sending…"),
    /** Shown on the button during the post-send cooldown. `{s}` = seconds left. */
    cooldownLabel: z.string().default("wait {s}s"),
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
  proof: ProofConfig;
  experience: ExperienceConfig;
  education: EducationConfig;
  certifications: CertificationsConfig;
  contact: ContactConfig;
  assistant: AssistantConfig;
}

/** Runtime assistant mode, resolved server-side from env. */
export type AssistantMode = "demo" | "live";
