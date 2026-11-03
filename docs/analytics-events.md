# Analytics implementation and activation

Implementation date: 3 November 2026. Live collection is **disabled**. No real GA4 property, measurement ID, owner email, or course destination has been configured. The automated fixture uses `G-TEST123456`, intercepts every request, and substitutes a local tag stub. It does not contact Google or validate delivery into a real property.

## Build configuration

`config/measurement.mjs` reads process environment variables at build time. Set them in the shell or authorized hosting build settings; `.env.example` is documentation, not an automatically loaded configuration file. Rebuild after changing them.

| Variable | Default | Effect |
| --- | --- | --- |
| `ANALYTICS_ENABLED` | `false` | Explicit collection opt-in |
| `GA4_MEASUREMENT_ID` | Empty | Public `G-XXXXXXXXXX` web stream identifier |
| `ANALYTICS_CONSENT_MODE` | `unconfigured` | Must be `required` to activate the consent integration |
| `SEARCH_CONSOLE_VERIFICATION_TOKEN` | Empty | Public HTML-tag verification content; independent of analytics |
| `CONTACT_EMAIL` | Empty | Optional owner-approved public email link; no message form |
| `COURSE_INFO_URL` | Empty | Optional reviewed `https://course.kalam.trade/` link |

Analytics requires all three analytics settings, `SITE_ENV=production`, and a non-preview Cloudflare branch. The browser separately requires the exact configured production origin and a known page path. The 404 has no consent controller. Disabled ordinary pages contain no JavaScript. Optional contact/course links can be configured independently of analytics; no destination is invented when absent. These values become public HTML or script configuration. Never enter an API key, account credential, Measurement Protocol secret, or private mailbox address.

## Choice and request lifecycle

The panel offers equally styled Allow and Reject buttons, a way to close it without deciding, and a privacy link. The footer reopens the choice. Nothing is sent to Google before an explicit grant or a still-valid stored grant. Preconsent interactions are dropped, not replayed later. Interactions while the tag is loading are also dropped. A simulator completion is counted only if its matching start was accepted after the tag became ready.

An explicit choice stores only `{ version, choice, expiresAt }` under `wingolab.analytics-consent.v1`, for up to 90 days. Unavailable storage leaves a choice valid for that document only. Malformed/expired preferences keep analytics off. Global Privacy Control and Do Not Track override grants while those signals are present. Cross-tab preference changes and restored pages reconcile their state.

