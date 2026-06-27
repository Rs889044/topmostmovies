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
    case 'studio':
      return movie.studios.includes(value);
    case 'theme':
      return movie.themes.includes(value);
    case 'year':
      return String(movie.year) === value;
    case 'decade':
      return movie.decade === value;
  }
}

/* -------------------------------------------------------------------- ranking ------ */

// --- Ranking constants (see docs/DATA-MODEL.md "Ranking") ---
// Bayesian weighted rating (IMDb Top-250 style) pulls low-vote films toward the catalog
// mean so a high score from a few hundred votes can't beat a slightly lower score from tens
// of thousands. Tuned against the current catalog.
const RATING_PRIOR = 7.1; // C: catalog mean of (IMDb||TMDb) ratings
const VOTE_PRIOR = 3000; // m: votes needed before a film's own rating dominates the prior
const CURRENT_YEAR = 2026;

// True concert films / making-of specials / event broadcasts — not "movies" for our lists.
// Anchored phrases only, so legitimate films ("… : The Movie") are NOT excluded.
const NON_FILM_TITLE =
  /(world tour|love yourself in|bring the soul|burn the stage|: making|making season|concert film|live in concert)/i;

/**
 * Eligibility for ranked lists. Filters out entries that would mislead a "best of" list:
 *  - too few votes to be a reliable signal,
 *  - unreleased/future films, and current-year films that are barely rated yet,
 *  - concert/making-of/event titles (not feature films).
 * Everything here is about list QUALITY — the movie pages still exist and are linked.
 */
export function isEligible(m: MovieData): boolean {
  const votes = m.tmdbVotes ?? 0;
  if (votes < 100) return false;
  if (m.year > CURRENT_YEAR) return false;
  if (m.year === CURRENT_YEAR && votes < 800) return false;
  if (NON_FILM_TITLE.test(m.title)) return false;
  if ((m.imdbRating ?? m.tmdbRating) === undefined) return false;
  return true;
}

/**
 * Bayesian weighted rating: (v/(v+m))·R + (m/(v+m))·C. Higher = better. Uses the IMDb
 * rating when present (else TMDb) as R, and TMDb vote count as v. See docs/DATA-MODEL.md.
 */
export function defaultScore(m: MovieData): number {
  const R = m.imdbRating ?? m.tmdbRating ?? 0;
  const v = m.tmdbVotes ?? 0;
  return (v / (v + VOTE_PRIOR)) * R + (VOTE_PRIOR / (v + VOTE_PRIOR)) * RATING_PRIOR;
}

/* ------------------------------------------------ site-wide special lists ---------- */

/** Greatest of all time — all eligible movies ranked by weighted rating. */
export function topRated(movies: MovieData[], topN = DEFAULT_TOP_N): MovieData[] {
  return movies.filter(isEligible).sort((a, b) => defaultScore(b) - defaultScore(a)).slice(0, topN);
}

/** Most popular / most watched — by TMDb popularity (with an eligibility floor). */
export function mostPopular(movies: MovieData[], topN = DEFAULT_TOP_N): MovieData[] {
  return movies
    .filter(isEligible)
    .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
    .slice(0, topN);
}

/** Best mature / R-rated films (adult-audience, NOT explicit). Ranked by weighted rating. */
export function topMature(movies: MovieData[], topN = DEFAULT_TOP_N): MovieData[] {
  const MATURE = /^(R|NC-17|MA ?15\+|R ?18\+|18A?|19|TV-MA|A|\+16|16|U\/A 16\+)$/i;
  return movies
    .filter((m) => isEligible(m) && m.certification && MATURE.test(m.certification.trim()))
    .sort((a, b) => defaultScore(b) - defaultScore(a))
    .slice(0, topN);
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
    case 'studio':
      return `Top ${n} ${name} Movies`;
    case 'theme':
      return `Top ${n} ${name} Movies`;
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

  // Editorial picks (rankOverride) are pinned to the top in order and bypass eligibility —
  // a human explicitly chose them.
  const pinned: MovieData[] = [];
  const pinnedSlugs = new Set(overrides?.rankOverride ?? []);
  if (pinnedSlugs.size > 0) {
    const bySlug = new Map(members.map((m) => [m.slug, m]));
    for (const slug of overrides!.rankOverride!) {
      const m = bySlug.get(slug);
      if (m) pinned.push(m);
    }
  }

  // The rest are filtered for list quality (eligibility) then ranked by weighted rating.
  const rest = members
    .filter((m) => !pinnedSlugs.has(m.slug) && isEligible(m))
    .sort((a, b) => defaultScore(b) - defaultScore(a));

  const ranked = [...pinned, ...rest].slice(0, topN);
  const name = nameForSlug(dimension, value) ?? value;
  // Honest count: films actually eligible to appear (pinned + eligible rest).
  const eligibleCount = pinned.length + rest.length;

  return {
    dimension,
    value,
    name,
    title: overrides?.title ?? listTitle(dimension, name, eligibleCount),
    movies: ranked,
    total: eligibleCount,
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
    m.studios.forEach((v) => add('studio', v));
    m.themes.forEach((v) => add('theme', v));
    add('year', String(m.year));
    add('decade', m.decade);
  }
  return refs;
}

