// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Site URL is required by @astrojs/sitemap and used for canonical/OG URLs.
// Overridable via PUBLIC_SITE_URL (e.g. for preview deploys); see .env.example.
const SITE = process.env.PUBLIC_SITE_URL ?? 'https://topmostmovies.com';

// https://astro.build/config
export default defineConfig({
  site: SITE,
  // Static output: fetch-at-build, zero runtime API calls. See docs/ARCHITECTURE.md.
  output: 'static',
  integrations: [sitemap()],
  vite: {
    // Tailwind v4 via the official Vite plugin (the @astrojs/tailwind integration is
    // deprecated). Styles are pulled in through src/styles/global.css.
    plugins: [tailwindcss()],
  },
});
