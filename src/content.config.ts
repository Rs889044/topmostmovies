/**
 * Astro content collections + Zod schemas. Validated at build time — bad data fails the
 * build rather than shipping. See docs/DATA-MODEL.md.
 *
 * - `movies`  : the cached, normalized dataset produced by `npm run fetch-data`
 *               (data lives as a JSON data-collection in src/content/movies/).
 * - `lists`   : editorial overrides per (dimension, value) — intro, rank, blurbs, FAQ.
 */
import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

/* --------------------------------------------------------------------- movies ------ */

export const movieSchema = z.object({
  // Identity
  id: z.string(), // e.g. "tmdb-496243"
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be kebab-case'),
  title: z.string(),
  originalTitle: z.string().optional(),
  year: z.number().int().gte(1888).lte(2100), // first films ~1888
  decade: z.string().regex(/^\d{4}s$/), // derived, e.g. "2010s"

  // Taxonomy / tags — slugs from src/lib/taxonomy.ts
  industries: z.array(z.string()).default([]),
  countries: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  genres: z.array(z.string()).default([]),
  studios: z.array(z.string()).default([]), // production studios (Pixar, Ghibli…) — permanent
  themes: z.array(z.string()).default([]), // audience/subject themes (coming-of-age, true-story…)

  // Media
  posterUrl: z.url().optional(),
  backdropUrl: z.url().optional(),
  posterAlt: z.string(),

  // Content
  synopsis: z.string().optional(), // ORIGINAL summary — hand-written (flagship) or generated from metadata
  synopsisAuto: z.boolean().optional(), // true if synopsis was metadata-generated (not hand-written)
  tmdbOverview: z.string().optional(), // raw TMDb overview — reference only, never published verbatim

  // Ratings
  tmdbRating: z.number().min(0).max(10).optional(),
  tmdbVotes: z.number().int().nonnegative().optional(),
  imdbRating: z.number().min(0).max(10).optional(), // from OMDb; undefined if unavailable
  imdbId: z.string().optional(),
  popularity: z.number().nonnegative().optional(),

  // Parental / age — HONEST ONLY (never fabricate; see docs/DATA-SOURCES.md)
  certification: z.string().optional(),
  certificationCountry: z.string().optional(),
  contentDescriptors: z.array(z.string()).default([]),
  parentalNotes: z.string().optional(), // optional editorial guidance

  // Editorial
  blurb: z.string().optional(),
});

// Derive the Movie type from Astro's generated collection entry rather than `z.infer`
// (astro:content re-exports `z` as a value only, and inferring directly can cross zod
// major versions). This always tracks the schema and avoids type-namespace pitfalls.
export type Movie = import('astro:content').CollectionEntry<'movies'>['data'];

const movies = defineCollection({
  // Each movie is one JSON file in src/content/movies/<slug>.json, produced by fetch-data.
  loader: glob({ pattern: '**/*.json', base: './src/content/movies' }),
  schema: movieSchema,
});

/* ---------------------------------------------------------------------- lists ------ */

export const DIMENSIONS = [
  'industry',
  'country',
  'language',
  'genre',
  'year',
  'decade',
] as const;

const listSchema = z.object({
  dimension: z.enum(DIMENSIONS),
  value: z.string(), // taxonomy slug, or year string for the year dimension
  title: z.string(), // e.g. "Top 10 Romance Movies"
  intro: z.string().optional(), // original intro paragraph (Phase 5)
  // Ordered movie slugs that pin to the top; remaining slots fill by default sort.
  rankOverride: z.array(reference('movies')).default([]),
  perMovieBlurb: z.record(z.string(), z.string()).default({}), // slug -> "why it made THIS list"
  faq: z
    .array(z.object({ q: z.string(), a: z.string() }))
    .default([]),
});

const lists = defineCollection({
  loader: glob({ pattern: '**/*.{md,yaml,yml,json}', base: './src/content/lists' }),
  schema: listSchema,
});

/* ----------------------------------------------------------------------- blog ------ */
// Original editorial articles targeting hot/trending keyword combos (best / top /
// greatest / most-watched × genre × language/country × decade × studio, plus actor &
// regional pieces). Each post hand-internal-links to our list pages and movie pages —
// pushing crawl depth + link equity into the long-tail lists. See docs/SEO.md.

// Dimensions a blog post can link to: the six list DIMENSIONS, plus studio/theme (which
// also have list pages) and 'combo' (a /best/<value> long-tail page).
export const BLOG_LINK_DIMENSIONS = [...DIMENSIONS, 'studio', 'theme', 'combo'] as const;

// A typed reference to one of our generated pages. dimension+value → a path:
//   { dimension: 'language', value: 'korean' } → /language/korean
//   { dimension: 'combo',    value: 'korean-thriller' } → /best/korean-thriller
const blogListLink = z.object({
  dimension: z.enum(BLOG_LINK_DIMENSIONS),
  value: z.string(),
  /** Optional override for the link text; otherwise derived from the taxonomy name. */
  label: z.string().optional(),
});

const blogSchema = z.object({
  title: z.string(),
  // Meta description / social summary. Also the listing-card excerpt. ≤ ~160 chars ideal.
  description: z.string().max(200),
  // Publication + last-updated dates (ISO). publishDate drives ordering + Article schema;
  // updatedDate (when set) surfaces freshness to Google.
  publishDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  // Hero image: a TMDb backdrop URL (attribution already in the footer) or a local asset.
  hero: z.string().optional(),
  heroAlt: z.string().optional(),
  // Free-text topical tags shown on the post + used for "related posts".
  tags: z.array(z.string()).default([]),
  // Curated internal links surfaced as a prominent "Explore these lists" block.
  linkedLists: z.array(blogListLink).default([]),
  // Movie slugs to surface as cards in a "Movies mentioned" block (must exist in catalog).
  linkedMovies: z.array(reference('movies')).default([]),
  // Optional FAQ → FAQPage schema (People-Also-Ask capture), same shape as lists.
  faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
  // Hide from index/sitemap without deleting (e.g. work-in-progress).
  draft: z.boolean().default(false),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: blogSchema,
});

// Derive types from the generated collection entry (not z.infer — astro:content re-exports
// `z` as a value only, so a `z.infer<>` namespace reference fails to type-check; see movies).
export type BlogPostData = import('astro:content').CollectionEntry<'blog'>['data'];
export type BlogListLink = BlogPostData['linkedLists'][number];

export const collections = { movies, lists, blog };
