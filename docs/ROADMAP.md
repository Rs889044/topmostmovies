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

- **2026-06-26** — **Phase 0 + Phase 1 complete.** Wrote `CLAUDE.md` + all `docs/`;
  scaffolded project (Astro 7.0.3, Tailwind 4.3.1 via `@tailwindcss/vite`, sitemap 3.7.3).
  Installed **Node 22.23.1 via nvm** (`.nvmrc`) after flagging v25 as unsupported; `npm
  install` clean (0 vulns); `npm run build` passes (5 pages + sitemap). Phase 1: built
  `Seo`, `Breadcrumbs`, `Header`, `Footer` (TMDb attribution verified in output),
  `BaseLayout`, `src/lib/jsonld.ts`, and placeholder pages (`/`, about, contact, privacy,
  404). Telemetry disabled. **Next: Phase 2 (data layer) — needs TMDb + OMDb API keys.**
