# Validation plan and phase gates

Created 2026-11-03. These are planned acceptance checks, not tests already passed. Phase 1's actual results are recorded in the [phase report](phase-1-report.md).

## Checks by phase

| Phase | Required evidence before commit/push | Deferred boundary |
| --- | --- | --- |
| 1. Research and architecture | References reviewed, ten queries assessed, all 14 routes mapped, complete classification and probability specification, document links and consistency checked | No application, build, browser test, or deployment claim |
| 2. Core site | Type/content checks and production build; inspect all routes; verify responsive navigation and representative article/home layouts with browser screenshots; local direct-route/404 checks | Tools visibly marked as previews until functional |
| 3. Tools | Deterministic unit tests plus browser interaction tests for all three learning tools; input errors and keyboard operation verified | No real-game integration or prediction claims |
| 4. SEO | Inspect built HTML, metadata uniqueness, H1s, canonicals, structured data, sitemap, robots, draft exclusion, internal links, production vs preview differences | Host-level redirects/statuses still need deployed checks |
| 5. Analytics | Config/consent/event tests; disabled-state network checks; consent withdrawal and duplicate protection; privacy text matches behavior | Live GA4 DebugView/Realtime checks need the owner's property/configuration |
| 6. QA/deployment | All applicable tests and builds pass; mobile/desktop QA; Lighthouse diagnostics; authorized live deployment; HTTPS, routes, 404, headers, domain, alias and sitemap verified | Owner access/authorization required for gated external actions |
| 7. Measurement | Initial baseline and 30-day review of Search Console and available consented GA4 engagement data | Low data and indexing delays reported honestly; no guaranteed ranking outcome |

## Mathematical unit tests

- Enumerate all ten digits against the specified table, including both colors for 0 and 5; reject noninteger/out-of-range inputs.
- Count event sets exactly. Red/Green each have five members, Violet has two, Red union Violet has six, and Big intersect Red has two.
- Verify sequence products: two chosen digits = 1%; Big, Big, Small = 12.5%; the observed history does not enter the formula.
- Verify sampler boundaries: 0 -> 0, 9 -> 9, 10 -> 0, 4,294,967,289 -> 9; reject 4,294,967,290 through 4,294,967,295. A controlled source spanning complete accepted residue groups must produce equal digit counts. Do not rely on a flaky random frequency assertion as proof of correctness.
- Verify recorded replay returns exactly the same digits, without claiming a new sample or requesting randomness again.
- Check count totals, full-run vs recent-history denominators, empty state, expected counts, overlapping color membership, and streak detection on known sequences including ties and a terminal run.
- Check invalid sizes, blanks, fractions, nonfinite values, very small sequence probabilities, cancelled batch runs, and bounded source failures.

## Browser acceptance flows

1. Open home and representative guide with JavaScript enabled and disabled. The purpose, classifications, explanation, and ordinary navigation remain readable.
2. Visit all 14 routes directly and refresh them. Use a nonexistent path and confirm a genuine 404 in the final host check.
3. Start a timed run, pause/resume, switch visibility, cancel, restart, reset, and replay. Confirm no duplicated/stale rounds, misleading background history, or completion event for cancellation/replay.
4. Run small and maximum batch samples, cancel mid-run, inspect counts and limited recent history, then export and compare digit count to the completed run if export is implemented.
5. Calculate a digit, each category, and ordered sequences. Submit invalid input and verify visible, associated errors without losing usable form state.
6. Regenerate the randomness comparison, inspect both sample sizes and actual longest runs, and confirm the independence explanation remains visible.
7. Navigate by keyboard; test menu state, focus visibility, labels, result announcements, reduced motion, 200% zoom, and narrow-screen overflow. Check semantic accessibility automatically where useful, with manual keyboard/contrast review.
8. Start with analytics unconfigured, then configured but consent absent/rejected. Assert no GA script or collection request. Accept consent and verify allowed events once; withdraw and verify future app tracking stops. Block real collection calls in automated tests and inspect their would-be payloads. Validate live collection separately only with authorized configuration.

Automated browser tests should operate a locally built preview and block unapproved external services. Use desktop and mobile-sized viewports, include a Chromium flow first, and add Firefox/WebKit coverage as the environment permits. Record any unavailable engine or browser-launch limitation rather than reporting it as tested.

## SEO and hosting checks

Maintain a route manifest as the implementation develops. Validate the generated HTML rather than relying only on template code. Check canonical origin/path, unique title and description, one H1, semantic links, image alternatives, visible breadcrumbs, parsable schema matching content, and no accidental production `noindex`.

Parse sitemap XML and compare its URL set to the canonical published routes. Confirm robots references the actual sitemap endpoint. Exclude drafts/404 and don't change modification dates without real edits. Verify equivalent paths/aliases don't create competing production URLs. Preview and production builds need separate test fixtures; an ordinary production-mode bundler build must not automatically become indexable.

After authorized deployment, verify status/redirect/header behavior with HTTP requests: HTTPS, important direct routes, a missing URL, root 404, canonical path normalization, preview `noindex`, stable host alias handling, and the custom-domain sitemap. Source-level checks cannot prove CDN behavior.

## Performance and privacy

Measure build asset sizes against the budgets in [architecture.md](architecture.md). Run Lighthouse for representative home/article/tool pages on mobile settings, record the test environment and findings, and fix material regressions. Run PageSpeed Insights after the public deployment exists. Review real-user 75th-percentile Core Web Vitals only when sufficient data is available; do not substitute a Lighthouse score for field INP or a promise of passing Core Web Vitals.

Inspect outgoing requests, generated artifacts, and tracked Git files. Exclude credentials and local files. Verify no operator embeds, live result feed, misleading service labels, copied branding, transaction controls, or unsupported ratings. Confirm hosting telemetry and actual analytics behavior match the privacy disclosure.

## External inputs and release gates

None of these blocks Phase 2 local implementation:

| Input/action | Needed by | Required behavior if unavailable |
| --- | --- | --- |
| Owner-approved public contact destination and publisher details | Production content QA | Use honest development state; don't publish a dead contact action or invented identity |
| Cloudflare project/account authorization | Hosted preview/deployment | Complete local build/tests and document connection steps |
| Inspection of existing `learn.kalam.trade` use and explicit DNS authorization | Custom-domain release | Don't change records or infer availability from a proposal |
| GA4 measurement ID and applicable consent configuration | Production analytics enablement | Keep tracking disabled and test the local event interface |
| Search Console property access/verification authorization | Production search setup | Provide exact owner steps; don't claim verification or sitemap submission |
| Owner-reviewed course destination, if wanted | Optional course-interest CTA | Omit the CTA/event trigger until enabled |
| Reliable volume dataset, if later available | Quantitative keyword refinement | Continue with documented qualitative research; leave volumes unknown |

Google Ads, certification applications, billing, and spend remain a separate future workstream. No paid tool subscription is assumed for the initial site.
