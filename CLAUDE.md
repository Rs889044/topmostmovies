# CLAUDE.md — topmostmovies.com

> Project context auto-loaded by Claude Code. Keep this current — it is the continuity
> anchor between sessions, alongside [docs/ROADMAP.md](docs/ROADMAP.md).

## What this is

**topmostmovies.com** — a fast, SEO-first movie discovery site that publishes curated
**"Top 10" movie lists** sliced across many dimensions. A single movie is one record and
can appear across many lists via tagging. Each movie also has a detail page (rating,
poster, age/parental info, and the lists it belongs to). Monetized with Google AdSense.

**Differentiation (this is the whole strategy):**
1. **Multi-dimensional tagging** → long-tail combos competitors ignore
   (e.g. "top 10 Korean romance movies 2024").
2. **Trustworthy parental / age info** — honest, never fabricated.

Goal: organic search traffic → AdSense revenue. **SEO, page speed, and original content
quality ARE the product.**

## List dimensions

Each generates "Top 10 …" pages: **Industry** (Hollywood, Bollywood…), **Country**
(South Korea, Japan…), **Language** (Korean, Hindi…), **Genre/category** (Romance,
Thriller, K-Drama, Horror…), **Year** (2026, 2011…), **Decade** (1980s, 1990s…).

## Stack

- **Astro 7** (static `output: 'static'`) — minimal JS, great Core Web Vitals, content
  collections, sitemap. **Use current Astro docs, not older v3/v4 patterns.**
- **TypeScript** throughout.
- **Tailwind CSS v4** via the **`@tailwindcss/vite`** plugin (NOT the deprecated
  `@astrojs/tailwind` integration). Global CSS uses `@import "tailwindcss";`.
- `@astrojs/sitemap`, Astro built-in `<Image>` for image optimization.
- **Deploy: Cloudflare Pages** (static, CI/CD from GitHub). Keep build host-agnostic.

## Data-source rules (NON-NEGOTIABLE — never change without asking the user)

- **NEVER scrape IMDb** (ToS violation + legal/AdSense risk). No scraping of any kind for
  detailed parental guides.
- **TMDb API = primary**: posters, backdrops, genres, release dates, popularity,
  **certifications/age ratings per country**. Footer attribution REQUIRED:
  *"This product uses the TMDb API but is not endorsed or certified by TMDb."*
- **OMDb API = supplementary**: the **IMDb rating number** (optionally RT / Metacritic).
- **Fetch at BUILD TIME, cache to local JSON, generate static pages.** Never call these
  APIs per request. Throttle + retry; respect rate limits.
- **Parental data:** surface official **age certification** (PG-13, R, U/A…) from TMDb +
  any descriptors, plus an optional **editorial `parentalNotes`** field. If missing, show
  "Not rated / data unavailable" — **NEVER fabricate ratings or parental details.**
- Keys live in `.env` (git-ignored). **Never hardcode or commit keys.** See
  [.env.example](.env.example).

## Monetization / legal (AdSense readiness from day one)

- Original-content layer everywhere: list pages get an original intro + a per-movie "why
  it made the list" blurb; movie pages get an original summary.
- Ship **Privacy Policy, About, Contact**, a **cookie-consent banner** (GDPR/CCPA) gating
  non-essential/ad cookies, an **`ads.txt`**, clean crawlable nav.
- Ad slots = reusable components with placeholder zones; reserve space (no CLS). **No live
  ad or analytics code until the user provides AdSense publisher ID / GA ID.**

## Commands

```bash
npm run dev          # local dev server (astro dev)
npm run build        # static build → dist/
npm run preview      # preview the built site
npm run check        # astro check (type-check .astro + TS; run this — it catches what build won't)
npm run fetch-data   # build-time fetch of TMDb + OMDb → src/content/movies/*.json (scripts/)
npm run validate-seo # post-build SEO/JSON-LD validation over dist/ (scripts/)
```

> Node is pinned to 22 via `.nvmrc`; run `nvm use` first. **Catalog (~500 movies)** is built
> by `fetch-data` from `scripts/discovery-plan.ts` (TMDb discovery across all dimensions).
> `fetch-data` auto-re-applies hand-written editorial copy (`scripts/apply-editorial.ts`,
> 12 flagship titles). Non-flagship synopses are original metadata blurbs from
> `scripts/generate-blurbs.ts` (run after fetch; marked `synopsisAuto`). List intros:
> `scripts/generate-list-intros.ts`.
> Agent skills (web-design-guidelines, astro) live in `.agents/` (git-ignored; re-install
> from `skills-lock.json`).

> **Node version note:** Astro requires Node **v22.12+ (even LTS)**; odd versions (v23/v25)
> are unsupported. Confirm the runtime before relying on `dev`/`build`.

## Conventions

- URLs are clean and keyword-friendly: `/industry/[slug]`, `/country/[slug]`,
  `/language/[slug]`, `/genre/[slug]`, `/year/[year]`, `/decade/[slug]`, `/movie/[slug]`.
- One `<h1>` per page; semantic HTML; logical heading order.
- All pages set metadata via the shared `<Seo>` component; interior pages use
  `<Breadcrumbs>`. JSON-LD per page type (see [docs/SEO.md](docs/SEO.md)).
- Movie data validated at build time via content collections + Zod
  (see [docs/DATA-MODEL.md](docs/DATA-MODEL.md)).
- **Blog:** original editorial in `src/content/blog/*.md` (`blog` collection) → `/blog` +
  `/blog/[slug]`. Posts internal-link into lists/movies via `linkedLists` + `linkedMovies`
  frontmatter (resolved by `src/lib/blog.ts`); `BlogPostLayout` adds those link blocks +
  `BlogPosting` JSON-LD. Add a post by dropping a `.md` file — no script needed.
- Small, reviewable commits. Push to GitHub regularly. Ask before any new dependency,
  major architectural change, or deviation from the data-source rules.

## Docs (source of truth — cross-linked, keep focused)

- [docs/PRD.md](docs/PRD.md) — product requirements, page types, success metrics.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — folders, build flow, routing, decisions + why.
- [docs/DATA-MODEL.md](docs/DATA-MODEL.md) — movie schema, tagging, ranking, slugs.
- [docs/DATA-SOURCES.md](docs/DATA-SOURCES.md) — TMDb/OMDb usage, attribution, limits.
- [docs/SEO.md](docs/SEO.md) — SEO conventions + per-page checklist.
- [docs/ADSENSE.md](docs/ADSENSE.md) — monetization-readiness + launch gating.
- [docs/OPERATIONS.md](docs/OPERATIONS.md) — go-live runbook: domain, deploy, GA, Search
  Console, AdSense + revenue tracking, with user-vs-me action items.
- [docs/GROWTH.md](docs/GROWTH.md) — traffic playbook: promotion channels, backlinks,
  weekly routine to reach the AdSense traffic threshold.
- [docs/CONTENT-GUIDELINES.md](docs/CONTENT-GUIDELINES.md) — how original copy is written.
- [docs/BLOG-GUIDELINES.md](docs/BLOG-GUIDELINES.md) — how to write a blog post (rules,
  template, SEO + performance gates). Template: `src/content/blog/_TEMPLATE.md`.
- [docs/KEYWORDS.md](docs/KEYWORDS.md) — target keywords + PAA questions per category.
- [docs/ROADMAP.md](docs/ROADMAP.md) — phased plan + live status checklist (update each session).
