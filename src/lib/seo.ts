/**
 * seo.ts — shared SEO constants. Single source of truth for which routes are noindex so
 * the page `<Seo noindex>` flag and the sitemap filter never drift. See docs/SEO.md.
 */

/** Site-relative paths excluded from indexing AND the sitemap. About/Contact/Privacy/
 *  Cookies now carry real content and ARE indexed (AdSense needs them crawlable). Keep this
 *  list available for any genuinely thin/utility routes added later. */
export const NOINDEX_PATHS: readonly string[] = [];

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
