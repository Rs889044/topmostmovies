# KEYWORDS — topmostmovies.com

Target keywords per category + the "People Also Ask"-style questions that feed FAQ blocks.
This guides **which lists to build first** and how copy is written.

> **Validation method (Phase 5):** exact monthly volumes live in gated tools (Google
> Keyword Planner) we can't query here, so the **Volume** column is a qualitative estimate
> (`high`/`med`/`low`) informed by **real SERP research** (web searches showing how many
> established sites target each term + what Google surfaces). Treat these as *evidence-based
> priorities, not tool-verified numbers* — refine with Search Console data once live.
> Research date: 2026-06-26. US-audience-weighted (higher ad value).

## Strategy recap

Head terms ("best movies", "best korean movies") are saturated by big sites (Timeout, IMDb,
Collider, StudioBinder, Ranker, Looper…). We don't fight them head-on. We win on:

1. **Long-tail combinations** — genre × language/country × era. Fewer competitors, clearer
   intent, and our tagging model generates them natively.
2. **Parental / age intent** — "is [movie] ok for kids", "[movie] age rating",
   "[movie] parents guide". Confirmed real demand; competitors are Common Sense Media /
   Kids-in-Mind / IMDb parents-guide (which we *cannot* scrape). Our honest angle: official
   certification + an original editorial parental note. We add value without copying them.

## Head / category terms — context only (do NOT target head-on)

| Keyword | Maps to | Volume | Competition | Status |
|---------|---------|:------:|:-----------:|:------:|
| best korean movies | country/south-korea, language/korean | high | very high | 🟡 supporting |
| best bollywood movies | industry/bollywood | high | very high | 🟡 supporting |
| best thriller movies | genre/thriller | high | very high | 🟡 supporting |
| best romance movies | genre/romance | high | very high | 🟡 supporting |

> "Supporting" = we have the page (it should exist + be good), but we don't expect to rank
> #1; it earns long-tail and internal-link value.

## Long-tail combinations — PRIMARY targets ✅

Evidence: SERP research shows dedicated competitor lists for these (proves demand) but far
fewer than for head terms, and our tagging makes them cheap to produce well.

| Keyword | Route | Volume | Status | Notes |
|---------|-------|:------:|:------:|-------|
| best korean romance movies | genre×language (romance + korean) | med | ✅ priority | Collider/MarieClaire target it; My Sassy Girl is a canonical pick we own |
| best k-drama movies | genre/k-drama | med | ✅ priority | Our custom category; differentiates from TV "k-drama" |
| best bollywood movies for beginners | industry/bollywood (intro framing) | med | ✅ priority | Strong SERP ("3 Idiots = best to start"); we own 3 Idiots, DDLJ |
| best korean thriller movies | language×genre (korean + thriller) | med | ✅ priority | We own Oldboy, The Handmaiden, Parasite |
| best korean movies of all time | country/south-korea | high | 🟡 supporting | Top picks (Parasite/Oldboy/Train to Busan) all owned |
| best japanese animated movies | country×genre (japan + animation) | med | ✅ priority | Spirited Away, Your Name owned |
| best psychological thriller movies | genre/thriller (framing) | med | 🟡 later | Needs more titles |
| best movies of the 2010s | decade/2010s | med | ✅ priority | Parasite, Get Out, Mad Max FR, Gully Boy owned |

## Parental / age-intent terms — PRIMARY targets ✅ (our trust differentiator)

Evidence: searches for "is parasite appropriate for kids / age rating / parents guide" all
return active demand. We answer with **official certification + an original parental note**
on each movie page — never scraped granular guides.

| Keyword pattern | Serves | Volume | Status |
|-----------------|--------|:------:|:------:|
| is [movie] ok for kids | movie page (cert + parentalNotes) | med | ✅ priority |
| [movie] age rating | movie page | med | ✅ priority |
| [movie] parents guide | movie page | med | 🟡 careful (don't imitate scraped guides) |
| is [movie] rated r / why is [movie] rated r | movie page | low-med | ✅ priority |

> Copy rule: state only the official cert (with its country system) + honest editorial
> guidance. See [CONTENT-GUIDELINES.md](CONTENT-GUIDELINES.md) and
> [DATA-SOURCES.md](DATA-SOURCES.md).

## "People Also Ask" → FAQ seeds (per list)

Drawn from SERP "People Also Ask"/related-question patterns. Feed these into each list's
`faq` (FAQPage schema). Keep answers original and specific.

**genre/k-drama**
- What is the best K-drama movie to start with?
- Are K-drama movies the same as Korean dramas?
- What's a good Korean romance movie for beginners?

**genre/romance (+ korean angle)**
- What are the best Korean romance movies?
- What is the most romantic Korean movie?

**industry/bollywood**
- What is the best Bollywood movie to start with?
- What Bollywood movie should a beginner watch first?
- Are Bollywood movies in Hindi?

**country/south-korea & language/korean**
- What is the best Korean movie of all time?
- Which Korean movie won an Oscar?
- What Korean thriller should I watch first?

**genre/thriller (korean)**
- What is the best Korean thriller movie?
- Is Oldboy worth watching?

**country/japan & genre/animation**
- What is the best Japanese animated movie?
- Is Spirited Away appropriate for kids?

**decade/2010s**
- What are the best movies of the 2010s?

## Build priority (Phase 5 order)

1. **k-drama**, **korean** + **south-korea**, **korean thriller**, **korean romance** —
   our strongest differentiation; titles owned; intros + FAQ + blurbs.
2. **bollywood** (beginner framing) + **hindi**/**india**.
3. **japan** + **animation** (Spirited Away, Your Name).
4. **2010s** decade; remaining genre lists get lighter intros + FAQ.
5. All 19 movie pages get an **original synopsis**; high-traffic-intent titles
   (Parasite, Oldboy, Train to Busan, Get Out, Inception) get **parental notes**.

> Sources informing this (SERP research, 2026-06-26): Timeout, IMDb, StudioBinder,
> Collider, MarieClaire, Common Sense Media, Refinery29, MovieWeb. Used to gauge demand +
> competition only — all copy on our site is original.
