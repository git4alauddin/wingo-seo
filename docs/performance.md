# Performance diagnostics

Measured locally on 3 November 2026 and confirmed on 4 November; the table records the final 4 November run. Lighthouse 13.5.0, Node 24.19.0, Windows, installed Chrome, static production candidate served over loopback, analytics disabled. One cold-navigation audit per route/profile in each run, using Lighthouse's default simulated mobile throttling and its desktop preset. HTTPS page requests are blocked during these local audits. No external production host was audited.

| Route | Mobile LCP | Desktop LCP | Scores: performance / accessibility / best practices / SEO |
| --- | --- | --- | --- |
| Home | 1,201 ms | 283 ms | 100 / 100 / 100 / 100 for both |
| Number probability | 1,202 ms | 282 ms | 100 / 100 / 100 / 100 for both |
| Simulator | 1,352 ms | 324 ms | 100 / 100 / 100 / 100 for both |
| Calculator | 1,354 ms | 323 ms | 100 / 100 / 100 / 100 for both |
| Randomness | 1,353 ms | 323 ms | 100 / 100 / 100 / 100 for both |

All ten reports recorded CLS 0 and TBT 0 ms. All local project gates passed: performance >=90, accessibility >=95, best practices/SEO >=90, LCP <=2,500 ms, CLS <=0.1, and TBT <=200 ms. Scores are diagnostics, not accessibility certification, Google indexing confirmation, or field Core Web Vitals. The tools' interaction correctness and maximum samples are covered separately by browser tests; navigation audits do not exercise every user interaction.

`npm run test:performance` rebuilds the candidate and produces ignored HTML/JSON reports under `artifacts/lighthouse/`. `summary.json` records timestamps, versions, browser user agents, metrics, warnings, and pass/fail outcomes. Runs can vary with the machine; retain the actual report for each release and investigate failures. The current site uses system fonts, local illustrations, little page JavaScript, reserved layout sizes, and bounded tools, so these audits did not identify a material performance regression to fix. Lighthouse is pinned to 13.5.0 to avoid the advisory-bearing dependency chain in the newer release inspected during this phase; npm audit reported zero vulnerabilities after installation.

Default ordinary pages remain script-free. Compressed tool JavaScript is 6,219 bytes (simulator), 5,399 (calculator), and 5,232 (randomness); ordinary CSS is 7,425 bytes and tool CSS 8,716 bytes. The social PNG has explicit 1200×630 dimensions. Build checks enforce first-party asset budgets. The optional Google SDK download and its live behavior are outside these disabled-analytics measurements.

After deployment, audit the actual CDN URLs with PageSpeed Insights and inspect caching/headers, mobile layout, and third-party traffic. Measure consented analytics separately after authorized activation. Field assessment needs sufficient real-user data at the 75th percentile: LCP <=2.5 seconds, INP <=200 ms, CLS <=0.1. TBT is a lab responsiveness diagnostic and cannot establish field INP. A new site may have no CrUX data; report that absence honestly. [Chrome explains local Lighthouse setup effects](https://developer.chrome.com/docs/devtools/lighthouse/) and [the distinction between Lighthouse and CrUX in PageSpeed Insights](https://developer.chrome.com/docs/crux/guides/pagespeed-insights).
