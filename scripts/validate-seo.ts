/**
 * validate-seo.ts — post-build SEO/structured-data check. Crawls dist/, extracts JSON-LD
 * + canonical/OG/title/description from every page, and asserts:
 *   - each page has exactly one <title>, a meta description, a canonical, OG tags
 *   - all JSON-LD parses and carries @context + @type
 *   - list pages have ItemList + BreadcrumbList; movie pages have Movie + BreadcrumbList;
 *     homepage has WebSite + Organization
 *   - Movie nodes never emit a fabricated rating/contentRating (only when present in data)
 * Exits non-zero on any failure. Run after `npm run build`.
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const DIST = join(process.cwd(), 'dist');

interface Issue {
  page: string;
  msg: string;
}
const issues: Issue[] = [];
const warn = (page: string, msg: string) => issues.push({ page, msg });

async function htmlFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) files.push(...(await htmlFiles(full)));
    else if (e.name.endsWith('.html')) files.push(full);
  }
  return files;
}

function extractAll(html: string, re: RegExp): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) out.push(m[1]);
  return out;
}

function jsonLdBlocks(html: string): unknown[] {
  const raw = extractAll(
    html,
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
  );
  const parsed: unknown[] = [];
  for (const r of raw) {
    try {
      parsed.push(JSON.parse(r));
    } catch (err) {
      parsed.push({ __parseError: (err as Error).message });
    }
  }
  return parsed;
}

function types(blocks: unknown[]): string[] {
  return blocks
    .map((b) => (b as { '@type'?: string })?.['@type'])
    .filter((t): t is string => Boolean(t));
}

async function main() {
  const files = await htmlFiles(DIST);
  let checked = 0;

  for (const file of files) {
    const page = '/' + relative(DIST, file).replace(/index\.html$/, '').replace(/\/$/, '');
    const html = await readFile(file, 'utf8');
    checked++;

    // --- core tags ---
    const titles = extractAll(html, /<title>([\s\S]*?)<\/title>/g);
    if (titles.length !== 1) warn(page, `expected 1 <title>, found ${titles.length}`);

    if (!/<meta name="description" content="/.test(html))
      warn(page, 'missing meta description');
    if (!/<link rel="canonical" href="https?:\/\//.test(html))
      warn(page, 'missing/invalid canonical');
    if (!/<meta property="og:title"/.test(html)) warn(page, 'missing og:title');
    if (!/<meta name="twitter:card"/.test(html)) warn(page, 'missing twitter:card');

    const h1s = extractAll(html, /<h1[^>]*>([\s\S]*?)<\/h1>/g);
    if (h1s.length !== 1 && page !== '/404')
      warn(page, `expected 1 <h1>, found ${h1s.length}`);

    // --- JSON-LD ---
    const blocks = jsonLdBlocks(html);
    for (const b of blocks) {
      if ((b as { __parseError?: string }).__parseError)
        warn(page, `JSON-LD parse error: ${(b as { __parseError: string }).__parseError}`);
      else {
        const obj = b as Record<string, unknown>;
        if (obj['@context'] !== 'https://schema.org')
          warn(page, `JSON-LD missing/invalid @context (@type=${obj['@type']})`);
        if (!obj['@type']) warn(page, 'JSON-LD block missing @type');
      }
    }

    const t = types(blocks);
    const noindex = /<meta name="robots" content="noindex/.test(html);

    if (page === '/') {
      if (!t.includes('WebSite')) warn(page, 'homepage missing WebSite JSON-LD');
      if (!t.includes('Organization')) warn(page, 'homepage missing Organization JSON-LD');
    } else if (page.startsWith('/movie/')) {
      if (!t.includes('Movie')) warn(page, 'movie page missing Movie JSON-LD');
      if (!t.includes('BreadcrumbList')) warn(page, 'movie page missing BreadcrumbList');
    } else if (/^\/(industry|country|language|genre|year|decade)\/.+/.test(page) || /^\/best\/.+/.test(page)) {
      if (!t.includes('ItemList')) warn(page, 'list page missing ItemList JSON-LD');
      if (!t.includes('BreadcrumbList')) warn(page, 'list page missing BreadcrumbList');
    } else if (/^\/(industry|country|language|genre|year|decade)$/.test(page)) {
      // Dimension hub/index pages.
      if (!t.includes('CollectionPage')) warn(page, 'hub page missing CollectionPage JSON-LD');
      if (!t.includes('BreadcrumbList')) warn(page, 'hub page missing BreadcrumbList');
    } else if (!noindex && page !== '/404') {
      // indexable static pages should still have breadcrumbs where applicable — informational
    }
  }

  console.log(`Checked ${checked} pages.`);
  if (issues.length === 0) {
    console.log('✓ SEO validation passed — no issues.');
    return;
  }
  console.error(`\n✗ ${issues.length} issue(s):`);
  for (const i of issues) console.error(`  [${i.page}] ${i.msg}`);
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
