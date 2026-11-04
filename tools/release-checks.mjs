import assert from 'node:assert/strict';
import { load } from 'cheerio';
import { XMLParser } from 'fast-xml-parser';
import { routes } from './routes.mjs';

export function releaseTargets(args) {
  assert.equal(args.length, 6, 'Usage: npm run check:release -- --production https://learn.kalam.trade --alias https://PROJECT.pages.dev --preview https://BRANCH.PROJECT.pages.dev');
  const values = {};
  for (let i = 0; i < args.length; i += 2) {
    assert(['--production', '--alias', '--preview'].includes(args[i]) && !values[args[i]], 'Supply each release target exactly once.');
    const url = new URL(args[i + 1]);
    assert(url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.hash && url.pathname === '/' && !url.port, 'Release targets must be plain HTTPS origins.');
    values[args[i]] = url.origin;
  }
  assert.equal(values['--production'], 'https://learn.kalam.trade', 'Production target must match the configured project origin.');
  const alias = new URL(values['--alias']), preview = new URL(values['--preview']);
  assert(/^[a-z0-9][a-z0-9-]*\.pages\.dev$/.test(alias.hostname), 'Alias must be the actual Cloudflare Pages project host.');
  assert(preview.hostname.endsWith('.' + alias.hostname) && /^[a-z0-9][a-z0-9-]*$/.test(preview.hostname.slice(0, -(alias.hostname.length + 1))), 'Preview must belong to the same Pages project.');
  return { production: values['--production'], alias: alias.origin, preview: preview.origin };
}

