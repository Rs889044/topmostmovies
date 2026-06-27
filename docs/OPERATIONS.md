# OPERATIONS — go-live, domain, analytics, ads & revenue

The ultimate goal is **organic traffic → AdSense revenue**. This runbook covers everything
from buying the domain to tracking earnings, and clearly marks **which steps only YOU can
do** (they need your accounts/payment) vs. what's already built into the site.

Legend: 🟢 built & ready in the code · 🔵 **YOUR action** (account/payment/DNS) · ⚙️ I do it once you've done the 🔵 step.

---

## 0. What's already built (gated, waiting on your IDs)

- 🟢 Cookie-consent banner (GDPR/CCPA), "Cookie settings" re-open link, Cookie Policy page.
- 🟢 Privacy Policy, About, Contact (real content, indexable).
- 🟢 **Gated analytics** (`Analytics.astro`): GA4 loads *only* after consent **and** only if
  `PUBLIC_GA_ID` is set. Zero code ships until then.
- 🟢 **Gated AdSense** (`AdSenseLoader.astro` + `AdSlot.astro`): ad library + units load only
  after consent and only if `PUBLIC_ADSENSE_CLIENT` is set. Reserved ad space prevents layout
  shift now (no CLS surprise later).
- 🟢 **Dynamic `/ads.txt`** (`src/pages/ads.txt.ts`): emits the correct `google.com, pub-…,
  DIRECT, …` line automatically once `PUBLIC_ADSENSE_CLIENT` is set.
- 🟢 AdSense site-verification `<meta>` injected when the publisher ID is set.
- 🟢 `sitemap-index.xml` + `robots.txt` generated each build; `npm run validate-seo`.

> Setting the env vars (below) is all that's needed to flip these on — no code changes.

---

## 1. Buy & connect the domain  🔵 (you) + ⚙️ (me)

You haven't bought `topmostmovies.com` yet. Steps:

1. 🔵 **Buy the domain.** Cheapest + simplest is to **register it directly in Cloudflare**
   (Cloudflare → Domain Registration → Register) — then DNS is already in Cloudflare and
   there are no nameserver steps. Alternatively use Namecheap/Porkbun/Google-Squarespace and
   point nameservers at Cloudflare later.
   - Confirm the exact domain you want. If `topmostmovies.com` is taken/expensive, tell me and
     I'll update `PUBLIC_SITE_URL`, canonical URLs, sitemap, and `robots.txt` accordingly.
2. 🔵 **Create a Cloudflare account** (free) if you don't have one.
3. 🔵 If you bought the domain elsewhere: add the site in Cloudflare, copy the **two
   nameservers** Cloudflare shows, and set them at your registrar. Propagation: minutes–hours.
4. ⚙️ Once the repo is connected (next section), I'll set the custom domain on the Pages
   project and verify HTTPS.

---

## 2. Deploy: GitHub → Cloudflare Pages (CI/CD)  🔵 + ⚙️

The repo is already on GitHub (`github.com/Rs889044/topmostmovies`). To get auto-deploys:

1. 🔵 In **Cloudflare → Workers & Pages → Create → Pages → Connect to Git**, authorize GitHub
   and pick the `topmostmovies` repo.
