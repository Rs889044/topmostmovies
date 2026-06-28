# BLOG-GUIDELINES — topmostmovies.com

How to write a blog post that **ranks, attracts traffic, and sends readers into our lists and
movie pages** — without slowing the site down. Read this before writing. Pairs with
[CONTENT-GUIDELINES.md](CONTENT-GUIDELINES.md) (voice + originality), [SEO.md](SEO.md), and
[KEYWORDS.md](KEYWORDS.md) (what to target).

> **The blog has one job:** pull organic search traffic for keywords our list pages can't win
> alone, and funnel that traffic — plus crawl depth and link equity — into our `/best`, list,
> and `/movie` pages. Every post must (a) target a real keyword, (b) be genuinely useful and
> enjoyable to read, and (c) link out to our lists and recommend specific movies.

---

## 1. The non-negotiables (every post does all of these)

1. **Targets one primary keyword** chosen from [KEYWORDS.md](KEYWORDS.md) (long-tail combo
   preferred — e.g. "best Japanese horror movies", "greatest 90s thrillers").
2. **Links to our pages.** At least **1 list/combo page** and **3+ movie pages** via the
   `linkedLists` / `linkedMovies` frontmatter (these render as link blocks automatically),
   **plus** inline links inside the prose to the most relevant list. This is the whole point.
3. **Recommends specific movies** the reader can act on — a "watch these" or ranked mini-list.
4. **Original, honest copy.** No copied TMDb/OMDb text, no fabricated ratings or parental
   claims (see CONTENT-GUIDELINES "Originality rules").
5. **Lightweight** — see §6. No heavy images, no client JS, no new dependencies.
6. **Has an FAQ** (`faq` frontmatter) sourced from real "People Also Ask" questions.

If a draft doesn't do all six, it's not ready.

---

## 2. Voice — engaging, simple, informative

Write like a film-obsessed friend who's genuinely excited to give you your next watch.

- **Simple language.** Short sentences. Everyday words over jargon. A 13-year-old should
  follow it; a film buff should still respect it. Aim ~8th-grade reading level.
- **Lead with the payoff.** First two sentences tell the reader they're in the right place
  and what they'll get. No throat-clearing ("In today's world of cinema…").
- **Be specific and interesting.** Concrete details, one good fact or hook per section. Cut
  any sentence that says nothing.
- **Confident, never hype.** No clickbait, no "you won't BELIEVE", no fake superlatives.
- **US-audience spelling/vocabulary** (higher ad value), globally readable.
- **Skimmable.** Real readers scan: descriptive `##`/`###` headings, short paragraphs
  (2–4 sentences), bullet lists for picks. White space is a feature.

---

## 3. Structure (the reliable template)

Target **700–1,200 words** of body copy (long enough to be useful, short enough to stay
fast). Use this shape:

1. **Hook intro (50–90 words).** Restate the search intent in human terms; promise the
   payoff; include the primary keyword **once, naturally**, in the first ~100 words.
2. **A "why / context" section** (`##`) — what unites these films, why they're worth it.
3. **The recommendations** (`##`) — a bulleted mini-list of **5–8 specific movies** with a
   one-line reason each. Bold the title. These titles should also appear in `linkedMovies`.
4. **(Optional) deeper cuts / sub-angles** (`##` or `###`) — eras, sub-genres, "if you liked X".
5. **A "where to go next" close** (`##`) — explicitly point to the full ranked list (inline
   link to the `/best` or list page). This is the conversion moment.

Then the layout auto-appends: **Explore these lists**, **Movies mentioned**, **FAQ**, and
**Keep reading** from your frontmatter — you don't write those sections, you feed them data.

---

## 4. Frontmatter — fill every field

Each post is one `.md` file in `src/content/blog/`. The filename **is** the URL slug
(`best-japanese-horror-movies.md` → `/blog/best-japanese-horror-movies`) — keep it
kebab-case and keyword-rich. Schema is enforced at build time; a bad field fails the build.

```yaml
---
title: "Best Japanese Horror Movies That Still Terrify"   # ≤ ~60 chars, keyword near the front
description: "Cursed tapes, vengeful spirits and slow dread..."  # ≤ 160 chars; this is the meta description + card excerpt
publishDate: 2026-06-28          # required (YYYY-MM-DD)
updatedDate: 2026-07-15          # optional — set when you meaningfully revise (freshness signal)
hero: "https://image.tmdb.org/t/p/w1280/<file>.jpg"  # optional; a TMDb backdrop URL or local asset
heroAlt: "A scene from a Japanese horror film"        # describe the image
tags: ["japanese", "horror", "best movies"]           # topical; drives "Keep reading" + related posts
linkedLists:                     # internal links → list/combo pages (render as a link block)
  - { dimension: combo,    value: japanese-horror }   # → /best/japanese-horror
  - { dimension: language, value: japanese }          # → /language/japanese
  - { dimension: genre,    value: horror }            # → /genre/horror
  - { dimension: country,  value: japan }             # → /country/japan
linkedMovies:                    # movie slugs (must exist in the catalog) → poster cards
  - ringu-1998
  - audition-1999
  - pulse-2001
faq:                             # 3–5 real PAA questions; first sentence answers directly
  - q: "What is the scariest Japanese horror movie?"
    a: "Many point to Ringu (1998)..."
draft: false                     # true = excluded from index + sitemap (WIP)
---
```

