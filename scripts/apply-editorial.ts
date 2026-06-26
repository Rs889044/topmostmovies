/**
 * apply-editorial.ts — one-off merge of original editorial copy (synopses + parental notes)
 * into the movie JSON records. Keeps all hand-written copy in ONE reviewable place and
 * applies it idempotently (re-running just re-sets the same fields). Run after fetch-data.
 *
 * All copy here is ORIGINAL (written for this site), never copied from TMDb/OMDb. See
 * docs/CONTENT-GUIDELINES.md. Run: node --experimental-strip-types scripts/apply-editorial.ts
 */
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const DIR = join(process.cwd(), 'src', 'content', 'movies');

interface Editorial {
  synopsis: string;
  parentalNotes?: string;
}

// Keyed by movie slug. Synopsis ~80–130 words, original framing, setup only (no spoilers).
const EDITORIAL: Record<string, Editorial> = {
  'parasite-2019': {
    synopsis:
      "Bong Joon-ho's genre-bending masterwork follows the Kims, a struggling family living in a cramped semi-basement, as they cunningly talk their way into jobs serving the wealthy Park household one by one. What begins as a sharp, often hilarious con curdles into something far darker once the family discovers they aren't the only ones with a secret. Equal parts comedy, thriller, and savage class satire, Parasite became the first non-English-language film to win the Best Picture Oscar — and it earns every bit of that reputation.",
    parentalNotes:
      'Rated R in the US for language, some violence, and sexual content. The first half plays like a comedy, but the back half turns sharply violent, with a few intense and bloody moments. Best for older teens and adults; its themes of inequality reward viewers mature enough to sit with them.',
  },
  'train-to-busan-2016': {
    synopsis:
      'A workaholic father takes his young daughter on a train to Busan to see her mother — and boards just as a zombie outbreak tears across South Korea. Trapped in the cars with a handful of strangers, the passengers must fight, cooperate, and sometimes betray one another to survive the journey. Yeon Sang-ho turns a lean action premise into a genuinely moving story about selfishness and sacrifice, and it remains the film that introduced much of the world to Korean genre cinema.',
    parentalNotes:
      "Carries a strong age rating (MA15+ in Australia) for sustained zombie horror, intense peril, and bloody violence. Frightening throughout and emotionally heavy at the end. Aimed at teens and adults rather than younger children.",
  },
  'oldboy-2003': {
    synopsis:
      'A drunken businessman is abducted off the street and locked in a single room for fifteen years, with no explanation and no contact with the outside world. When he is suddenly released, he sets out to learn who imprisoned him and why — a hunt that spirals into one of cinema\'s most notorious revenge stories. Park Chan-wook directs with operatic style, dark humor, and a now-legendary corridor fight, building toward a twist that has fueled debate for two decades.',
    parentalNotes:
      'Rated R in the US for strong violence, disturbing themes, and sexual content. Brutal and psychologically heavy, including a famously dark final reveal. Strictly adult viewing.',
  },
  'the-handmaiden-2016': {
    synopsis:
      "Set in 1930s Korea under Japanese rule, Park Chan-wook's lush thriller follows a young pickpocket hired as a handmaiden to a sheltered heiress, as part of a con artist's scheme to seize her fortune. But nothing — and no one — is what it seems, and the story keeps folding back on itself from multiple points of view. Gorgeously designed and slyly funny, it's a tale of deception and desire where the real power keeps shifting hands.",
    parentalNotes:
      'Rated R in the US for strong sexual content, graphic nudity, and some violence. Explicitly erotic and intended for adults only.',
  },
  'a-tale-of-two-sisters-2003': {
    synopsis:
      'After a stay in a psychiatric hospital, two devoted sisters return to their family\'s remote country home, where their cold stepmother presides and something feels deeply wrong. Doors creak, memories blur, and the line between grief and the supernatural dissolves. Kim Jee-woon crafts a beautiful, slow-burning horror film rooted in a Korean folktale — more interested in dread, sorrow, and a gut-punch of a reveal than in cheap scares.',
    parentalNotes:
      'Rated R in the US for some violence and disturbing images. A psychological ghost story with unsettling moments and heavy emotional themes; suited to older teens and adults.',
  },
  'my-sassy-girl-2001': {
    synopsis:
      "A mild-mannered college student meets a wildly unpredictable young woman one night and is swept into a relationship he can barely keep up with — by turns slapstick, sweet, and surprisingly sad. The blueprint for the modern Korean rom-com, My Sassy Girl pairs broad comedy with a melancholy streak and a much-imitated twist. Decades on, it's still the easiest, most charming entry point into Korean romance.",
    parentalNotes:
      'Rated PG in some regions. Largely gentle, with comic drinking and mild innuendo. Fine for teens and up.',
  },
  'the-classic-2003': {
    synopsis:
      "A college student reads her late mother's old love letters and discovers a tender, rain-soaked romance from a generation earlier — one that quietly mirrors her own hesitant feelings in the present. Kwak Jae-yong weaves the two timelines together into a dreamy, nostalgic melodrama about first love, fate, and the things left unsaid. It's pure, unabashed K-romance, built for a good cry.",
    parentalNotes:
      'A gentle romantic melodrama with mature emotional themes but little objectionable content. Suitable for teens and up.',
  },
  '3-idiots-2009': {
    synopsis:
      "Two friends set out to track down their brilliant, rebellious former classmate — and the search becomes a flashback to their chaotic years at a high-pressure engineering college. Through comedy, songs, and real tenderness, 3 Idiots skewers India's exam-obsessed education system while championing curiosity over conformity. Warm, funny, and surprisingly moving, it's the film most fans recommend as the perfect first Bollywood watch.",
    parentalNotes:
      'Broadly family-friendly with some crude humor and mature themes, including a frank treatment of academic pressure. Good for teens and up.',
  },
  'dilwale-dulhania-le-jayenge-1995': {
    synopsis:
      'Two young Londoners of Indian heritage meet on a backpacking trip across Europe and fall in love — only for her to be promised in an arranged marriage back in India. Rather than elope, he insists on winning over her family the right way. The most beloved romance in Bollywood history, DDLJ runs on charm, music, and old-fashioned sincerity, and has played in a Mumbai cinema almost continuously since its release.',
    parentalNotes:
      'A wholesome, family-oriented romance with virtually no objectionable content. Suitable for all but the youngest viewers.',
  },
  'gully-boy-2019': {
    synopsis:
      "Inspired by the real Mumbai street-rap scene, Gully Boy follows a young man from the slums who channels his frustration and ambition into hip-hop, against the wishes of his family and the limits of his circumstances. Ranveer Singh and Alia Bhatt anchor a vibrant, music-driven story about finding your voice. It's a modern Bollywood crowd-pleaser with real bite about class and aspiration.",
    parentalNotes:
      'Carries a UK 12A certificate for moderate language and mature themes. Generally fine for teens and up.',
  },
  'spirited-away-2001': {
    synopsis:
      "When a sullen ten-year-old's family stumbles into an abandoned theme park, her parents are transformed and she's stranded in a hidden world of spirits, ruled by a greedy witch and run as a bathhouse for the gods. To survive and save her family, she takes a job there and slowly finds her courage. Hayao Miyazaki's Oscar-winning fantasy is endlessly inventive, gorgeously hand-drawn, and rightly considered one of the greatest animated films ever made.",
    parentalNotes:
      'Rated PG for some scary moments and images. A handful of eerie, intense scenes may frighten very young children, but it\'s a wonderful watch for most kids and the whole family.',
  },
  'your-name-2016': {
    synopsis:
      "A teenage girl in a rural town and a teenage boy in Tokyo inexplicably begin swapping bodies in their sleep, leaving notes to manage each other's lives — until the connection between them turns out to be stranger and more urgent than either realized. Makoto Shinkai's animated phenomenon is dazzling to look at and deeply felt, blending body-swap comedy, first love, and a race against time into something unforgettable.",
    parentalNotes:
      'Rated PG for mild language and some suggestive content. Emotionally intense in places but appropriate for older children, teens, and adults.',
  },
  'inception-2010': {
    synopsis:
      "A specialized thief who steals secrets from deep within people's dreams is offered a shot at redemption — if he can pull off the reverse: planting an idea in a target's mind. Assembling a team, he descends through dreams within dreams, where time stretches and the rules bend. Christopher Nolan's blockbuster is a puzzle-box heist with staggering visuals and a spinning top of an ending that audiences still argue about.",
    parentalNotes:
      'Rated PG-13 for sequences of violence and action throughout. Stylized gunplay and intense action but little graphic content; suitable for teens and up.',
  },
  'the-notebook-2004': {
    synopsis:
      'An elderly man reads a love story from a worn notebook to a woman in a nursing home: the tale of a poor young laborer and a wealthy summer visitor whose passionate 1940s romance is torn apart by class and circumstance. As the past unfolds, the reason he keeps reading becomes clear. Adapted from Nicholas Sparks, The Notebook is unabashed, tear-jerking romance and a date-night staple for good reason.',
    parentalNotes:
      'Rated PG-13 for some sexuality and language. A tasteful love scene and mild content; appropriate for teens and up.',
  },
  'get-out-2017': {
    synopsis:
      "A young Black photographer travels with his white girlfriend to meet her parents at their secluded estate, where the relentless politeness curdles into something deeply unsettling. As small wrongnesses pile up, he realizes the weekend is a trap with horrifying logic. Jordan Peele's directorial debut fused social satire and horror into a phenomenon, winning an Oscar for its screenplay and reshaping what the genre could say.",
    parentalNotes:
      'Rated R for violence, bloody images, and language. A genuinely scary thriller with disturbing imagery and some gore; for older teens and adults.',
  },
  'mad-max-fury-road-2015': {
    synopsis:
      "In a scorched desert wasteland, a captive drifter and a rebel war-rig driver join forces to flee a tyrant and ferry a group of enslaved women toward freedom — igniting one long, ferocious chase. George Miller's return to Mad Max is a near-nonstop spectacle of practical stunts and roaring machines, with surprising emotional weight beneath the chrome. Widely hailed as one of the best action films of the century.",
    parentalNotes:
      'Rated R for intense sequences of violence and disturbing images. Relentless action-violence and grim imagery, though limited gore; aimed at older teens and adults.',
  },
  'the-silence-of-the-lambs-1991': {
    synopsis:
      'A driven young FBI trainee is sent to interview the brilliant, monstrous psychiatrist Hannibal Lecter, hoping his insight will help her catch another killer still at large. Their tense, cat-and-mouse conversations become the dark heart of the film. A rare horror-thriller to sweep the top Oscars, it remains a masterclass in dread, with two indelible performances at its core.',
    parentalNotes:
      'Rated R for strong, disturbing violence and content. Grisly crime imagery and deeply unsettling themes; strictly adult viewing.',
  },
  'amelie-2001': {
    synopsis:
      "A shy young waitress in Montmartre decides to quietly orchestrate small acts of kindness and mischief in the lives of those around her — all while struggling to reach for the connection she most wants for herself. Jean-Pierre Jeunet's whimsical Paris is candy-colored and brimming with invention, and Audrey Tautou's heroine made the film an international word-of-mouth sensation. Pure charm, with a wistful heart.",
    parentalNotes:
      'Rated R in the US, largely for some sexual content and frank French humor; comparatively mild overall. Best for older teens and adults.',
  },
  'pans-labyrinth-2006': {
    synopsis:
      "In the brutal aftermath of the Spanish Civil War, a lonely girl moves with her pregnant mother to the outpost of her cruel stepfather, a fascist officer. Seeking escape, she follows a faun into a labyrinth and a dark fairy tale of trials and monsters — one that bleeds into the real horrors around her. Guillermo del Toro's masterpiece is a haunting, beautiful blend of fantasy and wartime tragedy.",
    parentalNotes:
      'Rated R for graphic violence and disturbing images. Despite the fairy-tale frame, it is intense and bloody — not a children\'s film. For older teens and adults.',
  },
};

/** Merge hand-written editorial copy into existing movie records. Returns count updated.
 *  Skips silently if a record doesn't exist (catalog may have changed). */
export async function applyEditorial(): Promise<number> {
  let updated = 0;
  for (const [slug, ed] of Object.entries(EDITORIAL)) {
    const path = join(DIR, `${slug}.json`);
    if (!existsSync(path)) continue;
    const data = JSON.parse(await readFile(path, 'utf8'));
    data.synopsis = ed.synopsis;
    if (ed.parentalNotes) data.parentalNotes = ed.parentalNotes;
    await writeFile(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
    updated += 1;
  }
  return updated;
}

/** The slugs that have hand-written rich editorial copy (used by the hybrid blurb step). */
export const EDITORIAL_SLUGS = new Set(Object.keys(EDITORIAL));

// Run standalone: `node --experimental-strip-types scripts/apply-editorial.ts`
if (import.meta.url === `file://${process.argv[1]}`) {
  applyEditorial().then((n) => console.log(`Applied editorial copy to ${n} movie(s).`));
}