2. Build settings (⚙️ I'll confirm these values with you):
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node version:** set env var `NODE_VERSION = 22` (Astro needs 22.12+, even LTS).
3. 🔵 Add the **environment variables** in Cloudflare Pages → Settings → Environment variables
   (Production). Same names as `.env.example`:
   - `TMDB_READ_TOKEN` (or `TMDB_API_KEY`), `OMDB_API_KEY` — **needed at build** (the catalog
     is fetched at build). *(If you'd rather not run the fetch on Cloudflare, we can commit the
     prebuilt catalog and skip the keys on the build host — say the word.)*
   - `PUBLIC_SITE_URL = https://topmostmovies.com`
   - `PUBLIC_CONTACT_EMAIL = ...`
   - Later: `PUBLIC_GA_ID`, `PUBLIC_ADSENSE_CLIENT` (see below).
4. Every push to `master` now auto-builds and deploys. Preview URL: `*.pages.dev`.
5. **Preview `noindex`** (avoid duplicate content with the `.com`). `public/_headers` ships
   caching + security headers, but a static file can't target only the preview host. So in
   **Cloudflare → your Pages project → (Domains/Rules) → Transform Rules → Modify Response
   Header**, add a rule: *If* `Hostname ends with .pages.dev` *then set* `X-Robots-Tag` =
   `noindex`. 🔵 (one-time, 2 min). This keeps Google indexing only `topmostmovies.com`.

---

## 3. Page tracking / analytics  🔵 + ⚙️

To track visitors, pages, and (later) prove the traffic AdSense wants:

1. 🔵 Create a **Google Analytics 4** property at <https://analytics.google.com> → copy the
   **Measurement ID** (`G-XXXXXXXXXX`).
2. 🔵 Set `PUBLIC_GA_ID` in Cloudflare Pages env vars (and locally in `.env` if testing).
3. 🟢 That's it — `Analytics.astro` then loads GA4 after consent and reports pageviews
   automatically. IP anonymization is on.
4. 🔵 (Recommended) Also create **Microsoft Clarity** (free heatmaps/session replay) if you
   want qualitative insight — tell me and I'll add a gated loader like GA.

**What you'll watch in GA4:** Reports → Engagement → Pages and screens (top lists/movies),
Acquisition → Traffic acquisition (organic search growth). The ~10+ daily-users heuristic for
applying to AdSense is read here.

---

## 4. Search Console & Bing (indexing + page insights)  🔵 + ⚙️

This is how Google discovers/indexes pages and how you see search performance.

1. 🔵 **Google Search Console** (<https://search.google.com/search-console>): add the property
   (Domain property is best — verified via a DNS TXT record Cloudflare makes easy). 
2. 🔵 Submit the sitemap: `https://topmostmovies.com/sitemap-index.xml`.
3. 🔵 Use **URL Inspection → Request indexing** for the homepage + a few key lists to kickstart.
4. 🔵 **Bing Webmaster Tools** (<https://www.bing.com/webmasters>): you can import directly from
   Search Console; submit the same sitemap.
5. **Page insights / performance:** use **PageSpeed Insights**
   (<https://pagespeed.web.dev>) on the live URL — it reports Core Web Vitals + a Lighthouse
   score. We target 90+ (Phase 7). Search Console's "Core Web Vitals" and "Page indexing"
   reports show field data + any indexing problems over time.

**What you'll watch in Search Console:** Performance (impressions/clicks/queries — your
long-tail keywords appearing), Pages (what's indexed), Core Web Vitals.

---

## 5. AdSense — apply, verify, and earn  🔵 + ⚙️

Revenue comes from here. Order matters — apply only when the site has quality pages **and**
some consistent traffic.

1. 🔵 **Apply** at <https://adsense.google.com> with the live `.com` domain (not the
   `pages.dev`). Google reviews for original content, navigation, and the required legal
   pages — all of which we've built.
2. 🔵 During application Google gives you a **publisher ID** (`ca-pub-XXXXXXXXXXXXXXXX`) and a
   verification snippet. Set `PUBLIC_ADSENSE_CLIENT` in Cloudflare env vars.
   - 🟢 This automatically: injects the verification `<meta>`, generates the correct
     `/ads.txt`, and activates the gated ad library + `<AdSlot>` units (after consent).
3. 🔵 Wait for **approval** (days to weeks). Until approved, the library loads but **no ads
   fill** — that's expected.
4. 🔵 After approval, in AdSense create **ad units** (or enable **Auto ads**). If using manual
   units, paste each unit's `data-ad-slot` id and tell me — ⚙️ I'll wire them into the
   matching `<AdSlot adSlot="…">` placements (currently `list-top`, `list-bottom`,
   `movie-inline`).
5. 🔵 Add your **payment details + address** in AdSense; Google mails a **PIN** to verify your
   address once earnings cross a threshold (~$10). Payout threshold is **$100**.

**Revenue tracking:** the **AdSense dashboard** is the source of truth for earnings (estimated
earnings, RPM, impressions, CTR, top pages). For deeper analysis, **link AdSense ↔ GA4** (in
GA4 Admin → Product links) so you can see revenue *by page/landing page* alongside traffic —
this tells you which lists actually make money, guiding what to expand. 🔵 You do the linking
in the dashboards; ⚙️ I can add AdSense/GA custom events if you want richer tracking.

---

## 6. Your action-item checklist (in order)

| # | Action | Who | Needed for |
|---|--------|-----|------------|
| 1 | Buy `topmostmovies.com` (Cloudflare Registrar easiest) | 🔵 you | everything |
| 2 | Create Cloudflare account; connect GitHub repo to Pages | 🔵 you | hosting/CI/CD |
| 3 | Add build env vars (TMDb/OMDb keys, SITE_URL, contact email) | 🔵 you | builds on CF |
| 4 | Point domain / confirm HTTPS works | 🔵 you + ⚙️ me | live site |
| 5 | Create GA4 property → set `PUBLIC_GA_ID` | 🔵 you | page tracking |
| 6 | Verify in Search Console + Bing; submit sitemap | 🔵 you | indexing |
| 7 | Run PageSpeed Insights on live URL; I fix flags | 🔵 you + ⚙️ me | CWV / Phase 7 |
| 8 | Grow traffic to ~10+ daily users (GA4) | 🔵 you (content/time) | AdSense apply |
| 9 | Apply to AdSense → set `PUBLIC_ADSENSE_CLIENT` | 🔵 you | revenue |
| 10 | After approval: create ad units / Auto ads; add payment + PIN | 🔵 you | payouts |

> None of these require code changes from you — setting the env vars flips on the
> already-built features. Ping me at each ⚙️ step and I'll do my part.

See [ADSENSE.md](ADSENSE.md) for the readiness checklist and [ROADMAP.md](ROADMAP.md) Phase 8
for the deploy sequence.