**`linkedLists` dimensions:** `industry`, `country`, `language`, `genre`, `year`, `decade`,
`studio`, `theme`, or `combo` (a `/best/<value>` page, value `"<primary>-<genre>"`).
**Rule: only link to pages that actually exist.** Verify the combo/list generates a page and
each movie slug is real (see §7) — a broken internal link wastes the post's whole purpose.

---

## 5. SEO mechanics (do these, they're cheap and they compound)

- **One primary keyword**, used in: the title, the first ~100 words, one `##` heading, and
  the description — each time reading naturally. Sprinkle natural variants; **never stuff.**
- **One `<h1>` only** — that's the `title`; in the body start sections at `##` (never `#`).
- **Descriptive headings** that mirror how people search ("Best 90s Korean thrillers", not
  "More picks").
- **Internal links are the priority** over external ones. Link the exact-match list page with
  natural anchor text ("our full [ranked Korean thriller list](...)"). Inline links count.
- **FAQ** answers the question in sentence one (featured-snippet bait) → emits `FAQPage`
  schema automatically.
- **Title + description** are also the search snippet — make them click-worthy and accurate.
- **Freshness:** set `updatedDate` when you revise; consider year in the title for
  time-sensitive posts ("...in 2026") and update it annually.
- Posts get `BlogPosting` + `BreadcrumbList` (+ `FAQPage`) JSON-LD automatically.

---

## 6. Performance — keep pages light and fast (this is a ranking factor)

The site is static, zero-JS by default. **Don't regress that.** A blog post must stay as fast
as the rest of the site.

- **No client-side JavaScript.** No embeds, no widgets, no `<script>`, no React/islands. If
  you think you need JS, you don't — ask first.
- **Images, sparingly and optimized:**
  - One `hero` is plenty. Prefer a **TMDb backdrop URL** (already allowed + optimized) or
    rely on the auto-rendered movie poster cards (already optimized via `<Image>`).
  - Don't paste large raw `<img>` tags into the Markdown body. If you must add a body image,
    keep it small and always set `width`/`height` + `loading="lazy"` (avoid layout shift).
  - Never embed full-res posters/backdrops at display sizes larger than needed.
- **No new dependencies, fonts, or CSS frameworks.** Use the existing styles only.
- **No iframes / video embeds / GIFs.** Link out to a trailer instead of embedding it.
- **Keep it text-first.** The format that ranks here is well-written words + our optimized
  poster cards — that's already fast. Don't add weight chasing visual flair.
- Target body length 700–1,200 words; quality over padding.

> Litmus test: if it adds a network request, blocks the main thread, or shifts layout, it
> probably shouldn't be in a post.

---

## 7. Before you ship — checklist

- [ ] Filename is kebab-case, keyword-rich, matches intended URL.
- [ ] Primary keyword in title, first 100 words, one heading, description — all natural.
- [ ] `description` ≤ 160 chars and compelling.
- [ ] Body is 700–1,200 words, skimmable, simple, genuinely useful.
- [ ] Recommends 5–8 specific movies with a reason each.
- [ ] `linkedLists`: ≥1 valid list/combo page. `linkedMovies`: ≥3 real catalog slugs.
- [ ] At least one **inline** link to the most relevant list page.
- [ ] `faq`: 3–5 real questions, first sentence answers directly.
- [ ] No client JS, no heavy/raw images, no new deps, no iframes.
- [ ] Originality + honesty rules met (no copied text, no fabricated ratings/parental claims).
- [ ] `npm run check` (0 errors) → `npm run build` → `npm run validate-seo` all pass.

**Verify links/slugs quickly** (paths must resolve to generated pages):

```bash
# Is a combo page generated? (must be ≥ 8 eligible films)
grep -rl '"languages".*japanese' src/content/movies | head   # sanity-check the tag exists
# Confirm a movie slug exists:
ls src/content/movies/ringu-1998.json
# After build, confirm the linked pages were actually generated:
ls dist/best/japanese-horror dist/movie/ringu-1998
```

---

## 8. Picking topics (what to write next)

Pull from [KEYWORDS.md](KEYWORDS.md). Best blog candidates are angles a bare list page can't
fully serve but that share its keywords:

- **Keyword × modifier:** *best / top / greatest / most-watched / underrated* × genre ×
  language/country × decade/era × studio. (e.g. "Most underrated Korean thrillers",
  "Greatest A24 horror movies", "Best Bollywood action movies of the 2010s").
- **"If you liked X" / readalike** posts → link to the relevant list + similar movies.
- **Curated occasion lists** ("Korean movies for date night", "scariest films to stream").
- **Era / regional deep-dives** ("How South Korea took over the thriller").
- **Actor/career pieces** — editorial only, linking to that actor's films **already in our
  catalog** (no fabricated filmography facts; no new data pipeline — see CLAUDE.md).

Each topic should map to at least one existing list/combo page to link into. If the natural
target list doesn't exist yet, consider building that list first.

---

## 9. Workflow

1. Pick a topic + primary keyword from [KEYWORDS.md](KEYWORDS.md); confirm a target list/combo
   page exists to link into.
2. Copy `src/content/blog/_TEMPLATE.md` to a new kebab-case `.md` file.
3. Fill frontmatter (title, description, dates, hero, tags, `linkedLists`, `linkedMovies`,
   `faq`). Verify every slug/list resolves (§7).
4. Write the body per §2–§3: hook → context → recommendations → next-step close.
5. Run the §7 checklist + `check` / `build` / `validate-seo`.
6. Small commit; push.
