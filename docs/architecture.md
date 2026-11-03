# Technical architecture

Decision date: 2026-11-03. Status: selected for implementation; no application scaffold or hosting configuration exists yet.

## Decisions and rationale

| Concern | Decision | Why |
| --- | --- | --- |
| Rendering | Astro + strict TypeScript, static output | Content arrives as HTML; interactive code is limited to tools |
| Framework UI | Astro components and plain browser TypeScript | No React runtime or SPA router needed for this scope |
| Styling | Responsive CSS with custom-property tokens | Original, small design system without a UI framework dependency |
| Content | Markdown and schema-validated Astro content collection | Shared article layout and metadata; maintainable publishing |
| State | In-memory per tool; narrowly scoped consent preference storage later | No database, account, backend, or outcome persistence required |
| Charts | HTML/CSS or SVG plus accessible numeric tables | Small bundles, clear denominators, no chart-library requirement |
| Dependencies | npm with committed lockfile | Reproducible installs via `npm ci` |
| Hosting | Cloudflare Pages static project, `dist/` output | Fits the handoff and supports branch previews |
| Tests | Vitest for TypeScript logic; Playwright for browser flows | Deterministic math checks plus real-page interaction verification |

Local availability checked: Node `v24.19.0`, npm `11.17.0`. Use the Node 24 line for development/CI/hosting, and verify the selected Astro package's engine requirements during Phase 2. Pin the actual installed dependencies and lockfile then; do not guess current package versions from memory. [Astro installation requirements](https://docs.astro.build/en/install-and-setup/) were consulted.

