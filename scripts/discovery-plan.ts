/**
 * discovery-plan.ts — declares WHAT to pull from TMDb to build the catalog (~300–500
 * movies) across every dimension we model. fetch-data.ts runs each query, dedupes the ids,
 * then fetches details. Tuning the catalog = editing this file. See docs/DATA-SOURCES.md.
 */
import type { DiscoverParams } from './tmdb.ts';
import { COUNTRIES, LANGUAGES, GENRES } from '../src/lib/taxonomy.ts';

/** A discovery query + how many pages (20 results each) to pull. */
export interface PlanEntry {
  label: string;
  params: DiscoverParams;
  pages: number;
}

const COUNTRY_CODES = Object.keys(COUNTRIES); // US, GB, KR, JP, IN, FR, ES
const LANGUAGE_CODES = Object.keys(LANGUAGES); // en, ko, ja, hi, fr, es
const GENRE_IDS = Object.keys(GENRES).map(Number);

export function buildPlan(): PlanEntry[] {
  const plan: PlanEntry[] = [];

  // 1) Most popular + top-rated per modeled country (origin country).
  for (const country of COUNTRY_CODES) {
    plan.push({
      label: `country:${country} popular`,
      params: { country, sortBy: 'popularity.desc', minVotes: 100 },
      pages: 2,
    });
    plan.push({
      label: `country:${country} top-rated`,
      params: { country, sortBy: 'vote_average.desc', minVotes: 300 },
      pages: 1,
    });
  }

  // 2) Top-rated per modeled original language (catches diaspora/co-productions).
  for (const language of LANGUAGE_CODES) {
    plan.push({
      label: `lang:${language} top-rated`,
      params: { language, sortBy: 'vote_average.desc', minVotes: 200 },
      pages: 1,
    });
  }

  // 3) Genre depth for the languages we care about most (Korean/Hindi/Japanese/English):
  //    ensures genre×language long-tail lists have real depth.
  const focusLanguages = ['ko', 'hi', 'ja', 'en'];
  const focusGenres = [10749, 53, 27, 28, 18, 35, 9648, 16]; // romance, thriller, horror, action, drama, comedy, mystery, animation
  for (const language of focusLanguages) {
    for (const genreId of focusGenres) {
      plan.push({
        label: `lang:${language} genre:${genreId}`,
        params: { language, genreId, sortBy: 'popularity.desc', minVotes: 50 },
        pages: 1,
      });
    }
  }

  // 4) Globally top-rated (all-time greats) to backfill genre/decade lists.
  for (const genreId of GENRE_IDS) {
    plan.push({
      label: `global genre:${genreId} top-rated`,
      params: { genreId, sortBy: 'vote_average.desc', minVotes: 1000 },
      pages: 1,
    });
  }

  return plan;
}
