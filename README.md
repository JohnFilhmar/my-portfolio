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
npm ci
npm run dev          # http://localhost:3001, no env vars needed
```

That's it. The assistant answers in **demo mode** (server-side intent matching over
`config/assistant.json`) with no API key.

### Scripts

| Script                                 | What it does                                                  |
| -------------------------------------- | ------------------------------------------------------------- |
| `npm run dev`                          | Dev server                                                    |
| `npm run build`                        | Production build                                              |
| `npm start`                            | Serve the production build                                    |
| `npm run lint`                         | ESLint (next/core-web-vitals)                                 |
| `npm run typecheck`                    | `tsc --noEmit` (strict)                                       |
| `npm run format`                       | Prettier over the repo                                        |
| `npm test`                             | Unit tests (node:test)                                        |
| `npm run images`                       | Originals in `assets/` to WebP in `public/`                   |
| `npm run sample:seed` / `sample:clean` | Fill every empty slot with labelled samples, then remove them |

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

### Images

Put originals (phone photos, screenshots, a transparent PNG of yourself) in
`assets/` at the path the config names, then run `npm run images`. It writes a WebP
copy to the same path under `public/`, turned upright from the phone's EXIF
orientation, capped at 1920px on the long edge, with camera and GPS metadata
removed. `assets/photos/team.jpg` becomes `public/photos/team.webp`, so the config
points at `/photos/team.webp`. `assets/` stays out of git and the Docker image; the
WebP copies are what ship. Restart the server after adding images.

### Sample content

`npm run sample:seed` fills every empty slot with pictures and entries stamped
`SAMPLE`: portraits (including an opaque, non-square one), case-study shots,
evidence, timeline photos, credentials and notes, a few deliberately off their
slot's ratio. Use it to check layouts before the real assets exist.
`npm run sample:clean` removes exactly what seed wrote. A file you replaced while
seeded is kept, and an edited `certifications.json` keeps its original in
`.sample-content/` instead of being overwritten. Never commit while seeded.

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

`.github/workflows/pipeline.yml` runs on every PR and every push to `master`.

| Stage      | Runs on                          | What happens                                                                                                                                        |
| ---------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Checks     | GitHub                           | Lint, typecheck, unit tests, build, and a refusal if `sample:seed` content is committed                                                             |
| Scans      | GitHub                           | Secrets (gitleaks, full history), code (Semgrep), dependencies and config (Trivy)                                                                   |
| Image      | GitHub, `master` only            | Build, push to GHCR with an SBOM and provenance, scan the image (Trivy), then sign the digest (cosign, keyless)                                     |
| Staging    | Your server, automatic           | Verify the signature, start the image on `127.0.0.1:3101` in demo mode, smoke test, ZAP baseline scan, stop it                                      |
| Production | Your server, after your approval | The same digest on `127.0.0.1:3001` behind the host nginx; rolls back by itself if the healthcheck never passes; smoke tests https://filhmar.online |

Any HIGH or CRITICAL finding, and any ZAP warning not explained in
`deploy/zap-rules.tsv`, stops the run. `docker-compose.yml` still builds the
image locally for testing; the server only ever runs signed images.

### One-time server setup

1. **Packages.** Docker Engine with the compose plugin, `curl`, `sops` and
   `age`. The jobs install cosign themselves.
2. **Runner.** Create a dedicated user in the `docker` group (that group is
   root-equivalent, so the user runs nothing else). In GitHub: Settings →
   Actions → Runners → New self-hosted runner → Linux, and follow the steps
   as that user, adding `--labels portfolio` to `./config.sh`. Install it as a
   service with `sudo ./svc.sh install <user> && sudo ./svc.sh start`. Keep
   the repo private while this runner is attached: on a public repo, a pull
   request from a fork could run code on your server.
3. **Environments.** Settings → Environments: create `staging` with no rules,
   and `production` with yourself as required reviewer and deployments
   limited to `master`. That approval is the manual gate.
4. **Production secrets.** As the runner user on the server, run
   `age-keygen -o ~/.config/sops/age/keys.txt` and note the public key it
   prints. On your machine, encrypt the production env file to that key (add
   your own age public key too, so you can edit it later):

   ```bash
   sops --encrypt --age <server-key>,<your-key> \
     --input-type dotenv --output-type dotenv \
     .env.production > deploy/env/production.env.enc
   ```

   Commit only the `.enc` file. The deploy decrypts it into a private temp
   file that lives for the length of the deploy. Variables the app reads:
   `ASSISTANT_MODE`, `LLM_PROVIDER`, `LLM_API_KEY`, `LLM_MODEL`,
   `ASSISTANT_RATE_LIMIT`, `ASSISTANT_LLM_QUOTA`, `ASSISTANT_DAILY_LLM_CAP`,
   `NEXT_PUBLIC_SITE_URL`, `CONTACT_ENDPOINT`, `SMTP_HOST`, `SMTP_PORT`,
   `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_FROM`, `CONTACT_TO`.

5. **nginx.** In the live site file (certbot has rewritten it, so edit it
   rather than copying `docs/nginx/filhmar-production.conf` over it), replace
   the `Upgrade` and `Connection "upgrade"` lines with
   `proxy_set_header Connection "";`, then `sudo nginx -t && sudo systemctl
reload nginx`. The site uses no WebSockets, and forwarding `Upgrade` lets
   a client tunnel past the proxy (h2c smuggling).

### First deploy

The old container still holds `127.0.0.1:3001`, and the deploy refuses to
take over a port it did not start. Approve the production job only after
stopping it (`docker compose down` in its directory, or `docker stop` on the
container). The site is down only between that stop and the new start.

### Rollback

- **Automatic:** if the new image never turns healthy, the previous one is
  started again and the job fails.
- **By hand:** open an older successful pipeline run and re-run its
  Production job; it redeploys that run's signed digest. Every production
  deploy is listed in `~/portfolio-deploys.log` on the server.

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