// Minimum eligible movies for a list to be generated. Studio/theme are niche, so we
// require enough films for a credible Top list (avoids thin "Top 2" pages). Others: any
// populated value. Keep getStaticPaths, hubs, and internal links in sync via liveValueSet().
const DIMENSION_MIN: Record<Dimension, number> = {
  industry: 1, country: 1, language: 1, genre: 1, year: 1, decade: 1,
  studio: 5, theme: 5,
};

/** Set of "dimension:value" lists that actually get generated (meet DIMENSION_MIN).
 *  Single source of truth so internal links never point to a non-existent page. */
export async function liveValueSet(): Promise<Set<string>> {
  const refs = await enumerateLists();
  const movies = await allMovies();
  const set = new Set<string>();
  for (const r of refs) {
    const n = movies.filter((m) => isMember(m, r.dimension, r.value) && isEligible(m)).length;
    if (n >= DIMENSION_MIN[r.dimension]) set.add(`${r.dimension}:${r.value}`);
  }
  return set;
}

/** Enumerate the values for one dimension (for that dimension's getStaticPaths). */
export async function valuesForDimension(dimension: Dimension): Promise<ListRef[]> {
  const live = await liveValueSet();
  return (await enumerateLists()).filter(
    (r) => r.dimension === dimension && live.has(`${r.dimension}:${r.value}`),
  );
}

export interface HubEntry {
  value: string;
  name: string;
  path: string;
  count: number;
  /** A representative backdrop for the hub card (de-duplicated across the page). */
  posterUrl?: string;
  posterAlt?: string;
}

/**
 * Every populated value in a dimension, with count + a representative image — used to
 * render the dimension hub/index page (e.g. /genre lists all genres). Sorted by count desc.
 *
 * Picks a DISTINCT backdrop per card: the same top movie often heads several lists (e.g.
 * The Dark Knight tops Action + Thriller), so we greedily choose the highest-ranked movie
 * whose image isn't already used on this page — avoiding repeated thumbnails.
 */
export async function hubEntries(dimension: Dimension): Promise<HubEntry[]> {
  const movies = await allMovies();
  const values = (await valuesForDimension(dimension)).map((r) => r.value);

  // Sort by count desc first so the most important lists get first dibs on their top image.
  const ranked = values
    .map((value) => ({ value, list: buildList(movies, dimension, value, undefined, 8) }))
    .sort((a, b) => b.list.total - a.list.total);

  const usedImages = new Set<string>();
  const entries: HubEntry[] = ranked.map(({ value, list }) => {
    // Prefer a backdrop not yet used on this page; fall back to the top movie.
    const pick =
      list.movies.find((m) => m.backdropUrl && !usedImages.has(m.backdropUrl)) ??
      list.movies.find((m) => m.posterUrl && !usedImages.has(m.posterUrl)) ??
      list.movies[0];
    const img = pick?.backdropUrl ?? pick?.posterUrl;
    if (img) usedImages.add(img);
    return {
      value,
      name: nameForSlug(dimension, value) ?? value,
      path: `/${PATH_BASE[dimension]}/${value}`,
      count: list.total,
      posterUrl: img,
      posterAlt: pick ? `${pick.title} (${pick.year})` : undefined,
    };
  });
  return entries;
}

/* ------------------------------------------------------- combo lists (2-dimension) */
// Long-tail pages pairing two dimensions: language×genre ("Korean Thriller"),
// industry×genre ("Bollywood Thriller"), decade×genre ("2010s Thriller"). URL form
// /best/<a>-<b> where the SECOND value is always a genre. Targets validated long-tail
// keywords (see docs/KEYWORDS.md). Only combos with enough quality films become pages.

