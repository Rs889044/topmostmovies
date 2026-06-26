# DATA-SOURCES — topmostmovies.com

> These rules are **non-negotiable**. Do not change without explicit user approval.

## Summary

| Source | Role | Used for |
|--------|------|----------|
| **TMDb API** | Primary | Posters, backdrops, genres, release dates, popularity, TMDb rating, **certifications/age ratings per country** |
| **OMDb API** | Supplementary | **IMDb rating number** (optionally Rotten Tomatoes / Metacritic) |

All fetching happens at **build time** (`scripts/`), is **cached to local JSON**
(`src/data/`), and is **never** called per page request.

## TMDb (The Movie Database)

- Auth: API key (v3) or read access token (v4) in env (`TMDB_API_KEY` /
  `TMDB_READ_TOKEN`). Stored in `.env`, git-ignored. See [.env.example](../.env.example).
- Base: `https://api.themoviedb.org/3`
- Images: build full URLs from `https://image.tmdb.org/t/p/<size>` + poster/backdrop path.
- **Endpoints we use** (build-time):
  - `/discover/movie` — find candidates by genre, language, region, year, sort.
  - `/movie/{id}` — detail (overview, runtime, genres, etc.).
  - `/movie/{id}/release_dates` — **certifications per country** (the age-rating source).
  - `/configuration` — image base URLs + available sizes.
  - `/genre/movie/list` — canonical genre id→name map.
  - `/search/movie` — resolve titles → ids when seeding from a curated title list.

### Attribution (REQUIRED)

The footer must display, on every page:

> *"This product uses the TMDb API but is not endorsed or certified by TMDb."*

Plus the TMDb logo per their branding guidelines where appropriate. This lives in
`src/components/Footer.astro`.

## OMDb (Open Movie Database)

- Auth: API key in env (`OMDB_API_KEY`). Free tier is rate-limited (~1,000 req/day).
- Base: `https://www.omdbapi.com/`
- Used to fetch the **IMDb rating** (`imdbRating`) and `imdbID`, keyed by the title's
  IMDb id (obtainable from TMDb `external_ids`). Optionally `Ratings[]` for RT/Metacritic.
- **We do not** present OMDb data as IMDb-endorsed; it is a rating number with attribution
  to its source where shown.

## Rate-limit handling (in fetch scripts)

- **Throttle**: cap concurrency + insert delays between calls (a small rate limiter in
  `scripts/lib/`). TMDb is generous but not unlimited; OMDb free tier is ~1k/day — budget
  accordingly.
- **Retry with backoff**: on HTTP 429 / 5xx, exponential backoff with a max retry count.
- **On-disk cache**: responses cached by request key so re-running `fetch-data` does not
  re-hit the API for unchanged data. Cache is intentional/refreshable.
- **Fail loud**: a persistent failure for a movie should warn and skip that field, never
  silently fabricate.

## Parental-guide limitation (be honest)

- IMDb's **detailed** parental guides (granular sex / violence / profanity breakdowns) are
  **NOT available via any free, legitimate API**. **We do not scrape them.** Scraping IMDb
  violates its ToS and creates legal + AdSense-approval risk.
- What we surface instead:
  1. **Official age certification** (e.g. PG-13, R, U/A) from TMDb
     `/movie/{id}/release_dates`, with the country system noted.
  2. **Content descriptors** if/when TMDb provides them.
  3. An **optional original editorial `parentalNotes`** field the user can write per movie.
- **Never fabricate or guess** content ratings or parental details. Families may rely on
  this. If data is missing, render **"Not rated / data unavailable"** — not an invented
  value. (Enforced by the schema in [DATA-MODEL.md](DATA-MODEL.md).)

## Secrets

- All keys in `.env` (git-ignored). `.env.example` documents the variable names with empty
  values. **Never hardcode or commit keys.** The fetch scripts read from
  `process.env`/`import.meta.env` and fail with a clear message if a key is missing.

## Required env variables

See [.env.example](../.env.example):

```
TMDB_API_KEY=
TMDB_READ_TOKEN=        # optional v4 token alternative
OMDB_API_KEY=
PUBLIC_SITE_URL=https://topmostmovies.com
# Added later, only when user provides them:
# PUBLIC_ADSENSE_CLIENT=
# PUBLIC_GA_ID=
```
