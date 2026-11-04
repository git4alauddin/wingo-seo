# Technical SEO configuration and verification

Updated 2026-11-03. This documents the implemented local build. Production domain availability, CDN behavior, Search Console verification, and Google indexing have not been checked or changed.

## Indexing profiles

Build configuration comes from process environment variables in `config/site.mjs`, not from `NODE_ENV` or merely copying `.env.example`. Defaults keep local work excluded. Changing a build flag does not deploy or authorize the proposed domain.

| Profile | Settings | HTML / sitemap / host rules |
| --- | --- | --- |
| Default local or preview | `SITE_ENV` absent or `preview`; `SITE_INDEXABLE` defaults to `false` | `noindex, follow`; empty sitemap; robots permits crawling without advertising the sitemap; global preview `X-Robots-Tag` rule |
| Development | `SITE_ENV=development` | Same exclusion, even if an indexing opt-in was inherited |
| Production, not released | `SITE_ENV=production`, explicit `SITE_ORIGIN`, opt-in absent or false | Same exclusion |
| Indexable production | `SITE_ENV=production`, `SITE_ORIGIN=https://learn.kalam.trade`, `SITE_INDEXABLE=true` | Fourteen public canonical URLs in sitemap; robots advertises it; no public-page `noindex`; 404 remains excluded |
| Cloudflare branch preview | `CF_PAGES=1`, nonempty `CF_PAGES_BRANCH` other than `main` | Exclusion overrides inherited production/indexing flags |
| Workers branch preview | `WORKERS_CI=1`, `WORKERS_CI_BRANCH` other than `main` or missing | Exclusion overrides inherited production/indexing/analytics flags |

The origin is restricted to the proposed HTTPS host. Unknown environments and typoed boolean flags fail configuration. A production-labeled build requires an explicit origin. The production branch is currently `main`; update the guard together with hosting configuration if that changes.

Robots permits crawling in every profile so crawlers can see `noindex` on excluded HTML. `Disallow: /` alone would not reliably remove URLs from an index, and Google does not support putting `noindex` in robots.txt. See [Google's noindex guidance](https://developers.google.com/search/docs/crawling-indexing/block-indexing).

## Sitemap and canonical URLs

`/sitemap.xml` combines dedicated public routes with the published guide collection. Drafts are filtered before article paths are added. The 404, assets, query variants, internal artifacts, and preview hostnames are excluded. Preview/unreleased profiles have a valid empty XML URL set and no sitemap directive in robots.

For the indexable production profile, every listed location matches a page's absolute, trailing-slash canonical URL. The XML is syntax-validated, namespace-checked, and compared with the generated page set. No `lastmod`, priority, or change-frequency claims are manufactured. Google describes accurate modification dates and other sitemap considerations in its [sitemap documentation](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

Public page canonicals omit query strings/fragments and point to the production host, including on excluded previews. The 404 has no canonical or resource schema. Internal navigation uses the clean page paths. A canonical is a consolidation hint, not a guarantee of Google's selected canonical; see [Google's canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).

## Host aliases, paths, and 404s

The Astro build completion hook writes two files into each output folder:

- **`_headers`:** excluded profiles receive a global `X-Robots-Tag: noindex, follow` rule. Indexable production instead excludes the stable `:project.pages.dev` alias, nested `:version.:project.pages.dev` aliases, and the direct 404 document. The custom production host is not covered by a global noindex rule.
- **`_redirects`:** twenty-seven explicit 301 rules normalize `/index.html` and the extension/directory aliases of the thirteen non-home public routes. Targets are actual generated pages. No wildcard fallback redirects missing pages to home.

These files apply to **Cloudflare Workers static assets** as well as legacy Pages hosting; Astro's local preview does not execute them. Indexable builds also exclude `https://:worker.:account.workers.dev/*`, covering stable, branch, and version hosts. `wrangler.jsonc` serves directory HTML with canonical trailing slashes and real 404 fallback. Local Workers-emulator checks confirm known pages, explicit redirects, missing/nested 404s, and excluded-build headers. Live CDN checks remain necessary. [Workers static header behavior](https://developers.cloudflare.com/workers/static-assets/headers/).

Missing pages retain their 404 response and a `noindex` meta tag. The direct error document also has an exclusion header rule for Cloudflare; error handling does not depend solely on that rule matching an arbitrary missing request path.

## Structured data that matches the page

Every public page includes linked Organization, WebSite, and WebPage records. The organization is the visibly described project publisher; no address, credentials, affiliation, reviews, or ratings are invented. Article schema is emitted only for the six actual guides. Its headline matches H1, dates match visible `time` elements, and author/publisher identify the project linked from the byline.

A genuine optional revision date is displayed and emitted as `dateModified`. The collection rejects revisions earlier than publication. A rebuild or copyright-year change does not create a revision date. Refer to [Google's Article documentation](https://developers.google.com/search/docs/appearance/structured-data/article).

The thirteen visible non-home breadcrumb trails have matching BreadcrumbList records with the same labels, order, and destinations. No breadcrumbs are invented for home or the 404. See [Google's breadcrumb documentation](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb).

JSON-LD is escaped before insertion into HTML, including closing-script sequences and Unicode line separators. Local tests validate JSON syntax, the implemented vocabulary/relationships, visible-content consistency, and absence of unsupported review markup. They do not constitute a live Google Rich Results Test or promise a rich result.

## Page metadata and sharing

The shared head emits unique titles/descriptions, canonical URLs, Open Graph fields, a large-image social card, and image alternative text. Every page has one meaningful H1, a logical heading sequence, and ordinary crawlable links. Built-output checks cover every page and confirm all public pages are reachable from home.

The original educational social illustration is committed at `public/images/learning-lab-social.png` with its SVG source alongside it. Metadata specifies its actual 1200×630 PNG dimensions and meaningful alternative text. Regenerate after SVG edits with `npm run assets:social`. The asset is a general learning-lab illustration, not an external result screenshot.

## Local verification

```powershell
npm run check
npm test
npm run build
npm run check:site
npm run test:seo
```

The build matrix generates independent output folders and logs for preview, indexable production, and inherited-production Cloudflare branch preview under `artifacts/seo/`. It checks actual HTML, XML, robots, and host files; default `dist/` is left untouched. `npm run validate` adds the full browser suite. The [README](../README.md) covers browser installation and using installed Chrome on Windows.

## Production checks still required at release

After the owner-authorized deployment and domain setup, verify HTTPS, important direct routes, refreshes, missing-path 404s, and page aliases with real HTTP requests. Confirm the custom host has eligible HTML without a noindex response header, while preview/alias hosts have exclusion headers. Confirm sitemap and robots are served with correct contents/content types on the intended origin.

Use the live Google Rich Results Test and authorized Search Console URL inspection to inspect important public URLs, index eligibility, and selected canonicals. Submit the production sitemap only through the authorized property workflow. Finish the real contact destination and actual privacy/analytics configuration before launch. Sitemap submission, valid markup, and crawlability do not guarantee indexing, rankings, or traffic.
