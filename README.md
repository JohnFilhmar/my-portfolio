# Terminal Portfolio — config-driven Next.js

A production-quality personal portfolio with a dark, terminal-inspired aesthetic.
**Fully data-driven**: every piece of content, every section, and the entire visual
theme lives in JSON under [`./config`](./config) — reshape the site by editing
config, never by rewriting components.

Built with **Next.js (Pages Router) + TypeScript (strict) + Tailwind CSS + zod**,
server-side rendered on every request so config edits show up on refresh with no
rebuild. Ships with an **AI assistant** that works out of the box with zero
configuration (demo mode) and upgrades to a live LLM by setting one API key.

The visual spec lives at [`design/reference.html`](design/reference.html); the site
re-implements it as modular, token-driven components.

---

## Quick start

```bash
pnpm install
pnpm dev          # http://localhost:3001 — no env vars needed
```

That's it. The assistant answers in **demo mode** (server-side intent matching over
`config/assistant.json`) with no API key.

### Scripts

| Script           | What it does                  |
| ---------------- | ----------------------------- |
| `pnpm dev`       | Dev server                    |
| `pnpm build`     | Production build              |
| `pnpm start`     | Serve the production build    |
| `pnpm lint`      | ESLint (next/core-web-vitals) |
| `pnpm typecheck` | `tsc --noEmit` (strict)       |
| `pnpm format`    | Prettier over the repo        |

---

## How it works

```
config/*.json ──► loadConfig() [zod-validated] ──► getServerSideProps (per request)
                                 │
                 ┌───────────────┴──────────────────┐
                 ▼                                  ▼
        <ThemeTokens/> emits                <SectionRenderer/> maps
        theme.json as CSS vars              sections[] registry → components
        (Tailwind classes reference         (each component gets only its
         var(--…), never raw values)         typed slice of config)
```

- **SSR per request** — `pages/index.tsx` calls `loadConfig()` in
  `getServerSideProps`; editing any JSON file and refreshing reflects immediately.
- **Fail loudly** — invalid config throws a descriptive error (file + zod issues)
  instead of rendering something half-broken.
- **Tokens → Tailwind + CSS vars** — `tailwind.config.ts` maps token _names_ to
  `var(--…)` references; `src/lib/theme.ts` emits token _values_ on `:root` at
  request time. Editing `config/theme.json` restyles the whole site on refresh.

## Editing the config files

Every file ships with clearly-marked placeholder content (`_readme` key at the top
of each file). Replace it with your own story.

| File                              | Owns                                                                                                                                                                                                            |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `config/site.json`                | Name, prompt (`user@host`), role, tagline, SEO description, site URL, locale, email, socials, résumé link, nav, footer, command-palette copy, **the `sections` registry**                                       |
| `config/theme.json`               | All design tokens: colors, font stacks, font sizes, spacing, radii, shadows, motion durations/easings, typing speeds, terminal specifics (cursor/prompt colors, `grid`/`scanlines`/`none` texture, accent glow) |
| `config/sections/hero.json`       | Prompt line, CTAs, status line, boot-sequence lines (the typed tagline comes from `site.json`)                                                                                                                  |
| `config/sections/about.json`      | Heading, paragraphs (supports `**bold**` / `*italic*`), philosophy line, `$ whoami` terminal card                                                                                                               |
| `config/sections/skills.json`     | Skill groups; `level` (1–5) at or above `coreLevel` renders as a core strength (`▸`, accent styling)                                                                                                            |
| `config/sections/projects.json`   | Project items (`domain` + `secondaryDomains` drive the filters), case-study labels, link labels                                                                                                                 |
| `config/sections/experience.json` | Roles; `"end": null` marks the current role                                                                                                                                                                     |
| `config/sections/contact.json`    | Contact copy + form labels/placeholders/messages                                                                                                                                                                |
| `config/assistant.json`           | Assistant name/copy, greeting, suggested questions, disclaimer, **FAQs (demo mode)**, **knowledge base + system prompt template (live mode)**, fallback message                                                 |

Text in terminal-style blocks uses named **tones** instead of colors
(`default | bright | heading | prose | muted | subtle | faint | dim | ghost | accent`)
— they map to theme tokens, so content JSON never contains raw colors.

A few field notes: projects marked `"featured": true` are ordered first in the
unfiltered ("all") view; `socials[].icon` and `skills[].tags` are validated,
reserved metadata fields (available to custom components, not rendered by the
defaults); disabling a section automatically hides its nav/footer links.

### Reordering / toggling sections

`site.json → sections` is the registry:

```json
{ "type": "projects", "enabled": true, "id": "work" }
```

Reorder the array to reorder the page; set `enabled: false` to drop a section
(numbering like `01 // about` renumbers automatically); `id` overrides the anchor
(`#work`) used by nav links.

### Adding a new section type

1. Add a JSON slice under `config/sections/your-section.json`.
2. Add its zod schema + type in `config/schema.ts` (and the type name to
   `sectionTypeSchema`), wire it into `loadConfig()` in `config/index.ts`.
