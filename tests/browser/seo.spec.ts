import { test, expect } from '@playwright/test';
import { load } from 'cheerio';

test('preview responses expose crawlable rules and an empty, unadvertised sitemap', async ({ request }) => {
  const robots = await request.get('/robots.txt'); expect(robots.status()).toBe(200);
  expect(robots.headers()['content-type']).toContain('text/plain');
  const rules = await robots.text(); expect(rules).toContain('User-agent: *'); expect(rules).toContain('Allow: /');
  expect(rules).not.toContain('Sitemap:'); expect(rules).not.toContain('Disallow: /');
  const sitemap = await request.get('/sitemap.xml'); expect(sitemap.status()).toBe(200);
  expect(sitemap.headers()['content-type']).toMatch(/(?:application|text)\/xml/);
  expect(await sitemap.text()).toContain('http://www.sitemaps.org/schemas/sitemap/0.9');
  expect(await sitemap.text()).not.toContain('<loc>');
});

test('query parameters do not change canonical metadata or visible article identity', async ({ page, request }) => {
  await page.goto('/number-probability/?utm_source=seo-check&sample=7');
  const head = page.locator('head');
  await expect(head.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://dmplay.kalam.trade/number-probability/');
  await expect(head.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
  const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
  const nodes = scripts.flatMap(text => { const data = JSON.parse(text); return data['@graph'] ?? [data]; });
  const article = nodes.find(node => node['@type'] === 'Article');
  expect(article.headline).toBe(await page.locator('h1').textContent());
  expect(article.datePublished).toBe(await page.locator('.publisher-line time').first().getAttribute('datetime'));
  const response = await request.get('/wingo-rules/index.html'); expect(response.status()).toBe(200);
  const $ = load(await response.text()); expect($('link[rel="canonical"]').attr('href')).toBe('https://dmplay.kalam.trade/wingo-rules/');
});

test('share image is available locally and missing pages keep their 404/noindex response', async ({ request }) => {
  const image = await request.get('/images/learning-lab-social.png'); expect(image.status()).toBe(200);
  expect(image.headers()['content-type']).toContain('image/png');
  const png = await image.body(); expect(png.readUInt32BE(16)).toBe(1200); expect(png.readUInt32BE(20)).toBe(630);
  const missing = await request.get('/unpublished-page-for-seo-check/'); expect(missing.status()).toBe(404);
  const $ = load(await missing.text()); expect($('meta[name="robots"]').attr('content')).toBe('noindex, follow');
  expect($('link[rel="canonical"]')).toHaveLength(0); expect($('script[type="application/ld+json"]')).toHaveLength(0);
});
