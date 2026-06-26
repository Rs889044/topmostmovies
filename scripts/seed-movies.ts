/**
 * Seed movie set to develop against (Phase 2). A small, deliberately diverse list that
 * exercises every dimension and our differentiation (Korean/Bollywood/long-tail). Each
 * entry is resolved against TMDb by title + year. Expanded/curated in Phase 5.
 *
 * `custom` lets us editorially attach long-tail category slugs (e.g. k-drama) that aren't
 * 1:1 TMDb genres. See docs/DATA-MODEL.md.
 */
export interface SeedEntry {
  title: string;
  year: number;
  /** Optional extra (custom) genre slugs to attach editorially. */
  custom?: string[];
}

export const SEED_MOVIES: SeedEntry[] = [
  // Korean — powers k-drama / Korean / South Korea long-tail
  { title: 'Parasite', year: 2019 },
  { title: 'Train to Busan', year: 2016 },
  { title: 'Oldboy', year: 2003 },
  { title: 'The Handmaiden', year: 2016 },
  { title: 'A Tale of Two Sisters', year: 2003 },
  { title: 'My Sassy Girl', year: 2001, custom: ['k-drama'] },
  { title: 'The Classic', year: 2003, custom: ['k-drama'] },

  // Bollywood / Hindi — powers Bollywood, Hindi, India
  { title: '3 Idiots', year: 2009 },
  { title: 'Dilwale Dulhania Le Jayenge', year: 1995 },
  { title: 'Gully Boy', year: 2019 },

  // Japanese
  { title: 'Spirited Away', year: 2001 },
  { title: 'Your Name.', year: 2016 },

  // Hollywood / English — multiple decades + genres
  { title: 'Inception', year: 2010 },
  { title: 'The Notebook', year: 2004 },
  { title: 'Get Out', year: 2017 },
  { title: 'Mad Max: Fury Road', year: 2015 },
  { title: 'The Silence of the Lambs', year: 1991 },

  // French / Spanish — country + language coverage
  { title: 'Amélie', year: 2001 },
  { title: 'Pan\'s Labyrinth', year: 2006 },
];
