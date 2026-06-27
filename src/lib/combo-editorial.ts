/**
 * combo-editorial.ts — optional hand-written intro + FAQ for high-value combo pages
 * (/best/[language]-[genre]). Keyed by "language-genre". Combos not listed here fall back
 * to the auto-generated intro. Keeps our flagship long-tail pages rich for SEO + AdSense.
 * All copy is original. See docs/CONTENT-GUIDELINES.md.
 */
export interface ComboEditorial {
  intro?: string;
  faq?: { q: string; a: string }[];
}

export const COMBO_EDITORIAL: Record<string, ComboEditorial> = {
  'korean-thriller': {
    intro:
      "Korean thrillers are in a league of their own — twisty, stylish, and unafraid to go to dark places. From Bong Joon-ho's Oscar-winning Parasite to Park Chan-wook's revenge classics, these are the films that turned Korean cinema into a global obsession. We've ranked the very best by rating, with honest age info for each.",
    faq: [
      {
        q: 'What is the best Korean thriller movie?',
        a: 'Oldboy and Parasite top most lists — Oldboy for its shocking, stylish revenge story, and Parasite for its genre-blending social satire that won Best Picture. Memories of Murder and The Handmaiden round out the essentials.',
      },
      {
        q: 'Where should I start with Korean thrillers?',
        a: 'Parasite is the most accessible entry point — gripping and easy to follow. Once hooked, move on to Oldboy and Memories of Murder, two of the most acclaimed Korean films ever made.',
      },
      {
        q: 'Why are Korean thrillers so popular?',
        a: 'They combine tight plotting, bold visual style, and a willingness to subvert expectations — often blending genres and delivering twists Hollywood wouldn\'t dare. That fearlessness is why they\'ve built such a devoted global following.',
      },
    ],
  },
  'korean-romance': {
    intro:
      'Korean romance has a flavor all its own — equal parts swooning, funny, and heartbreaking. Whether you want a classic rom-com or a tearjerker that stays with you for days, these are the best Korean love stories, ranked by rating with age info included.',
    faq: [
      {
        q: 'What is the best Korean romance movie?',
        a: 'My Sassy Girl is the genre-defining classic, while more recent favorites blend romance with fantasy and melodrama. Browse the ranked list above for the highest-rated picks.',
      },
      {
        q: 'Are Korean romance movies the same as K-dramas?',
        a: 'Not quite — K-dramas are episodic TV series, while these are standalone films. They share the same emotional, character-driven style, just in a single two-hour story.',
      },
    ],
  },
  'japanese-animation': {
    intro:
      "Japanese animation is some of the most imaginative filmmaking on Earth — and it's not just for kids. From Studio Ghibli's hand-drawn masterpieces to modern blockbusters like Your Name, these anime films dazzle with visual beauty and genuine emotion. Ranked by rating, with age guidance for family viewing.",
    faq: [
      {
        q: 'What is the best Japanese animated movie?',
        a: 'Spirited Away is the most acclaimed — Hayao Miyazaki\'s Oscar-winning fantasy is widely called one of the greatest animated films ever. Your Name is the standout among more recent anime films.',
      },
      {
        q: 'Are these anime movies suitable for kids?',
        a: 'Many are family-friendly, but check each film\'s age rating. Studio Ghibli films like Spirited Away (PG) are great for most children, while some titles are aimed at teens and adults.',
      },
    ],
  },
  'hindi-comedy': {
    intro:
      "Bollywood comedies mix big laughs with heart, music, and plenty of charm. From campus satires to feel-good crowd-pleasers, these are the funniest Hindi movies worth your time — ranked by rating, with age info for each.",
    faq: [
      {
        q: 'What is the best Bollywood comedy?',
        a: '3 Idiots is the most beloved — a hilarious yet moving satire of India\'s education system, and a perfect first Bollywood watch. Browse the ranked list for more top-rated picks.',
      },
    ],
  },
  'spanish-horror': {
    intro:
      "Spanish-language horror punches far above its weight — atmospheric, intelligent, and genuinely unsettling. From Guillermo del Toro's dark fairy tales to found-footage shockers, these are the best Spanish horror films, ranked by rating with age info included.",
    faq: [
      {
        q: 'What is the best Spanish horror movie?',
        a: "Pan's Labyrinth is the most acclaimed — a haunting, beautiful blend of fairy tale and wartime horror from Guillermo del Toro. [REC] is the standout for pure scares.",
      },
    ],
  },
  'korean-horror': {
    intro:
      'Korean horror specializes in dread that lingers — ghost stories steeped in grief, and creature films with real emotional weight. These are the best Korean horror movies, ranked by rating, with honest age guidance since the genre earns its warnings.',
    faq: [
      {
        q: 'What is the best Korean horror movie?',
        a: 'Train to Busan (a zombie thriller with genuine heart) and A Tale of Two Sisters (a beautiful, melancholy ghost story) are the standouts. I Saw the Devil is essential for fans of darker, more violent horror.',
      },
    ],
  },
};
