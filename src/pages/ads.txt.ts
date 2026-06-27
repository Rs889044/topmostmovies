/**
 * /ads.txt — generated at build time from PUBLIC_ADSENSE_CLIENT. AdSense requires an
 * ads.txt with your publisher id (without the "ca-" prefix) for ads to serve. Until you set
 * the env var, this emits an explanatory placeholder (harmless). See docs/OPERATIONS.md.
 */
import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const client = import.meta.env.PUBLIC_ADSENSE_CLIENT; // e.g. "ca-pub-1234567890123456"
  let body: string;

  if (client) {
    const pub = client.replace(/^ca-/, ''); // ads.txt uses "pub-..." not "ca-pub-..."
    body = `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`;
  } else {
    body =
      '# ads.txt placeholder — set PUBLIC_ADSENSE_CLIENT to emit the real line.\n' +
      '# Format: google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0\n';
  }

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
