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
