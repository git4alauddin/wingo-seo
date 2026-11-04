import { describe, expect, it } from 'vitest';
import { XMLParser } from 'fast-xml-parser';
import { SyntaxValidator } from 'fast-xml-validator';
import { resolveSiteConfig } from '../../config/site.mjs';
import { canonicalUrl, serializeSchema, sitemapXml, robotsText, headersText, redirectsText } from '../../config/seo.mjs';
import { breadcrumbSchema, pageSchema } from '../../src/lib/structured-data';

const origin = 'https://dmplay.kalam.trade';
describe('indexing controls', () => {
  it('defaults to an excluded preview even when the bundler uses production mode', () => {
    expect(resolveSiteConfig({})).toMatchObject({ environment: 'preview', indexable: false });
    expect(resolveSiteConfig({ NODE_ENV: 'production' }).indexable).toBe(false);
  });
  it('requires explicit production origin and opt-in', () => {
    expect(() => resolveSiteConfig({ SITE_ENV: 'production' })).toThrow('SITE_ORIGIN');
    expect(resolveSiteConfig({ SITE_ENV: 'production', SITE_ORIGIN: origin }).indexable).toBe(false);
    expect(resolveSiteConfig({ SITE_ENV: 'production', SITE_ORIGIN: origin, SITE_INDEXABLE: 'true' }).indexable).toBe(true);
  });
  it('excludes Workers non-main and unknown branches despite inherited production flags', () => {
    const env = { SITE_ENV: 'production', SITE_ORIGIN: origin, SITE_INDEXABLE: 'true', WORKERS_CI: '1' };
    expect(resolveSiteConfig(env).indexable).toBe(false);
    expect(resolveSiteConfig({ ...env, WORKERS_CI_BRANCH: 'feature/test' }).cloudflarePreview).toBe(true);
    expect(resolveSiteConfig({ ...env, WORKERS_CI_BRANCH: 'main' }).indexable).toBe(true);
  });
  it.each(['development', 'preview'])('cannot enable indexing for %s', environment => {
    expect(resolveSiteConfig({ SITE_ENV: environment, SITE_INDEXABLE: 'true' }).indexable).toBe(false);
  });
  it('overrides an inherited production flag on Cloudflare branch previews', () => {
    const env = { SITE_ENV: 'production', SITE_ORIGIN: origin, SITE_INDEXABLE: 'true', CF_PAGES: '1', CF_PAGES_BRANCH: 'feature/seo' };
    expect(resolveSiteConfig(env).indexable).toBe(false);
    expect(resolveSiteConfig({ ...env, CF_PAGES_BRANCH: 'main' }).indexable).toBe(true);
  });
  it.each(['https://learn.kalam.trade', 'http://dmplay.kalam.trade', 'https://example.com', origin + '/other', origin + '?q=x', 'https://user:password@dmplay.kalam.trade'])('rejects unintended origin %s', value => {
    expect(() => resolveSiteConfig({ SITE_ORIGIN: value })).toThrow();
  });
  it('rejects typoed settings rather than silently enabling a release', () => {
    expect(() => resolveSiteConfig({ SITE_ENV: 'prod' })).toThrow();
    expect(() => resolveSiteConfig({ SITE_INDEXABLE: 'yes' })).toThrow();
  });
});

