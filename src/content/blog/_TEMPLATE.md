---
# ────────────────────────────────────────────────────────────────────────────
# BLOG POST TEMPLATE — copy this file to a new kebab-case name, e.g.
#   src/content/blog/best-japanese-horror-movies.md   → /blog/best-japanese-horror-movies
# Filename = URL slug. Keep it keyword-rich. Read docs/BLOG-GUIDELINES.md first.
# (Underscore-prefixed files like this one are ignored by the build.)
# ────────────────────────────────────────────────────────────────────────────

title: "Best <Topic> Movies — <Hook>"          # ≤ ~60 chars, primary keyword near the front
description: "<One-sentence promise of the payoff, with the keyword.>"  # ≤ 160 chars (meta + card excerpt)
publishDate: 2026-01-01                          # YYYY-MM-DD (required)
# updatedDate: 2026-06-01                         # set when you meaningfully revise (freshness)
hero: "https://image.tmdb.org/t/p/w1280/<file>.jpg"   # optional TMDb backdrop URL (or remove)
heroAlt: "<Describe the hero image>"
tags: ["<tag1>", "<tag2>", "best movies"]        # topical; powers "Keep reading"

# Internal links → list/combo pages (rendered as an "Explore these lists" block).
# Only link to pages that ACTUALLY generate. dimensions: industry | country | language |
# genre | year | decade | studio | theme | combo  (combo value = "<primary>-<genre>")
linkedLists:
  - { dimension: combo,    value: <primary>-<genre> }   # → /best/<primary>-<genre>
  - { dimension: genre,    value: <genre> }             # → /genre/<genre>
  - { dimension: language, value: <language> }          # → /language/<language>

# Movie slugs that appear in the post → rendered as poster cards. Must exist in the catalog:
#   ls src/content/movies/<slug>.json
linkedMovies:
  - <movie-slug-1>
  - <movie-slug-2>
  - <movie-slug-3>

# 3–5 real "People Also Ask" questions. First sentence of each answer answers it directly.
faq:
  - q: "<Question people actually search?>"
    a: "<Direct answer in sentence one, then one line of useful detail.>"
  - q: "<Second question?>"
    a: "<Direct answer first.>"

draft: true   # ← set to false to publish. (true = excluded from index + sitemap)
---

<!--
BODY GUIDE (delete these comments). Target 700–1,200 words. Simple, engaging, useful.
Start sections at ## (the title above is the only <h1>). No client JS, no raw heavy images.
See docs/BLOG-GUIDELINES.md §3 for the full structure.
-->

Open with a 50–90 word hook: name the reader's intent, promise the payoff, and use the
primary keyword once, naturally, in the first ~100 words.

## Why these movies are worth it

A short context section — what unites this list, why it's worth the reader's time. One good
hook or fact. Keep paragraphs to 2–4 sentences.

## The movies to watch

A scannable mini-list of 5–8 specific picks (these should match `linkedMovies` above):

- **Movie Title (Year)** — one line on why it earns a spot.
- **Movie Title (Year)** — one line.
- **Movie Title (Year)** — one line.

## Where to go next

Close by pointing the reader to the full ranked list with a natural inline link, e.g.
"See the full [ranked list](/best/<primary>-<genre>) — every title with its rating and honest
age info." This inline link is the conversion moment; don't skip it.
