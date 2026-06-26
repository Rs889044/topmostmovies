/**
 * TMDb client (build-time only). Primary data source: details, images, genres, release
 * dates + certifications, popularity. Auth via Bearer read token (preferred) or api_key.
 * See docs/DATA-SOURCES.md.
 */
import { fetchJson, RateLimiter } from './lib/util.ts';

const BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';
const POSTER_SIZE = 'w500';
const BACKDROP_SIZE = 'w1280';

// TMDb is generous (~50 req/s) but we stay polite: ~10 req/s.
const limiter = new RateLimiter(100);

const READ_TOKEN = process.env.TMDB_READ_TOKEN;
const API_KEY = process.env.TMDB_API_KEY;

if (!READ_TOKEN && !API_KEY) {
  throw new Error(
    'TMDb credentials missing. Set TMDB_READ_TOKEN or TMDB_API_KEY in .env (see .env.example).',
  );
}

function authHeaders(): Record<string, string> {
  return READ_TOKEN ? { Authorization: `Bearer ${READ_TOKEN}` } : {};
}

/** Build a TMDb URL; appends api_key only when no read token is configured. */
function url(path: string, params: Record<string, string> = {}): string {
  const u = new URL(`${BASE}${path}`);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  if (!READ_TOKEN && API_KEY) u.searchParams.set('api_key', API_KEY);
  return u.toString();
}

async function get<T>(path: string, params?: Record<string, string>, label?: string) {
  return fetchJson<T>(url(path, params), { headers: authHeaders(), limiter, label });
}

export function posterUrl(path: string | null): string | undefined {
  return path ? `${IMG_BASE}/${POSTER_SIZE}${path}` : undefined;
}
export function backdropUrl(path: string | null): string | undefined {
  return path ? `${IMG_BASE}/${BACKDROP_SIZE}${path}` : undefined;
}

/* ----------------------------------------------------------------- API shapes ------ */

export interface TmdbMovieDetail {
  id: number;
  title: string;
  original_title: string;
  original_language: string;
  overview: string;
  release_date: string; // "YYYY-MM-DD"
  poster_path: string | null;
  backdrop_path: string | null;
  popularity: number;
  vote_average: number;
  vote_count: number;
  genres: { id: number; name: string }[];
  origin_country?: string[];
  production_countries: { iso_3166_1: string; name: string }[];
  spoken_languages: { iso_639_1: string }[];
  imdb_id?: string | null;
}

interface ReleaseDatesResponse {
  results: {
    iso_3166_1: string;
    release_dates: { certification: string; type: number }[];
  }[];
}

export interface DiscoverParams {
  /** ISO-3166-1 origin/production country, e.g. "KR". */
  country?: string;
  /** ISO-639-1 original language, e.g. "ko". */
  language?: string;
  /** TMDb genre id. */
  genreId?: number;
  /** Release year. */
  year?: number;
  sortBy?: 'popularity.desc' | 'vote_average.desc' | 'vote_count.desc';
  /** Minimum vote count (filters out obscure/unrated entries on vote_average sorts). */
  minVotes?: number;
  page?: number;
}

interface DiscoverResult {
  page: number;
  total_pages: number;
  results: { id: number; vote_count: number; vote_average: number; popularity: number }[];
}

/**
 * Discover movie ids by filter. Used to build the catalog across dimensions (country,
 * language, genre, year) rather than a hand-typed list. Returns ids only; details are
 * fetched per movie afterward. See scripts/fetch-data.ts.
 */
export async function discoverMovies(params: DiscoverParams): Promise<number[]> {
  const q: Record<string, string> = {
    include_adult: 'false',
    include_video: 'false',
    sort_by: params.sortBy ?? 'popularity.desc',
    page: String(params.page ?? 1),
    'vote_count.gte': String(params.minVotes ?? 50),
  };
  if (params.country) q.with_origin_country = params.country;
  if (params.language) q.with_original_language = params.language;
  if (params.genreId) q.with_genres = String(params.genreId);
  if (params.year) q.primary_release_year = String(params.year);

  const res = await get<DiscoverResult>('/discover/movie', q, 'discover');
  return res.results.map((r) => r.id);
}

/** Find a movie by title (+ optional year) → its TMDb id. */
export async function findMovieId(title: string, year?: number): Promise<number | undefined> {
  const params: Record<string, string> = { query: title, include_adult: 'false' };
  if (year) params.year = String(year);
  const res = await get<{ results: { id: number }[] }>(
    '/search/movie',
    params,
    `search "${title}"`,
  );
  return res.results[0]?.id;
}

/** Full movie detail, with external_ids appended (for imdb_id). */
export async function getMovie(id: number): Promise<TmdbMovieDetail> {
  return get<TmdbMovieDetail>(
    `/movie/${id}`,
    { append_to_response: 'external_ids' },
    `movie ${id}`,
  );
}

/**
 * Official certification for a movie. Returns the cert from the preferred country if
 * present, else the first available — with the country it came from. Returns undefined
 * when no certification data exists (caller renders "Not rated / data unavailable").
 */
export async function getCertification(
  id: number,
  preferredCountry = 'US',
): Promise<{ certification: string; country: string } | undefined> {
  const res = await get<ReleaseDatesResponse>(
    `/movie/${id}/release_dates`,
    {},
    `release_dates ${id}`,
  );

  // "NR"/"Not Rated"/"Unrated" carry no real age guidance — treat them as no cert so the
  // UI shows the honest "Not rated / data unavailable" rather than a cryptic code.
  const NON_INFORMATIVE = new Set(['nr', 'not rated', 'unrated', 'ur', 'n/a']);
  const pickFrom = (entry: ReleaseDatesResponse['results'][number]) => {
    for (const r of entry.release_dates) {
      const cert = r.certification?.trim();
      if (cert && !NON_INFORMATIVE.has(cert.toLowerCase())) return cert;
    }
    return undefined;
  };

  const preferred = res.results.find((r) => r.iso_3166_1 === preferredCountry);
  if (preferred) {
    const cert = pickFrom(preferred);
    if (cert) return { certification: cert, country: preferredCountry };
  }
  for (const entry of res.results) {
    const cert = pickFrom(entry);
    if (cert) return { certification: cert, country: entry.iso_3166_1 };
  }
  return undefined;
}
