# Phase 6 report: local QA and deployment preparation

Later hosting update: the owner selected Workers. See the [Workers migration record](workers-migration.md) and current [deployment runbook](deployment.md); Pages-specific statements below record the earlier phase implementation.

Date: 2026-11-04. **Local implementation and QA are complete; authorized deployment and live verification remain pending.** No Cloudflare account/project, DNS record, production website, Google property, advertising, or billing setting was changed.

## Delivered

- A minimal `wrangler.jsonc` for the proposed separate static Pages project `wingo-seo`, serving `dist/`. The Pages project name remains subject to owner review and availability.
- `npm run build:release`: builds and validates a local indexable candidate under `artifacts/release/`. Analytics and optional owner configuration are cleared, default `dist/` is preserved, and nothing is uploaded.
- `npm run test:performance`: audits home, number-probability guide, simulator, calculator, and randomness pages with mobile and desktop Lighthouse profiles. HTML/JSON reports include metrics, scores, versions, and timestamps. Threshold failures fail the command. CI now runs this command after the full validation suite.
- `npm run check:release`: read-only public HTTP/HTTPS verification for explicit production, stable Pages alias, and matching preview origins. Its 33 groups cover route/status/metadata/indexing behavior, redirects, assets, sitemap/robots, HTTPS upgrades, and host exclusions. Reports are saved locally. No live release check has been claimed.
- New QA for all routes at 320px, representative pages with 200% text resizing, reduced-motion behavior, visible keyboard focus, and keyboard tool use. Text resizing is not a claim of native browser zoom or screen-reader coverage.
- A [deployment runbook](deployment.md) covering account/repository authorization, static hosting settings, separate preview/production environments, domain confirmation, Git auto-deployment behavior, release verification, and rollback. [Performance evidence](performance.md) records lab results and live measurement limits.
- Package version 0.6.0 and pinned Lighthouse/chrome-launcher development tooling. Lighthouse 13.5.0 avoids the vulnerable dependency chain observed in the newer version during tool selection. No runtime application dependency was added.

## Validation

Environment: Windows, Node 24.19.0, installed Chrome via Playwright 1.64.1; Lighthouse 13.5.0. Initial performance measurements were taken 3 November, and the full final regression was run 4 November.

| Check | Result |
| --- | --- |
| Type/content checks | 73 files; zero errors, warnings, or hints |
| Unit suite | 146 passed, including 16 new release-target/HTTP contract cases |
| Browser suite | 93 passed across desktop, tablet, and mobile, including six new release QA cases |
| Four-profile build matrix | Preview, production, Cloudflare branch preview, and synthetic analytics-enabled production passed |
| Default output | Fourteen public routes plus custom 404; 461 internal links/anchors; ordinary pages retain zero executable JavaScript |
| SEO invariants | Six Articles, thirteen breadcrumbs, fourteen production sitemap URLs, zero preview sitemap URLs, 27 canonical alias redirects |
| Local production candidate | Built and passed generated-output checks without changing default preview output |
| Lighthouse ten audits and final confirmation run | All categories scored 100; LCP about 1.2–1.4 seconds mobile and 0.3 seconds desktop; CLS 0 and TBT 0 ms |
| Dependency review | Installed selected tooling reported zero npm vulnerabilities |
| Release checker | Success and failure paths validated with synthetic responses, including wrong canonical/redirects, missing exclusions, SPA-like false 404s, and network failures |

Lighthouse reports are laboratory diagnostics from a local static server with analytics disabled. They do not measure the eventual CDN, Google SDK, field INP, or real-user Core Web Vitals. Existing browser tests cover consent, calculator/simulator/randomness behavior, maximum samples, timer/cancellation/replay/export, accessibility scans, no-JavaScript content, and disabled-state privacy. Linux CI exposed homepage overflow with enlarged text and its fallback fonts. The tablet hero now switches columns according to available space and text size, and its decorative note stays inset. The overflow assertion remains strict.

The live checker does not execute JavaScript, inspect Cloudflare account settings, or establish every accessibility/privacy property. Actual deployment headers, DNS/certificate activation, branch and hashed preview exclusions, browser behavior, PageSpeed Insights, GA4 delivery, and Search Console verification remain external release work. The Wrangler configuration was reviewed against Cloudflare documentation; a Wrangler CLI deployment was not performed.

## Owner inputs and release gates

1. Confirm `learn.kalam.trade` and authorize inspection of its existing Cloudflare/DNS use. An alternate hostname needs deliberate config/test/doc updates.
2. Provide authorized access to the intended Cloudflare account and approve connection of only this repository to a separate Pages project. Connecting Git can publish immediately; agree on automatic production/preview deployment behavior first.
3. Review owner/publisher/contact details, optional course destination, and actual hosting/privacy settings. Optional services can stay disabled for launch.
4. Approve the specific release and subdomain changes described in the runbook. Then deploy the validated commit, verify live hosts, and record deployment URLs/ID, date, and results.
5. Follow the existing Search Console and optional analytics owner checklists. Begin Phase 7 only once a real public release and measurement access exist.

## Learning recap

A production build is the static output intended for hosting. Local tests establish whether that output behaves as designed; Lighthouse estimates loading performance under controlled conditions. Deployment adds real DNS, HTTPS, CDN routing, headers, and account settings, which must be checked on the public host. This phase prepares those checks and a repeatable release process; it does not substitute local evidence for a live deployment.
