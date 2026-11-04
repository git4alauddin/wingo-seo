import { test, expect, type BrowserContext, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { CONSENT_KEY, savedChoice } from '../../src/lib/analytics';

const origin = 'https://dmplay.kalam.trade';
const fixtureRoot = resolve('artifacts/seo/analytics-enabled');
type Call = [string, string | Record<string, unknown>, Record<string, unknown>?];
declare global { interface Window { __gtagCalls?: Call[] } }

// Every request is intercepted. The fixture never connects to Google or production.
async function fixture(context: BrowserContext, options: { failTag?: boolean } = {}) {
  const traffic = { tags: 0, unexpected: [] as string[] };
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin === 'https://www.googletagmanager.com' && url.pathname === '/gtag/js' && url.search === '?id=G-TEST123456') {
      traffic.tags++;
      if (options.failTag) return route.abort();
      return route.fulfill({ contentType: 'application/javascript', body: `
        window.__gtagCalls = (window.dataLayer || []).map(entry => Array.from(entry));
        window.dataLayer.push = function(entry) { window.__gtagCalls.push(Array.from(entry)); return 0; };
      ` });
    }
    if (url.origin !== origin && url.origin !== 'https://preview.example') {
      traffic.unexpected.push(url.origin + url.pathname); return route.abort();
    }
    const pathname = decodeURIComponent(url.pathname);
    const filename = resolve(fixtureRoot, '.' + (pathname.endsWith('/') ? pathname + 'index.html' : pathname));
    if (!filename.startsWith(fixtureRoot + sep)) return route.abort();
    try {
      const body = await readFile(filename);
      const contentType = ({ '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml' } as Record<string, string>)[extname(filename)] ?? 'application/octet-stream';
      return route.fulfill({ body, contentType });
    } catch { return route.fulfill({ status: 404, contentType: 'text/html', body: await readFile(resolve(fixtureRoot, '404.html')) }); }
  });
  return traffic;
}
async function events(page: Page, name?: string) {
  return page.evaluate(name => (window.__gtagCalls ?? []).filter(call => call[0] === 'event' && (!name || call[1] === name)), name);
}
async function allow(page: Page) {
  await page.locator('[data-consent-allow]').click();
  await expect.poll(async () => (await events(page, 'page_view')).length).toBe(1);
}
async function grantOnLoad(page: Page) {
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: CONSENT_KEY, value: savedChoice('granted', Date.now()) });
}

test('undecided and rejected visitors use the tools without a tag or outcome storage', async ({ page, context }) => {
  const traffic = await fixture(context); await page.goto(origin + '/simulator/?email=private#results');
  await expect(page.locator('[data-consent]')).toBeVisible();
  await page.locator('[data-consent-close]').click();
  await page.getByRole('button', { name: 'Start experiment', exact: true }).click();
  await expect(page.locator('[data-status]')).toContainText('Complete.');
  expect(await page.evaluate(() => localStorage.length)).toBe(0); expect(traffic.tags).toBe(0);
  await page.locator('[data-analytics-settings]').click(); await page.locator('[data-consent-reject]').click();
  const record = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), CONSENT_KEY);
  expect(Object.keys(record).sort()).toEqual(['choice', 'expiresAt', 'version']); expect(record.choice).toBe('denied');
  await page.reload(); await expect(page.locator('[data-consent]')).toBeHidden();
  expect(traffic.tags).toBe(0); expect(await context.cookies()).toEqual([]); expect(traffic.unexpected).toEqual([]);
});

