import { test, expect } from '@playwright/test';
import { routes } from '../../tools/routes.mjs';

test('all pages reflow at 320px and remain usable with text doubled', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  for (const route of routes) {
    await page.goto(route);
    const size = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: innerWidth }));
    expect(size.content, route + ' at 320px').toBeLessThanOrEqual(size.viewport + 1);
  }
  await page.setViewportSize({ width: 768, height: 1024 });
  for (const route of ['/', '/number-probability/', '/simulator/', '/probability-calculator/', '/privacy-policy/']) {
    await page.goto(route);
    // Text resizing, not a claim of native browser zoom or screen-reader testing.
    await page.addStyleTag({ content: 'html { font-size: 200% !important; } body { font-size: 32px !important; }' });
    const size = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: innerWidth }));
    expect(size.content, route + ' with 200% text').toBeLessThanOrEqual(size.viewport + 1);
    await expect(page.locator('h1')).toBeVisible();
  }
});

test('reduced motion keeps navigation instant and keyboard controls visible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto('/simulator/');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
  const start = page.getByRole('button', { name: 'Start experiment', exact: true });
  await start.focus(); await expect(start).toBeFocused();
  expect(await start.evaluate(node => getComputedStyle(node).outlineStyle)).not.toBe('none');
  await page.keyboard.press('Enter'); await expect(page.locator('[data-status]')).toContainText('Complete.');
});
