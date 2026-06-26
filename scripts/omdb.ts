/**
 * OMDb client (build-time only). Supplementary source: the IMDb rating number (and
 * optionally RT / Metacritic). Degrades gracefully — if the key is missing or invalid,
 * it warns and returns undefined so the build still succeeds without IMDb ratings.
 * See docs/DATA-SOURCES.md.
 */
import { fetchJson, RateLimiter } from './lib/util.ts';

const BASE = 'https://www.omdbapi.com/';
// OMDb free tier is ~1,000 req/day — be gentle: ~4 req/s.
const limiter = new RateLimiter(250);

const API_KEY = process.env.OMDB_API_KEY;
let warnedMissing = false;

interface OmdbResponse {
  Response: 'True' | 'False';
  Error?: string;
  imdbRating?: string; // "8.5" or "N/A"
  imdbID?: string;
  Ratings?: { Source: string; Value: string }[];
}

export interface OmdbRatings {
  imdbRating?: number;
  rottenTomatoes?: number; // percent 0–100
  metacritic?: number; // 0–100
}

/**
 * Fetch ratings by IMDb id. Returns {} (and warns once) if the key is absent/invalid or
 * the title isn't found — never throws for those cases, and never fabricates a rating.
 */
export async function getOmdbRatings(imdbId: string | undefined): Promise<OmdbRatings> {
  if (!imdbId) return {};
  if (!API_KEY) {
    if (!warnedMissing) {
      console.warn('  ⚠ OMDB_API_KEY not set — skipping IMDb ratings (movies keep them empty).');
      warnedMissing = true;
    }
    return {};
  }

  const url = `${BASE}?i=${encodeURIComponent(imdbId)}&apikey=${API_KEY}`;
  let data: OmdbResponse;
  try {
    data = await fetchJson<OmdbResponse>(url, { limiter, label: `omdb ${imdbId}` });
  } catch (err) {
    console.warn(`  ⚠ OMDb request failed for ${imdbId}: ${(err as Error).message}`);
    return {};
  }

  if (data.Response === 'False') {
    if (!warnedMissing && /invalid api key/i.test(data.Error ?? '')) {
      console.warn(`  ⚠ OMDb: ${data.Error} — activate the key, then re-run fetch-data.`);
      warnedMissing = true;
    }
    return {};
  }

  const out: OmdbRatings = {};
  const imdb = parseFloat(data.imdbRating ?? '');
  if (Number.isFinite(imdb)) out.imdbRating = imdb;

  for (const r of data.Ratings ?? []) {
    if (r.Source === 'Rotten Tomatoes') {
      const pct = parseInt(r.Value, 10);
      if (Number.isFinite(pct)) out.rottenTomatoes = pct;
    } else if (r.Source === 'Metacritic') {
      const score = parseInt(r.Value, 10);
      if (Number.isFinite(score)) out.metacritic = score;
    }
  }
  return out;
}