test('grant sends one clean page view and a guide view, with advertising disabled', async ({ page, context }, info) => {
  const traffic = await fixture(context);
  await page.goto(origin + '/wingo-rules/?email=private#secret', { referer: 'https://www.google.com/search?q=private' });
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(axe.violations).toEqual([]);
  await page.screenshot({ path: `artifacts/screenshots/phase-5/${info.project.name}-consent.png`, fullPage: true, scale: 'css' });
  await allow(page);
  const calls = await page.evaluate(() => window.__gtagCalls!);
  expect(calls.find(call => call[0] === 'config')?.[2]).toMatchObject({ send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false, cookie_domain: 'none', cookie_update: false, cookie_expires: 2592000 });
  expect(calls.find(call => call[0] === 'consent' && call[1] === 'update')?.[2]).toEqual({ analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  expect(await events(page, 'guide_open')).toHaveLength(1);
  const view = (await events(page, 'page_view'))[0][2]!;
  expect(view).toMatchObject({ page_location: origin + '/wingo-rules/', page_path: '/wingo-rules/', page_title: 'WinGo rules', page_referrer: 'https://www.google.com/' });
  expect(JSON.stringify(calls)).not.toContain('private');
  await page.locator('[data-analytics-settings]').click(); await page.locator('[data-consent-allow]').click();
  expect(await events(page, 'page_view')).toHaveLength(1); expect(traffic.tags).toBe(1); expect(traffic.unexpected).toEqual([]);
});

test('simulator counts completed experiments once and ignores replay, reset, and cancelled completion', async ({ page, context }) => {
  await fixture(context); await page.goto(origin + '/simulator/');
  await page.locator('[data-consent-close]').click();
  await page.getByRole('button', { name: 'Start experiment', exact: true }).click(); await expect(page.locator('[data-status]')).toContainText('Complete.');
  await page.locator('[data-analytics-settings]').click(); await allow(page);
  expect(await events(page, 'simulator_start')).toHaveLength(0);
  await page.locator('#sim-count').fill('200');
  await page.getByRole('button', { name: 'Start experiment', exact: true }).click(); await expect.poll(async () => (await events(page, 'simulator_complete')).length).toBe(1);
  expect((await events(page, 'simulator_start'))[0][2]).toMatchObject({ tool: 'simulator', run_mode: 'batch', sample_size_bucket: '21-200' });
  await page.getByRole('button', { name: 'Replay recorded run' }).click(); await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await page.locator('#sim-mode').selectOption('timed');
  await page.getByRole('button', { name: 'Start experiment', exact: true }).click(); await page.getByRole('button', { name: 'Cancel run', exact: true }).click();
  expect(await events(page, 'simulator_start')).toHaveLength(2); expect(await events(page, 'simulator_complete')).toHaveLength(1);
});

test('calculator and randomness send categories without entered sequences or sampled results', async ({ page, context }) => {
  const traffic = await fixture(context); await page.goto(origin + '/probability-calculator/'); await allow(page);
  await page.getByRole('button', { name: 'Calculate event', exact: true }).click();
  await page.locator('#calc-sequence').fill('7,,7'); await page.getByRole('button', { name: 'Calculate sequence', exact: true }).click();
  expect(await events(page, 'calculator_use')).toHaveLength(1);
  await page.locator('#calc-sequence').fill('7, 7'); await page.getByRole('button', { name: 'Calculate sequence', exact: true }).click();
  await page.getByRole('button', { name: 'Run comparison', exact: true }).click(); await expect.poll(async () => (await events(page, 'calculator_use')).length).toBe(3);
  expect((await events(page, 'calculator_use')).map(call => call[2]?.calculator_action)).toEqual(['event', 'sequence', 'trials']);
  for (const call of await events(page, 'calculator_use')) expect(Object.keys(call[2]!).sort()).toEqual(['calculator_action', 'page_location', 'page_referrer', 'page_title', 'send_to']);
  await page.goto(origin + '/patterns-and-randomness/'); await expect.poll(async () => (await events(page, 'page_view')).length).toBe(1);
  await page.getByRole('button', { name: 'Generate two samples', exact: true }).click(); await expect.poll(async () => (await events(page, 'simulator_complete')).length).toBe(1);
  expect((await events(page, 'simulator_complete'))[0][2]).toMatchObject({ tool: 'randomness', run_mode: 'comparison', sample_size_bucket: '2001-10000' });
  expect(traffic.unexpected).toEqual([]);
});

test('run signals are deduplicated and cannot complete a preconsent or mismatched run', async ({ page, context }) => {
  await fixture(context); await page.goto(origin + '/simulator/'); await allow(page);
  await page.evaluate(() => {
    const parameters = { tool: 'simulator', run_mode: 'batch', sample_size_bucket: '1-20' }, token = {};
    const emit = (name: string, p = parameters, t = token) => document.dispatchEvent(new CustomEvent('learning-lab:measurement', { detail: { name, parameters: p, token: t } }));
    emit('simulator_complete'); emit('simulator_start'); emit('simulator_start');
    emit('simulator_complete', { ...parameters, sample_size_bucket: '21-200' });
    emit('simulator_complete'); emit('simulator_complete');
    document.dispatchEvent(new CustomEvent('learning-lab:measurement', { detail: { name: 'calculator_use', parameters: { calculator_action: 'sequence', raw: 'private' } } }));
  });
  expect(await events(page, 'simulator_start')).toHaveLength(1); expect(await events(page, 'simulator_complete')).toHaveLength(1);
  expect(await events(page, 'calculator_use')).toHaveLength(0);
});

test('withdrawal removes owned cookies and reloads without another tag', async ({ page, context }) => {
  const traffic = await fixture(context); await page.goto(origin + '/simulator/'); await allow(page);
  await page.evaluate(() => { document.cookie = 'wingolab_ga=test; Path=/; Secure'; document.cookie = 'unrelated=keep; Path=/; Secure'; });
  await page.locator('[data-analytics-settings]').click();
  await Promise.all([page.waitForEvent('load'), page.locator('[data-consent-reject]').click()]);
  await expect(page.locator('[data-consent]')).toBeHidden();
  expect(traffic.tags).toBe(1); expect(await events(page)).toHaveLength(0);
  expect((await context.cookies()).map(cookie => cookie.name)).toEqual(['unrelated']);
});

for (const signal of ['globalPrivacyControl', 'doNotTrack'] as const) test(`${signal} overrides a stored grant`, async ({ page, context }) => {
  const traffic = await fixture(context); await grantOnLoad(page);
  await page.addInitScript(signal => Object.defineProperty(navigator, signal, { value: signal === 'globalPrivacyControl' ? true : '1' }), signal);
  await page.goto(origin + '/'); await page.locator('[data-analytics-settings]').click();
  await expect(page.locator('[data-consent-allow]')).toBeDisabled(); await expect(page.locator('[data-consent-status]')).toContainText('privacy signal');
  expect(traffic.tags).toBe(0);
});

test('expired consent stays off and a grant in another tab starts only after its storage event', async ({ page, context }) => {
  const traffic = await fixture(context);
  await page.addInitScript(({ key, value }) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem(key, value); sessionStorage.setItem('seeded', 'yes'); } }, { key: CONSENT_KEY, value: savedChoice('granted', 1) });
  await page.goto(origin + '/'); await expect(page.locator('[data-consent]')).toBeVisible(); expect(traffic.tags).toBe(0);
  const other = await context.newPage(); await other.goto(origin + '/');
  await other.locator('[data-consent-allow]').click();
  await expect.poll(async () => (await events(page, 'page_view')).length).toBe(1);
  await other.locator('[data-analytics-settings]').click(); await other.locator('[data-consent-reject]').click();
  await expect.poll(async () => await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).choice, CONSENT_KEY)).toBe('denied');
  await expect.poll(async () => (await events(page)).length).toBe(0);
  expect(traffic.tags).toBe(2); await other.close();
});

