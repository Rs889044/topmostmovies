/**
 * generate-blurbs.ts — for movies WITHOUT a hand-written synopsis (the non-flagship
 * majority), compose an ORIGINAL, varied descriptive blurb from structured metadata
 * (genres, country/language, era, rating, certification). This is generated text we author
 * from facts — it NEVER copies TMDb's overview. Flagship movies (EDITORIAL_SLUGS) are left
 * untouched. Keeps every movie page substantive (not thin) for AdSense. Idempotent: it only
 * fills an empty/auto synopsis, re-running refreshes the auto ones.
 *
 * Run: node --experimental-strip-types scripts/generate-blurbs.ts
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { EDITORIAL_SLUGS } from './apply-editorial.ts';
import { nameForSlug, decadeForYear } from '../src/lib/taxonomy.ts';

const DIR = join(process.cwd(), 'src', 'content', 'movies');

interface MovieRec {
  slug: string;
  title: string;
  year: number;
  decade: string;
  genres: string[];
  countries: string[];
  languages: string[];
  imdbRating?: number;
  tmdbRating?: number;
  certification?: string;
  certificationCountry?: string;
  synopsis?: string;
  synopsisAuto?: boolean;
}

function listToProse(names: string[]): string {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/** Pick a deterministic variant per movie so wording differs across the catalog. */
function variant(slug: string, n: number): number {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % n;
}

function ratingClause(m: MovieRec): string {
  const r = m.imdbRating ?? m.tmdbRating;
  if (r === undefined) return '';
  const src = m.imdbRating !== undefined ? 'IMDb' : 'TMDb';
  if (r >= 8) return ` It's highly rated, holding a strong ${r.toFixed(1)} on ${src}.`;
  if (r >= 7) return ` It holds a solid ${r.toFixed(1)} rating on ${src}.`;
  if (r >= 6) return ` It carries a ${r.toFixed(1)} rating on ${src}.`;
  return ` It has a ${r.toFixed(1)} rating on ${src}.`;
}

function certClause(m: MovieRec): string {
  if (!m.certification) return ' An official age rating was not available at the time of writing.';
  const sys = m.certificationCountry ?? 'an international';
  return ` It carries a ${m.certification} certification (${sys} rating system) — see the film's page for parental details.`;
}

function buildBlurb(m: MovieRec): string {
  const genreNames = m.genres
    .map((g) => nameForSlug('genre', g))
    .filter((n): n is string => Boolean(n));
  const countryNames = m.countries
    .map((c) => nameForSlug('country', c))
    .filter((n): n is string => Boolean(n));
  const langNames = m.languages
    .map((l) => nameForSlug('language', l))
    .filter((n): n is string => Boolean(n));

  const genrePhrase = genreNames.length
    ? listToProse(genreNames.slice(0, 3)).toLowerCase()
    : 'feature';
  const origin =
    countryNames.length > 0
      ? `from ${listToProse(countryNames.slice(0, 2))}`
      : langNames.length > 0
        ? `in ${langNames[0]}`
        : '';
  const decade = m.decade ?? decadeForYear(m.year);

  const openers = [
    `${m.title} is a ${m.year} ${genrePhrase} film${origin ? ` ${origin}` : ''}.`,
    `Released in ${m.year}, ${m.title} is a ${genrePhrase} film${origin ? ` ${origin}` : ''}.`,
    `${m.title} (${m.year}) is a ${genrePhrase} film${origin ? ` ${origin}` : ''}.`,
  ];
  const middles = [
    ` A standout of ${decade} cinema, it earns its spot on our lists.`,
    ` It's one of the titles we feature across our ${decade} and genre rankings.`,
    ` It appears on several of our curated Top 10 lists.`,
  ];

  const opener = openers[variant(m.slug, openers.length)];
  const middle = middles[variant(m.slug + 'x', middles.length)];
  return `${opener}${ratingClause(m)}${middle}${certClause(m)}`;
}

async function main() {
  const files = await readdir(DIR);
  let filled = 0;
  for (const f of files) {
    if (!f.endsWith('.json')) continue;
    const path = join(DIR, f);
    const m: MovieRec = JSON.parse(await readFile(path, 'utf8'));

    // Never touch hand-written flagship synopses.
    if (EDITORIAL_SLUGS.has(m.slug)) continue;
    // Fill if missing OR previously auto-generated (refreshable).
    if (m.synopsis && !m.synopsisAuto) continue;

    m.synopsis = buildBlurb(m);
    m.synopsisAuto = true;
    await writeFile(path, JSON.stringify(m, null, 2) + '\n', 'utf8');
    filled += 1;
  }
  console.log(`Generated original blurbs for ${filled} movie(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
