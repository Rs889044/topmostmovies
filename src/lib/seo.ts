/**
 * seo.ts — shared SEO constants. Single source of truth for which routes are noindex so
 * the page `<Seo noindex>` flag and the sitemap filter never drift. See docs/SEO.md.
 */

/** Site-relative paths that should be excluded from indexing AND the sitemap. */
export const NOINDEX_PATHS = ['/about', '/contact', '/privacy-policy'] as const;

/** True if a full URL or pathname corresponds to a noindex route. */
export function isNoindexPath(urlOrPath: string): boolean {
  let pathname: string;
  try {
    pathname = new URL(urlOrPath).pathname;
  } catch {
    pathname = urlOrPath;
  }
  // Normalize trailing slash for comparison.
  const normalized = pathname.replace(/\/+$/, '') || '/';
  return (NOINDEX_PATHS as readonly string[]).includes(normalized);
}
