// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { isNoindexPath } from './src/lib/seo.ts';

// Site URL is required by @astrojs/sitemap and used for canonical/OG URLs.
// Overridable via PUBLIC_SITE_URL (e.g. for preview deploys); see .env.example.
const SITE = process.env.PUBLIC_SITE_URL ?? 'https://topmostmovies.com';

// https://astro.build/config
export default defineConfig({
  site: SITE,
  // Static output: fetch-at-build, zero runtime API calls. See docs/ARCHITECTURE.md.
  output: 'static',
  // Allow Astro's <Image> to optimize remote TMDb posters/backdrops.
  image: {
    remotePatterns: [{ protocol: 'https', hostname: 'image.tmdb.org' }],
  },
  integrations: [
    sitemap({
      // Keep noindex pages (about/contact/privacy) out of the sitemap so Google only
      // discovers indexable content. Single source of truth: src/lib/seo.ts.
      filter: (page) => !isNoindexPath(page),
      // Add lastmod (build date) + priority so Google knows the content is current and
      // recrawls efficiently. (changefreq omitted — Google ignores it; lastmod is what matters.)
      serialize(item) {
        item.lastmod = new Date().toISOString();
        item.priority = item.url.replace(/\/$/, '') === SITE.replace(/\/$/, '') ? 1.0 : 0.7;
        return item;
      },
    }),
  ],
  vite: {
    // Tailwind v4 via the official Vite plugin (the @astrojs/tailwind integration is
    // deprecated). Styles are pulled in through src/styles/global.css.
    plugins: [tailwindcss()],
  },
});
