# Cloudflare Pages deployment runbook

Prepared 4 November 2026. The local release tools are implemented. **No Cloudflare project has been connected, no custom domain has been attached, and no public release has been verified.** The proposed address remains `https://learn.kalam.trade/`; owner confirmation and inspection of existing infrastructure are required.

## Release inputs and authorization

Use this separate repository: `https://github.com/git4alauddin/wingo-seo`. Do not modify the course website or the older simulator. The proposed Pages project name is `wingo-seo`, subject to account availability. If another name is needed, update `wrangler.jsonc` before connecting it. That file defines static output `./dist` and compatibility date; it does not configure build-time environment variables or authorize an upload. No Functions, Workers adapter, database, or secrets are required.

Before taking external actions, obtain authorization to connect this repository to the intended Cloudflare account, create the separate Pages project, publish it, and attach the confirmed subdomain. Inspect existing DNS, Pages custom domains, Workers routes, and redirects for that subdomain first. Public DNS absence does not establish that a name is unused. Record the selected project name, owner-approved hostname, release commit, and account access without copying credentials into this repository.

The [handoff](../handoff.txt) requires explicit authorization before production DNS changes, external account changes, privileged connections, and publication to an existing production environment. The steps below are the concrete proposed release; they have not been executed.

## Local release evidence

Use Node 24 and install pinned dependencies:

```powershell
npm ci
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm run validate
npm run test:performance
Remove-Item Env:PLAYWRIGHT_CHANNEL
```

An installed Chrome is convenient on this Windows machine. Alternatively, leave the channel unset and install Playwright Chromium with `npx playwright install chromium`. The browser suite uses port 4322; keep it free. Lighthouse uses its own temporary loopback port and closes its browser/server afterward.

`npm run build:release` writes and validates an **indexable local production candidate** under ignored `artifacts/release/`, with analytics, verification token, and optional contact/course configuration cleared. It leaves normal `dist/` untouched and performs no upload. This candidate is for QA, not an owner-configured release artifact. `npm run test:performance` builds that candidate and audits five representative routes at mobile and desktop settings. HTML/JSON reports and `summary.json` are saved under `artifacts/lighthouse/`. See [performance evidence and limits](performance.md).

Normal `npm run build` still defaults to excluded preview output in `dist/`. Production behavior comes from the explicitly configured environment below. GitHub Actions validates pushes and pull requests, including local Lighthouse checks; it has no deployment step or Cloudflare credentials.

## Connect Pages only after authorization

Use **Workers & Pages → create a Pages application → connect Git**, selecting only this repository. Cloudflare's dashboard labels can change; select Pages static hosting rather than creating an unrelated Worker. Review the GitHub installation scope before authorizing it. Connecting Git can immediately start a build and publication on a `pages.dev` host. Use preview-safe values for the first build and obtain authorization before connecting. [Cloudflare Git setup](https://developers.cloudflare.com/pages/get-started/git-integration/).

| Build setting | Value |
| --- | --- |
| Project name | `wingo-seo`, after availability/owner review |
| Production branch | `main` |
| Root directory | Repository root |
| Framework | Astro/static; verify the resulting command and output |
| Build command | `npm ci --no-fund && npm run build && npm run check:site` |
| Output directory | `dist` |
| Node version | Node 24; explicitly set `NODE_VERSION=24.19.0` or an owner-reviewed supported Node 24 release |
| Build system | Current Pages build system (v3 where available) |

