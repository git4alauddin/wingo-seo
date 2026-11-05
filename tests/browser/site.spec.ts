import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir } from 'node:fs/promises';
import { routes } from '../../tools/routes.mjs';

test('all pages load directly, refresh, and fit the viewport', async ({ page }) => {
  const errors: string[] = [];
  const external: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.hostname !== '127.0.0.1') { external.push(url.origin); return route.abort(); }
    return route.continue();
  });
  for (const route of routes) {
    await test.step(route, async () => {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('h1')).toHaveCount(1);
      const dimensions = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: window.innerWidth }));
      expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
      expect((await page.reload())?.status()).toBe(200);
    });
  }
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

test('navigation, keyboard skip link, and educational tools are available', async ({ page, isMobile }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  if (isMobile) {
    await page.locator('.mobile-menu summary').focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
    await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Learn', exact: true }).click();
  } else {
    await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Learn', exact: true }).click();
  }
  await expect(page).toHaveURL(/\/guides\/$/);
  await expect(page.locator('.article-card')).toHaveCount(7);
  await page.getByRole('link', { name: 'Begin with the basics' }).click();
  await expect(page.locator('h1')).toContainText('What Is WinGo?');
  await page.goto('/simulator/');
  await expect(page.getByRole('button', { name: 'Start experiment', exact: true })).toBeVisible();
  await expect(page.locator('[data-simulator] .model-notice')).toContainText('not live results');
  await page.goto('/probability-calculator/');
  await expect(page.getByRole('button', { name: 'Calculate event', exact: true })).toBeVisible();
});

test('core layouts have no detected WCAG A/AA violations and save review images', async ({ page }, testInfo) => {
  await mkdir('artifacts/screenshots/phase-3', { recursive: true });
  for (const [name, route] of [['home', '/'], ['guide', '/number-probability/'], ['dmplay-guide', '/dmplay-wingo-guide/'], ['simulator', '/simulator/'], ['calculator', '/probability-calculator/'], ['randomness', '/patterns-and-randomness/']] as const) {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
    await page.screenshot({ path: `artifacts/screenshots/phase-3/${testInfo.project.name}-${name}.png`, fullPage: true, scale: 'css' });
  }
});

test('content and mobile navigation remain useful without JavaScript', async ({ browser, baseURL, isMobile }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: isMobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 } });
  const page = await context.newPage();
  await page.goto(`${baseURL}/wingo-rules/`);
  await expect(page.getByRole('heading', { name: 'Color classifications', exact: true })).toBeVisible();
  await expect(page.locator('tbody tr')).toHaveCount(10);
  if (isMobile) {
    await page.locator('.mobile-menu summary').click();
    await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Calculator', exact: true }).click();
    await expect(page).toHaveURL(/\/probability-calculator\/$/);
  }
  await page.goto(`${baseURL}/simulator/`);
  await expect(page.locator('[data-fallback]')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start experiment' })).toBeHidden();
  await page.goto(`${baseURL}/probability-calculator/`);
  await expect(page.locator('[data-fallback]')).toContainText('P(7) = 1/10 = 10%');
  await expect(page.getByRole('button', { name: 'Calculate event' })).toBeHidden();
  await context.close();
});

test('homepage referral is disclosed, user-initiated, and isolated from local tools', async ({ page }) => {
  const external: string[] = [];
  await page.route('**/*', route => {
    if (new URL(route.request().url()).hostname !== '127.0.0.1') { external.push(route.request().url()); return route.abort(); }
    return route.continue();
  });
  await page.goto('/');
  const card = page.getByRole('region', { name: 'Observe the concepts in practice.' });
  await expect(card).toContainText('Referral link');
  await expect(card).toContainText('Demo-only access has not been verified.');
  const link = card.getByRole('link', { name: 'Explore external game' });
  await expect(link).toHaveAttribute('href', 'https://www.dmplay20.com/#/register?invitationCode=96875106250');
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('rel', 'sponsored nofollow noopener noreferrer');
  await expect(link).toHaveAttribute('referrerpolicy', 'no-referrer');
  await link.scrollIntoViewIfNeeded(); await link.focus();
  await expect(link).toBeFocused();
  expect(external).toEqual([]);
  await page.getByRole('link', { name: 'Explore the Simulator', exact: true }).first().click();
  await expect(page).toHaveURL(/\/simulator\/$/);
  await expect(page.getByRole('button', { name: 'Start experiment', exact: true })).toBeVisible();
});

test('the homepage referral hook is visible without scrolling on desktop and short phones', async ({ page }, testInfo) => {
  await mkdir('artifacts/screenshots/homepage-hook', { recursive: true });
  for (const [width,height] of [[1440,900],[393,852],[360,640],[320,568]]) {
    await page.setViewportSize({width,height}); await page.goto('/');
    const link = page.getByRole('link', { name: 'Explore external game' });
    const visible = await link.evaluate(element => {
      const r=element.getBoundingClientRect();
      return r.top>=0 && r.bottom<=innerHeight && r.left>=0 && r.right<=innerWidth;
    });
    expect(visible, `${width}x${height} primary referral action is above the fold`).toBe(true);
    await page.screenshot({path:`artifacts/screenshots/homepage-hook/${testInfo.project.name}-${width}.png`});
    await page.locator('.external-game').screenshot({path:`artifacts/screenshots/homepage-hook/${testInfo.project.name}-card-${width}.png`});
  }
});

test('DmPlay guide is discoverable with accurate metadata and recorded reference images', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('WinGo Rules, Colors & Probability Guides | Kalam');
  await page.getByRole('link', { name: 'Read the DmPlay WinGo guide' }).click();
  await expect(page).toHaveURL(/\/dmplay-wingo-guide\/$/);
  await expect(page.getByRole('heading', { level:1 })).toHaveText('DmPlay WinGo Guide: Numbers, Colors and the History Chart');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href','https://dmplay.kalam.trade/dmplay-wingo-guide/');
  const images = page.locator('.reference-figure img');
  await expect(images).toHaveCount(2);
  for (const image of await images.all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate(node => (node as HTMLImageElement).complete && (node as HTMLImageElement).naturalWidth > 0)).toBe(true);
  }
  await expect(page.locator('article.prose')).toContainText('independent guide');
  await expect(page.locator('article.prose')).toContainText('not a live feed');
  await expect(page.locator('.publisher-line time').first()).toHaveAttribute('datetime','2026-11-06T00:00:00.000Z');
  for (const route of ['/wingo-rules/','/big-small-explained/','/historical-analysis/']) {
    await page.goto(route);
    await expect(page.locator('article a[href^="/dmplay-wingo-guide/"]').first()).toBeVisible();
  }
});

test('missing pages return a real 404 and a useful recovery link', async ({ page }) => {
  const response = await page.goto('/a-page-that-does-not-exist/');
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toContainText('A wrong turn.');
  await page.getByRole('link', { name: 'Explore the learning guides' }).click();
  await expect(page).toHaveURL(/\/guides\/$/);
});
