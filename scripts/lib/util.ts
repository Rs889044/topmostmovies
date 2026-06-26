/**
 * Shared build-time fetch helpers: throttling, retry/backoff, on-disk caching, slugify.
 * Used by scripts/tmdb.ts and scripts/omdb.ts. See docs/DATA-SOURCES.md (rate-limit
 * handling). These run only at build time (Node) — never shipped to the browser.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';

const CACHE_DIR = join(process.cwd(), '.cache'); // git-ignored

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Minimal serial rate limiter: ensures >= minIntervalMs between calls. */
export class RateLimiter {
  private last = 0;
  private minIntervalMs: number;
  constructor(minIntervalMs: number) {
    this.minIntervalMs = minIntervalMs;
  }
  async wait(): Promise<void> {
    const elapsed = Date.now() - this.last;
    if (elapsed < this.minIntervalMs) await sleep(this.minIntervalMs - elapsed);
    this.last = Date.now();
  }
}

function cacheKey(url: string): string {
  return createHash('sha1').update(url).digest('hex');
}

async function readCache(url: string): Promise<unknown | undefined> {
  const path = join(CACHE_DIR, `${cacheKey(url)}.json`);
  if (!existsSync(path)) return undefined;
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return undefined;
  }
}

async function writeCache(url: string, data: unknown): Promise<void> {
  const path = join(CACHE_DIR, `${cacheKey(url)}.json`);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(data), 'utf8');
}

export interface FetchOptions {
  headers?: Record<string, string>;
  limiter?: RateLimiter;
  /** Skip the on-disk cache for this request. */
  noCache?: boolean;
  retries?: number;
  /** A label used in logs (does NOT include secrets). */
  label?: string;
}

/**
 * Fetch JSON with on-disk caching + retry/backoff on 429/5xx. The cache key is the full
 * URL (incl. query) so re-running fetch-data does not re-hit the API for unchanged data.
 * NOTE: callers must keep secrets OUT of `url` where possible (TMDb uses a Bearer header);
 * OMDb requires the key in the query string, so its cache key includes the key — fine
 * locally, and .cache/ is git-ignored.
 */
export async function fetchJson<T = unknown>(
  url: string,
  opts: FetchOptions = {},
): Promise<T> {
  const { headers, limiter, noCache = false, retries = 4, label } = opts;

  if (!noCache) {
    const cached = await readCache(url);
    if (cached !== undefined) return cached as T;
  }

  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (limiter) await limiter.wait();
    const res = await fetch(url, { headers });

    if (res.ok) {
      const data = (await res.json()) as T;
      if (!noCache) await writeCache(url, data);
      return data;
    }

    const retryable = res.status === 429 || res.status >= 500;
    if (retryable && attempt < retries) {
      const backoff = Math.min(2 ** attempt * 500, 8000);
      console.warn(
        `  ⚠ ${label ?? 'request'} → HTTP ${res.status}; retry ${attempt + 1}/${retries} in ${backoff}ms`,
      );
      await sleep(backoff);
      attempt += 1;
      continue;
    }

    const body = await res.text().catch(() => '');
    throw new Error(`${label ?? 'request'} failed: HTTP ${res.status} ${body.slice(0, 200)}`);
  }
}

/** kebab-case slug from arbitrary text (titles, names). */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Movie slug: kebab title + "-" + year (disambiguates same-title films). */
export function movieSlug(title: string, year: number): string {
  const base = slugify(title);
  return `${base}-${year}`;
}
