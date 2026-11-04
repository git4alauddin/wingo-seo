# Cloudflare Workers deployment

Updated 4 November 2026. The owner selected Workers after the dashboard offered Workers setup. This supersedes the earlier Pages deployment plan. The Astro site remains static; no SSR adapter, application server, database, or hand-written Worker entry point is needed.

## Why the first deployment failed

The build and generated-site checks passed. Deployment ran `npx wrangler deploy`, but `wrangler.jsonc` declared Pages output with `pages_build_output_dir`. Workers could not find its script or assets directory. The configuration now uses Workers `assets.directory: ./dist`, automatic directory trailing slashes, and `not_found_handling: 404-page`. Existing `_headers` and `_redirects` apply to static asset responses. [Cloudflare static hosting configuration](https://developers.cloudflare.com/workers/static-assets/routing/static-site-generation/).

Wrangler 4.157.0 is pinned as a development dependency. `npm run check:worker` performs a packaging dry run without uploading. No custom domain or DNS change is included in the repository configuration.

## Existing Workers Git build settings

Use the separate Worker for `git4alauddin/wingo-seo`; match its name to `wingo-seo` in `wrangler.jsonc`. If the existing Worker has a different name, update that name deliberately before retrying. Keep other projects unchanged.

| Setting | Value |
| --- | --- |
| Repository | `git4alauddin/wingo-seo` |
| Production branch | `main` |
| Root directory | Repository root / blank |
| Build command | `npm run build && npm run check:site` |
| Deploy command | `npx wrangler deploy` |
| Preview command | Keep the dashboard's Workers preview default; keep preview build variables excluded |

Cloudflare installs dependencies before the build, so a second `npm ci` inside the build command is unnecessary. The repo's Wrangler configuration identifies `dist`; Workers does not need a separate Pages output-directory field. Git pushes can now trigger real hosted deployments because the owner connected Workers Builds. A green GitHub Actions run is not automatically a gate on Workers Builds: release only a reviewed commit with successful validation.

In the Worker's **Settings → Build → Variables and secrets** (build-time variables), set these for the first hosted review:

```text
NODE_VERSION=24.19.0
SITE_ENV=preview
SITE_ORIGIN=https://learn.kalam.trade
SITE_INDEXABLE=false
ANALYTICS_ENABLED=false
ANALYTICS_CONSENT_MODE=unconfigured
WRANGLER_SEND_METRICS=false
```

These must be available during the build, rather than only as runtime Worker bindings. Leave the measurement ID, verification token, contact email, and course URL empty until owner-approved values are supplied. Use the same safe values for nonproduction branches. `WORKERS_CI=1` and `WORKERS_CI_BRANCH` are injected by Workers Builds; non-main or missing branch information overrides inherited production settings and disables indexing/analytics. Keep this guard synchronized if the production branch changes. [Build environment reference](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).

Retry the latest commit once these settings are saved. Review the resulting `https://wingo-seo.ACCOUNT.workers.dev` URL before attaching the custom hostname. That address is deliberately excluded from search, and analytics remains off. `preview_urls: true` enables review URLs; Worker observability is disabled in this configuration. Review any separately enabled Cloudflare analytics, Zaraz, or injected scripts before launch.

## Local validation

```powershell
npm ci
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm run validate
npm run check:worker
npm run test:performance
Remove-Item Env:PLAYWRIGHT_CHANNEL
```

Alternatively, install Playwright Chromium and leave the channel unset. Browser tests use port 4322. `check:worker` expects `dist/` to have been built; it performs no publication. `build:release` and `test:performance` produce an indexable local candidate under `artifacts/release/`, with analytics/optional owner inputs cleared, and leave default `dist/` untouched. This is QA output, not an owner-configured upload artifact. Reports are ignored by Git. [Performance evidence](performance.md).

## Approved custom-domain release

1. Confirm `learn.kalam.trade` and authorized Cloudflare access. Inspect existing DNS, Worker routes, and custom domains for conflicts; absence from public DNS does not prove availability. Preserve the course website, old simulator, and all unrelated records.
2. Review the hosted Worker, content/contact status, privacy, routing, tools, and network requests. Keep analytics off for the initial release.
3. Obtain explicit approval for attaching this Worker to the confirmed domain and for any DNS/account change. Use the Worker's **Domains & Routes → Add → Custom Domain** workflow for the new subdomain, inspecting the proposed change before confirming it. Wait for domain/certificate activation and verify HTTPS. No custom-domain route is currently committed, so the deploy command itself does not attach that hostname.
4. Only after the domain and release are approved, set production build variables `SITE_ENV=production`, `SITE_ORIGIN=https://learn.kalam.trade`, and `SITE_INDEXABLE=true`. Keep `ANALYTICS_ENABLED=false`. Rebuild/deploy the validated commit. Preview variables must remain excluded.
5. Verify the actual custom host, stable Workers alias, and branch/version hosts. Host-specific `_headers` protect Workers aliases without applying a global production noindex. The analytics runtime also requires the exact configured origin. [Static headers](https://developers.cloudflare.com/workers/static-assets/headers/), [Workers preview URL formats](https://developers.cloudflare.com/workers/previews/custom-domains/).

Owner authorization remains required by the [handoff](../handoff.txt) for production DNS changes, privileged service connections, account changes, and publishing to existing production infrastructure. The owner has requested the Workers hosting approach; this does not authorize modifying other sites or attaching an unconfirmed custom domain.

## Live checks and rollback

After authorized custom-domain deployment, use actual matching hosts:

```powershell
npm run check:release -- --production https://learn.kalam.trade --alias https://wingo-seo.ACCOUNT.workers.dev --preview https://qa-wingo-seo.ACCOUNT.workers.dev
```

The checker accepts matching Workers hosts and legacy Pages hosts. It performs 33 read-only HTTP check groups: HTTPS upgrade, fourteen direct pages, metadata/canonicals/indexing, sitemap/robots, canonical redirects, actual missing-path 404s, PNG and CSS/JS delivery, alias exclusion, and branch-preview exclusion/empty sitemap. It does not execute browser code or change account settings. Results go to `artifacts/release-check/latest.json`. Protected preview redirects fail the public checker intentionally; inspect through authorized access and record that exception.

Use a **branch Preview built with excluded settings** for `--preview`. A Version URL of an indexable production build shares that build's HTML/sitemap: it still needs host noindex, but cannot satisfy the checker's excluded-HTML/empty-sitemap assertions. Verify those production Version URLs separately for host noindex and disabled runtime analytics. [Version URL behavior](https://developers.cloudflare.com/workers/versions-and-deployments/version-urls/).

Browser-smoke tools and refreshes on the live host, inspect requests/headers, and run PageSpeed Insights on representative live pages. Local results cannot prove CDN behavior or real-user Core Web Vitals. Follow the [Search Console](search-console-setup.md) and optional [GA4 activation](analytics-events.md) guides after the release.

Record the deployed commit, Worker version/deployment ID, environment settings, domain state, and verification date. For later failures, pause automatic publication and restore a known-good deployed Worker version through Cloudflare's version/deployment controls with owner authorization. Recheck DNS/build settings separately; rolling back assets does not restore every account setting. For the first release, agree on how to pause the new publication if no prior good version exists. Never remove unrelated records. Phase 7 begins after the public release and measurement access are established.