test('blocked storage and blocked tag leave educational tools working', async ({ page, context }) => {
  const traffic = await fixture(context, { failTag: true });
  await page.addInitScript(() => { Storage.prototype.getItem = () => { throw new Error('blocked'); }; Storage.prototype.setItem = () => { throw new Error('blocked'); }; });
  await page.goto(origin + '/simulator/'); await page.locator('[data-consent-allow]').click();
  await expect(page.locator('[data-consent-status]')).toContainText('could not load');
  await page.locator('[data-consent-reject]').click();
  await page.getByRole('button', { name: 'Start experiment', exact: true }).click(); await expect(page.locator('[data-status]')).toContainText('Complete.');
  expect(traffic.tags).toBe(1); expect(traffic.unexpected).toEqual([]);
});

test('a production artifact served on another origin cannot start tracking', async ({ page, context }) => {
  const traffic = await fixture(context); await grantOnLoad(page); await page.goto('https://preview.example/');
  await expect(page.locator('[data-consent]')).toBeHidden(); await expect(page.locator('[data-analytics-settings]')).toBeHidden(); expect(traffic.tags).toBe(0);
});

test('optional course and contact clicks send no URL or email', async ({ page, context }) => {
  const traffic = await fixture(context); await page.goto(origin + '/contact/'); await allow(page);
  // The manager listens on document; stop navigation at window after it observes the click.
  await page.evaluate(() => window.addEventListener('click', event => event.preventDefault()));
  await page.locator('[data-track-contact]').click(); await page.locator('[data-track-course]').click();
  expect((await events(page, 'contact_click'))[0][2]).toMatchObject({ channel: 'email' });
  expect((await events(page, 'course_interest_click'))[0][2]).toMatchObject({ destination: 'course_homepage' });
  expect(JSON.stringify(await events(page))).not.toContain('study@example.com'); expect(JSON.stringify(await events(page))).not.toContain('course.kalam.trade'); expect(traffic.unexpected).toEqual([]);
});
