# Initial dmplay deployment review

4 November 2026. The owner supplied the deployed URL `https://dmplay.kalam.trade/`, replacing the earlier proposed `learn.kalam.trade`. The owner performed the Cloudflare publication/domain setup; this review makes read-only public requests and local repository corrections.

## Observed on the first live deployment

- All fourteen public routes returned HTTP 200 with one H1 each.
- Sampled pages had HTML and HTTP `noindex, follow`, deliberately matching the initial review build. Sitemap XML was valid and empty; robots allowed crawling without advertising a sitemap.
- A missing path returned HTTP 404 with noindex, and `/wingo-rules` returned 301 to `/wingo-rules/`.
- Browser smoke checks completed a simulator experiment, verified calculator P(7)=10%, and generated both randomness samples. No page JavaScript errors were observed.
- Canonical URLs still referenced `learn.kalam.trade`. This revision updates the strict origin, metadata/build checks, release checker, analytics fixture, tests, and active owner instructions to `dmplay.kalam.trade`. Historical phase reports preserve the original proposal.
- The browser attempted three requests to `static.cloudflareinsights.com` during tool navigation. Those requests were blocked by the test, so no collection payload or successful beacon delivery is claimed. Raw Node HTTP responses did not include that script, indicating response/client-dependent hosting injection. The repo itself does not include the beacon, and GA4's consent controller was absent as expected.

The fourteen-route HTTP summary is saved in ignored `artifacts/live-review/dmplay-initial.json`. Public HTTP checks and browser checks provide different evidence; raw HTML inspection alone did not establish the absence of injected telemetry.

## Owner steps before production indexing

1. In the Worker's **build-time variables**, change `SITE_ORIGIN` to `https://dmplay.kalam.trade`. The corrected source rejects the previous hostname; an automatic build before this setting changes can fail validation while the prior deployment continues serving.
2. Keep `SITE_ENV=preview`, `SITE_INDEXABLE=false`, `ANALYTICS_ENABLED=false`, and `ANALYTICS_CONSENT_MODE=unconfigured` for the next review deployment.
3. Review Cloudflare Web Analytics/Observatory automatic injection for this hostname. Disable the injected beacon for the planned initial analytics-off release, scoped to this site so other projects are unaffected. Cloudflare documents **Web Analytics → Manage site → Disable** and hostname-scoped rules. [Automatic setup controls](https://developers.cloudflare.com/web-analytics/get-started/), [hostname rules](https://developers.cloudflare.com/web-analytics/configuration-options/rules/).
4. Rebuild the latest commit, then verify canonical, Open Graph, structured data, and browser network behavior on `dmplay.kalam.trade`. The repository tests do not prove the updated Cloudflare environment was applied.
5. Supply the actual stable Workers URL and an excluded branch Preview URL for the complete live release checker. Production Version URLs need host exclusion but share their version's HTML; see the [deployment guide](deployment.md).
6. After review and explicit production-indexing approval, switch the production build to `SITE_ENV=production` and `SITE_INDEXABLE=true`, rebuild, and verify fourteen dmplay sitemap URLs and eligible production headers/HTML. Then perform [Search Console ownership and sitemap setup](search-console-setup.md). Optional GA4 activation remains a separate owner configuration step.

This is not a complete production sign-off. The canonical fix has been validated locally; updated live output, automatic injection disablement, stable/branch/version aliases, production indexing, Search Console ownership, and a dated monitoring baseline remain pending.
