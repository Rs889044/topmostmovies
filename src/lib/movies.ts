/**
 * movies.ts — site-side access to the movie dataset (content collection). Loads all
 * movies once and exposes lookup + the data needed to build lists and "Featured in".
 * See docs/DATA-MODEL.md.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Movie } from '../content.config';

export type MovieData = Movie;

/** All movies as plain data objects (collection `data` flattened). */
export async function allMovies(): Promise<MovieData[]> {
  const entries = await getCollection('movies');
  return entries.map((e: CollectionEntry<'movies'>) => e.data);
}

/** Map of slug → movie for O(1) lookups. */
export async function movieBySlug(): Promise<Map<string, MovieData>> {
  const movies = await allMovies();
  return new Map(movies.map((m) => [m.slug, m]));
}

/**
 * Smaller TMDb backdrop for decorative hero images (they sit at low opacity behind text, so
 * a lighter file improves LCP without visible quality loss). Swaps the `/w1280/` size
 * segment for a smaller one; safe no-op for non-TMDb URLs.
 */
export function heroBackdrop(
  url: string | undefined,
  size: 'w780' | 'w300' = 'w780',
): string | undefined {
  if (!url) return undefined;
  return url.replace(/\/t\/p\/w\d+\//, `/t/p/${size}/`);
}
