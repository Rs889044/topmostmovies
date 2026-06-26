# ADSENSE — topmostmovies.com

Monetization is via Google AdSense. Google rejects thin, purely-aggregated sites, so
readiness is built in from day one. **No live ad code ships until the user provides an
AdSense publisher ID.**

## Readiness checklist (before applying)

- [ ] **Original content layer** everywhere:
  - List pages: original intro paragraph + per-movie "why it made the list" blurb.
  - Movie pages: original synopsis (not TMDb's overview verbatim).
  - FAQ blocks on key category pages with real answers.
  - See [CONTENT-GUIDELINES.md](CONTENT-GUIDELINES.md).
- [ ] **Required pages present**: Privacy Policy, About, Contact.
- [ ] **Cookie-consent banner** (GDPR/CCPA) gating non-essential / ad cookies.
- [ ] **`ads.txt`** present at site root (`public/ads.txt`).
- [ ] **`robots.txt` + `sitemap.xml`** correct; site fully crawlable.
- [ ] Clean navigation; no broken links; custom 404.
- [ ] Mobile-friendly, fast (green Core Web Vitals / Lighthouse).
- [ ] Enough quality pages **and** consistent traffic (common heuristic: ~10+ daily users
      in Analytics) before submitting the AdSense application.

## Consent requirements

- A consent banner blocks non-essential cookies (ads/analytics) until the user consents.
- Ad and analytics scripts **must not load** before consent (and not at all until the user
  supplies IDs). The `CookieConsent.astro` component stores the choice (e.g.
  localStorage / a first-party cookie) and conditionally enables tagging.
- Privacy Policy explains data use, cookies, AdSense, and analytics.

## Ad-slot conventions

- `src/components/AdSlot.astro` is a **reusable placeholder** with:
  - A clearly marked placeholder zone during development (visible "Ad" box).
  - **Reserved space** (fixed/min dimensions per breakpoint) to prevent CLS — this is the
    main CWV protection. Sizes are set before any real ad renders.
  - A `slot` / `format` prop so placements are named and consistent.
  - **No live ad code** until `PUBLIC_ADSENSE_CLIENT` is provided; until then it renders
    only the reserved placeholder.
- Placements designed to protect Core Web Vitals and UX: e.g. below the intro, between
  list sections, in-content on movie pages — never causing layout shift, never deceptive.

## Launch gating (what flips on, and when)

| Item | Gated until |
|------|-------------|
| Reserved ad placeholders | Always present (dev + prod) — no code, just space. |
| AdSense verification script | User provides publisher ID **and** is applying. |
| Live ads (Auto Ads or manual slots) | **After** AdSense approval. |
| Analytics (GA) tag | User provides `PUBLIC_GA_ID`; loads only after consent. |
| `ads.txt` real publisher line | User provides publisher ID (placeholder until then). |

## Notes

- Keep ad density reasonable and content-first; AdSense policy penalizes ad-heavy,
  low-value pages.
- Re-run the readiness checklist before submitting the application (Phase 8).
- See [ROADMAP.md](ROADMAP.md) Phase 6 (build) and Phase 8 (go-live / apply).
