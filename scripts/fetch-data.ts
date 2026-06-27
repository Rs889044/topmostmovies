/**
 * fetch-data.ts — build-time catalog builder. Runs the discovery plan to collect a broad,
 * deduplicated set of TMDb movie ids across every dimension, then for each id:
 *   fetch detail + certification → fetch OMDb IMDb rating → normalize (taxonomy slugs +
 *   custom-category rules) → write src/content/movies/<slug>.json
 *
 * APIs are never hit at request time — this runs via `npm run fetch-data`. Responses are
 * cached on disk (.cache/, git-ignored) so re-runs are cheap. See docs/DATA-SOURCES.md.
 *
 * Editorial copy (hand-written synopses/parental notes) lives in scripts/apply-editorial.ts
 * and is re-applied automatically at the end so a refetch never wipes it.
 */
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import {
  backdropUrl,
  discoverMovies,
  getCertification,
  getKeywords,
  getMovie,
  posterUrl,
  type TmdbMovieDetail,
} from './tmdb.ts';
import { getOmdbRatings } from './omdb.ts';
import { movieSlug } from './lib/util.ts';
import { buildPlan } from './discovery-plan.ts';
import { applyEditorial } from './apply-editorial.ts';
import {
  COUNTRIES,
  LANGUAGES,
  GENRES,
  CUSTOM_GENRES,
  decadeForYear,
  studioSlugsFor,
  themeSlugsFor,
} from '../src/lib/taxonomy.ts';

const OUT_DIR = join(process.cwd(), 'src', 'content', 'movies');
const TARGET_MAX = 500; // safety cap on catalog size

/** Map TMDb country/language/genre ids to our slugs, dropping ones we don't model. */
function mapCountries(d: TmdbMovieDetail): string[] {
  const codes = new Set<string>([
    ...(d.origin_country ?? []),
    ...d.production_countries.map((c) => c.iso_3166_1),
  ]);
  return [...codes].map((c) => COUNTRIES[c]?.slug).filter((s): s is string => Boolean(s));
}

function mapLanguages(d: TmdbMovieDetail): string[] {
  // Use ONLY the original language — the language the film was made in. Including
  // `spoken_languages` wrongly tagged English films as French/Spanish from a few lines of
  // dialogue (e.g. Pulp Fiction appearing on the French list). A movie's language is
  // effectively single. See docs/DATA-MODEL.md.
  const slug = LANGUAGES[d.original_language]?.slug;
  return slug ? [slug] : [];
}

function mapGenres(d: TmdbMovieDetail): string[] {
  return [
    ...new Set(
      d.genres.map((g) => GENRES[g.id]?.slug).filter((s): s is string => Boolean(s)),
    ),
  ];
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

/**
 * Custom (editorial) category rules applied by tag pattern — lets us target long-tail
 * keywords that aren't TMDb genres. "k-drama" = Korean-language romance/comedy/drama.
 */
function deriveCustomGenres(
  languages: string[],
  genres: string[],
): string[] {
  const out: string[] = [];
  if (
    CUSTOM_GENRES['k-drama'] &&
    languages.includes('korean') &&
    (genres.includes('romance') || genres.includes('comedy') || genres.includes('drama'))
  ) {
    out.push('k-drama');
  }
  return out;
}

async function buildMovie(id: number) {
  const detail = await getMovie(id);

  // Skip entries without the essentials for a good page.
  if (!detail.release_date || !detail.poster_path) return undefined;
  const year = Number(detail.release_date.slice(0, 4));
  if (!Number.isFinite(year) || year < 1900) return undefined;

  const countries = mapCountries(detail);
  const languages = mapLanguages(detail);
  let genres = mapGenres(detail);
  const industries = deriveIndustries(countries, languages);
  genres = [...new Set([...genres, ...deriveCustomGenres(languages, genres)])];

  // Only keep movies that land in at least one modeled dimension list.
  if (countries.length === 0 && languages.length === 0 && genres.length === 0) {
    return undefined;
  }

  const cert = await getCertification(id, 'US');
  const imdbId = detail.imdb_id ?? undefined;
  const omdb = await getOmdbRatings(imdbId);

  // Studios (from cached detail — permanent) + themes (from keywords endpoint).
  const studios = studioSlugsFor((detail.production_companies ?? []).map((c) => c.name));
  const keywords = await getKeywords(id);
  const themes = themeSlugsFor(keywords);

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
    studios,
    themes,

    posterUrl: posterUrl(detail.poster_path),
    backdropUrl: backdropUrl(detail.backdrop_path),
    posterAlt: `${detail.title} (${year}) movie poster`,

    // TMDb overview kept for reference + as a fallback blurb source (never published as
    // our "synopsis"; original synopses come from apply-editorial.ts).
    tmdbOverview: detail.overview || undefined,

    tmdbRating: detail.vote_average || undefined,
    tmdbVotes: detail.vote_count || undefined,
    imdbRating: omdb.imdbRating,
    imdbId,
    popularity: detail.popularity || undefined,

    certification: cert?.certification,
    certificationCountry: cert?.country,
    contentDescriptors: [],
  };
}

async function collectIds(): Promise<number[]> {
  const plan = buildPlan();
  const ids = new Set<number>();
  console.log(`Running ${plan.length} discovery queries…`);

  for (const entry of plan) {
    for (let page = 1; page <= entry.pages; page++) {
      try {
        const pageIds = await discoverMovies({ ...entry.params, page });
        pageIds.forEach((id) => ids.add(id));
      } catch (err) {
        console.warn(`  ⚠ discovery "${entry.label}" p${page}: ${(err as Error).message}`);
      }
    }
    if (ids.size >= TARGET_MAX) break;
  }

  console.log(`Discovered ${ids.size} unique movie ids.\n`);
  return [...ids].slice(0, TARGET_MAX);
}

async function main() {
  const ids = await collectIds();

  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  const slugsSeen = new Set<string>();
  let ok = 0;
  let i = 0;
  for (const id of ids) {
    i++;
    try {
      const movie = await buildMovie(id);
      if (!movie) continue;
      // Disambiguate rare slug collisions (same title + year).
      let slug = movie.slug;
      let n = 2;
      while (slugsSeen.has(slug)) slug = `${movie.slug}-${n++}`;
      slugsSeen.add(slug);
      movie.slug = slug;

      await writeFile(
        join(OUT_DIR, `${slug}.json`),
        JSON.stringify(movie, null, 2) + '\n',
        'utf8',
      );
      ok++;
      if (ok % 50 === 0) console.log(`  …${ok} movies written (${i}/${ids.length} processed)`);
    } catch (err) {
      console.error(`  ✗ id ${id}: ${(err as Error).message}`);
    }
  }

  console.log(`\nWrote ${ok} movies to src/content/movies/.`);

  // Re-apply hand-written editorial copy so a refetch never loses it.
  const applied = await applyEditorial();
  console.log(`Re-applied editorial copy to ${applied} movie(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
