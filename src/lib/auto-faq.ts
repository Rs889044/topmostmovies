/**
 * auto-faq.ts — generates a sensible, list-specific FAQ when a list has no hand-written
 * one. Uses the list's ACTUAL ranked movies so answers are real, not boilerplate. Powers
 * FAQPage schema on every list (chance to win Google "People Also Ask" boxes). Question
 * phrasing mirrors how people actually search. All copy original/templated from facts.
 * See docs/CONTENT-GUIDELINES.md.
 */
import type { MovieData } from './movies';
import type { Dimension } from './taxonomy';

export interface QA {
  q: string;
  a: string;
}

function nameList(movies: MovieData[], n: number): string {
  const names = movies.slice(0, n).map((m) => m.title);
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/**
 * Build a 2–3 question FAQ for a list.
 * @param singular human phrase, singular — e.g. "Korean movie", "thriller movie", "Pixar movie"
 * @param plural   human phrase, plural   — e.g. "Korean movies", "thriller movies"
 */
export function autoFaq(
  dimension: Dimension,
  singular: string,
  plural: string,
  movies: MovieData[],
): QA[] {
  if (movies.length === 0) return [];
  const top = movies[0];
  const top3 = nameList(movies, 3);
  const out: QA[] = [];

  // Q1 — "what is the best …" mirrors real search; uses the real #1 + top 3.
  out.push({
    q: `What is the best ${singular}?`,
    a: `${top.title} (${top.year}) tops our ranking of the best ${plural}, based on a weighted blend of IMDb and TMDb ratings. ${top3} round out the top picks.`,
  });

  // Q2 — ranking method (builds trust + targets "how ranked" intent).
  out.push({
    q: `How are these ${plural} ranked?`,
    a: `We rank by a weighted rating that combines IMDb and TMDb scores with how many people voted — so well-loved, widely-seen films rank above obscure titles with a high score from only a handful of votes. Every pick also shows its official age rating.`,
  });

  // Q3 — dimension-specific.
  if (dimension === 'language' || dimension === 'country') {
    out.push({
      q: `Where should I start with ${plural}?`,
      a: `${top.title} is the most acclaimed and an easy entry point. From there, work down the ranked list above — each film includes its rating and honest age info.`,
    });
  } else if (dimension === 'genre' || dimension === 'theme') {
    out.push({
      q: `What are some good ${plural} to watch?`,
      a: `Beyond ${top.title}, our list above highlights the highest-rated ${plural} worth your time, each with its rating and age certification noted.`,
    });
  } else if (dimension === 'studio') {
    out.push({
      q: `Which ${singular} should I watch first?`,
      a: `${top.title} (${top.year}) is the highest-rated on our list and a great place to start.`,
    });
  } else if (dimension === 'decade' || dimension === 'industry') {
    out.push({
      q: `What are the best ${plural}?`,
      a: `${top3} are among the very best ${plural}, ranked by rating in the list above.`,
    });
  }

  return out;
}
