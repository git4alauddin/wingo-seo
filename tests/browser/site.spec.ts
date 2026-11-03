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
  await expect(page.locator('.article-card')).toHaveCount(6);
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
  for (const [name, route] of [['home', '/'], ['guide', '/number-probability/'], ['simulator', '/simulator/'], ['calculator', '/probability-calculator/'], ['randomness', '/patterns-and-randomness/']] as const) {
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

test('missing pages return a real 404 and a useful recovery link', async ({ page }) => {
  const response = await page.goto('/a-page-that-does-not-exist/');
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toContainText('A wrong turn.');
  await page.getByRole('link', { name: 'Explore the learning guides' }).click();
  await expect(page).toHaveURL(/\/guides\/$/);
});
