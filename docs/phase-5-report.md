# Phase 5 report: analytics and measurement preparation

Date: 2026-11-03. Status: implemented and locally validated. Live analytics remains disabled; Search Console setup is prepared and unverified. No account, DNS, deployment, billing, or advertising settings were changed.

## Delivered

- Configurable GA4 integration gated by an explicit enable flag, measurement ID, required consent mode, production environment, Cloudflare branch, exact runtime origin, and known page path.
- Consent controls with equally styled allow/reject choices, undecided dismissal, footer settings, expiry, cross-tab reconciliation, GPC/DNT overrides, and nonblocking failure handling. Withdrawal disables future tracking, removes integration-owned cookies, and reloads the document.
- Seven event types covering page/guide views, simulator starts/completions, calculator use, and optional course/contact interest. Runtime event allowlists exclude raw inputs, outcome data, emails, and full destination URLs. In-memory tokens deduplicate experiments without sending run identifiers.
- Manual page views with queries/fragments removed, static page names, and restricted referrers. No preconsent or tag-loading interaction backlog. Advertising consent remains denied, signals disabled, cookies host-only with 30-day expiry, and explicit preferences expire after 90 days.
- Optional public contact/course configuration, absent by default. Updated privacy disclosures and public contact-status wording. Static production Search Console verification-tag support is independent of analytics consent.
- [Analytics event contract and owner activation checklist](analytics-events.md), [Search Console setup instructions](search-console-setup.md), README updates, version 0.5.0, and automated test coverage.

## Validation

Local environment: Windows, Node 24.19.0, installed Chrome through Playwright 1.64.1. Run `npm run validate` with `PLAYWRIGHT_CHANNEL=chrome` on this machine.

| Check | Result |
| --- | --- |
| Type/content checks | 67 files; zero errors, warnings, or hints |
| Unit suite | 130 passed; includes 38 new measurement gate, consent, event, bucket, and referrer cases |
| Static build | Fourteen public pages plus 404, robots, sitemap, and generated host files |
| Default generated-output checks | 461 internal links/anchors; metadata, assets, headings, and route checks passed |
| SEO/measurement build matrix | Preview, indexable production, inherited-production Cloudflare branch preview, synthetic analytics-enabled production passed |
| Existing SEO behavior | Six Articles, thirteen breadcrumb trails; fourteen production sitemap URLs, zero preview sitemap URLs; 27 alias redirects |
| Browser suite | 87 passed across desktop, tablet, and mobile; includes 36 new analytics checks |
| Consent checks | Undecided, rejected, granted, renewed, expired, withdrawn, cross-tab changes, GPC/DNT, origin mismatch, unavailable storage, and blocked tag |
| Event checks | One manual page view/guide event; valid simulator/calculator/randomness actions; cancellation/replay/reset and invalid data exclusions; deduplication and matching completions |
| Privacy checks | No requests before consent or after rejection; query/referrer filtering; no raw sequence/outcome/contact destination in app events; owned cookie cleanup |
| Accessibility/review | Automated axe checks on the consented fixture at all three widths passed; consent screenshots captured and mobile layout reviewed |

The browser fixture serves a synthetic production build through Playwright interception. Every request is intercepted; the Google tag is replaced with a local command-recording stub. Tests never contact Google or the production host. Existing tests also verify disabled pages keep tool data local and persist no outcomes. The matrix's Cloudflare branch-preview profile inherits configured analytics flags to prove branch suppression; its output contains no consent controller or verification tag.

Default ordinary pages and the 404 retain **zero executable JavaScript**. Compressed default tool JavaScript is 6,219 bytes for the simulator, 5,399 for the calculator, and 5,232 for randomness. The synthetic enabled profile uses 3,204 bytes on ordinary pages and up to 8,148 bytes on tool pages, before any external Google SDK download. Local CSS is 7,425 bytes compressed on ordinary pages and 8,716 on tools. These remain within project budgets; they are not field performance measurements. Artifacts, logs, screenshots, and traces are ignored by Git.

## Pending external verification

No real measurement ID, Search Console token, public owner email, or approved live course destination is set. Consent controls intentionally do not appear in the default local build. Use the analytics test fixture and screenshots to review the implementation without enabling live collection.

The Google SDK was not downloaded or executed during tests. Its actual requests, cookies, automatic events, and delivery into the selected property require owner-authorized live verification. Before activation, the owner must disable GA4 Enhanced Measurement and review advertising, retention, privacy, and hosting settings. A runtime event allowlist cannot control an incorrectly configured external property. Collection must remain disabled if live behavior differs from the documented plan.

Search Console ownership, sitemap submission, live inspection, and an initial measurement baseline remain pending access and deployment. Cloudflare header/redirect behavior still requires live host checks during Phase 6. Indexing and ranking results are not guaranteed.

## Learning recap

Analytics instrumentation defines which interactions become events and which parameters describe them. Consent determines whether the analytics service may load; the learning tools work independently. GA4 measures consented visits and engagement, while Search Console reports search visibility and clicks. Implementing the code prepares measurement; real property verification and a public deployment establish whether measurement actually works.

## Next

Phase 6 covers final QA, performance review, deployment documentation, and an authorized Cloudflare release when owner access and host confirmation are available. Phase 7 establishes and monitors the first 30 days of real search and engagement data after deployment.
