# WinGo Educational SEO Lab

An original educational website for learning number classifications, probability, randomness, and search-focused publishing through practical implementation.

## Current status

**Phase 2: core website and content implemented.** The Astro site contains the 14 planned pages, six original guides, reusable article layouts, responsive navigation, original diagrams, and a custom 404 page.

The simulator, calculator, and randomness experiment are explicitly labeled **static previews**. Working controls arrive in Phase 3. No live deployment or analytics is enabled. All current builds remain `noindex` until the SEO release work is completed.

The [handoff](handoff.txt) is the authoritative specification. See the [documentation index](docs/README.md), [Phase 1 report](docs/phase-1-report.md), and [Phase 2 report](docs/phase-2-report.md) for decisions, evidence, and phase boundaries.

## Run locally

Use **Node 24** and npm. Dependencies are pinned and the lockfile is committed.

```powershell
npm ci
npm run dev
```

Open the local address printed by Astro, normally **http://127.0.0.1:4321/**. Stop the server with `Ctrl+C`. If the port is occupied, Astro may select another one; use the printed address.

To inspect a static build:

```powershell
npm run build
npm run preview
```

These commands serve local files. They do not publish a site or modify DNS. Build-tool telemetry is disabled by `tools/astro.mjs`.

## Validation

```powershell
npm run check
npm run build
npm run check:site
```

For the browser suite, install Chromium once, then run all checks:

```powershell
npx playwright install chromium
npm run validate
```

On Windows, an existing Google Chrome installation can be used instead:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm run validate
Remove-Item Env:PLAYWRIGHT_CHANNEL
```

The suite starts its own temporary server on port **4322**, without reusing an existing server. Keep that port free. It checks desktop, tablet, and mobile-sized Chromium layouts, keyboard navigation, JavaScript-disabled content, preview disclosures, direct routes/refreshes, 404 behavior, and selected layouts with axe. Route checks block unexpected external requests.

Review screenshots are saved under `artifacts/screenshots/phase-2/`; failure traces/screenshots go under `test-results/`. Generated artifacts are ignored by Git. Automated accessibility checks supplement visual/keyboard review; they do not establish certification.

GitHub Actions runs the same checks on pushes to `main` and pull requests. It validates the site without deploying it. Runtime probability/simulation unit tests follow with the actual logic in Phase 3.

## Project structure

```text
config/site.mjs             validated build environment and proposed origin
src/components/             navigation, metadata, cards, diagrams, tables
src/content/guides/         six original Markdown articles
src/content.config.ts       schema-validated content collection
src/data/site.ts            site identity and classification reference data
src/layouts/                base, article, and information layouts
src/lib/guides.ts           publication and related-link validation
src/pages/                  static pages and generated article routes
src/styles/global.css      responsive design system
public/                    original favicon and future public assets
tools/                     Astro launcher, route manifest, built-site checks
tests/browser/             Playwright browser checks
docs/                      research, plans, and phase reports
```

## Content workflow

Articles live in `src/content/guides/`. The schema requires a title, description, slug, topic, summary, takeaway, order, reading-time estimate, publication date, publisher key, related guides, sources, and an educational CTA.

The layout supplies the only H1, publication context, table of contents, sources, related reading, and CTA. Start article Markdown at H2. Set `draft: true` to exclude an entry from routes and cards; references to unpublished related guides fail the build. When adding a published topic, deliberately update the allowed slugs and route manifest.

Use genuine publication/revision dates and original examples. Keep synthetic-data captions visible. Preserve both color memberships on 0 and 5; overlapping color percentages are not an exclusive three-slice pie chart.

## Environment and services

`config/site.mjs` reads process environment variables. Set them in your shell or hosting build settings. `.env.example` documents their values; copying it alone does not configure the launcher.

| Variable | Default / behavior |
| --- | --- |
| `SITE_ENV` | `preview`; accepts `development`, `preview`, `production` |
| `SITE_ORIGIN` | Proposed `https://learn.kalam.trade` for preview; explicitly required for a production-labeled build |
| `PLAYWRIGHT_CHANNEL` | Unset uses installed Playwright Chromium; `chrome` selects installed Google Chrome |

Unknown environments and unintended origins fail configuration validation. **Indexability is deliberately off even for a production-labeled build in this phase.** Phase 4 will establish production/preview SEO behavior, sitemap, robots, structured data, and indexing eligibility.

Contact details are pending owner input and disclosed honestly. There is no active contact form, invented email, GA4 script, course conversion link, external outcome feed, database, authentication, or payment integration. Privacy/terms describe the current implementation and will change when behavior changes.

Cloudflare configuration and deployment documentation follow in Phase 6. The proposed subdomain has not been confirmed or changed. Privileged service connections, DNS changes, and production actions require the handoff's authorization. Never commit credentials or put secrets in public configuration.

## Phase workflow

1. Research and architecture — complete.
2. Core website and educational content — implemented; validation recorded in the phase report.
3. Interactive educational tools — next.
4. Technical SEO.
5. Analytics and measurement setup.
6. QA and authorized production deployment.
7. Post-deployment baseline and monitoring over the first 30 days.

Each phase ends with validation, a brief learning recap, and a commit/push. Google Ads, certification applications, billing, and spend are separate future work. The site does not offer real-money gambling, operator referrals, or predictions of external results.
