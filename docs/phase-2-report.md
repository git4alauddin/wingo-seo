# Phase 2 report: core website and content

Date: 2026-11-03. Status: core implementation complete and locally validated. This report describes Phase 2, not a completed production launch.

## Delivered

- Astro 7.4.5 with strict TypeScript, static output, pinned dependencies, and a committed npm lockfile.
- All 14 planned public routes plus a custom root `404.html`.
- An original responsive editorial design: warm neutral surfaces, indigo accents, system fonts, original classification diagrams, and meaningful numeric examples.
- Six original Markdown guides covering the format, rules, size classifications, number probability, randomness, and historical analysis.
- Schema-validated article publishing with shared H1, publisher/date, table of contents, sources, related reading, and educational CTA.
- Accessible desktop navigation and a native mobile menu that works without JavaScript.
- Simulator, calculator, and randomness demonstration previews, visibly labeled as static examples with no pretend working controls.
- About, contact-status, privacy, and terms pages describing the actual implementation without fabricated credentials or contact details.
- Shared metadata interfaces, staged `noindex` safeguards, environment validation, and a local 404 response.
- Built-output checks, Playwright/axe browser validation, and a GitHub Actions validation workflow. The workflow does not deploy anything.

## Local validation results

Environment: Windows, Node 24.19.0, npm 11.17.0, installed Google Chrome through Playwright 1.64.1.

| Check | Result |
| --- | --- |
| `npm run check` | Passed: 34 files, zero errors/warnings/hints |
| `npm run build` | Passed: fourteen public pages plus custom 404 |
| `npm run check:site` | Passed: 439 internal links/anchors, unique metadata, existing local assets, preview safeguards |
| Browser suite | 15 passed across desktop 1440px, tablet 768px, and mobile 390px viewports |
| Direct navigation and refresh | All 14 routes returned 200 in every viewport |
| Missing route | Returned 404 with a working recovery link |
| Keyboard/no-JavaScript | Skip link, navigation, rules content, native mobile menu, and preview disclosures passed |
| Automated accessibility | No detected WCAG A/AA violations on home, probability article, simulator, and guide index at the three viewports |
| Network/console | No unexpected external requests or console/page errors during all-route checks |
| Build guards | Unknown environment, wrong origin, and production without an explicit origin correctly rejected; staged indexing remained off |
| First-party assets | No client JavaScript generated; one shared CSS file, 30,497 bytes raw / 7,113 bytes gzip |
| Illustrative dataset | Independently recounted 20 digits: 12 Small, 8 Big; frequency table matches |

Visual review covered desktop, tablet, and mobile screenshots of the main layouts. Twelve review images are generated at `artifacts/screenshots/phase-2/` and remain local/ignored. A tablet heading-space issue found during review was corrected. This is viewport testing in Chromium, not verification on physical iOS/Safari or every browser.

An initial restricted Windows test run completed its assertions but did not finish process cleanup. The Astro launcher was simplified to run in-process, the test server was given its own port, and the final suite completed successfully with browser/process permissions. Temporary validation servers were stopped. No product feature depends on elevated privileges in production.

Automated accessibility results are limited to detected issues on the stated pages. Asset size is not a Core Web Vitals measurement. Lighthouse, PageSpeed, broader browser coverage, field metrics, and production CDN checks remain assigned to later QA.

## Run and inspect

```powershell
npm ci
npm run dev
```

Open Astro's printed local address, normally `http://127.0.0.1:4321/`. For the built site, run `npm run build` and `npm run preview`. The [README](../README.md) documents browser installation, Chrome-based validation, environment variables, and content authoring.

## Deliberately pending

- Phase 3: random sampler, timer/state behavior, batch runs, calculator inputs, randomness experiments, replay/export, and runtime unit tests.
- Phase 4: full SEO validation, sitemap, robots, structured data, and production indexability. All current builds remain `noindex`, even when labeled production.
- Phase 5: configurable GA4 events, consent behavior, updated privacy disclosure, and Search Console setup documentation.
- Phase 6: authorized Cloudflare setup/deployment, domain inspection/authorization, final contact details, and broader QA.
- Phase 7: real search/engagement baseline and monitoring after launch.

No analytics, operator integration, course referral, external account, paid service, DNS change, or deployment was enabled. Public contact details are still an owner input before production; the current page discloses this honestly.

## Learning recap

Components keep shared navigation and styling consistent. A content collection separates the educational writing from the page layout and checks required metadata. Static generation turns that content into ordinary HTML, so the guides and navigation work even when browser JavaScript is disabled. Browser checks verify the resulting pages, not just whether source code compiles.

## Next

Phase 3 will make the three educational tools functional while preserving these layouts, model assumptions, accessibility, and clear synthetic-data labels.
