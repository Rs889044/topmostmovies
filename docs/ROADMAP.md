# ROADMAP — topmostmovies.com

Phased plan with a **live status checklist**. **Update this at the end of every working
session** — it is the memory between sessions alongside [../CLAUDE.md](../CLAUDE.md).

Legend: 🔲 not started · 🟡 in progress · ✅ done · ⏸️ blocked/waiting on user

---

## Phase 0 — Docs & setup  ✅

- [x] `CLAUDE.md` + all `docs/` (PRD, ARCHITECTURE, DATA-MODEL, DATA-SOURCES, SEO,
      ADSENSE, CONTENT-GUIDELINES, KEYWORDS seed, ROADMAP)
- [x] Astro 7 + TypeScript scaffolded (`package.json`, `astro.config.mjs`, `tsconfig.json`,
      `src/styles/global.css`)
- [x] Tailwind v4 via `@tailwindcss/vite` wired
- [x] `@astrojs/sitemap` configured
- [x] `.env.example` + `.gitignore`
- [x] git repo initialized
- [x] Node 22 LTS via nvm (`.nvmrc`); dependencies installed; `build` verified ✅
- [x] User approved folder structure / routes / schema

> **Remaining open item for the user:**
> - TMDb + OMDb API keys (needed in Phase 2, not before).

---

## Phase 1 — Foundations  ✅

- [x] `BaseLayout.astro` (html shell, global.css, header/footer; consent mount in Phase 6)
- [x] Design tokens in `global.css` (brand color scale, font stack)
- [x] `Header.astro` + nav; `Footer.astro` **with TMDb attribution** (verified in build)
- [x] `Seo.astro` shared component (title/meta/canonical/OG/Twitter/JSON-LD)
- [x] `Breadcrumbs.astro` + `src/lib/jsonld.ts` (Breadcrumb/WebSite/Organization builders)
- [x] Placeholder pages: `/`, `/about`, `/contact`, `/privacy-policy`, `404`
      (thin placeholders ship `noindex` until real copy in Phase 6)

## Phase 2 — Data layer  ✅

- [x] Zod schema in `src/content.config.ts` (movies + lists/editorial overrides)
- [x] `src/lib/taxonomy.ts` (country/language/genre/industry slug maps + custom genres)
- [x] `scripts/lib/util.ts` (rate limiter, retry/backoff, on-disk cache, slugify)
- [x] `scripts/tmdb.ts` (Bearer/api_key, detail + **certifications** endpoint)
- [x] `scripts/omdb.ts` (IMDb rating; graceful degrade if key missing/invalid)
- [x] `scripts/fetch-data.ts` orchestrator + `scripts/seed-movies.ts`; `npm run fetch-data`
- [x] Seed set fetched: **19 movies** → `src/content/movies/*.json`, validated (build green)
- [x] Updated `DATA-SOURCES.md` / `DATA-MODEL.md` with specifics learned

> Movies stored as one JSON per movie under `src/content/movies/` (not a single
> `src/data/*.json`) — better fit for Astro's `glob()` content loader. Both APIs verified
> live. `synopsis`/`blurb`/`parentalNotes`/list overrides come in Phase 5.

## Phase 3 — Lists & tagging  ✅

- [x] `src/lib/movies.ts` (load/index collection) + `src/lib/lists.ts` (filter + rank,
      default sort, editorial override, enumeration, "Featured in" reverse-map)
- [x] Dynamic routes for all 6 dimensions: industry, country, language, genre, year, decade
- [x] `movie/[slug].astro` detail page + "Featured in" section (honest cert + parental UI)
- [x] `MovieCard.astro` (poster-forward, Astro `<Image>`), `ListLayout.astro`, `Faq.astro`,
      `AdSlot.astro` (reserved-space placeholder — no live code)
- [x] JSON-LD: `ItemList` (lists), `Movie` (movie pages), `FAQPage`; honesty-gated ratings
- [x] Sample editorial override `src/content/lists/genre-k-drama.yaml` (intro + pinned rank
      + per-movie blurbs + FAQ) proving the override system
- [x] Homepage + header wired to real populated lists; **0 broken internal links**;
      **69 pages** build green, posters optimized to WebP