[Astro's structure guide](https://docs.astro.build/en/basics/project-structure/) supports separating routes, components, layouts, and public assets. [Build-time content collections](https://docs.astro.build/en/guides/content-collections/) use `src/content.config.ts`; the implementation should follow the installed version's supported APIs.

## Planned layout

```text
public/                    original public assets and host headers/redirect rules
src/
  assets/                  optimized illustrations where useful
  components/              header, footer, SEO head, breadcrumbs, cards, tables
  content/guides/          six substantive Markdown guides
  content.config.ts        content schema and loader
  data/site.ts             publisher, navigation, related topics, optional links
  layouts/                 base layout and article layout
  lib/                     classification, probability, sampling, statistics, analytics
  scripts/                 page-specific tool controllers and consent UI
  pages/
    index.astro
    [slug].astro           allowlisted guide paths from the collection
    simulator.astro
    probability-calculator.astro
    guides/index.astro
    about.astro
    contact.astro
    privacy-policy.astro
    terms.astro
    404.astro
    robots.txt.ts          build-time environment-aware endpoint
  styles/                  tokens, global styles, content, tools
tests/unit/
tests/browser/
tools/                     built-output and environment validation
docs/
.github/workflows/         validation CI, added when application exists
astro.config.mjs
package.json
package-lock.json
tsconfig.json
```

Planned routing is conventional multi-page navigation. Guide slugs must not collide with dedicated routes. Use directory-style output and trailing-slash canonical URLs. The generated root `404.html` is necessary for Pages' expected not-found behavior; do not install an SPA wildcard fallback. [Cloudflare documents its routing and 404 behavior](https://developers.cloudflare.com/pages/configuration/serving-pages/).

## Application boundaries

Classification and probability modules are pure and shared by all tools. The sampler accepts a random-word source so tests can verify edge cases deterministically. Statistics operates on data; DOM controllers manage form validation, timers, cancellation, and rendering. Analytics consumes a small typed event interface and never participates in generating outcomes.

Static content must be useful without JavaScript. Enhance interactive pages with their own scripts, leave explanation and examples visible when unavailable, and avoid shipping simulator code to every article. Use system fonts initially, original lightweight SVG, reserved chart/image dimensions, and reduced-motion styles.

## Build and environment contract

The exact variable names will be established with the scaffold. The required semantics are:

- A deployment environment with explicit `development`, `preview`, or `production` values, defaulting to nonproduction. `NODE_ENV=production` from a build is not enough to authorize indexing or analytics.
- One validated production origin, proposed `https://learn.kalam.trade`. Production builds must fail on a missing/invalid origin or an unintended host. Domain availability/ownership remains unverified.
- Optional public GA4 measurement ID, analytics enabled flag, and configured consent behavior. Public build variables are not secrets. Missing ID or incomplete consent configuration leaves tracking off.
- Optional owner-approved contact and course information destinations. No privileged tokens in public configuration or the client bundle.

Production HTML uses self-referencing canonical URLs at the production origin. Preview HTML is `noindex` and uses the matching production canonical as a consolidation hint; it is not submitted for indexing. Generate environment-appropriate robots/sitemap artifacts at build time. Production sitemap includes only canonical public routes, excludes 404/drafts, and robots points to its actual URL. A preview can omit the sitemap; robots must permit a crawler to read its `noindex` rather than rely on `Disallow: /` alone. [Google explains this distinction](https://developers.google.com/search/docs/crawling-indexing/block-indexing).

## Hosting and repository workflow

Choose Pages Git integration for this separate repository when owner-authorized access is available. Build with `npm run build`, output `dist/`, and use branch previews for experiments. [Cloudflare's Astro Pages guide](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/) remains the Pages-specific reference; the current [Astro Cloudflare guide](https://docs.astro.build/en/guides/deploy/cloudflare/) presents Workers deployment as another option. Pure static Pages output does not require an on-demand rendering adapter. Do not combine Pages and Workers configuration without an actual need.

Before custom-domain launch, inspect authorized Cloudflare configuration and DNS to confirm `learn.kalam.trade` is unused and appropriate. A public DNS absence alone cannot prove availability. The handoff requires explicit authorization for DNS changes, privileged service connections, and publishing to an existing production environment.

Pages preview deployments have a documented default `X-Robots-Tag: noindex`, but verify it on the real host rather than assuming it. Keep our build-time preview safeguards too. The stable `pages.dev` production alias is a separate concern: once the custom domain is live, redirect that alias to it or apply host-specific indexing protection, then verify responses. Never apply global production `noindex` by accident. See [Cloudflare preview indexing documentation](https://developers.cloudflare.com/pages/configuration/preview-deployments/).

Phase commits go to this repository's `main` and are pushed after the relevant checks. GitHub pushes do not currently deploy a website. Before enabling automatic production deployment on push, document that change in behavior and obtain the applicable authorization. No paid plan, billing, ads, or new external account is required by the local architecture.

## SEO interfaces to establish early

The shared SEO head accepts title, description, canonical path, page type, optional image, indexability, and valid structured data. The content schema supplies article dates/publisher/related links. Breadcrumbs must be visible when their markup is emitted. Production pages get unique metadata and one meaningful H1. WebSite/publisher data must describe the real project; no invented entity qualifications or ratings.

Phase 4 validates the complete implementation and generated HTML, not merely source templates. [Google Search Essentials](https://developers.google.com/search/docs/essentials) guides crawlable links and useful visible content; meeting technical requirements does not guarantee search appearance.

## Analytics boundary

Phase 5 implements the handoff event set behind configuration and consent. Initial design: no GA script or analytics requests before affirmative analytics consent; reject and accept are both available, and consent can be withdrawn. This is a conservative implementation choice, not legal advice or a universal compliance claim. Review the applicable requirements and actual disclosures before enabling production analytics.

Use basic consent gating rather than sending denied-consent pings by default. Drop pre-consent events rather than replaying a history of interactions. Send one page view per document, one completion per fully completed run, and no completion for cancellations/replays. Avoid duplicate automatic/manual page-view paths. No session replay, ad targeting, user ID, sensitive inputs, or outcomes sent as event parameters. Read [Google's consent guidance](https://developers.google.com/tag-platform/security/guides/consent) during implementation.

## Planned checks and budgets

Scaffold commands in Phase 2: `dev`, `check`, `build`, and `preview`; add `test`, `test:browser`, and built-output checks as their implementations exist. [Playwright](https://playwright.dev/docs/intro) will exercise the actual built site. No commands are claimed to work before their scripts exist.

Initial engineering budgets (project decisions, not measured results): article/home first-party JavaScript <=30 KiB gzip per route, tool first-party JavaScript <=80 KiB gzip per route, CSS <=40 KiB gzip per route, no external font request, no third-party request before consent except hosting infrastructure behavior outside the app. Measure fetched assets, not just entry files. Core Web Vitals targets remain LCP <=2.5s, INP <=200ms, CLS <=0.1 from the handoff; lab scores cannot prove field performance.

Detailed tests, phase gates, and deferred owner inputs are in the [validation plan](validation-plan.md).
