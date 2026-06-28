/**
 * blog.ts — site-side access to the blog collection + the internal-linking glue that turns
 * a post's `linkedLists` / `linkedMovies` frontmatter into resolved, on-site links.
 *
 * The blog's whole SEO job is to funnel crawl + link equity into our list and movie pages,
 * so every helper here is about resolving those cross-links reliably (and never emitting a
 * link to a page we don't generate). See docs/SEO.md.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { nameForSlug } from './taxonomy';
import type { BlogListLink } from '../content.config';

export type BlogPost = CollectionEntry<'blog'>;

/** Path base per blog-link dimension (mirrors the page routes). */
const LINK_PATH_BASE: Record<BlogListLink['dimension'], string> = {
  industry: 'industry',
  country: 'country',
  language: 'language',
  genre: 'genre',
  studio: 'studio',
  theme: 'theme',
  year: 'year',
  decade: 'decade',
  combo: 'best',
};

/** Resolve a linkedLists entry to an on-site path, e.g. /language/korean, /best/korean-thriller. */
export function listLinkPath(link: BlogListLink): string {
  return `/${LINK_PATH_BASE[link.dimension]}/${link.value}`;
}

/** Resolve the display label for a linkedLists entry (explicit label → taxonomy name → value). */
export function listLinkLabel(link: BlogListLink): string {
  if (link.label) return link.label;
  if (link.dimension === 'combo') {
    // "korean-thriller" → "Korean Thriller"
    return link.value
      .split('-')
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  return nameForSlug(link.dimension, link.value) ?? link.value;
}

/**
 * All published posts, newest first. Drafts are dropped in production builds (kept in dev so
 * you can preview WIP). Single source of truth for the index, sitemap-eligibility, and
 * related-post computation.
 */
export async function allPosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog').catch(() => [] as BlogPost[]);
  return posts
    .filter((p) => import.meta.env.DEV || !p.data.draft)
    .sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime());
}

/**
 * Related posts for the "Keep reading" block — most tag overlap first, then most recent.
 * Internal-links posts to each other so the blog forms a connected cluster Google can crawl.
 */
export async function relatedPosts(post: BlogPost, limit = 3): Promise<BlogPost[]> {
  const tags = new Set(post.data.tags);
  const others = (await allPosts()).filter((p) => p.id !== post.id);
  return others
    .map((p) => ({ p, overlap: p.data.tags.filter((t) => tags.has(t)).length }))
    .sort((a, b) => b.overlap - a.overlap || b.p.data.publishDate.getTime() - a.p.data.publishDate.getTime())
    .slice(0, limit)
    .map((x) => x.p);
}

/** Format a post date for display, e.g. "June 28, 2026". */
export function formatPostDate(d: Date): string {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
