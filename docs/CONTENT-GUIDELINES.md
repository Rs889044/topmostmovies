# CONTENT-GUIDELINES — topmostmovies.com

Original content is what makes this site rank and what makes AdSense approve it. Aggregated
data alone is "thin content." Every page must add real human value.

## Why this matters

- **AdSense**: purely-aggregated content is a common rejection reason.
- **SEO**: duplicate/boilerplate text doesn't rank; original, useful copy does.
- **Trust**: especially for parental info, families rely on accuracy.

## What must be original on each page

| Page | Original elements |
|------|-------------------|
| List page | Intro paragraph (context for the list) + a "why it made the list" blurb per movie + FAQ answers |
| Movie page | Synopsis (rewritten, not copied) + optional parental notes |
| Static pages | About / Contact / Privacy — genuine, specific copy |

## Tone & voice

- Knowledgeable, friendly, concise. Like a well-read friend recommending films.
- US-audience-leaning vocabulary and spelling (higher ad value market), but globally
  readable.
- Confident but honest — no hype, no fabricated claims, no clickbait.

## Length guidance

- **List intro**: ~60–120 words. Sets context (what unites the list, who it's for) and
  naturally includes the target keyword once.
- **Per-movie blurb**: ~30–60 words. Why *this* film earns its spot *on this list* — make
  it list-specific where possible (a film can have different blurbs on different lists).
- **Movie synopsis**: ~80–150 words. Original framing of the premise; no spoilers beyond
  the setup; do not paste TMDb's `overview`.
- **FAQ answer**: ~40–80 words, directly answering the question.

## Originality rules (hard requirements)

- **Never** copy/paste TMDb overviews, OMDb text, or any third-party description verbatim.
  Rewrite in our own words.
- No AI-generated filler that says nothing — every sentence should add information or a
  genuine recommendation angle.
- Keyword usage must read naturally; no stuffing. One primary keyword + natural variants.
- Each blurb/intro should be **unique** across the site (don't reuse the same intro on
  multiple lists).

## Parental / age copy (special care)

- Only state **verifiable** facts: the official certification + its country system, and any
  descriptors actually provided by TMDb.
- `parentalNotes` may add *editorial guidance* ("themes of grief; mild language") but must
  not assert specific content claims that aren't verifiable. When unsure, say less.
- If no certification data exists: render **"Not rated / data unavailable."** Never guess.
- Don't imply endorsement by IMDb, TMDb, or any rating body.

## FAQ blocks

- Source questions from real "People Also Ask" / search queries in
  [KEYWORDS.md](KEYWORDS.md).
- Answer the question directly in the first sentence (good for featured snippets), then add
  brief useful detail.
- Mark up with `FAQPage` schema (see [SEO.md](SEO.md)).

## Workflow

1. Pick the list to build from [KEYWORDS.md](KEYWORDS.md) priorities.
2. Confirm the movie set + ranking (default sort or editorial override).
3. Write the intro, per-movie blurbs, and FAQ in the list's content-collection entry.
4. For new movies, write/refine the synopsis and optional parental notes.
5. Run through the [SEO.md](SEO.md) per-page checklist.
