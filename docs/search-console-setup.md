# Google Search Console setup

Prepared 3 November 2026. **Pending owner access and an authorized public deployment.** No property has been created or verified, sitemap submitted, indexing requested, account changed, or DNS modified during this phase.

## Property and verification

The proposed origin remains `https://dmplay.kalam.trade`. Confirm it with the owner before release. Prefer a URL-prefix property for `https://dmplay.kalam.trade/` to scope this experiment to its exact HTTPS host. If the owner already has an appropriate verified parent property, request authorized access or use its supported child-property verification. A Domain property covers broader hosts/protocols and uses DNS verification; any DNS change requires separate explicit authorization. [Google explains the available verification methods and continued token checks](https://support.google.com/webmasters/answer/9008080).

For the implemented HTML-tag method:

1. The authorized owner opens Search Console, adds/selects the URL-prefix property, and chooses **HTML tag** verification. Copy only the `content` value from Google's `google-site-verification` meta tag.
2. Set that public value as `SEARCH_CONSOLE_VERIFICATION_TOKEN` in authorized production build settings. It is a public verification marker, not an API secret. It grants verification significance, so do not insert another person's token or remove an existing owner's method casually. The token is emitted server-side only in production builds outside detected Cloudflare branch previews; analytics can remain disabled.
3. Build and inspect the homepage HTML for exactly the intended tag in `<head>`. Deploy through the authorized Phase 6 process. Check the **live** HTTPS homepage source, status, certificate, canonical, and access without a login. Localhost and an intercepted test fixture cannot verify ownership of this production property.
4. The owner clicks Verify in Search Console and records the result. Keep the production tag in later builds because ownership can be checked again. If verification fails, check property URL, deployed token, stale build/cache, and homepage accessibility before changing other services.

Do not rely on analytics-based verification: this site's analytics tag is deliberately blocked before consent. No privileged Google credential is required in this source repository.

## Sitemap and release checks

After the host is authorized and released with `SITE_ENV=production`, explicit `SITE_ORIGIN=https://dmplay.kalam.trade`, and `SITE_INDEXABLE=true`:

1. Verify the live homepage and representative guides/tools return 200, self-canonicalize to HTTPS directory URLs, and have no `noindex` in HTML **or HTTP headers**. Confirm Cloudflare aliases/previews remain excluded, known aliases redirect, and missing pages return actual 404 responses. Local Astro preview does not execute Cloudflare's generated host rules.
2. Open `https://dmplay.kalam.trade/sitemap.xml`: expect 14 distinct canonical URLs, correct XML, and no 404, preview, or alias URLs. Confirm `/robots.txt` permits access and advertises this sitemap. Preview/default builds intentionally have an empty sitemap and no advertised sitemap.
3. In the correct Search Console property, open **Sitemaps**, submit the sitemap URL, and record its fetch/processing status. Investigate fetch or XML errors. A successful submission helps discovery; it does not prove every URL is indexed. [Sitemaps report documentation](https://support.google.com/webmasters/answer/7451001).
4. Inspect the homepage, `/wingo-rules/`, `/patterns-and-randomness/`, `/simulator/`, and `/probability-calculator/` in **URL Inspection**. Run a live test and review rendered content and crawl/indexing eligibility. Request indexing for these representative pages if appropriate. Later compare Google's selected canonical in indexed results with the declared canonical. The live test cannot predict Google's canonical decision. [URL Inspection documentation](https://support.google.com/webmasters/answer/9012289).

Avoid repeated indexing requests as a ranking tactic. Crawl eligibility, an accepted sitemap, or an indexing request is not a guarantee of indexing or rankings.

## Baseline and monitoring handoff

In Phase 7, record the actual deployment date, property scope, verification method, sitemap status, representative inspection outcomes, and known exclusions. Keep dates and evidence, without private account details or credentials. Track Page indexing reasons and Performance impressions, clicks, CTR, average position, queries, and pages over the first 30 days. Review early changes against the release date and content edits, allowing for reporting delay and limited data. No baseline exists yet, and missing early data is not proof of a technical failure.

Owner inputs still needed: confirmed host, authorized hosting/deployment access, Search Console ownership/access, and a real verification token if this method is selected. GA4 account access is optional and independent. Phase 6 will provide deployment steps; Phase 7 will provide the dated monitoring checklist.
