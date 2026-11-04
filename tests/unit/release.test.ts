import { describe, expect, it } from 'vitest';
import { releaseTargets, checkRelease } from '../../tools/release-checks.mjs';
import { routes } from '../../tools/routes.mjs';
import { sitemapXml } from '../../config/seo.mjs';

const production = 'https://learn.kalam.trade', alias = 'https://example-project.pages.dev', preview = 'https://qa.example-project.pages.dev';
const targets = { production, alias, preview };
const args = ['--production', production, '--alias', alias, '--preview', preview];

describe('explicit public release targets', () => {
  it('accepts Workers previews only for the same Worker and account', () => {
    const workerArgs = ['--production', production, '--alias', 'https://wingo-seo.owner.workers.dev', '--preview', 'https://qa-wingo-seo.owner.workers.dev'];
    expect(releaseTargets(workerArgs).alias).toBe(workerArgs[3]);
    for (const host of ['https://qa-other.owner.workers.dev', 'https://qa-wingo-seo.other.workers.dev', 'https://wingo-seo.owner.workers.dev']) {
      expect(() => releaseTargets([...workerArgs.slice(0, 5), host])).toThrow();
    }
  });
  it('accepts only the intended production origin and matching Pages hosts', () => { expect(releaseTargets(args)).toEqual(targets); });
  it.each([
    [], ['--production', production], ['--production', production, '--production', production, '--alias', alias],
    ['--production', 'https://other.example', '--alias', alias, '--preview', preview],
    ['--production', production, '--alias', 'http://example-project.pages.dev', '--preview', preview],
    ['--production', production, '--alias', alias + '?token=private', '--preview', preview],
    ['--production', production, '--alias', alias, '--preview', 'https://qa.another-project.pages.dev'],
    ['--production', production, '--alias', 'https://user:password@example-project.pages.dev', '--preview', preview],
  ].map(input => ({ input })))('rejects incomplete or unintended targets $input', ({ input }) => { expect(() => releaseTargets(input)).toThrow(); });
});

function fixture(breakage = '') {
  const request: typeof fetch = async input => {
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
    const path = url.pathname;
    if (breakage === 'network') throw new Error('Test network failure');
    if (url.protocol === 'http:') return new Response('', { status: 301, headers: { location: production + '/' } });
    if (url.origin === alias) return new Response('', { status: 200, headers: breakage === 'alias' ? {} : { 'x-robots-tag': 'noindex, follow' } });
    const isPreview = url.origin === preview;
    if (path === '/sitemap.xml') return new Response(sitemapXml(routes, production, !isPreview), { headers: { 'content-type': 'application/xml' } });
    if (path === '/robots.txt') return new Response(`User-agent: *\nAllow: /\n${isPreview ? '' : 'Sitemap: ' + production + '/sitemap.xml'}\n`);
    if (path === '/image.png') {
      const bytes = Buffer.alloc(24); Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(bytes); bytes.writeUInt32BE(1200, 16); bytes.writeUInt32BE(630, 20);
      return new Response(bytes, { headers: { 'content-type': 'image/png' } });
    }
    if (path.startsWith('/_astro/')) return new Response('', { headers: { 'content-type': path.endsWith('.css') ? 'text/css' : 'application/javascript' } });
    if (['/index.html', '/wingo-rules', '/wingo-rules/index.html'].includes(path)) return new Response('', { status: 301, headers: { location: breakage === 'redirect' ? 'https://unexpected.example/' : path === '/index.html' ? '/' : '/wingo-rules/' } });
    if (!routes.includes(path)) return new Response('<h1>Missing</h1><meta name="robots" content="noindex">', { status: breakage === '404' ? 200 : 404, headers: { 'content-type': 'text/html' } });
    const canonical = breakage === 'canonical' && path === '/simulator/' ? production + '/' : production + path;
    return new Response(`<title>${path}</title><meta name="description" content="Description ${path}"><h1>Page</h1><link rel="canonical" href="${canonical}"><meta property="og:image" content="${production}/image.png"><link rel="stylesheet" href="/_astro/app.css"><script src="/_astro/app.js"></script>${isPreview ? '<meta name="robots" content="noindex">' : ''}`, { headers: { 'content-type': 'text/html', ...((isPreview || breakage === 'noindex') ? { 'x-robots-tag': 'noindex' } : {}) } });
  };
  return request;
}
describe('live-response release checks with synthetic HTTP responses', () => {
  it('accepts the complete production and excluded-host contract', async () => {
    const result = await checkRelease(targets, fixture()); expect(result.passed).toBe(true); expect(result.checks.length).toBe(33);
  });
  it.each(['alias', 'redirect', '404', 'canonical', 'noindex', 'network'])('fails the release when %s is broken', async breakage => {
    const result = await checkRelease(targets, fixture(breakage)); expect(result.passed).toBe(false);
    expect(result.checks.some(row => !row.passed && row.error)).toBe(true);
  });
});
