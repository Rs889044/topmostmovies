/**
 * JSON-LD structured-data builders. Pass the output to <Seo jsonLd={...} />.
 * Expanded with ItemList / Movie / FAQPage in later phases — see docs/SEO.md.
 */

const SITE_NAME = 'topmostmovies.com';

/** Absolute URL helper bound to the configured site. */
function abs(path: string, site: URL): string {
  return new URL(path, site).href;
}

export interface Crumb {
  name: string;
  /** Site-relative path, e.g. "/genre/romance". */
  path: string;
}

/** BreadcrumbList — used on every interior page. */
export function breadcrumbList(crumbs: Crumb[], site: URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: abs(c.path, site),
    })),
  };
}

/** WebSite — homepage. */
export function website(site: URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: abs('/', site),
  };
}

/** Organization — homepage. */
export function organization(site: URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: abs('/', site),
  };
}

/** ItemList — list ("Top 10 …") pages. `items` are ordered movie paths + names. */
export function itemList(
  name: string,
  items: { name: string; path: string }[],
  site: URL,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: abs(it.path, site),
      name: it.name,
    })),
  };
}

export interface MovieJsonLdInput {
  name: string;
  path: string;
  image?: string;
  description?: string;
  year?: number;
  genres?: string[];
  /** 0–10 aggregate rating — only pass when a real rating exists. */
  rating?: number;
  ratingCount?: number;
  /** Official certification — only pass when one exists. */
  contentRating?: string;
}

/** Movie — movie detail pages. Omits aggregateRating/contentRating when unavailable. */
export function movie(input: MovieJsonLdInput, site: URL) {
  const node: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: input.name,
    url: abs(input.path, site),
  };
  if (input.image) node.image = input.image;
  if (input.description) node.description = input.description;
  if (input.year) node.datePublished = String(input.year);
  if (input.genres?.length) node.genre = input.genres;
  if (input.contentRating) node.contentRating = input.contentRating;
  if (input.rating !== undefined) {
    node.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: input.rating,
      bestRating: 10,
      worstRating: 0,
      ...(input.ratingCount ? { ratingCount: input.ratingCount } : {}),
    };
  }
  return node;
}

/** FAQPage — pages with an FAQ block. */
export function faqPage(faq: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}
