# WinGo Educational SEO Lab

An original educational website for learning number classifications, probability, randomness, and search-focused publishing through practical implementation.

## Current status

**Phase 3: interactive educational tools implemented.** The Astro site contains the 14 planned pages, six original guides, responsive layouts, a working simulator and probability calculator, a randomness experiment, and a custom 404 page.

The tools run locally in the browser. Timed/batch simulations, recorded replay, CSV export, event/sequence calculations, and sample-size comparisons use the documented model. No live deployment or analytics is enabled. All current builds remain `noindex` until the SEO release work is completed.

The [handoff](handoff.txt) is the authoritative specification. See the [documentation index](docs/README.md) and [Phase 3 report](docs/phase-3-report.md) for decisions, validation evidence, and phase boundaries. Earlier phase reports remain historical records.

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

`npm test` runs deterministic Vitest checks for classification, probability, statistics, random-source boundaries, cancellation, timers, replay, and export. GitHub Actions runs the full validation on pushes to `main` and pull requests. It validates without deploying.

## Using the tools

- **Simulator:** choose a batch of 1–10,000 draws or 1–100 five-second teaching rounds. Pause/resume timed runs, cancel pending work, and inspect full-run frequencies alongside at most 20 recent outcomes. Timed progression pauses while the page is hidden.
- **Replay/export:** restore the last completed dataset without drawing again, or download it as CSV. A cancelled partial run does not replace that dataset. Reset clears the visible run and saved replay data; reload clears in-memory run history.
- **Calculator:** calculate an exact digit, size/color event, or supported compound event. Enter 1–20 comma-separated ordered events for a specified block; this is not an anywhere-in-history streak calculation. Compare an event with a locally generated sample.
- **Randomness:** generate separate samples of 20 and 2,000 digits to compare counts, relative gaps, and longest observed size runs. The next draw's theoretical size probability stays 50/50 under the model.

Sampling uses browser `crypto.getRandomValues` with rejection mapping. If that API is unavailable, sampling is disabled with an explanation; mathematical calculations and static explanations remain available. Outcomes are not live external results or predictions. No outcomes are automatically persisted, and no tool data is sent to an external service. See the [model specification](docs/simulation-model.md).

## Project structure

```text
config/site.mjs             validated build environment and proposed origin
src/components/             navigation, metadata, cards, diagrams, tables
src/content/guides/         six original Markdown articles
src/content.config.ts       schema-validated content collection
src/data/site.ts            site identity and classification reference data
src/layouts/                base, article, and information layouts
src/lib/                   model, probability, sampling, statistics, guide validation
src/scripts/               page-specific browser controllers
src/pages/                  static pages and generated article routes
src/styles/global.css      responsive design system
public/                    original favicon and future public assets
tools/                     Astro launcher, route manifest, built-site checks
tests/browser/             Playwright browser checks
tests/unit/                deterministic mathematical and state tests
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
3. Interactive educational tools — implemented; validation recorded in the phase report.
4. Technical SEO — next.
5. Analytics and measurement setup.
6. QA and authorized production deployment.
7. Post-deployment baseline and monitoring over the first 30 days.

Each phase ends with validation, a brief learning recap, and a commit/push. Google Ads, certification applications, billing, and spend are separate future work. The site does not offer real-money gambling, operator referrals, or predictions of external results.
