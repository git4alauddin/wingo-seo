import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { XMLParser } from 'fast-xml-parser';
import { SyntaxValidator } from 'fast-xml-validator';

export function checkSEO(pages, root, config) {
  const { origin, indexable } = config;
  const publicRoutes = [...pages.keys()].filter(route => route !== '/404.html');
  const imageUrl = `${origin}/images/learning-lab-social.png`;
  const picture = readFileSync(join(root, 'images/learning-lab-social.png'));
  assert.equal(picture.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'Share image must be a real PNG');
  assert.equal(picture.readUInt32BE(16), 1200); assert.equal(picture.readUInt32BE(20), 630);
  let articles = 0, trails = 0;
  const edges = new Map();
  const normalize = value => String(value).replace(/\s+/g, ' ').trim();

  for (const [route, $] of pages) {
    const is404 = route === '/404.html';
    const canonical = `${origin}${route}`;
    assert.equal($('link[rel="canonical"]').length, is404 ? 0 : 1, `${route}: canonical count`);
    if (!is404) assert.equal($('link[rel="canonical"]').attr('href'), canonical, `${route}: canonical must be the clean production URL`);
    const robots = $('meta[name="robots"]').attr('content') ?? '';
    assert.equal(/\bnoindex\b/i.test(robots), !indexable || is404, `${route}: wrong indexing eligibility`);
    assert.equal($('meta[property="og:title"]').attr('content'), $('head > title').text());
    assert.equal($('meta[property="og:description"]').attr('content'), $('meta[name="description"]').attr('content'));
    assert.equal($('meta[property="og:url"]').attr('content'), is404 ? undefined : canonical);
    assert.equal($('meta[property="og:image"]').attr('content'), imageUrl);
    assert.equal($('meta[property="og:image:width"]').attr('content'), '1200');
    assert.equal($('meta[property="og:image:height"]').attr('content'), '630');
    assert($('meta[property="og:image:alt"]').attr('content')?.trim());
    assert.equal($('meta[name="twitter:card"]').attr('content'), 'summary_large_image');
    assert.equal($('meta[name="twitter:image"]').attr('content'), imageUrl);
    $('img').each((_, element) => assert($(element).attr('alt') !== undefined, `${route}: image missing alt attribute`));
    let depth = 0;
    $('main h1, main h2, main h3, main h4, main h5, main h6').each((_, element) => {
      const level = Number(element.tagName.slice(1));
      assert(normalize($(element).text()), `${route}: empty heading`);
      assert(level <= depth + 1, `${route}: skipped heading level at ${$(element).text()}`); depth = level;
    });
    const nodes = [];
    $('script[type="application/ld+json"]').each((_, element) => {
      const schema = JSON.parse($(element).text()); assert.equal(schema['@context'], 'https://schema.org');
      nodes.push(...(schema['@graph'] ?? [schema]));
    });
    if (is404) { assert.equal(nodes.length, 0, '404 should not describe an indexable resource'); continue; }
    const byType = type => nodes.filter(node => node['@type'] === type);
    assert.equal(byType('WebSite').length, 1); assert.equal(byType('Organization').length, 1); assert.equal(byType('WebPage').length, 1);
    const publisher = byType('Organization')[0], website = byType('WebSite')[0], page = byType('WebPage')[0];
    assert.equal(publisher['@id'], `${origin}/#publisher`);
    assert.equal(publisher.url, `${origin}/about/`);
    assert(normalize(pages.get('/about/')('main').text()).includes(publisher.name), 'Publisher must be described visibly');
    assert(normalize($('footer').text()).includes(publisher.alternateName), 'Visible site identity must match its schema');
    assert.equal(website.url, `${origin}/`); assert.equal(website.publisher['@id'], publisher['@id']);
    assert.equal(page.url, canonical); assert.equal(page.name, $('head > title').text());
    assert.equal(page.description, $('meta[name="description"]').attr('content'));
    assert.equal(page.isPartOf['@id'], website['@id']);
    assert.equal(page.primaryImageOfPage.url, imageUrl);
    assert.equal(byType('Review').length + byType('AggregateRating').length, 0, 'No unsupported review/rating markup');
    const article = byType('Article');
    const isArticle = $('meta[property="og:type"]').attr('content') === 'article';
    assert.equal(article.length, isArticle ? 1 : 0, `${route}: Article only on actual guides`);
    if (isArticle) {
      articles++;
      assert.equal(article[0].headline, normalize($('h1').text()));
      assert.equal(article[0].datePublished, $('.publisher-line time').first().attr('datetime'));
      assert.equal(article[0].dateModified, $('.publisher-line time').eq(1).attr('datetime'));
      assert.equal(article[0].author['@id'], publisher['@id']); assert.equal(article[0].publisher['@id'], publisher['@id']);
      assert(normalize($('.publisher-line').text()).includes(publisher.name));
      assert.equal(article[0].mainEntityOfPage['@id'], page['@id']); assert.equal(article[0].image.url, imageUrl);
    }
    const crumbs = byType('BreadcrumbList');
    const visible = $('.breadcrumbs li').toArray();
    assert.equal(crumbs.length, visible.length ? 1 : 0);
    if (visible.length) {
      trails++;
      const list = crumbs[0].itemListElement; assert.equal(list.length, visible.length); assert(list.length >= 2);
      list.forEach((entry, i) => {
        const li = $(visible[i]);
        assert.equal(entry.position, i + 1); assert.equal(entry.name, normalize(li.text()));
        const path = li.find('a').attr('href') ?? route;
        assert.equal(entry.item, new URL(path, origin).href, `${route}: breadcrumb URL must match visible trail`);
      });
    }
    const outgoing = [];
    $('a[href]').each((_, element) => {
      const url = new URL($(element).attr('href'), `https://local.test${route}`);
      if (url.origin === 'https://local.test' && publicRoutes.includes(url.pathname)) outgoing.push(url.pathname);
    });
    edges.set(route, outgoing);
  }
  assert.equal(articles, 7, 'Expected seven substantive guide articles'); assert.equal(trails, publicRoutes.length - 1, 'Breadcrumbs on every non-home public page');
  const visited = new Set(), queue = ['/'];
  while (queue.length) { const route = queue.shift(); if (visited.has(route)) continue; visited.add(route); queue.push(...(edges.get(route) ?? [])); }
  assert.deepEqual([...visited].sort(), publicRoutes.sort(), 'Every public page must be reachable through ordinary links');

  const robots = readFileSync(join(root, 'robots.txt'), 'utf8');
  assert(/^User-agent: \*$/m.test(robots)); assert(/^Allow: \/$/m.test(robots));
  assert(!/^Disallow: \/$/m.test(robots), 'Do not block the crawler from seeing noindex');
  assert(!/^Noindex:/im.test(robots), 'noindex is not a robots.txt directive');
  const sitemapLines = robots.split('\n').filter(line => line.startsWith('Sitemap:'));
  assert.deepEqual(sitemapLines, indexable ? [`Sitemap: ${origin}/sitemap.xml`] : []);
  const xml = readFileSync(join(root, 'sitemap.xml'), 'utf8');
  assert.equal(SyntaxValidator.validate(xml), true, 'Sitemap XML syntax');
  assert(!xml.includes('<!DOCTYPE')); assert(!xml.includes('<lastmod>'), 'No fabricated modification dates');
  const sitemap = new XMLParser({ ignoreAttributes: false, isArray: name => name === 'url' }).parse(xml);
  assert.equal(sitemap.urlset['@_xmlns'], 'http://www.sitemaps.org/schemas/sitemap/0.9');
  const locations = (sitemap.urlset.url ?? []).map(item => item.loc);
  assert.equal(new Set(locations).size, locations.length, 'No duplicate sitemap entries');
  assert.deepEqual(locations.sort(), indexable ? publicRoutes.map(route => `${origin}${route}`).sort() : []);

  const headers = readFileSync(join(root, '_headers'), 'utf8');
  assert.equal(/^\/\*\n\s+X-Robots-Tag: noindex/m.test(headers), !indexable, 'No production-wide noindex header');
  if (indexable) {
    for (const pattern of ['https://:worker.:account.workers.dev/*', 'https://:project.pages.dev/*', 'https://:version.:project.pages.dev/*', '/404.html']) {
      assert(headers.includes(`${pattern}\n  X-Robots-Tag: noindex`), `Missing host/error exclusion: ${pattern}`);
    }
  }
  const rules = readFileSync(join(root, '_redirects'), 'utf8').split('\n').filter(line => line && !line.startsWith('#')).map(line => line.split(/\s+/));
  assert.equal(rules.length, publicRoutes.length * 2 - 1, 'Only known root and directory aliases are redirected');
  const sources = new Set();
  for (const [source, target, status] of rules) {
    assert(!sources.has(source) && source !== target && !source.includes('*'), 'Duplicate/circular/wildcard redirect'); sources.add(source);
    assert(publicRoutes.includes(target), `Redirect target does not exist: ${target}`); assert.equal(status, '301');
    assert(existsSync(join(root, target, 'index.html')));
  }
  console.log(`SEO PASS: ${indexable ? 'indexable production' : 'excluded preview/unreleased'}; ${articles} Articles; ${trails} breadcrumb trails; ${locations.length} sitemap URLs; ${rules.length} alias redirects.`);
}
