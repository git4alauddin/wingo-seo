import lighthouse from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';
import { launch } from 'chrome-launcher';
import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';

const root = resolve('artifacts/release'), output = resolve('artifacts/lighthouse');
await readFile(resolve(root, 'index.html')); // Run build:release first; never audit stale default preview output.
await mkdir(output, { recursive: true });
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', 'http://127.0.0.1');
    const path = decodeURIComponent(url.pathname);
    const file = resolve(root, '.' + (path.endsWith('/') ? path + 'index.html' : path));
    if (!file.startsWith(root + sep)) { response.writeHead(400).end(); return; }
    const body = await readFile(file);
    const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.xml': 'application/xml', '.txt': 'text/plain' };
    response.writeHead(200, { 'Content-Type': mime[extname(file)] ?? 'application/octet-stream' }); response.end(body);
  } catch { response.writeHead(404, { 'Content-Type': 'text/html' }); response.end(await readFile(resolve(root, '404.html'))); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
if (!address || typeof address === 'string') throw new Error('Could not bind local performance server.');
const base = `http://127.0.0.1:${address.port}`;
const results = [];
let chrome;
try {
  chrome = await launch({
    chromePath: process.env.CHROME_PATH || (process.env.PLAYWRIGHT_CHANNEL === 'chrome' ? undefined : chromium.executablePath()),
    chromeFlags: ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--disable-background-networking'],
  });
  for (const [profile, config] of [['mobile', undefined], ['desktop', desktopConfig]]) {
    for (const [name, path] of [['home', '/'], ['guide', '/number-probability/'], ['simulator', '/simulator/'], ['calculator', '/probability-calculator/'], ['randomness', '/patterns-and-randomness/']]) {
      const result = await lighthouse(base + path, {
        port: chrome.port, logLevel: 'error', output: 'html', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        blockedUrlPatterns: ['https://*'],
      }, config);
      if (!result || result.lhr.runtimeError) throw new Error(result?.lhr.runtimeError?.message ?? 'Lighthouse returned no report.');
      const { lhr } = result;
      await writeFile(resolve(output, `${profile}-${name}.html`), result.report);
      await writeFile(resolve(output, `${profile}-${name}.json`), JSON.stringify(lhr, null, 2));
      const scores = Object.fromEntries(Object.entries(lhr.categories).map(([key, value]) => [key, Math.round((value.score ?? 0) * 100)]));
      const row = {
        profile, path, scores, lcpMs: lhr.audits['largest-contentful-paint'].numericValue,
        cls: lhr.audits['cumulative-layout-shift'].numericValue, tbtMs: lhr.audits['total-blocking-time'].numericValue,
        warnings: lhr.runWarnings, version: lhr.lighthouseVersion, userAgent: lhr.environment.hostUserAgent,
      };
      row.passed = scores.performance >= 90 && scores.accessibility >= 95 && scores['best-practices'] >= 90 && scores.seo >= 90 && row.lcpMs <= 2500 && row.cls <= 0.1 && row.tbtMs <= 200;
      results.push(row); console.log(`${row.passed ? 'PASS' : 'FAIL'} ${profile} ${path}: ${JSON.stringify(scores)}; LCP ${Math.round(row.lcpMs)}ms; CLS ${row.cls.toFixed(3)}; TBT ${Math.round(row.tbtMs)}ms`);
    }
  }
} finally {
  try { await Promise.resolve(chrome?.kill()); }
  finally {
    await new Promise(resolve => server.close(resolve));
    await writeFile(resolve(output, 'summary.json'), JSON.stringify({ measuredAt: new Date().toISOString(), environment: 'Local static production candidate; analytics off; simulated Lighthouse throttling; not CDN or field data.', results }, null, 2));
  }
}
if (results.some(result => !result.passed)) throw new Error('Performance gate failed. Inspect artifacts/lighthouse/ reports.');
console.log('Lighthouse reports saved to artifacts/lighthouse/. TBT is a lab diagnostic, not field INP. No deployment was performed.');