describe('canonical pages, sitemap and host rules', () => {
  it('strips query/fragment and normalizes known directory aliases', () => {
    expect(canonicalUrl('/wingo-rules?utm_source=x#colors', origin)).toBe(origin + '/wingo-rules/');
    expect(canonicalUrl('/wingo-rules/index.html', origin)).toBe(origin + '/wingo-rules/');
    expect(canonicalUrl('/', origin)).toBe(origin + '/');
    expect(() => canonicalUrl('https://example.com/', origin)).toThrow();
    expect(() => canonicalUrl('/404.html', origin)).toThrow();
  });
  it('emits unique canonical URLs without invented last-modification dates', () => {
    const xml = sitemapXml(['/', '/wingo-rules/', '/wingo-rules'], origin, true);
    expect(SyntaxValidator.validate(xml)).toBe(true);
    const parsed = new XMLParser({ ignoreAttributes: false }).parse(xml);
    expect(parsed.urlset['@_xmlns']).toBe('http://www.sitemaps.org/schemas/sitemap/0.9');
    expect(parsed.urlset.url.map((url: {loc: string}) => url.loc)).toEqual([origin + '/', origin + '/wingo-rules/']);
    expect(xml).not.toContain('lastmod');
  });
  it('keeps preview sitemaps empty while allowing crawlers to see noindex', () => {
    const xml = sitemapXml(['/', '/wingo-rules/'], origin, false);
    expect(SyntaxValidator.validate(xml)).toBe(true); expect(xml).not.toContain('<loc>');
    expect(robotsText({ origin, indexable: false })).toContain('Allow: /');
    expect(robotsText({ origin, indexable: false })).not.toContain('Sitemap:');
    expect(robotsText({ origin, indexable: true })).toContain(`Sitemap: ${origin}/sitemap.xml`);
  });
  it('protects preview hosts and 404 without globally excluding production', () => {
    expect(headersText({ indexable: false })).toMatch(/^\/\*\n  X-Robots-Tag: noindex/m);
    const production = headersText({ indexable: true });
    expect(production).not.toMatch(/^\/\*$/m);
    expect(production).toContain('https://:project.pages.dev/*');
    expect(production).toContain('https://:version.:project.pages.dev/*');
    expect(production).toContain('https://:worker.:account.workers.dev/*');
    expect(production).toContain('/404.html\n  X-Robots-Tag: noindex');
  });
  it('redirects known aliases only, without wildcard or circular rules', () => {
    expect(redirectsText(['/', '/wingo-rules/'])).toContain('/wingo-rules /wingo-rules/ 301');
    expect(redirectsText(['/', '/wingo-rules/'])).toContain('/wingo-rules/index.html /wingo-rules/ 301');
    expect(redirectsText(['/'])).not.toContain('/*');
    expect(() => redirectsText(['/unknown.html'])).toThrow();
  });
});

describe('truthful structured data', () => {
  it('escapes closing script tags and separators without changing data', () => {
    const input = { headline: '</script><script>alert(1)</script>&\u2028\u2029' };
    const output = serializeSchema(input);
    expect(output).not.toContain('<'); expect(output).not.toContain('&');
    expect(JSON.parse(output)).toEqual(input);
  });
  it('uses the real project publisher and includes Article only when supplied', () => {
    const ordinary = pageSchema('/about/', 'About', 'Project background');
    expect(ordinary['@graph'].map(node => node['@type'])).not.toContain('Article');
    const article = pageSchema('/number-probability/', 'Probability guide', 'Our model', { headline: 'Visible heading', published: new Date('2026-11-03T00:00:00Z') });
    const publisher = article['@graph'].find(node => node['@type'] === 'Organization');
    expect(publisher).toMatchObject({ name: 'WinGo Learning Lab project', url: origin + '/about/' });
    const entry = article['@graph'].find(node => node['@type'] === 'Article');
    expect(entry).toMatchObject({ headline: 'Visible heading', datePublished: '2026-11-03T00:00:00.000Z' });
    expect(entry).not.toHaveProperty('dateModified'); expect(JSON.stringify(article)).not.toContain('aggregateRating');
  });
  it('keeps breadcrumb order and visible labels', () => {
    const data = breadcrumbSchema([{ label: 'Guides', href: '/guides/' }, { label: 'Number probability' }], '/number-probability/');
    expect(data.itemListElement.map(item => [item.position, item.name, item.item])).toEqual([
      [1, 'Home', origin + '/'], [2, 'Guides', origin + '/guides/'], [3, 'Number probability', origin + '/number-probability/'],
    ]);
  });
});
