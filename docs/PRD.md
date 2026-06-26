# PRD — topmostmovies.com

## 1. Goal

Build a lightweight, SEO-first movie discovery website that publishes curated **"Top 10"
movie lists** across many dimensions, monetized via Google AdSense. Success = sustained
organic search traffic to ad-supported pages.

## 2. The product thesis (why this can rank in a saturated niche)

"Top 10 movies" is competitive and saturated; generic lists will not rank. Our two
defensible angles:

1. **Multi-dimensional tagging** — one movie maps to many lists, letting us target
   **long-tail keyword combinations** competitors ignore (e.g. *"top 10 Korean romance
   movies 2024"*, *"best Bollywood thrillers of the 2010s"*).
2. **Trustworthy parental / age info** — honest, sourced age certifications + optional
   editorial parental notes, never fabricated. Families searching "is X movie ok for
   kids" are a high-intent, underserved segment.

These two angles drive the keyword strategy ([KEYWORDS.md](KEYWORDS.md)) and the content
plan ([CONTENT-GUIDELINES.md](CONTENT-GUIDELINES.md)).

## 3. List dimensions

Each dimension generates "Top 10 …" pages:

| Dimension | Examples |
|-----------|----------|
| Industry  | Hollywood, Bollywood |
| Country   | South Korea, Japan, France |
| Language  | Korean, Hindi, Spanish |
| Genre / category | Romance, Thriller, K-Drama, Horror |
| Year      | 2026, 2011 |
| Decade    | 1980s, 1990s |

Dimensions are **composable** in the content/keyword strategy (genre × language × year),
even though the primary routes are single-dimension. See
[ARCHITECTURE.md](ARCHITECTURE.md) for how combo pages may be added later.

## 4. Page types

1. **Homepage `/`** — featured lists + entry points to every dimension; `WebSite` +
   `Organization` JSON-LD.
2. **List pages** (`/industry/…`, `/country/…`, `/language/…`, `/genre/…`, `/year/…`,
   `/decade/…`) — a "Top 10 …" ranked list: original intro paragraph, ranked movie cards
   each with a "why it made the list" blurb, FAQ block on key pages, breadcrumbs,
   `ItemList` + `BreadcrumbList` (+ `FAQPage`) JSON-LD.
3. **Movie detail `/movie/[slug]`** — poster, TMDb + IMDb ratings, official certification,
   optional parental notes, original synopsis, **"Featured in"** section linking every
   list the movie belongs to; `Movie` + `BreadcrumbList` JSON-LD.
4. **Static pages** — `/about`, `/contact`, `/privacy-policy` (+ later cookie policy).
5. **Utility** — custom 404, `sitemap.xml`, `robots.txt`, `ads.txt`.

## 5. Content requirements (AdSense-critical)

- Every list page: an **original intro** + a per-movie **original blurb**.
- Every movie page: an **original synopsis** (not a copy of TMDb's overview).
- FAQ blocks on key category pages from real "People Also Ask" questions.
- See [CONTENT-GUIDELINES.md](CONTENT-GUIDELINES.md) for tone/length/originality rules.

## 6. Non-goals (for now)

- No user accounts, comments, ratings, or watchlists (keeps it static + fast).
- No streaming-availability data (out of scope; can revisit).
- No detailed scraped parental guides (legally off-limits — see
  [DATA-SOURCES.md](DATA-SOURCES.md)).
- No live ad/analytics code until the user supplies IDs.

## 7. Success metrics

| Metric | Target / signal |
|--------|-----------------|
| Indexing | Pages indexed in Google Search Console; sitemap accepted |
| Organic traffic | Growing impressions/clicks on long-tail list queries |
| Core Web Vitals | All green (LCP, CLS, INP) in field + Lighthouse |
| Lighthouse | 90+ on Performance, Accessibility, Best Practices, SEO |
| AdSense readiness | Site passes review (original content, legal pages, consent) |
| Revenue | AdSense earnings once approved + traffic threshold met (~10+ daily users) |

## 8. Constraints

- Static output, host-agnostic build, deploy on Cloudflare Pages.
- Data fetched at build time and cached; APIs never hit per request.
- No secrets in repo. Data-source rules in [DATA-SOURCES.md](DATA-SOURCES.md) are
  non-negotiable.

See [ROADMAP.md](ROADMAP.md) for the phased delivery plan and live status.
