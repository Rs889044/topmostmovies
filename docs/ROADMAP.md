# ROADMAP — topmostmovies.com

Phased plan with a **live status checklist**. **Update this at the end of every working
session** — it is the memory between sessions alongside [../CLAUDE.md](../CLAUDE.md).

Legend: 🔲 not started · 🟡 in progress · ✅ done · ⏸️ blocked/waiting on user

---

## Phase 0 — Docs & setup  🟡 (awaiting user approval to proceed)

- [x] `CLAUDE.md` created
- [x] `docs/PRD.md`
- [x] `docs/ARCHITECTURE.md`
- [x] `docs/DATA-MODEL.md`
- [x] `docs/DATA-SOURCES.md`
- [x] `docs/SEO.md`
- [x] `docs/ADSENSE.md`
- [x] `docs/CONTENT-GUIDELINES.md`
- [x] `docs/KEYWORDS.md` (seed framework; validation deferred to Phase 5)
- [x] `docs/ROADMAP.md` (this file)
- [ ] Astro + TypeScript project scaffolded (`package.json`, `astro.config.mjs`,
      `tsconfig.json`, `src/styles/global.css`)
- [ ] Tailwind v4 via `@tailwindcss/vite` wired
- [ ] `@astrojs/sitemap` configured
- [ ] `.env.example` + `.gitignore`
- [ ] git repo initialized
- [ ] **Dependencies installed + `dev`/`build` verified** ⏸️ (needs LTS Node + user OK)
- [ ] **STOP: confirm folder structure, routes, and movie schema with user** ⏸️

> **Open items for the user (see chat):**
> 1. Node runtime — system has v25 (unsupported by Astro; needs v22.12+ LTS).
> 2. Approve proposed folder structure / routes / schema before Phase 1.
> 3. TMDb + OMDb API keys (needed in Phase 2, not before).

---

## Phase 1 — Foundations  🔲

- [ ] `BaseLayout.astro` (html shell, global.css, header/footer, consent mount)
- [ ] Design system / tokens in `global.css` (colors, type scale, spacing)
- [ ] `Header.astro` + nav; `Footer.astro` **with TMDb attribution**
- [ ] `Seo.astro` shared component (title/meta/canonical/OG/Twitter/JSON-LD)
- [ ] `Breadcrumbs.astro`
- [ ] Placeholder pages: `/`, `/about`, `/contact`, `/privacy-policy`, `404`

## Phase 2 — Data layer  🔲

- [ ] Zod schema in `src/content/config.ts` (movies, lists, editorial overrides)
- [ ] `scripts/tmdb.ts` (throttle, retry, certifications endpoint)
- [ ] `scripts/omdb.ts` (IMDb rating)
- [ ] `scripts/fetch-data.ts` → cached `src/data/*.json`; `npm run fetch-data`
- [ ] Seed set of movies to develop against
- [ ] Update `DATA-SOURCES.md` / `DATA-MODEL.md` with any specifics learned

## Phase 3 — Lists & tagging  🔲

- [ ] `src/lib/taxonomy.ts`, `src/lib/lists.ts` (filter + rank, override support)
- [ ] Dynamic routes: industry, country, language, genre, year, decade
- [ ] `movie/[slug].astro` detail page + "Featured in" section
- [ ] `MovieCard.astro`, `ListLayout.astro`, `MovieLayout.astro`

## Phase 4 — SEO  🔲

- [ ] `src/lib/jsonld.ts` builders; wire JSON-LD per page type
- [ ] `@astrojs/sitemap` output verified; `robots.txt`; custom 404
- [ ] OG/canonical on all pages; internal linking pass
- [ ] Validate structured data (Rich Results / schema validator)

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

- **2026-06-26** — Phase 0: wrote `CLAUDE.md` + all `docs/`; scaffolded project config
  (`package.json`, `astro.config.mjs`, `tsconfig.json`, `global.css`, `.env.example`,
  `.gitignore`, `robots.txt`, `ads.txt` placeholder). Verified current versions on npm:
  **Astro 7.0.3, Tailwind 4.3.1, @astrojs/sitemap 3.7.3**; Tailwind wired via
  `@tailwindcss/vite`. Flagged Node v25 (unsupported by Astro; needs v22.12+ LTS) — deps
  NOT yet installed. Awaiting user approval of structure/routes/schema before Phase 1.
