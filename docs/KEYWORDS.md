# KEYWORDS — topmostmovies.com

Target keywords per category + the "People Also Ask" questions that feed FAQ blocks. This
guides **which lists to build first**.

> **Status:** This is a **seed framework**, not validated data. Search-volume validation
> happens in **Phase 5** (favor US-audience terms for higher ad value). Each row will be
> marked once validated. Do **not** treat unvalidated rows as confirmed targets.
>
> Validation tools to use in Phase 5: Google Keyword Planner, Search Console (once live),
> and free volume/PAA checkers. Record real numbers and intent here.

## Strategy recap

Our edge is **long-tail combinations** (genre × language/country × year/decade) and
**parental-intent** queries. Single-word head terms ("best movies") are too competitive;
we win on specificity.

Validation columns to fill in Phase 5: **Volume** (US monthly), **Difficulty**,
**Intent**, **Status** (🔲 unvalidated / ✅ validated / ❌ dropped).

## Head / category terms (high competition — context, not primary targets)

| Keyword | Volume | Difficulty | Status |
|---------|:------:|:----------:|:------:|
| best korean movies | — | high | 🔲 |
| best bollywood movies | — | high | 🔲 |
| best thriller movies | — | high | 🔲 |
| best romance movies | — | high | 🔲 |

## Long-tail combinations (PRIMARY targets — our differentiation)

| Keyword | Maps to route(s) | Volume | Status |
|---------|------------------|:------:|:------:|
| top korean romance movies 2024 | genre×language×year | — | 🔲 |
| best k-drama movies | genre/k-drama | — | 🔲 |
| best bollywood thrillers | industry×genre | — | 🔲 |
| best korean thriller movies | language×genre | — | 🔲 |
| best japanese horror movies | country×genre | — | 🔲 |
| top romance movies of the 2010s | genre×decade | — | 🔲 |
| best spanish language movies on netflix style | language×genre | — | 🔲 |
| best french movies of all time | country/language | — | 🔲 |
| top movies 2026 | year/2026 | — | 🔲 |

## Parental-intent terms (PRIMARY targets — underserved, high trust value)

| Keyword pattern | Serves | Volume | Status |
|-----------------|--------|:------:|:------:|
| is [movie] ok for kids | movie page (cert + parental notes) | — | 🔲 |
| [movie] age rating | movie page | — | 🔲 |
| [movie] parents guide | movie page | — | 🔲 |
| best family friendly [genre] movies | genre list filtered by cert | — | 🔲 |

> Note: we surface official certifications + editorial notes only — we do **not** provide
> scraped granular parental guides (see [DATA-SOURCES.md](DATA-SOURCES.md)). Copy must stay
> honest per [CONTENT-GUIDELINES.md](CONTENT-GUIDELINES.md).

## "People Also Ask" → FAQ seeds

These feed `FAQPage`-marked FAQ blocks on the relevant list pages. Replace/expand with real
PAA pulls in Phase 5.

**Genre/romance**
- What is the best romance movie of all time?
- What are the best romance movies for date night?

**Genre/k-drama**
- What is the best Korean movie to start with?
- Is K-drama the same as Korean movies?

**Country/south-korea**
- What are the best South Korean movies?
- Which Korean movie won an Oscar?

**Year/2026**
- What are the best movies of 2026?
- What new movies are coming out in 2026?

## Build priority (provisional — re-rank after Phase 5 validation)

1. A few high-differentiation long-tail lists with clear intent (e.g. k-drama, Korean
   thriller, Bollywood thriller) — to prove the tagging model + content workflow.
2. A current-year list (`/year/2026`) for freshness/recurring traffic.
3. Expand by dimension once the workflow is smooth and keywords are validated.
