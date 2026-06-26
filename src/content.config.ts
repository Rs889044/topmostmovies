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

export const collections = { movies, lists };
