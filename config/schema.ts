import { z } from "zod";
import type { NotesConfig } from "./notesSchema";

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
 * ./public. Timeline photo strips drop entries whose file is not there; slots
 * that should stay visible until the real picture lands (project covers and
 * screens, the about portrait) keep the entry and render a placeholder.
 */
export const mediaItemSchema = z.object({
  src: z.string(),
  /** Describe what the picture shows, not that it is a picture. */
  alt: z.string(),
  caption: z.string().default(""),
  /** CSS aspect-ratio, e.g. "4/3" for photos or "9/16" for phone shots. */
  aspect: z.string().default("4/3"),
  /** Set by the config loader when `src` has no file in ./public. Never authored. */
  missing: z.boolean().default(false),
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

/** One theme's colors. Light and dark each declare the full set. */
export const colorSetSchema = z.object({
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
  /** Live-status marks only. Never text, so it is exempt from text contrast. */
  signal: z.string(),
  success: z.string(),
  warning: z.string(),
  danger: z.string(),
  /** Neutral hover tint for nav links / palette rows. */
  hoverTint: z.string(),
  /** Modal backdrop veil (command palette overlay). */
  overlay: z.string(),
  /** Input, toggle and chip outlines. Holds 3:1 against every surface. */
  controlBorder: z.string(),
});
export type ColorSet = z.infer<typeof colorSetSchema>;

export const themeSchema = z.object({
  _readme: readme,
  /** Light is the default; dark applies by system preference or the toggle. */
  palettes: z.object({
    light: colorSetSchema,
    dark: colorSetSchema,
  }),
  fonts: z.object({
    /** Headings and the hero index only; used with restraint. */
    display: z.string(),
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
      chatCharsPerTick: z.number().int().positive(),
      chatTickMs: z.number().int().positive(),
      chatReplyDelayMs: z.number().int().nonnegative(),
    }),
  }),
  media: z.object({
    /** CSS filter that tones the hero portrait into the palette's blue. */
    portraitTint: z.string(),
  }),
  terminal: z.object({
    texture: z.enum(["grid", "scanlines", "none"]).default("grid"),
    textureLine: z.string(),
    /** Line color for the `scanlines` texture (darker than the grid line). */
    scanlineColor: z.string(),
    textureSize: z.string(),
    glow: z.boolean().default(true),
    /** Interactive dot field behind the page (pointer and click aware). */
    ambient: z.boolean().default(true),
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
  "notes",
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
  .prefault({});
export type SeoMeta = z.infer<typeof seoSchema>;

export const siteSchema = z.object({
  _readme: readme,
  name: z.string(),
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
  lightbox: lightboxSchema.prefault({}),
  /** Interface strings that belong to no single section. */
  /** Status chip in the header, e.g. "Open to work" linking to #contact. */
  availability: z.object({ label: z.string(), href: z.string() }).optional(),
  a11y: z
    .object({
      skipToContentLabel: z.string().default("skip to content"),
      mainLandmarkLabel: z.string().default("Main content"),
      scrollProgressLabel: z.string().default("Reading progress"),
      themeToggleLabel: z.string().default("Dark theme"),
      menuLabel: z.string().default("Menu"),
      menuCloseLabel: z.string().default("Close"),
    })
    .prefault({}),
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

export const projectStatusSchema = z.enum([
  "live",
  "in-development",
  "completed",
  "beta",
]);
export type ProjectStatus = z.infer<typeof projectStatusSchema>;

export const heroSchema = z.object({
  _readme: readme,
  /** The page's h1: what you do, in one sentence. */
  headline: z.string(),
  ctas: z.array(ctaSchema),
  /** Line under the headline: current role, location, availability. */
  statusLine: z.array(spanSchema),
  /** The big photo beside the headline. Clicking it shows the next one. */
  portrait: z.object({
    alt: z.string(),
    cycleLabel: z.string().default("Show the next photo"),
    /** Placeholder text until a photo lands in public/portrait. */
    emptyLabel: z.string().default("portrait"),
    /** How many placeholder photos to cycle through while none exist. */
    placeholderCount: z.number().int().min(1).max(9).default(3),
    /** Filled by the loader: every image in public/portrait, by file name. */
    images: z.array(z.string()).default([]),
  }),
  /** Heading over the index of flagship projects. */
  indexLabel: z.string(),
  /** Shown under an in-development system's status. `{date}` is replaced. */
  plannedReleaseTemplate: z.string().default("release planned {date}"),
  /** Visible text for each project `status` in the index. */
  statusLabels: z
    .object({
      live: z.string().default("live"),
      "in-development": z.string().default("in development"),
      completed: z.string().default("completed"),
      beta: z.string().default("closed beta"),
    })
    .prefault({}),
});
export type HeroConfig = z.infer<typeof heroSchema>;

/* ---------------------------------- about ---------------------------------- */

export const aboutSchema = z.object({
  _readme: readme,
  label: z.string(),
  heading: z.string(),
  /** Supports minimal inline markup: **bold** and *italic*. */
  paragraphs: z.array(z.string()),
  /** Square photo of you, ideally a transparent PNG cut-out. */
  portrait: mediaItemSchema.optional(),
  /** Lead-in for the one-line education summary built from education.json. */
  educationLabel: z.string().default("education"),
});
export type AboutConfig = z.infer<typeof aboutSchema>;

/* ---------------------------------- skills --------------------------------- */

export const skillSchema = z.object({
  name: z.string(),
  /** 1–5. Skills at or above the group file's `coreLevel` get the core-strength treatment. */
  level: z.number().int().min(1).max(5).optional(),
  tags: z.array(z.string()).optional(),
  /** Short evidence shown with the skill, e.g. "12 repos" or "at YouCode". */
  note: z.string().optional(),
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
  /** Heading over the soft skills. */
  softHeading: z.string().default("How I work"),
  /** Soft skills, each with the concrete evidence behind it. */
  soft: z
    .array(z.object({ name: z.string(), evidence: z.string() }))
    .default([]),
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
  links: projectLinksSchema.prefault({}),
  domain: z.string(),
  secondaryDomains: z.array(z.string()).default([]),
  /**
   * Visual weight, not ordering. `flagship` gets a row in the hero index and
   * its own case-study page at /work/<id>, `standard` a card in the grid,
   * `compact` a single expandable row. Keep flagships to two or three: the
   * point of the tier is that most projects are not one.
   */
  tier: z.enum(["flagship", "standard", "compact"]).default("standard"),
  /** Where the system stands today. Shown beside it in the hero index. */
  status: projectStatusSchema.optional(),
  /** What kind of work it was; shown as a badge on /projects. */
  context: z
    .enum([
      "production",
      "client",
      "personal",
      "assessment",
      "hackathon",
      "academic",
    ])
    .optional(),
  /** Details are limited by a non-disclosure agreement; shows an NDA badge. */
  nda: z.boolean().default(false),
  /**
   * Dates in the project's life, free-form like "Mar 2025". Each one shows
   * only when set, so fill them in as you have them.
   */
  timeline: z
    .object({
      /** First line of code. */
      started: z.string().optional(),
      /** First production release. */
      firstRelease: z.string().optional(),
      /** For work still in development. */
      plannedRelease: z.string().optional(),
      /** When active development stopped or the work was handed over. */
      ended: z.string().optional(),
    })
    .optional(),
  /** Lead picture for the top of the case study. */
  cover: mediaItemSchema.optional(),
  /**
   * Measured outcomes, e.g. `{ value: "1.2k", label: "daily messages" }`.
   * Nothing renders until at least one exists, so never pad it with guesses.
   */
  metrics: z
    .array(z.object({ value: z.string(), label: z.string() }))
    .default([]),
  /** Screens and diagrams shown on the case-study page. */
  shots: z.array(mediaItemSchema).default([]),
});
export type Project = z.infer<typeof projectSchema>;

export const projectsSchema = z.object({
  _readme: readme,
  label: z.string(),
  heading: z.string(),
  showFilters: z.boolean().default(true),
  filterAllLabel: z.string().default("all"),
  filterGroupLabel: z.string().default("Filter projects by domain"),
  resultsPrefix: z.string().default("▲ "),
  caseStudy: z.object({
    summaryLabel: z.string(),
    problemLabel: z.string(),
    roleLabel: z.string(),
    decisionsLabel: z.string(),
    stackLabel: z.string().default("stack"),
    resultsLabel: z.string().default("results"),
    evidenceLabel: z.string().default("evidence"),
    screensLabel: z.string().default("screens"),
    backLabel: z.string().default("← all work"),
    nextLabel: z.string().default("next case study"),
  }),
  linkLabels: z.object({
    demo: z.string().default("demo"),
    repo: z.string().default("repo"),
    writeup: z.string().default("write-up"),
  }),
  /** Copy for /projects, the page that lists everything not featured. */
  page: z
    .object({
      label: z.string().default("projects"),
      heading: z.string().default("Everything else I've built."),
      blurb: z.string().default(""),
      /** Link under the featured work on the home page. `{n}` = count. */
      allLinkTemplate: z.string().default("All other projects ({n}) →"),
      featuredHeading: z.string().default("Featured work"),
      caseStudyLabel: z.string().default("Read the case study →"),
      timelineLabels: z
        .object({
          started: z.string().default("first line of code"),
          firstRelease: z.string().default("in production"),
          plannedRelease: z.string().default("planned release"),
          ended: z.string().default("wrapped up"),
        })
        .prefault({}),
      /** Stands in for a date not supplied yet (placeholder mode only). */
      pendingDateLabel: z.string().default("date to come"),
      /** `{d}` = duration, e.g. "8 months". */
      durationTemplate: z.string().default("{d} from first code to production"),
      ndaLabel: z.string().default("NDA"),
      ndaNote: z
        .string()
        .default(
          "Built under a non-disclosure agreement, so internals stay private.",
        ),
      contextLabels: z
        .object({
          production: z.string().default("production"),
          client: z.string().default("client work"),
          personal: z.string().default("personal"),
          assessment: z.string().default("assessment"),
          hackathon: z.string().default("hackathon"),
          academic: z.string().default("academic"),
        })
        .prefault({}),
      galleryLabel: z.string().default("{title} images"),
    })
    .prefault({}),
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
  /** Rendered in the window title bar, so keep it filename-shaped. */
  title: z.string(),
  /** Short headline for the row. Name the thing, do not describe the picture. */
  caption: z.string(),
  /** One supporting sentence under the headline. */
  blurb: z.string().default(""),
  /** Filter category — free text, the section derives the chip list from it. */
  category: z.string(),
  /** Verifiable one-liner under the caption: capture date, host, environment. */
  meta: z.string().default(""),
  /** Optional link to the running system this was captured from. */
  href: z.string().optional(),
  /** CSS aspect-ratio for the frame, e.g. "16/10" or "9/16" for phone shots. */
  aspect: z.string().default("16/10"),
  /**
   * Flagship project id this capture proves. Bound captures appear on that
   * project's case study, with a placeholder until the file exists; unbound
   * ones stay in the home evidence section and only show once the file exists.
   */
  project: z.string().optional(),
  /**
   * More pictures of the same thing. With any, the row becomes an
   * auto-rotating carousel that starts with `src`.
   */
  gallery: z
    .array(
      z.object({
        src: z.string(),
        alt: z.string(),
        /** Set by the config loader. Never authored. */
        missing: z.boolean().default(false),
      }),
    )
    .default([]),
  /** Set by the config loader when `src` has no file in ./public. Never authored. */
  missing: z.boolean().default(false),
});
export type ProofItem = z.infer<typeof proofItemSchema>;

export const proofSchema = z.object({
  _readme: readme,
  label: z.string(),
  heading: z.string(),
  blurb: z.string(),
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
  /** Lets recommendations point at this role, e.g. "youcode". */
  id: z.string().optional(),
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
  /** null = the credential does not expire; omitted = no expiry line shown. */
  expires: z.string().nullable().optional(),
  /** Printed verbatim as the credential's checksum line. */
  credentialId: z.string().optional(),
  /** Public verification URL from the issuer. Drives the "verified" chip. */
  verifyUrl: z.string().optional(),
  /** Badge or certificate scan under ./public. Dropped if the file is absent. */
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  /** What the credential actually covers. */
  skills: z.array(z.string()).default([]),
  /** Set by the config loader from `expires`. Never authored. */
  expired: z.boolean().default(false),
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
  /** Shown after the expiry date once it has passed. */
  expiredLabel: z.string().default("expired"),
  credentialLabel: z.string().default("id"),
  verifyLabel: z.string().default("verify"),
  /** Chip shown when the entry carries a public verification URL. */
  verifiedLabel: z.string().default("verifiable"),
  /** Shown on /certifications while `items` is empty. */
  emptyMessage: z.string().default("No credentials listed yet."),
  filterLabel: z.string().default("Filter credentials by skill"),
  allSkillsLabel: z.string().default("all"),
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
  /** Reply to off-topic or instruction-injection messages, without a model call. */
  guardMessage: z
    .string()
    .default(
      "I can only answer questions about John's work, projects, experience, skills, education, credentials and availability.",
    ),
  /** Reply once a visitor's daily model answers are spent. `{limit}` is replaced. */
  quotaMessage: z
    .string()
    .default(
      "You've used the {limit} AI answers available per visitor today. Common questions still get instant answers, and you can always email John directly.",
    ),
  /** Counter under the chat. `{n}` is replaced with the answers left. */
  remainingTemplate: z.string().default("{n} AI answers left today"),
  closeLabel: z.string().default("Close the assistant"),
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
  notes: NotesConfig;
  recommendations: RecommendationsConfig;
  contact: ContactConfig;
  assistant: AssistantConfig;
}

/* ----------------------------- recommendations ----------------------------- */

export const recommendationSchema = z.object({
  id: z.string(),
  name: z.string(),
  /** Their title, e.g. "CTO" or "Barangay health worker". */
  role: z.string(),
  organization: z.string().optional(),
  relationship: z.enum(["employer", "colleague", "client", "end-user"]),
  quote: z.string(),
  /** Free-form, e.g. "Sep 2026". */
  date: z.string().optional(),
  /** Photo under ./public. Dropped if the file is absent; initials show instead. */
  photo: z.string().optional(),
  /** Where it can be checked, e.g. the LinkedIn recommendation. */
  sourceHref: z.string().optional(),
  /** Experience id from experience.json this is about, e.g. "youcode". */
  experience: z.string().optional(),
  /** Project id from projects.json this is about, e.g. "usapp". */
  project: z.string().optional(),
});
export type Recommendation = z.infer<typeof recommendationSchema>;

export const recommendationsSchema = z.object({
  _readme: readme,
  label: z.string(),
  heading: z.string(),
  blurb: z.string(),
  emptyMessage: z.string(),
  filterLabel: z.string().default("Filter recommendations by relationship"),
  allLabel: z.string().default("all"),
  relationshipLabels: z
    .object({
      employer: z.string().default("employer"),
      colleague: z.string().default("colleague"),
      client: z.string().default("client"),
      "end-user": z.string().default("end user"),
    })
    .prefault({}),
  /** Link text to what it is about. `{name}` = company or project. */
  aboutExperienceTemplate: z.string().default("at {name}"),
  aboutProjectTemplate: z.string().default("on {name}"),
  sourceLabel: z.string().default("verify"),
  /** Heading over recommendations shown on a project or case study. */
  linkedHeading: z.string().default("What people say"),
  items: z.array(recommendationSchema),
});
export type RecommendationsConfig = z.infer<typeof recommendationsSchema>;

/** Runtime assistant mode, resolved server-side from env. */
export type AssistantMode = "demo" | "live";
