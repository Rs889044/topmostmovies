/**
 * generate-list-intros.ts — one-off: write a concise ORIGINAL intro for every populated
 * genre/country/language/industry list that doesn't already have an editorial override, so
 * no list page ships thin. Skips lists that already have a hand-written YAML override.
 * FAQ-rich overrides are authored separately (the flagship lists). All copy original.
 *
 * Run: node --experimental-strip-types scripts/generate-list-intros.ts
 */
import { readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const LISTS_DIR = join(process.cwd(), 'src', 'content', 'lists');

// Hand-written intros per (dimension, value). Concise (~40–70 words), original, specific.
const INTROS: Record<string, { title: string; intro: string }> = {
  'genre/horror': {
    title: 'Top 10 Horror Movies',
    intro:
      "From a slow-burn Korean ghost story to Jordan Peele's genre-redefining debut, these are horror films that get under your skin and stay there. We've gathered the scariest and smartest the genre has to offer — and noted each film's age rating, because horror earns its warnings.",
  },
  'genre/drama': {
    title: 'Top 10 Drama Movies',
    intro:
      'Great drama lives in the details — the choices, the heartbreaks, the moments that feel true. This list spans acclaimed films from around the world, from Oscar-winning social satire to intimate stories of love and ambition, each with its age rating noted.',
  },
  'genre/crime': {
    title: 'Top 10 Crime Movies',
    intro:
      'Cons, killers, and the people who chase them — crime cinema is endlessly gripping, and this list collects some of its finest. Expect tense plotting and unforgettable characters across decades and countries, with each film\'s age rating flagged.',
  },
  'genre/comedy': {
    title: 'Top 10 Comedy Movies',
    intro:
      'Comedy travels in surprising ways — sometimes wrapped inside a thriller, sometimes carrying real heartbreak underneath the laughs. This list gathers films that are genuinely funny while being so much more, with age ratings noted for each.',
  },
  'genre/action': {
    title: 'Top 10 Action Movies',
    intro:
      'Big set pieces, real stakes, and momentum that never lets up — this list rounds up action filmmaking at its best, led by a desert chase widely called the finest of its kind. Age ratings are noted, since action can range from PG-13 to full-throttle R.',
  },
  'genre/adventure': {
    title: 'Top 10 Adventure Movies',
    intro:
      'Adventure films sweep you into other worlds — fantastical, dangerous, or wondrous. This list highlights journeys worth taking, from animated spirit worlds to post-apocalyptic odysseys, with each film\'s age rating included.',
  },
  'genre/fantasy': {
    title: 'Top 10 Fantasy Movies',
    intro:
      'Fantasy at its best makes the impossible feel real and meaningful. This list gathers spellbinding films — hand-drawn spirit worlds and dark fairy tales among them — that use magic to tell deeply human stories, with age ratings noted.',
  },
  'genre/mystery': {
    title: 'Top 10 Mystery Movies',
    intro:
      'A good mystery keeps you guessing right up to the reveal. This list collects films built on secrets and slow-dawning dread, from twisty thrillers to puzzle-box dramas, each with its age rating flagged.',
  },
  'genre/science-fiction': {
    title: 'Top 10 Science Fiction Movies',
    intro:
      'The best science fiction uses the future, or the impossible, to ask something about us. This list spans mind-bending blockbusters and inventive visions, with each film\'s age rating noted.',
  },
  'genre/family': {
    title: 'Top 10 Family Movies',
    intro:
      'Films the whole household can enjoy together — imaginative, warm, and rewarding for kids and grown-ups alike. This list leans on titles with broad appeal, and we note each one\'s age rating so you can choose with confidence.',
  },
  'genre/war': {
    title: 'Top 10 War Movies',
    intro:
      'War cinema confronts history at its most harrowing and human. This list highlights powerful films set against conflict, including a haunting fairy tale born from the Spanish Civil War, with age ratings noted given the intense subject matter.',
  },
  'genre/music': {
    title: 'Top 10 Music Movies',
    intro:
      'When music drives the story, films find a different kind of energy. This list celebrates movies powered by sound and rhythm — from street-rap ambition to song-filled romance — each with its age rating noted.',
  },
  'country/india': {
    title: 'Top 10 Movies from India',
    intro:
      'Indian cinema is vast, vibrant, and globally beloved. This list highlights standout Hindi-language films — sweeping romance, sharp comedy, and music-driven drama — that make perfect entry points, with each film\'s age rating noted.',
  },
  'country/united-states': {
    title: 'Top 10 Movies from the United States',
    intro:
      'American filmmaking spans every genre and mood. This list gathers some of the finest US films — from puzzle-box blockbusters to genre-redefining horror — each with its age rating noted.',
  },
  'country/united-kingdom': {
    title: 'Top 10 Movies from the United Kingdom',
    intro:
      'British and UK-tied productions have shaped modern cinema across genres. This list highlights notable films connected to the UK, with each one\'s age rating flagged.',
  },
  'country/france': {
    title: 'Top 10 Movies from France',
    intro:
      'French cinema is synonymous with style, romance, and invention. This list celebrates the best of it, led by a whimsical Parisian charmer that became an international sensation, with age ratings noted.',
  },
  'country/spain': {
    title: 'Top 10 Movies from Spain',
    intro:
      'Spanish-language cinema delivers some of film\'s most striking imagery and storytelling. This list highlights essential picks, including a haunting wartime fairy tale, with each film\'s age rating noted.',
  },
  'language/english': {
    title: 'Top 10 English-Language Movies',
    intro:
      'This list gathers standout English-language films across genres and eras — from mind-bending blockbusters to sharp horror and sweeping romance — each with its official age rating noted so you know what to expect.',
  },
  'language/hindi': {
    title: 'Top 10 Hindi-Language Movies',
    intro:
      'Hindi cinema — the heart of Bollywood — is famous for big emotions, memorable music, and great storytelling. This list highlights the most rewarding Hindi-language films for newcomers and fans alike, with age ratings noted.',
  },
  'language/japanese': {
    title: 'Top 10 Japanese-Language Movies',
    intro:
      'Japanese-language cinema ranges from hand-drawn fantasy to intimate drama. This list highlights the essentials, led by two animated masterpieces that captivated the world, each with its age rating noted.',
  },
  'language/french': {
    title: 'Top 10 French-Language Movies',
    intro:
      'French-language films are celebrated for their style and feeling. This list gathers standout picks, led by a beloved Parisian fairy tale of small kindnesses, with each film\'s age rating noted.',
  },
  'language/spanish': {
    title: 'Top 10 Spanish-Language Movies',
    intro:
      'Spanish-language cinema is rich with bold imagery and unforgettable storytelling. This list highlights essential films, including a dark wartime fantasy, each with its age rating noted.',
  },
  'industry/hollywood': {
    title: 'Top 10 Hollywood Movies',
    intro:
      'Hollywood sets the global standard for blockbusters and prestige films alike. This list rounds up the best across genres — from puzzle-box thrillers to genre-redefining horror and adrenaline-fueled action — each with its age rating noted.',
  },
};

function yamlEscape(s: string): string {
  return s.replace(/"/g, '\\"');
}

async function main() {
  const existing = new Set(
    (await readdir(LISTS_DIR)).map((f) => f.replace(/\.(ya?ml|json|md)$/, '')),
  );

  let written = 0;
  for (const [key, { title, intro }] of Object.entries(INTROS)) {
    const [dimension, value] = key.split('/');
    const fileBase = `${dimension}-${value}`;
    if (existing.has(fileBase)) continue; // never overwrite a hand-authored override

    const yaml = [
      `dimension: ${dimension}`,
      `value: ${value}`,
      `title: "${yamlEscape(title)}"`,
      `intro: >-`,
      ...intro.match(/.{1,90}(\s|$)/g)!.map((line) => `  ${line.trim()}`),
      '',
    ].join('\n');

    await writeFile(join(LISTS_DIR, `${fileBase}.yaml`), yaml, 'utf8');
    written += 1;
  }
  console.log(`Wrote ${written} list intro file(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