3. Build the component under `src/components/sections/` — it should take only its
   typed slice of config as props.
4. Register it in the `switch` inside `src/components/sections/SectionRenderer.tsx`
   and add an entry to `site.json → sections`.

### Theming

`config/theme.json` is emitted as CSS custom properties on `:root` per request and
mapped into Tailwind (`tailwind.config.ts`). Light colors live in `palettes.light` and
dark ones in `palettes.dark`; the header toggle switches between them and remembers the
choice. Change `palettes.light.accent` and refresh, and the light theme follows,
including the derived tints like tag borders that `src/lib/theme.ts` computes. `terminal.texture` switches the page backdrop between
`grid`, `scanlines`, and `none`.

**Fonts:** IBM Plex Sans/Mono are self-hosted via `next/font/local`
(`src/fonts/*.woff2`, OFL-licensed — see `src/fonts/LICENSE-OFL.txt`); no external
font requests at build or runtime. To swap families, replace the files referenced in
`src/lib/fonts.ts` and update the fallback stacks in `theme.json → fonts`.

---

## The AI assistant

One API route — `POST /api/assistant` — serves both modes; the client never changes.

- **Demo mode** (default, zero config): answers come from `config/assistant.json →
faqs` via keyword intent matching (`src/lib/assistant.ts`), with a graceful
  `fallbackMessage` when nothing matches. Never returns an empty reply.
- **Live mode**: set `LLM_API_KEY` and the same route builds
  `[system, …history, user]` from `systemPromptTemplate` + `knowledgeBase` and
  streams the reply from the LLM. The response header `X-Assistant-Mode` reports
  which path served each reply, and the UI badge/disclaimer follow suit.

```bash
# .env.local — switch demo → live with no code changes
LLM_PROVIDER=anthropic
LLM_API_KEY=sk-ant-…
LLM_MODEL=claude-opus-4-8   # optional; this is the default
ASSISTANT_MODE=auto         # auto | demo | live
```

Mode logic: `live` requires a key (missing key = loud 500, not silent demo);
`demo` forces demo; `auto` picks live iff a key is present.

### Swapping the LLM provider

`src/lib/llm/` defines a small adapter interface:

```ts
interface LLMProvider {
  name: string;
  stream(options: LLMStreamOptions): AsyncGenerator<string>;
}
```

The default adapter targets Anthropic via the official SDK with streaming
(`src/lib/llm/anthropic.ts`). To add another provider, implement the interface in a
sibling module, add a case in `src/lib/llm/index.ts`, and set `LLM_PROVIDER`.

### Rate limiting

`/api/assistant` and `/api/contact` are rate-limited per IP
(`ASSISTANT_RATE_LIMIT`, default 20 req/min) via an in-memory sliding window.
Note: on serverless platforms with many concurrent instances the window is
per-instance — front it with your platform's rate limiting for hard guarantees.

---

## Contact form

Zero-config default: the form composes a `mailto:` link (no server involved), like
the design prototype. Set `CONTACT_ENDPOINT=https://…` to have the form POST
`{ name, message }` through `/api/contact` (the endpoint URL stays server-side)
instead — remember to update `contact.json → form.commandComment` copy if you do.

## Environment variables

See [`.env.example`](.env.example). All server-side secrets are read through a typed
accessor (`src/lib/env.ts`) — never with a `NEXT_PUBLIC_` prefix — and misconfiguration
fails with a clear message.

## Accessibility & motion

Semantic HTML, keyboard-operable palette/filters/chat, visible focus rings, labeled
form fields, `role="log"`/`aria-live` chat, and full `prefers-reduced-motion`
support: every animation (boot sequence, typed tagline, chat typing, reveal-on-scroll,
smooth scrolling, blinking cursors) has a static fallback.

## Deployment

Any Node host or Vercel:

```bash
pnpm build && pnpm start
```

The `config/` directory is read at runtime — keep it deployed alongside the app
(it is by default; SSR reads it per request from the project root).

## Project structure

```
config/                 # JSON content + zod schema + typed loader (the source of truth)
design/reference.html   # the visual spec this site re-implements
src/
  components/ui         # primitives: Button, Tag, Card, TerminalWindow, TypedText, Cursor, …
  components/layout     # Container, Section, Header, Footer, Seo, ThemeTokens, CommandPalette
  components/sections   # Hero, About, Skills, Projects, Experience, Contact + SectionRenderer
  components/assistant  # AssistantSection, ChatWindow, MessageList, ChatInput, chips, launcher
  hooks/                # useAssistant, useBootSequence, useTypewriter, useScrollSpy, useReveal, …
  lib/                  # theme (tokens→CSS vars), llm adapters, assistant matching, env, rate limit
  styles/               # globals.css (Tailwind layers + keyframes + reduced-motion)
pages/                  # _app, _document, index (SSR), api/assistant, api/contact, robots, sitemap
```