> Data-quality fix: TMDb "NR/Unrated" certs are treated as no-cert (fall through to the
> next country's real rating, with its country noted) — honest age info, never a cryptic
> code. Known follow-up for Phase 4: exclude `noindex` pages from the sitemap.

## Phase 4 — SEO  ✅

- [x] `src/lib/jsonld.ts` builders wired per page type (ItemList/Movie/FAQPage/Breadcrumb/
      WebSite/Organization), with honesty-gated ratings/contentRating (verified no leaks)
- [x] `@astrojs/sitemap` filtered via `src/lib/seo.ts` `NOINDEX_PATHS` → 66 indexable URLs,
      about/contact/privacy + 404 excluded; `robots.txt` → `sitemap-index.xml`; custom 404
- [x] OG/canonical/Twitter on all pages (audited)
- [x] Internal-linking pass: `RelatedLists.astro` (sibling + cross-dimension) on lists;
      "Featured in" on movie pages; homepage/header link real lists
- [x] Structured-data validation: `scripts/validate-seo.ts` (`npm run validate-seo`) —
      **all 70 pages pass** (title/h1/meta/canonical/OG + JSON-LD types per page)

## Phase 5 — Content & keywords  🔲

- [ ] Validate keywords (volume, US-weighted) → fill in `KEYWORDS.md`
- [ ] Prioritize lists to build
- [ ] Write original intros + per-movie blurbs + optional parental notes
- [ ] FAQ blocks + `FAQPage` schema on key pages (`Faq.astro`)

## Phase 6 — AdSense & legal  🔲

- [ ] Privacy Policy / About / Contact real copy
- [ ] `CookieConsent.astro` (GDPR/CCPA) gating non-essential cookies
- [ ] `public/ads.txt` (placeholder until publisher ID)
- [ ] `AdSlot.astro` reserved-space placeholders (no live code)

## Phase 7 — Performance & QA  🔲

- [ ] Image/CSS optimization pass
- [ ] Run Lighthouse (Perf/A11y/SEO/Best-Practices); fix flagged issues (target 90+)
- [ ] Cross-browser + real mobile testing

## Phase 8 — Deploy & go-live  🔲

- [ ] Push to GitHub; connect Cloudflare Pages (CI/CD on push)
- [ ] Connect custom domain (nameservers at registrar)
- [ ] `public/_headers`: `noindex` on `*.pages.dev` preview
- [ ] Real `ads.txt`; GA tag (placeholder until GA ID; load after consent)
- [ ] Submit to Google Search Console + Bing Webmaster; submit sitemap; request indexing
- [ ] Apply to AdSense once quality pages + ~10+ daily users; add verification script;
      enable ads after approval

---

## Session log

- **2026-06-26** — **Phase 0 + Phase 1 complete.** Wrote `CLAUDE.md` + all `docs/`;
  scaffolded project (Astro 7.0.3, Tailwind 4.3.1 via `@tailwindcss/vite`, sitemap 3.7.3).
  Installed **Node 22.23.1 via nvm** (`.nvmrc`) after flagging v25 as unsupported; `npm
  install` clean (0 vulns); `npm run build` passes (5 pages + sitemap). Phase 1: built
  `Seo`, `Breadcrumbs`, `Header`, `Footer` (TMDb attribution verified in output),
  `BaseLayout`, `src/lib/jsonld.ts`, and placeholder pages (`/`, about, contact, privacy,
  404). Telemetry disabled.
- **2026-06-26** — **Phase 2 complete.** User supplied TMDb + OMDb keys (in git-ignored
  `.env`; OMDb activated). Built taxonomy, Zod content schema (`src/content.config.ts`),
  throttled/cached TMDb + OMDb clients, and the `fetch-data` orchestrator. Fetched **19
  seed movies** with certifications + IMDb ratings → `src/content/movies/*.json`; build
  validates them via Zod (green). Installed `gh` 2.95.0 — **GitHub push pending user
  `gh auth login`**.
- **2026-06-26** — Pushed all commits to GitHub (`github.com/Rs889044/topmostmovies`,
  branch `master`). **Phase 3 complete:** built the tagging engine, all 6 dimension routes,
  movie detail pages with "Featured in", poster cards, list/FAQ/ad components, and JSON-LD
  (ItemList/Movie/FAQPage). Added a sample editorial override (k-drama). Homepage/header
  wired to real lists; 69 pages, 0 broken links, build green. Fixed NR-cert handling.
  **Next: Phase 4.**
- **2026-06-26** — **Phase 4 (SEO) complete.** Filtered noindex pages from the sitemap via
  shared `src/lib/seo.ts`; added `RelatedLists` internal-linking on list pages; built
  `scripts/validate-seo.ts` (`npm run validate-seo`) which passes on all 70 pages. Verified
  JSON-LD honesty gating (no fabricated ratings, no TMDb-overview leak into Movie nodes).
  Updated `docs/SEO.md`. **Next: Phase 5 (content & keywords) — validate keywords, then
  write original intros/blurbs/synopses + FAQ blocks.**