const COMBO_MIN = 8;

const COMBO_GENRES = [
  'romance', 'thriller', 'horror', 'action', 'drama', 'comedy', 'crime', 'animation', 'mystery',
] as const;
const COMBO_LANGUAGES = ['korean', 'hindi', 'japanese', 'spanish', 'french'] as const;
const COMBO_INDUSTRIES = ['hollywood', 'bollywood'] as const;
const COMBO_DECADES = ['1990s', '2000s', '2010s', '2020s'] as const;

/** A combo couples a primary dimension (language/industry/decade) with a genre. */
export interface ComboRef {
  primary: Dimension; // 'language' | 'industry' | 'decade'
  primaryValue: string;
  genre: string;
  primaryName: string;
  genreName: string;
  count: number;
}

function comboMembers(
  movies: MovieData[],
  primary: Dimension,
  primaryValue: string,
  genre: string,
): MovieData[] {
  return movies.filter(
    (m) => isMember(m, primary, primaryValue) && m.genres.includes(genre) && isEligible(m),
  );
}

const COMBO_SOURCES: { primary: Dimension; values: readonly string[] }[] = [
  { primary: 'language', values: COMBO_LANGUAGES },
  { primary: 'industry', values: COMBO_INDUSTRIES },
  { primary: 'decade', values: COMBO_DECADES },
];

/** Every viable combo (≥ COMBO_MIN eligible movies) — for getStaticPaths + linking. */
export async function enumerateCombos(): Promise<ComboRef[]> {
  const movies = await allMovies();
  const out: ComboRef[] = [];
  for (const { primary, values } of COMBO_SOURCES) {
    for (const primaryValue of values) {
      for (const genre of COMBO_GENRES) {
        const count = comboMembers(movies, primary, primaryValue, genre).length;
        if (count >= COMBO_MIN) {
          out.push({
            primary,
            primaryValue,
            genre,
            primaryName: nameForSlug(primary, primaryValue) ?? primaryValue,
            genreName: nameForSlug('genre', genre) ?? genre,
            count,
          });
        }
      }
    }
  }
  return out.sort((a, b) => b.count - a.count);
}

/** Parse a /best/<slug> param back into (primary, primaryValue, genre). */
export function parseComboSlug(
  slug: string,
): { primary: Dimension; primaryValue: string; genre: string } | undefined {
  // slug is "<primaryValue>-<genre>"; genre is the trailing known genre token.
  for (const genre of COMBO_GENRES) {
    const suffix = `-${genre}`;
    if (slug.endsWith(suffix)) {
      const primaryValue = slug.slice(0, -suffix.length);
      for (const { primary, values } of COMBO_SOURCES) {
        if ((values as readonly string[]).includes(primaryValue)) {
          return { primary, primaryValue, genre };
        }
      }
    }
  }
  return undefined;
}

export interface ComboList {
  primary: Dimension;
  primaryValue: string;
  genre: string;
  primaryName: string;
  genreName: string;
  title: string; // "Top 10 Korean Thriller Movies"
  movies: MovieData[];
  total: number;
}

/** Build a ranked combo list, weighted-ranked + eligibility-filtered. */
export function buildCombo(
  movies: MovieData[],
  primary: Dimension,
  primaryValue: string,
  genre: string,
  topN = DEFAULT_TOP_N,
): ComboList {
  const members = comboMembers(movies, primary, primaryValue, genre).sort(
    (a, b) => defaultScore(b) - defaultScore(a),
  );
  const primaryName = nameForSlug(primary, primaryValue) ?? primaryValue;
  const genreName = nameForSlug('genre', genre) ?? genre;
  // "Top 10 1990s Thriller Movies" / "Top 10 Korean Thriller Movies".
  const label = primary === 'decade' ? `${primaryName} ${genreName}` : `${primaryName} ${genreName}`;
  return {
    primary,
    primaryValue,
    genre,
    primaryName,
    genreName,
    title: `Top ${Math.min(members.length, topN)} ${label} Movies`,
    movies: members.slice(0, topN),
    total: members.length,
  };
}