The committed `.nvmrc` selects Node 24. Set `NODE_VERSION` explicitly to avoid inheriting an older host default. [Cloudflare build versions](https://developers.cloudflare.com/pages/configuration/build-image/). The minimal [Wrangler Pages configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/) is committed, but Wrangler CLI upload/configuration was not exercised. If reusing an existing project, reconcile its settings before treating this file as authoritative; do not overwrite an existing project's bindings.

## Environment separation

Set process build variables in the Pages dashboard. Copying `.env.example` does not configure the build launcher. Keep public values separate from account credentials.

| Variable | First hosted review / Preview | Approved indexable production |
| --- | --- | --- |
| `SITE_ENV` | `preview` | `production` |
| `SITE_ORIGIN` | `https://learn.kalam.trade` | Same, after owner confirmation |
| `SITE_INDEXABLE` | `false` | `true`, only at the approved release |
| `ANALYTICS_ENABLED` | `false` | `false` initially |
| `GA4_MEASUREMENT_ID` | Empty | Empty until separate owner configuration |
| `ANALYTICS_CONSENT_MODE` | `unconfigured` | `unconfigured` until analytics activation |
| `SEARCH_CONSOLE_VERIFICATION_TOKEN` | Empty | Optional real owner-provided public token |
| `CONTACT_EMAIL` | Empty or approved public address | Approved public address if supplied; otherwise honest pending notice |
| `COURSE_INFO_URL` | Empty | Empty unless owner approves the reviewed course homepage |

Set Production and Preview variables separately. A detected non-main Cloudflare branch also forces indexing and analytics off, even if production flags were inherited. Do not change the production branch without updating that guard in `config/site.mjs`. Production `pages.dev` aliases need the generated host-specific noindex headers even when custom-domain HTML is indexable. The analytics browser controller separately rejects alias origins.

After initial review, pause automatic production deployments unless the owner explicitly approves publishing on every push to `main`. Cloudflare offers production branch controls and preview branch selection; this behavior differs from the repository's current validation-only pushes. Choose approved preview branches deliberately. An automatic Pages build is not inherently gated by a green GitHub Actions run: confirm the exact commit passed validation before triggering an approved release. [Git deployment controls](https://developers.cloudflare.com/pages/configuration/branch-build-controls/).

## Custom domain and production activation

1. Confirm `learn.kalam.trade` with the owner and inspect its existing use. If another hostname is chosen, update the validated origin, release checker, docs, and tests before building. Do not force a different hostname through the existing allowlist.
2. In the **new project's Custom domains** screen, add the approved subdomain. Review the proposed DNS change. For a Cloudflare-managed zone, the association can create the CNAME automatically after confirmation; otherwise follow the approved DNS provider's instructions. Associate the domain with Pages first rather than creating a standalone CNAME. [Cloudflare custom-domain setup](https://developers.cloudflare.com/pages/configuration/custom-domains/).
3. Change only the approved new subdomain record. Preserve the course site, apex records, mail, and all unrelated routes/records. Wait for domain activation and a valid HTTPS certificate. Confirm the actual production and Pages alias URLs.
4. Review public content, publisher/contact status, privacy disclosures, and hosting telemetry. Keep Cloudflare Web Analytics, Zaraz, and other injected tracking disabled unless separately reviewed and authorized. Keep GA4 off for the initial release; activate later using the [analytics checklist](analytics-events.md).
5. Apply the approved production values, build the selected validated commit, and review build logs and generated output. Authorize the production release. Verify the custom host and aliases immediately using the checks below. Do not apply a global production noindex header or an SPA wildcard redirect.

Pages normally handles static caching; start with its defaults rather than adding broad HTML cache rules. The build emits `_headers` and `_redirects`, and includes a real top-level `404.html`. Astro preview does not execute those host files. [Cloudflare static routing/caching behavior](https://developers.cloudflare.com/pages/configuration/serving-pages/).

## Read-only live release checks

After authorized deployment, replace the sample Pages hostnames with the actual project/preview hosts:

```powershell
npm run check:release -- --production https://learn.kalam.trade --alias https://wingo-seo.pages.dev --preview https://qa.wingo-seo.pages.dev
```

The checker makes public HTTP/HTTPS requests, does not execute JavaScript, and changes no account settings. It requires explicit matching hosts and rejects credentials/query strings in target arguments. It checks HTTP-to-HTTPS upgrade, all 14 public routes, metadata and canonical consistency, production indexing, sitemap/robots, missing-path 404s, permanent canonical redirects, PNG delivery/dimensions, first-level local CSS/JS assets, stable alias exclusions, and preview exclusions/empty sitemap. Output is saved to ignored `artifacts/release-check/latest.json`; failures return a nonzero exit status. Its 33 check groups have been tested using synthetic responses, not a live deployment.

Run the checker once with the actual branch preview and again with its immutable hashed preview URL. Both must remain excluded. A protected preview may return a login redirect instead of public HTML; the checker then fails intentionally. Inspect the protected preview through authorized access and document that result rather than declaring the public check passed. Source and mocked-response tests cannot prove CDN behavior. Browser-smoke the deployed tools, direct-route refreshes, keyboard navigation, and consent-disabled network behavior separately. Review nested imported assets and actual hosting headers in the browser too.

Run PageSpeed Insights for the live home, guide, simulator, calculator, and randomness URLs on mobile/desktop. Record lab results separately from any CrUX field data; a new site may have no field data. Check live Search Console ownership, sitemap submission, and representative URL inspection using the [owner setup guide](search-console-setup.md). None of these external tasks is completed by the local checker.

## Rollback and handoff

Record a known-good production deployment ID and commit before later releases. If a new release breaks routes, indexing, tools, or privacy, pause automatic production deployments and use Pages' rollback to a successful **production** deployment after owner authorization. Preview deployments are not rollback targets. Recheck environment/DNS settings separately, as rolling back static output does not establish that every account setting was restored. [Cloudflare rollback procedure](https://developers.cloudflare.com/pages/configuration/rollbacks/).

For a first release without a previous production deployment, agree with the owner how to pause/remove the new publication or restore the prior approved subdomain state; do not delete unrelated records. Log the incident, deployed commit, restoration, and repeated checks. Phase 7 begins after the public release date is known and Search Console access is available.