After grant, the controller queues denied consent defaults, then configures GA4 and grants only analytics storage before loading the tag. Advertising storage, ad user data, and ad personalization stay denied. Google signals and personalization signals are disabled. Cookies use the `wingolab` prefix, host-only scope, a 30-day expiry, and no automatic expiry renewal. This follows a basic consent approach that blocks the tag before consent; the implementation does not use denied-state cookieless pings. See [Google's consent guide](https://developers.google.com/tag-platform/security/guides/consent).

Rejecting after activation sets the measurement-specific disable flag, clears integration-owned host cookies, and reloads to stop the loaded tag. This clears in-memory experiments too. Requests already sent cannot be recalled. Blocking the script or storage must not break a tool. Google can still generate session/engagement events, technical metadata, and identifiers after consent; this is not anonymous measurement or a guarantee about every future SDK behavior.

## Event contract

Every app event has `send_to`, a safe `page_location`, a static `page_title`, and a filtered `page_referrer`. Locations omit query/fragment. Same-site referrers retain only known paths; recognized Google/Bing/DuckDuckGo/Yahoo search referrers retain only origins. Other referrers are empty. Campaign parameters and many referral sources are deliberately lost.

| Event | Trigger | Additional parameters |
| --- | --- | --- |
| `page_view` | Once per eligible full page load, after tag readiness | `page_path`: known path |
| `guide_open` | Once on each of the six guide pages after readiness | `guide_slug`: known slug |
| `simulator_start` | Valid new simulator or randomness experiment | `tool`, `run_mode`, `sample_size_bucket` |
| `simulator_complete` | Successful matching experiment | Same categories as its start |
| `calculator_use` | Successful calculation or finished trial comparison | `calculator_action`: `event`, `sequence`, `trials` |
| `course_interest_click` | Click on the configured reviewed course homepage | `destination`: `course_homepage` |
| `contact_click` | Click on the configured public email link | `channel`: `email` |

`tool` is `simulator` or `randomness`. `run_mode` is `batch`, `timed`, or `comparison` (randomness only). Buckets are `1-20`, `21-200`, `201-2000`, and `2001-10000`; randomness buckets its combined 2,020 draws. Per-experiment tokens exist only as in-memory objects for deduplication and never leave the browser. Reset/replay/export, invalid inputs, and cancelled or failed completions do not produce a completion event. A new valid calculation can produce another use event. Link events indicate interest, not a completed course enrollment or delivered message.

The runtime allowlist rejects unknown events, extra fields, invalid categories, and unmatched run completions. Never add sequence text, drawn values, dataset CSVs, raw sample counts, guesses, email addresses, messages, user IDs, or full destination URLs. When adding pages, update the known page-name map and route checks deliberately.

## Owner activation procedure (pending)

1. Obtain authorization for the intended GA4 account/property and public destination details. Use an owner-approved web stream for the exact production origin. Do not add a second tag through Cloudflare, a CMS, Google Tag Manager, or another plugin.
2. In GA4 Admin, open the web stream's **Enhanced measurement** settings and turn automatic enhanced measurement off, including history-based page views, outbound clicks, site search, forms, scroll, downloads, and media. The narrow app event plan depends on this account setting. Keep Google signals and advertising integrations off; review data collection, retention, access, and disclosures with the owner. [Google documents the automatic events and their controls](https://support.google.com/analytics/answer/9216061).
3. Set the actual public measurement ID and the two explicit opt-ins in authorized production build settings. Keep preview builds disabled. Confirm production hosting/privacy disclosures and consent requirements before activation. Update the contact email only with a publicly approved destination; enable the course URL only after reviewing its educational role.
4. Run `npm run validate` locally with default settings. The SEO matrix creates a separate synthetic analytics-enabled fixture; it does not overwrite `dist/` or enable a real property.
5. After an authorized deployment, use a fresh browser profile and Network inspection. Before choosing, after Reject, and on preview aliases, confirm zero Google tag/analytics requests and no GA cookies. After Allow, confirm a single manual `page_view`, a single guide event, correct property destination, safe URL/referrer fields, advertising consent denied, and expected cookies. Inspect **all** outgoing requests, including automatic SDK events. See [manual page-view configuration](https://developers.google.com/analytics/devguides/collection/ga4/views) and [GA4 configuration fields](https://developers.google.com/analytics/devguides/collection/ga4/reference/config).
6. In GA4 Realtime (or a deliberately enabled temporary DebugView session), verify the actual event delivery. Check valid/cancel/replay tool flows, navigation, refusal, withdrawal, expiry, cross-tab revocation, unavailable storage, blocked script, GPC, and DNT. Rejection must stop later collection; allow may resume only after a new choice. Document SDK/network behavior and remove temporary debugging afterward.
7. Optionally register the low-cardinality event parameters above as event-scoped custom dimensions for reporting. Mark `course_interest_click` as a key event only if the owner chooses to measure it that way; it does not establish revenue. Do not mark ordinary page views as course conversions.

If live behavior differs from the documented limits, disable `ANALYTICS_ENABLED`, rebuild/redeploy through the authorized release process, and investigate before reenabling. Search Console works independently and does not require collecting visitor analytics.

## Interpretation

Use consented tool starts/completions and calculator actions to understand educational engagement. Missing consent, blocking, interrupted runs, filtered attribution, and load failures cause undercounting. GA4 visits and Search Console clicks measure different things and should not be expected to match. No live baseline or conversion rate has been measured in this phase.