/** Combos that involve a given (dimension,value) — for cross-linking from parent lists. */
export async function combosFor(
  dimension: Dimension,
  value: string,
): Promise<{ path: string; label: string; count: number }[]> {
  const combos = await enumerateCombos();
  return combos
    .filter((c) =>
      dimension === 'genre' ? c.genre === value : c.primary === dimension && c.primaryValue === value,
    )
    .map((c) => ({
      path: `/best/${c.primaryValue}-${c.genre}`,
      label: `${c.primaryName} ${c.genreName}`,
      count: c.count,
    }));
}

/* --------------------------------------------------------------- related lists ---- */

export interface RelatedLink {
  dimension: Dimension;
  value: string;
  name: string;
  path: string;
  count: number;
}

const PATH_BASE: Record<Dimension, string> = {
  industry: 'industry',
  country: 'country',
  language: 'language',
  genre: 'genre',
  studio: 'studio',
  theme: 'theme',
  year: 'year',
  decade: 'decade',
};

/**
 * Related lists for internal linking on a list page: sibling lists in the SAME dimension
 * (most-populated first), plus a few cross-dimension lists drawn from the movies in THIS
 * list (e.g. a genre list surfaces the countries/languages its films come from). Strengthens
 * topical internal linking for long-tail SEO. See docs/SEO.md.
 */
export function relatedLists(
  allMoviesData: MovieData[],
  dimension: Dimension,
  value: string,
  members: MovieData[],
  limit = 8,
  live?: Set<string>,
): RelatedLink[] {
  const out: RelatedLink[] = [];
  const seen = new Set<string>([`${dimension}:${value}`]);

  const add = (dim: Dimension, val: string) => {
    const key = `${dim}:${val}`;
    if (seen.has(key)) return;
    // Only link to lists that are actually generated (when a live set is provided).
    if (live && !live.has(key)) return;
    const count = allMoviesData.filter((m) => isMember(m, dim, val)).length;
    if (count === 0) return;
    seen.add(key);
    out.push({
      dimension: dim,
      value: val,
      name: nameForSlug(dim, val) ?? val,
      path: `/${PATH_BASE[dim]}/${val}`,
      count,
    });
  };

  // 1) Siblings in the same dimension, ranked by how populated they are.
  const siblingValues = new Set<string>();
  for (const m of allMoviesData) {
    const vals = membersValues(m, dimension);
    vals.forEach((v) => siblingValues.add(v));
  }
  [...siblingValues]
    .filter((v) => v !== value)
    .map((v) => ({ v, count: allMoviesData.filter((m) => isMember(m, dimension, v)).length }))
    .sort((a, b) => b.count - a.count)
    .forEach(({ v }) => add(dimension, v));

  // 2) Cross-dimension lists derived from this list's own movies (most common first).
  const crossDims: Dimension[] = ['genre', 'country', 'language', 'decade'].filter(
    (d) => d !== dimension,
  ) as Dimension[];
  for (const dim of crossDims) {
    const freq = new Map<string, number>();
    for (const m of members) {
      for (const v of membersValues(m, dim)) freq.set(v, (freq.get(v) ?? 0) + 1);
    }
    [...freq.entries()].sort((a, b) => b[1] - a[1]).forEach(([v]) => add(dim, v));
  }

  return out.slice(0, limit);
}

/** The taxonomy values a movie has for a given dimension. */
function membersValues(m: MovieData, dimension: Dimension): string[] {
  switch (dimension) {
    case 'industry':
      return m.industries;
    case 'country':
      return m.countries;
    case 'language':
      return m.languages;
    case 'genre':
      return m.genres;
    case 'studio':
      return m.studios;
    case 'theme':
      return m.themes;
    case 'year':
      return [String(m.year)];
    case 'decade':
      return [m.decade];
  }
}

/* --------------------------------------------------------------- featured in ------- */

/**
 * For a movie, every list it belongs to — powers the "Featured in" section + internal
 * linking on the movie page. Returns links with display names + paths.
 */
export function featuredIn(
  movie: MovieData,
  live?: Set<string>,
): { dimension: Dimension; name: string; path: string }[] {
  const out: { dimension: Dimension; name: string; path: string }[] = [];
  const push = (dimension: Dimension, value: string, base: string) => {
    // Only link to lists that are actually generated (live set), when provided.
    if (live && !live.has(`${dimension}:${value}`)) return;
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
  movie.studios.forEach((v) => push('studio', v, 'studio'));
  movie.themes.forEach((v) => push('theme', v, 'theme'));
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
