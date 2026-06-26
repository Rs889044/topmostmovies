/**
 * fetch-data.ts — build-time orchestrator. For each seed title:
 *   resolve TMDb id → fetch detail + certification → fetch OMDb IMDb rating →
 *   normalize to the movie schema (taxonomy slugs) → write src/content/movies/<slug>.json
 *
 * APIs are never hit at request time — this runs via `npm run fetch-data`. Results are
 * cached on disk (.cache/, git-ignored) so re-runs are cheap. See docs/DATA-SOURCES.md.
 *
 * Run with: node --experimental-strip-types --env-file=.env scripts/fetch-data.ts
 * (npm script wires this up.)
 */
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import {
  backdropUrl,
  findMovieId,
  getCertification,
  getMovie,
  posterUrl,
  type TmdbMovieDetail,
} from './tmdb.ts';
import { getOmdbRatings } from './omdb.ts';
import { movieSlug } from './lib/util.ts';
import { SEED_MOVIES, type SeedEntry } from './seed-movies.ts';
import {
  COUNTRIES,
  LANGUAGES,
  GENRES,
  CUSTOM_GENRES,
  decadeForYear,
} from '../src/lib/taxonomy.ts';

const OUT_DIR = join(process.cwd(), 'src', 'content', 'movies');

/** Map TMDb country/language/genre ids to our slugs, dropping ones we don't model. */
function mapCountries(d: TmdbMovieDetail): string[] {
  const codes = new Set<string>([
    ...(d.origin_country ?? []),
    ...d.production_countries.map((c) => c.iso_3166_1),
  ]);
  return [...codes].map((c) => COUNTRIES[c]?.slug).filter((s): s is string => Boolean(s));
}

function mapLanguages(d: TmdbMovieDetail): string[] {
  const codes = new Set<string>([
    d.original_language,
    ...d.spoken_languages.map((l) => l.iso_639_1),
  ]);
  return [...codes].map((c) => LANGUAGES[c]?.slug).filter((s): s is string => Boolean(s));
}

function mapGenres(d: TmdbMovieDetail, custom: string[] = []): string[] {
  const fromTmdb = d.genres
    .map((g) => GENRES[g.id]?.slug)
    .filter((s): s is string => Boolean(s));
  const validCustom = custom.filter((c) => CUSTOM_GENRES[c]);
  return [...new Set([...fromTmdb, ...validCustom])];
}

/**
 * Derive editorial "industry" tags from country + language. Hollywood = US English;
 * Bollywood = India Hindi. Deliberately narrow — extend as we add industries.
 */
function deriveIndustries(countries: string[], languages: string[]): string[] {
  const out: string[] = [];
  if (countries.includes('united-states') && languages.includes('english')) {
    out.push('hollywood');
  }
  if (countries.includes('india') && languages.includes('hindi')) {
    out.push('bollywood');
  }
  return out;
}

async function buildMovie(seed: SeedEntry) {
  const id = await findMovieId(seed.title, seed.year);
  if (!id) {
    console.warn(`  ✗ Not found on TMDb: ${seed.title} (${seed.year}) — skipped.`);
    return undefined;
  }

  const detail = await getMovie(id);
  const year = detail.release_date ? Number(detail.release_date.slice(0, 4)) : seed.year;

  const countries = mapCountries(detail);
  const languages = mapLanguages(detail);
  const genres = mapGenres(detail, seed.custom);
  const industries = deriveIndustries(countries, languages);

  const cert = await getCertification(id, 'US');
  const imdbId = detail.imdb_id ?? undefined;
  const omdb = await getOmdbRatings(imdbId);

  const slug = movieSlug(detail.title, year);

  return {
    id: `tmdb-${detail.id}`,
    slug,
    title: detail.title,
    originalTitle:
      detail.original_title !== detail.title ? detail.original_title : undefined,
    year,
    decade: decadeForYear(year),

    industries,
    countries,
    languages,
    genres,

    posterUrl: posterUrl(detail.poster_path),
    backdropUrl: backdropUrl(detail.backdrop_path),
    posterAlt: `${detail.title} (${year}) movie poster`,

    // Original synopsis is written in Phase 5; keep TMDb overview for reference only.
    tmdbOverview: detail.overview || undefined,

    tmdbRating: detail.vote_average || undefined,
    tmdbVotes: detail.vote_count || undefined,
    imdbRating: omdb.imdbRating,
    imdbId,
    popularity: detail.popularity || undefined,

    // Honest parental data only — omit when TMDb has none.
    certification: cert?.certification,
    certificationCountry: cert?.country,
    contentDescriptors: [],
  };
}

async function main() {
  console.log(`Fetching ${SEED_MOVIES.length} seed movies from TMDb + OMDb…\n`);

  // Fresh output dir so removed seeds don't leave stale files.
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  let ok = 0;
  for (const seed of SEED_MOVIES) {
    try {
      const movie = await buildMovie(seed);
      if (!movie) continue;
      await writeFile(
        join(OUT_DIR, `${movie.slug}.json`),
        JSON.stringify(movie, null, 2) + '\n',
        'utf8',
      );
      const imdb = movie.imdbRating ? `IMDb ${movie.imdbRating}` : 'IMDb —';
      const c = movie.certification ?? 'no cert';
      console.log(`  ✓ ${movie.slug}  [${c}, ${imdb}]`);
      ok += 1;
    } catch (err) {
      console.error(`  ✗ ${seed.title} (${seed.year}): ${(err as Error).message}`);
    }
  }

  console.log(`\nDone. Wrote ${ok}/${SEED_MOVIES.length} movies to src/content/movies/.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
