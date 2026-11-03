import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { load } from 'cheerio';
import { gzipSync } from 'node:zlib';
import { routes } from './routes.mjs';

const root = resolve('dist');
const htmlPath = route => route === '/404.html' ? join(root, '404.html') : join(root, route, 'index.html');
const allRoutes = [...routes, '/404.html'];
const pages = new Map(allRoutes.map(route => {
  const file = htmlPath(route);
  assert(existsSync(file), `Missing built route: ${route}`);
  return [route, load(readFileSync(file, 'utf8'))];
}));
const titles = new Set();
const descriptions = new Set();
let linksChecked = 0;
const toolRoutes = ['/simulator/', '/probability-calculator/', '/patterns-and-randomness/'];
for (const [route, $] of pages) {
  assert.equal($('html').attr('lang'), 'en', `${route}: missing language`);
  assert.equal($('main').length, 1, `${route}: main landmark`);
  assert.equal($('h1').length, 1, `${route}: exactly one H1 required`);
  const title = $('title').text().trim();
  const description = $('meta[name="description"]').attr('content');
  assert(title && !titles.has(title), `${route}: missing/duplicate title`);
  assert(description && !descriptions.has(description), `${route}: missing/duplicate description`);
  titles.add(title); descriptions.add(description);
  assert($('meta[name="robots"]').attr('content')?.includes('noindex'), `${route}: staged build must remain noindex`);
  $('a[href]').each((_, element) => {
    const href = $(element).attr('href');
    assert(href && href !== '#', `${route}: empty action`);
    const url = new URL(href, `https://local.test${route}`);
    if (url.origin !== 'https://local.test') return;
    const target = pages.get(url.pathname);
    assert(target, `${route}: broken internal route ${href}`);
    if (url.hash) {
      const id = decodeURIComponent(url.hash.slice(1));
      assert(target('[id]').toArray().some(el => target(el).attr('id') === id), `${route}: broken anchor ${href}`);
    }
    linksChecked++;
  });
  $('[src], link[href]').each((_, element) => {
    const href = $(element).attr('src') ?? $(element).attr('href');
    if (!href || /^(https?:|data:)/.test(href) || $(element).attr('rel') === 'canonical') return;
    const url = new URL(href, `https://local.test${route}`);
    assert(existsSync(resolve(root, `.${url.pathname}`)), `${route}: missing asset ${href}`);
  });
  assert.equal($('script[src^="http"], iframe').length, 0, `${route}: unexpected external service`);
  if (toolRoutes.includes(route)) {
    assert($('[data-enhanced][hidden]').length, `${route}: JavaScript-only controls must start hidden`);
    assert($('[data-fallback]').text().includes('JavaScript'), `${route}: missing no-JavaScript explanation`);
    assert($('script[src]').length, `${route}: missing tool bundle`);
  } else {
    assert.equal($('script[src], form').length, 0, `${route}: non-tool route should not ship interactive JavaScript`);
  }
  // Count the route's entry modules, their shared chunks, and its styles.
  const visited = new Set();
  let jsBytes = 0, cssBytes = 0;
  function measure(asset) {
    if (visited.has(asset)) return;
    visited.add(asset);
    const content = readFileSync(resolve(root, `.${asset}`));
    if (asset.endsWith('.css')) cssBytes += gzipSync(content).length;
    if (asset.endsWith('.js')) {
      jsBytes += gzipSync(content).length;
      for (const match of content.toString().matchAll(/(?:from\s*|import\s*|import\s*\()\s*["']([^"']+\.js)["']/g)) {
        const dependency = new URL(match[1], `https://local.test${asset}`).pathname;
        measure(dependency);
      }
    }
  }
  $('script[src], link[rel="stylesheet"][href], link[rel="modulepreload"][href]').each((_, element) => {
    const asset = $(element).attr('src') ?? $(element).attr('href');
    if (asset?.startsWith('/')) measure(asset);
  });
  $('style').each((_, element) => { cssBytes += gzipSync($(element).html() ?? '').length; });
  assert(jsBytes <= (toolRoutes.includes(route) ? 80 : 30) * 1024, `${route}: JavaScript budget exceeded`);
  assert(cssBytes <= 40 * 1024, `${route}: CSS budget exceeded`);
  console.log(`${route}: JS ${jsBytes} bytes gzip, CSS ${cssBytes} bytes gzip`);
}
const builtHtml = readdirSync(root, { recursive: true }).filter(file => String(file).endsWith('.html'));
assert.equal(builtHtml.length, 15, 'Expected fourteen pages plus root 404');
assert(pages.get('/wingo-rules/')('#color-classifications').length, 'Rules color anchor missing');
console.log(`PASS: ${routes.length} public routes + 404; ${linksChecked} internal links/anchors; unique metadata; local assets; preview safeguards.`);
