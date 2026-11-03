# WinGo Educational SEO Lab

An original educational website for learning number classifications, probability, randomness, and search-focused publishing through practical implementation.

## Current status

**Phase 5: configurable analytics implemented.** The Astro site includes 14 public pages, six guides, working educational tools, technical SEO, and consent-based GA4 instrumentation with Search Console verification support and setup instructions.

The tools run locally in the browser. No live deployment or analytics is enabled. Default local/preview builds remain `noindex`; production indexing requires an explicit opt-in. Cloudflare preview/alias protection is generated but still needs live host verification after authorized deployment.

The [handoff](handoff.txt) is the authoritative specification. See the [documentation index](docs/README.md), [Phase 5 report](docs/phase-5-report.md), [analytics guide](docs/analytics-events.md), and [Search Console setup](docs/search-console-setup.md) for decisions, evidence, and pending account steps. Earlier reports remain historical records.

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
npm test
npm run build
npm run check:site
npm run test:seo
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

The suite starts its own temporary server on port **4322**, without reusing an existing server. Keep that port free. It checks desktop, tablet, and mobile-sized Chromium layouts, keyboard navigation, JavaScript-disabled content, tool controls, direct routes/refreshes, 404 behavior, and selected layouts with axe. It tests timers with a virtual clock, counts/replay/CSV against a test-only deterministic source, maximum samples, errors, cancellation, and privacy boundaries. Route and privacy checks block unexpected external requests.

Review screenshots, including populated tool states, are saved under `artifacts/screenshots/phase-3/`; failure traces/screenshots go under `test-results/`. Generated artifacts are ignored by Git. Automated accessibility checks supplement visual/keyboard review; they do not establish certification.

`npm test` runs deterministic Vitest checks for the tools, indexing, structured data, measurement gates, event allowlists, consent records, and referrer filtering. `npm run test:seo` builds preview, indexable production, inherited-production Cloudflare branch-preview, and a synthetic analytics-enabled production profile into ignored `artifacts/seo/` folders, then validates their actual output. It leaves default `dist/` untouched. Logs are saved alongside those folders. Run this matrix before running the analytics browser tests directly: they use its synthetic fixture.

Analytics browser checks intercept every request and substitute a local tag stub. They cover consent, refusal, withdrawal, cross-tab changes, privacy signals, event categories, deduplication, and failure modes without contacting Google. Consent screenshots are saved under `artifacts/screenshots/phase-5/`. Real Google SDK behavior and property delivery still require authorized live verification.

The full browser suite also verifies robots/sitemap HTTP responses, query-independent canonicals, share-image delivery, and 404 indexing behavior. GitHub Actions runs the full validation on pushes to `main` and pull requests, without deploying.

## Using the tools

- **Simulator:** choose a batch of 1–10,000 draws or 1–100 five-second teaching rounds. Pause/resume timed runs, cancel pending work, and inspect full-run frequencies alongside at most 20 recent outcomes. Timed progression pauses while the page is hidden.
- **Replay/export:** restore the last completed dataset without drawing again, or download it as CSV. A cancelled partial run does not replace that dataset. Reset clears the visible run and saved replay data; reload clears in-memory run history.
- **Calculator:** calculate an exact digit, size/color event, or supported compound event. Enter 1–20 comma-separated ordered events for a specified block; this is not an anywhere-in-history streak calculation. Compare an event with a locally generated sample.
- **Randomness:** generate separate samples of 20 and 2,000 digits to compare counts, relative gaps, and longest observed size runs. The next draw's theoretical size probability stays 50/50 under the model.

Sampling uses browser `crypto.getRandomValues` with rejection mapping. If that API is unavailable, sampling is disabled with an explanation; mathematical calculations and static explanations remain available. Outcomes are not live external results or predictions. Outcomes and raw tool inputs are not automatically persisted or sent to an external service. Optional analytics records coarse interaction categories only after consent. See the [model specification](docs/simulation-model.md).

## Project structure

```text
config/site.mjs             validated build environment and proposed origin
config/seo.mjs              canonical, sitemap, robots, and host-rule helpers
config/measurement.mjs      analytics gates and optional public destinations
src/components/             navigation, metadata, cards, diagrams, tables
src/content/guides/         six original Markdown articles
src/content.config.ts       schema-validated content collection
src/data/site.ts            site identity and classification reference data
src/layouts/                base, article, and information layouts
src/lib/                   model, probability, sampling, statistics, guide validation
src/scripts/               page-specific browser controllers
src/pages/                  pages, article routes, sitemap.xml and robots.txt
src/styles/global.css      responsive design system
public/                    original favicon and social-card SVG/PNG
tools/                     Astro launcher, route manifest, built-site checks
tests/browser/             Playwright browser checks
tests/unit/                deterministic mathematical and state tests
docs/                      research, plans, and phase reports
```

