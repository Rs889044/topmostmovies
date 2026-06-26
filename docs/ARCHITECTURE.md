# ARCHITECTURE — topmostmovies.com

## Build philosophy

**Fetch → cache → generate.** Movie data is pulled from TMDb + OMDb at *build time* by
scripts in `scripts/`, written to cached JSON in `src/data/`, validated by a typed schema,
and rendered into fully static HTML. The runtime site makes **zero** API calls. This keeps
pages fast (great Core Web Vitals), avoids rate-limit/cost problems, and is host-agnostic.

```
                build time                          request time
  ┌─────────────────────────────────────┐        ┌──────────────────┐
  TMDb API ─┐                             │        │                  │
            ├─► scripts/fetch-data.ts ─► src/data/*.json ─► Astro ─►  │  static HTML/CSS
  OMDb API ─┘   (throttle + retry +       (cached,    pages/routes   │  (no API calls)
                 cache, never per-page)    Zod-validated)            │
  ┌─────────────────────────────────────┘        └──────────────────┘
```

## Proposed folder structure

```
topmostmovies/
├── CLAUDE.md
├── astro.config.mjs            # site URL, sitemap, @tailwindcss/vite plugin
├── tsconfig.json
├── package.json
├── .env                        # secrets (git-ignored)
├── .env.example                # documents required keys
├── .gitignore
├── docs/                       # PRD, ARCHITECTURE, DATA-MODEL, DATA-SOURCES,
│                               #   SEO, ADSENSE, CONTENT-GUIDELINES, KEYWORDS, ROADMAP
├── scripts/
│   ├── fetch-data.ts           # orchestrates TMDb + OMDb fetch → src/data/*.json
│   ├── tmdb.ts                 # TMDb client (throttle, retry, certifications)
│   ├── omdb.ts                 # OMDb client (IMDb rating)
│   └── lib/                    # shared fetch helpers (rate limiter, cache, slugify)
├── src/
│   ├── data/                   # CACHED build-time JSON (movies, lists, taxonomies)
│   │   ├── movies.json
│   │   └── .gitkeep
│   ├── content/                # Astro content collections (config + editorial data)
│   │   └── config.ts           # Zod schemas: movies, lists, editorial overrides
│   ├── lib/                    # site-side helpers: ranking, list-building, slug, seo
│   │   ├── lists.ts            # filter+rank movies → list entries
│   │   ├── taxonomy.ts         # dimension definitions + slug maps
│   │   └── jsonld.ts           # JSON-LD builders (ItemList/Movie/Breadcrumb/FAQ/WebSite)
│   ├── components/
│   │   ├── Seo.astro           # title, meta, canonical, OG/Twitter, JSON-LD slot
│   │   ├── Breadcrumbs.astro
│   │   ├── MovieCard.astro     # poster-forward card + rank + blurb
│   │   ├── AdSlot.astro        # reserved-space placeholder (no live code yet)
│   │   ├── Faq.astro           # FAQ block + FAQPage schema
│   │   ├── CookieConsent.astro # GDPR/CCPA banner gating non-essential cookies
│   │   ├── Header.astro
│   │   └── Footer.astro        # TMDb attribution lives here
│   ├── layouts/
│   │   ├── BaseLayout.astro    # html shell, global.css import, header/footer, consent
│   │   ├── ListLayout.astro    # shared "Top 10 …" list page scaffolding
│   │   └── MovieLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── 404.astro
│   │   ├── about.astro
│   │   ├── contact.astro
│   │   ├── privacy-policy.astro
│   │   ├── industry/[slug].astro
│   │   ├── country/[slug].astro
│   │   ├── language/[slug].astro
│   │   ├── genre/[slug].astro
│   │   ├── year/[year].astro
│   │   ├── decade/[slug].astro
│   │   └── movie/[slug].astro
│   └── styles/
│       └── global.css          # @import "tailwindcss"; + design tokens
└── public/
    ├── robots.txt
    ├── ads.txt                 # placeholder until AdSense publisher ID provided
    └── _headers                # Cloudflare: noindex on *.pages.dev (Phase 8)
```

## Routing strategy

- **Dynamic route per dimension** (`[slug].astro` / `[year].astro`) using
  `getStaticPaths()` to enumerate every taxonomy value that has ≥1 movie. Each builds a
  "Top 10 …" page from the filtered + ranked movie set.
- **`/movie/[slug].astro`** uses `getStaticPaths()` over all movies; computes the
  "Featured in" set by reverse-mapping the movie's tags to the lists it appears in.
- All output is static (`output: 'static'`). No SSR/runtime data fetching.
- **Combo/long-tail pages** (genre × language × year, etc.) are deferred: they can be
  generated later by enumerating curated tag combinations in `getStaticPaths()` once the
  keyword strategy confirms which combos are worth a page. Avoids exploding the page count.

## Data flow & validation

1. `npm run fetch-data` runs `scripts/fetch-data.ts` → calls TMDb + OMDb with throttling,
   retry/backoff, and an on-disk cache so re-runs are cheap and respect rate limits.
2. Output written to `src/data/*.json` (the canonical cached dataset, committed so builds
   are reproducible without keys; refreshed intentionally).
3. **Editorial overrides** (manual rank, `parentalNotes`, `blurb`, intros, FAQ) live in
   Astro **content collections** under `src/content/`, validated by **Zod** at build time
   so bad data fails the build rather than shipping. See [DATA-MODEL.md](DATA-MODEL.md).
4. `src/lib/lists.ts` merges cached movie data + editorial overrides, then filters and
   ranks to produce each list's ordered entries.

## Key decisions & rationale

| Decision | Why |
|----------|-----|
| Static output | Best CWV, cheapest hosting, no runtime API cost/limits, easy CDN. |
| Build-time fetch + cached JSON | APIs never hit per request; reproducible builds; rate-limit safe. |
| `@tailwindcss/vite` (not `@astrojs/tailwind`) | The integration is deprecated; Vite plugin is the current Tailwind v4 path. |
| Content collections + Zod | Build-time validation of editorial data; typed access in pages. |
| Single movie record, many lists | Core thesis: tagging powers long-tail lists + internal linking. |
| Editorial rank override | "Top 10" is editorial; default sort exists but humans can curate. |
| Defer combo pages | Prevent page-count explosion; add only validated long-tail combos. |
| Cloudflare Pages | Free static hosting + GitHub CI/CD; build stays host-agnostic. |

## Open questions to confirm with the user

- **Node runtime**: system has v25 (odd, unsupported by Astro which wants v22.12+ LTS).
  Need an LTS Node before `dev`/`build` are reliable.
- Whether cached `src/data/*.json` should be committed (reproducibility) or git-ignored
  and always refetched (smaller repo). Current plan: commit it.
