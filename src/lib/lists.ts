/**
 * lists.ts — the tagging engine. Lists are QUERIES over the movie set: filter movies by a
 * (dimension, value), rank them (editorial override → default sort), truncate to Top N.
 * Also provides list enumeration (for getStaticPaths) and the "Featured in" reverse-map.
 * See docs/DATA-MODEL.md.
 */
import { getCollection } from 'astro:content';
import type { MovieData } from './movies';
import { allMovies } from './movies';
import { type Dimension, nameForSlug } from './taxonomy';

export const DEFAULT_TOP_N = 10;

/* ----------------------------------------------------------------- membership ------ */

/** Does a movie belong to the (dimension, value) list? */
export function isMember(movie: MovieData, dimension: Dimension, value: string): boolean {
  switch (dimension) {
    case 'industry':
      return movie.industries.includes(value);
    case 'country':
      return movie.countries.includes(value);
    case 'language':
      return movie.languages.includes(value);
    case 'genre':
      return movie.genres.includes(value);
    case 'year':
      return String(movie.year) === value;
    case 'decade':
      return movie.decade === value;
  }
}

/* -------------------------------------------------------------------- ranking ------ */

/**
 * Default ranking signal: IMDb rating when present, else TMDb rating, then popularity as
 * a tiebreaker. Returns a sortable number (higher = better). See docs/DATA-MODEL.md.
 */
function defaultScore(m: MovieData): number {
  const rating = m.imdbRating ?? m.tmdbRating ?? 0;
  const pop = m.popularity ?? 0;
  // Rating dominates; popularity only breaks ties (scaled tiny).
  return rating * 1000 + Math.min(pop, 999);
}

export interface RankedList {
  dimension: Dimension;
  value: string;
  title: string; // "Top 10 Romance Movies"
  name: string; // display value, e.g. "Romance"
  movies: MovieData[]; // ranked, truncated
  total: number; // total members before truncation
}

/** Human title for a list. */
function listTitle(dimension: Dimension, name: string, count: number): string {
  const n = Math.min(count, DEFAULT_TOP_N);
  switch (dimension) {
    case 'year':
      return `Top ${n} Movies of ${name}`;
    case 'decade':
      return `Top ${n} Movies of the ${name}`;
    case 'language':
      return `Top ${n} ${name}-Language Movies`;
    case 'country':
      return `Top ${n} Movies from ${name}`;
    case 'industry':
    case 'genre':
      return `Top ${n} ${name} Movies`;
  }
}

/**
 * Build a ranked list for a (dimension, value). Applies an editorial rankOverride (movie
 * slugs pinned to the top in order) when present, then fills remaining slots by default
 * sort. `overrides` is the optional editorial list entry's data.
 */
export function buildList(
  movies: MovieData[],
  dimension: Dimension,
  value: string,
  overrides?: { title?: string; rankOverride?: string[] },
  topN = DEFAULT_TOP_N,
): RankedList {
  const members = movies.filter((m) => isMember(m, dimension, value));

  const pinned: MovieData[] = [];
  const pinnedSlugs = new Set(overrides?.rankOverride ?? []);
  if (pinnedSlugs.size > 0) {
    const bySlug = new Map(members.map((m) => [m.slug, m]));
    for (const slug of overrides!.rankOverride!) {
      const m = bySlug.get(slug);
      if (m) pinned.push(m);
    }
  }

  const rest = members
    .filter((m) => !pinnedSlugs.has(m.slug))
    .sort((a, b) => defaultScore(b) - defaultScore(a));

  const ranked = [...pinned, ...rest].slice(0, topN);
  const name = nameForSlug(dimension, value) ?? value;

  return {
    dimension,
    value,
    name,
    title: overrides?.title ?? listTitle(dimension, name, members.length),
    movies: ranked,
    total: members.length,
  };
}

/* ----------------------------------------------------------------- enumeration ----- */

export interface ListRef {
  dimension: Dimension;
  value: string;
  name: string;
}

/**
 * Every (dimension, value) that has at least one movie — used by getStaticPaths so we only
 * generate list pages that have content. Years/decades are derived from the movie set.
 */
export async function enumerateLists(): Promise<ListRef[]> {
  const movies = await allMovies();
  const refs: ListRef[] = [];

  const add = (dimension: Dimension, value: string) => {
    const name = nameForSlug(dimension, value) ?? value;
    if (!refs.some((r) => r.dimension === dimension && r.value === value)) {
      refs.push({ dimension, value, name });
    }
  };

  for (const m of movies) {
    m.industries.forEach((v) => add('industry', v));
    m.countries.forEach((v) => add('country', v));
    m.languages.forEach((v) => add('language', v));
    m.genres.forEach((v) => add('genre', v));
    add('year', String(m.year));
    add('decade', m.decade);
  }
  return refs;
}

/** Enumerate the values for one dimension (for that dimension's getStaticPaths). */
export async function valuesForDimension(dimension: Dimension): Promise<ListRef[]> {
  return (await enumerateLists()).filter((r) => r.dimension === dimension);
}

/* --------------------------------------------------------------- featured in ------- */

/**
 * For a movie, every list it belongs to — powers the "Featured in" section + internal
 * linking on the movie page. Returns links with display names + paths.
 */
export function featuredIn(movie: MovieData): { dimension: Dimension; name: string; path: string }[] {
  const out: { dimension: Dimension; name: string; path: string }[] = [];
  const push = (dimension: Dimension, value: string, base: string) => {
    out.push({
      dimension,
      name: nameForSlug(dimension, value) ?? value,
      path: `/${base}/${value}`,
    });
  };
  movie.industries.forEach((v) => push('industry', v, 'industry'));
  movie.countries.forEach((v) => push('country', v, 'country'));
  movie.languages.forEach((v) => push('language', v, 'language'));
  movie.genres.forEach((v) => push('genre', v, 'genre'));
  push('year', String(movie.year), 'year');
  push('decade', movie.decade, 'decade');
  return out;
}

/* ------------------------------------------------------- editorial overrides ------- */

/** Load the editorial list override for a (dimension, value), if one exists. */
export async function listOverride(
  dimension: Dimension,
  value: string,
): Promise<{ title?: string; intro?: string; rankOverride?: string[]; perMovieBlurb?: Record<string, string>; faq?: { q: string; a: string }[] } | undefined> {
  // The `lists` collection is empty until editorial content lands in Phase 5; getCollection
  // warns on an empty collection, so swallow that case quietly.
  const lists = await getCollection('lists').catch(() => []);
  const entry = lists.find(
    (l) => l.data.dimension === dimension && l.data.value === value,
  );
  if (!entry) return undefined;
  return {
    title: entry.data.title,
    intro: entry.data.intro,
    // rankOverride entries are references; coerce to slug ids.
    rankOverride: entry.data.rankOverride.map((r) => (typeof r === 'string' ? r : r.id)),
    perMovieBlurb: entry.data.perMovieBlurb,
    faq: entry.data.faq,
  };
}