export async function checkRelease(targets, request = fetch) {
  const checks = [];
  const get = (origin, path) => request(origin + path, { redirect: 'manual', signal: AbortSignal.timeout(15_000) });
  const check = async (name, operation) => {
    try { await operation(); checks.push({ name, passed: true }); }
    catch (error) { checks.push({ name, passed: false, error: error.message }); }
  };
  const excluded = response => /(?:^|[,;\s])(?:noindex|none)(?:$|[,;\s])/i.test(response.headers.get('x-robots-tag') ?? '');
  const pageHTML = new Map();
  await check('HTTP upgrades to HTTPS', async () => {
    const response = await get(targets.production.replace('https:', 'http:'), '/');
    assert([301, 308].includes(response.status), 'HTTP must permanently upgrade to HTTPS.');
    assert.equal(new URL(response.headers.get('location') ?? '', targets.production).href, targets.production + '/');
  });
  for (const route of routes) await check(`Production ${route}`, async () => {
    const response = await get(targets.production, route);
    assert.equal(response.status, 200, 'Expected a direct 200 response.');
    assert.match(response.headers.get('content-type') ?? '', /text\/html/i);
    assert(!excluded(response), 'Production HTTP headers exclude indexing.');
    const html = await response.text(), $ = load(html); pageHTML.set(route, html);
    assert.equal($('h1').length, 1, 'Expected exactly one primary heading.');
    assert($('title').text() && $('meta[name="description"]').attr('content'), 'Missing page metadata.');
    assert.equal($('link[rel="canonical"]').attr('href'), targets.production + route, 'Canonical mismatch.');
    assert(!/noindex|none/i.test($('meta[name="robots"]').attr('content') ?? ''), 'Production HTML excludes indexing.');
    assert.equal($('script[src^="http"], iframe').length, 0, 'Unexpected embedded service.');
    for (const script of $('script[type="application/ld+json"]').toArray()) JSON.parse($(script).text());
  });
  await check('Distinct production titles and descriptions', () => {
    assert.equal(pageHTML.size, routes.length, 'Some production pages were unavailable.');
    for (const selector of ['title', 'meta[name="description"]']) {
      const values = [...pageHTML.values()].map(html => { const $ = load(html); return selector === 'title' ? $(selector).text() : $(selector).attr('content'); });
      assert.equal(new Set(values).size, routes.length, 'Repeated metadata can indicate a fallback page.');
    }
  });
  await check('Query-independent canonical', async () => {
    const response = await get(targets.production, '/number-probability/?release-check=1');
    assert.equal(response.status, 200); const $ = load(await response.text());
    assert.equal($('link[rel="canonical"]').attr('href'), targets.production + '/number-probability/');
  });
  await check('Production sitemap', async () => {
    const response = await get(targets.production, '/sitemap.xml'); assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type') ?? '', /xml/i);
    const parsed = new XMLParser({ ignoreAttributes: false }).parse(await response.text());
    assert.equal(parsed.urlset['@_xmlns'], 'http://www.sitemaps.org/schemas/sitemap/0.9');
    const urls = (Array.isArray(parsed.urlset.url) ? parsed.urlset.url : [parsed.urlset.url]).map(row => row.loc);
    assert.deepEqual(urls.sort(), routes.map(route => targets.production + route).sort());
  });
  await check('Production robots', async () => {
    const response = await get(targets.production, '/robots.txt'); assert.equal(response.status, 200);
    const body = await response.text(); assert.match(body, /^User-agent:\s*\*\s*$/im); assert.match(body, /^Allow:\s*\/\s*$/im);
    assert(!/^Disallow:\s*\/\s*$/im.test(body), 'Robots blocks the entire website.');
    assert(body.includes(`Sitemap: ${targets.production}/sitemap.xml`));
  });
  for (const path of ['/release-check-nonexistent/', '/nested/release-check-nonexistent/']) await check(`Real 404 ${path}`, async () => {
    const response = await get(targets.production, path); assert.equal(response.status, 404, 'Missing paths must not return an SPA fallback.');
    const $ = load(await response.text()); assert.match($('meta[name="robots"]').attr('content') ?? '', /noindex/i); assert.equal($('link[rel="canonical"]').length, 0);
  });
  for (const path of ['/index.html', '/wingo-rules', '/wingo-rules/index.html']) await check(`Canonical redirect ${path}`, async () => {
    const response = await get(targets.production, path); assert([301, 308].includes(response.status), 'Expected a permanent canonical redirect.');
    assert.equal(new URL(response.headers.get('location') ?? '', targets.production + path).href, targets.production + (path === '/index.html' ? '/' : '/wingo-rules/'));
  });
  await check('Share image', async () => {
    const $ = load(pageHTML.get('/') ?? ''); const image = new URL($('meta[property="og:image"]').attr('content') ?? '');
    assert.equal(image.origin, targets.production); const response = await get(targets.production, image.pathname); assert.equal(response.status, 200); assert.match(response.headers.get('content-type') ?? '', /image\/png/i);
    const bytes = new Uint8Array(await response.arrayBuffer()); assert.deepEqual([...bytes.slice(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
    const view = new DataView(bytes.buffer); assert.equal(view.getUint32(16), 1200); assert.equal(view.getUint32(20), 630);
  });
  await check('Immutable local assets respond', async () => {
    const paths = new Set();
    for (const html of pageHTML.values()) {
      const $ = load(html); $('script[src], link[rel="stylesheet"]').each((_, node) => { const path = $(node).attr('src') ?? $(node).attr('href'); if (path?.startsWith('/_astro/')) paths.add(path); });
    }
    assert(paths.size, 'No local page assets found.');
    for (const path of paths) {
      const response = await get(targets.production, path); assert.equal(response.status, 200, `Missing asset ${path}`);
      assert.match(response.headers.get('content-type') ?? '', path.endsWith('.css') ? /text\/css/i : /javascript/i);
    }
  });
  for (const path of ['/', '/simulator/', '/wingo-rules/']) await check(`Stable alias excluded ${path}`, async () => {
    const response = await get(targets.alias, path);
    if ([301, 308].includes(response.status)) assert.equal(new URL(response.headers.get('location') ?? '', targets.alias + path).href, targets.production + path, 'Alias redirected to an unexpected host or path.');
    else { assert.equal(response.status, 200); assert(excluded(response), 'Stable pages.dev alias needs HTTP noindex or a canonical permanent redirect.'); }
  });
  for (const path of ['/', '/simulator/', '/wingo-rules/']) await check(`Branch preview excluded ${path}`, async () => {
    const response = await get(targets.preview, path); assert.equal(response.status, 200); assert(excluded(response), 'Preview HTTP noindex missing.');
    const $ = load(await response.text()); assert.match($('meta[name="robots"]').attr('content') ?? '', /noindex/i); assert.equal($('[data-consent]').length, 0, 'Preview contains consent integration.');
  });
  await check('Preview robots and sitemap stay unadvertised and empty', async () => {
    const robots = await get(targets.preview, '/robots.txt'); assert.equal(robots.status, 200); assert(!/^Sitemap:/im.test(await robots.text()));
    const sitemap = await get(targets.preview, '/sitemap.xml'); assert.equal(sitemap.status, 200);
    const parsed = new XMLParser().parse(await sitemap.text()); assert(parsed.urlset !== undefined, 'Missing XML URL set.'); assert(!parsed.urlset.url, 'Preview sitemap lists public URLs.');
  });
  return { checkedAt: new Date().toISOString(), targets, passed: checks.every(row => row.passed), checks };
}