## Content workflow

Articles live in `src/content/guides/`. The schema requires a title, description, slug, topic, summary, takeaway, order, reading-time estimate, publication date, publisher key, related guides, sources, and an educational CTA.

The layout supplies the only H1, publication context, table of contents, sources, related reading, and CTA. Start article Markdown at H2. Set `draft: true` to exclude an entry from routes and cards; references to unpublished related guides fail the build. When adding a published topic, deliberately update the allowed slugs and route manifest.

Use genuine publication/revision dates and original examples. A supplied revision date must not precede publication; the article layout displays it and the schema uses the same value. Sitemap modification dates are omitted rather than invented. Keep synthetic-data captions visible and preserve both color memberships on 0 and 5.

## Environment and services

`config/site.mjs` reads process environment variables. Set them in your shell or hosting build settings. `.env.example` documents their values; copying it alone does not configure the launcher.

| Variable | Default / behavior |
| --- | --- |
| `SITE_ENV` | `preview`; accepts `development`, `preview`, `production` |
| `SITE_ORIGIN` | Proposed `https://learn.kalam.trade` for preview; explicitly required for a production-labeled build |
| `SITE_INDEXABLE` | `false`; only literal `true` plus production environment can enable indexing |
| `ANALYTICS_ENABLED` | `false`; requires a valid ID, required consent mode, and production environment |
| `GA4_MEASUREMENT_ID` | Empty; public GA4 web stream identifier |
| `ANALYTICS_CONSENT_MODE` | `unconfigured`; set `required` only for an approved activation |
| `SEARCH_CONSOLE_VERIFICATION_TOKEN` | Empty; optional public production HTML-tag token |
| `CONTACT_EMAIL` | Empty; optional owner-approved public email destination |
| `COURSE_INFO_URL` | Empty; optionally `https://course.kalam.trade/` after owner review |
| `PLAYWRIGHT_CHANNEL` | Unset uses installed Playwright Chromium; `chrome` selects installed Google Chrome |

Unknown environments, invalid indexing flags, and unintended origins fail configuration validation. A production-labeled build without `SITE_INDEXABLE=true` stays excluded. Development/preview environments ignore an inherited true opt-in. Detected Cloudflare branches other than `main` stay excluded even if production settings were inherited; keep the branch guard consistent if the production branch changes.

Indexable production builds emit fourteen canonical URLs in `/sitemap.xml`, advertise it from `/robots.txt`, and omit public-page `noindex`. Other profiles emit an empty, unadvertised sitemap and page-level `noindex`. The build also writes Cloudflare `_headers` and `_redirects`; Astro's local server does not apply those host-specific files. Known page aliases normalize without an SPA catch-all. See [technical SEO](docs/technical-seo.md) for exact behavior and release checks.

The original 1200×630 share image is committed as PNG, with its editable SVG source. Regenerate it after changing the SVG using `npm run assets:social`; normal builds use the committed image.

Contact details and course links remain absent by default. Live GA4 remains disabled, and Search Console has not been verified. When deliberately activated, the consent panel allows rejection and later withdrawal; tool usage works with analytics off. See the [event contract and owner activation checklist](docs/analytics-events.md). There is no contact form, invented email, external outcome feed, database, authentication, or payment integration.

Cloudflare project connection, live host verification, and deployment documentation follow in Phase 6; generated static host rules are already prepared. The proposed subdomain has not been confirmed or changed. Privileged service connections, DNS changes, and production actions require the handoff's authorization. Never commit credentials or put secrets in public configuration.

## Phase workflow

1. Research and architecture — complete.
2. Core website and educational content — implemented; validation recorded in the phase report.
3. Interactive educational tools — implemented; validation recorded in the phase report.
4. Technical SEO — implemented; validation recorded in the phase report.
5. Analytics instrumentation and Search Console preparation — implemented; live activation pending owner configuration.
6. QA and authorized production deployment.
7. Post-deployment baseline and monitoring over the first 30 days.

Each phase ends with validation, a brief learning recap, and a commit/push. Google Ads, certification applications, billing, and spend are separate future work. The site does not offer real-money gambling, operator referrals, or predictions of external results.
