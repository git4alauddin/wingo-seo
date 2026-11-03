# Phase 4 report: technical SEO

Date: 2026-11-03. Status: implemented and locally validated. No deployment, DNS change, Search Console submission, or live Google indexing task was performed.

## Delivered

- Environment-specific `/sitemap.xml` and `/robots.txt`. Only explicitly indexable production lists the fourteen public canonical URLs and advertises its sitemap. Excluded profiles emit an empty, unadvertised XML URL set while permitting crawlers to see `noindex`.
- Explicit production indexing opt-in through `SITE_INDEXABLE=true`, alongside production environment and a validated origin. Default/local/preview builds stay excluded. Detected non-main Cloudflare branch previews override inherited production flags.
- Absolute, trailing-slash canonical URLs without query strings/fragments, unique title/description validation, Open Graph/social metadata, and an original 1200×630 PNG share illustration with SVG source.
- Linked Organization, WebSite, and WebPage data, plus Article only for the six guides. Publisher, headline, and dates match visible content. Optional revision dates are displayed and validated; modification dates are not fabricated.
- BreadcrumbList data matching the thirteen visible non-home breadcrumb trails. No resource schema or canonical is emitted for the 404.
- Escaped JSON-LD serialization to prevent closing-script markup from becoming executable HTML.
- Generated Cloudflare `_headers` exclusions for nonproduction and production `pages.dev` aliases, plus twenty-seven explicit `_redirects` rules for known page aliases. No SPA fallback masks missing paths.
- Automated generated-output checks for metadata, heading structure, image alternatives, link reachability, schema/content relationships, XML syntax/namespace/URL sets, host rules, and asset budgets.
- A three-profile build matrix, SEO unit/browser tests, updated configuration instructions, and a [technical SEO guide](technical-seo.md).

## Validation

Local environment: Windows, Node 24.19.0, npm 11.17.0, installed Chrome through Playwright 1.64.1. The full validation chain completed successfully; a follow-up type check confirmed generated artifacts are excluded from source diagnostics.

| Check | Result |
| --- | --- |
| Type/content checks | 61 files; zero errors, warnings, or hints |
| Unit suite | 92 passed, including 19 SEO configuration/serialization/schema/rule cases |
| Default static build | Fourteen public pages plus custom 404, robots, sitemap, and generated host files |
| Links and structure | 446 internal links/anchors; all public pages reachable from home; one H1 per page; no skipped heading levels |
| Structured data | Six Article records, thirteen breadcrumb trails, publisher/date/headline consistency, no unsupported reviews or ratings |
| Preview build | Public pages excluded; zero sitemap URLs; no advertised sitemap; global exclusion header rule |
| Indexable production build | Fourteen sitemap URLs matching canonicals; no public-page noindex; error and host aliases remain excluded |
| Cloudflare branch-preview build | Inherited production opt-in overridden; HTML, sitemap, robots, and host file remain excluded |
| Browser suite | 51 passed across desktop, tablet, and mobile layouts |
| SEO HTTP checks | Robots/sitemap status and content type, query-independent canonicals, local PNG delivery/dimensions, and real missing-path 404/noindex behavior |
| Existing behavior | Simulator/calculator/randomness, maximum samples, cancellation/replay/export, no-JavaScript content, accessibility scans, and privacy checks passed |
| Share illustration | PNG rendered from original SVG, dimensions verified, and image visually reviewed |

The matrix writes artifacts/logs under ignored `artifacts/seo/` folders and leaves the ordinary preview output in `dist/` untouched. Source checks now exclude generated artifact folders as well as normal build output. All three profile checks inspect generated files, rather than assuming configuration flags had the intended effect.

The new metadata/schema does not add executable browser JavaScript. Existing compressed tool-route JavaScript remains 4,840 bytes for the simulator, 4,065 for the calculator, and 3,858 for randomness; ordinary pages remain script-free. These are build measurements, not field Core Web Vitals results.

## Limits and release work

Cloudflare header and redirect files are generated and validated locally. Astro's preview server does not apply those files, so their CDN behavior is not reported as verified. Live host checks remain part of the authorized deployment phase, including exclusion of stable/hashed preview aliases and correct behavior on the custom production domain.

Local structured-data checks validate syntax, implemented vocabulary/relationships, and visible-content consistency. A live Google Rich Results Test and authorized Search Console URL inspection remain pending. Valid markup, sitemap submission, and crawlability do not guarantee indexing, Google's selected canonical, rich results, rankings, or traffic.

The proposed domain and final public contact details remain owner inputs before release. Analytics and consent are still unimplemented and disabled. No external account, privileged service connection, paid campaign, or production change was introduced by this phase.

## Learning recap

A sitemap lists the canonical pages intended for discovery. Robots rules control crawling; a `noindex` directive controls index eligibility when the crawler can read it. Structured data describes visible content in a machine-readable form. These mechanisms prepare a site for search, while actual crawling, indexing, and search performance must be observed after deployment.

## Next

Phase 5 adds configurable GA4 events, consent behavior, tracking documentation, and Search Console setup instructions. The [README](../README.md) explains how to run the current site and validation locally.
