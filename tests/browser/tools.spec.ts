import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function deterministicSource(page: Page) {
  // Test fixture only. The shipped application always uses the native source.
  await page.addInitScript(() => {
    let digit = 0;
    Object.defineProperty(globalThis.crypto, 'getRandomValues', { configurable: true, value: (array: Uint32Array) => {
      for (let i = 0; i < array.length; i++) array[i] = digit++ % 10;
      return array;
    } });
  });
}
async function clock(page: Page) {
  const now = new Date('2026-11-03T12:00:00Z');
  await page.clock.install({ time: now }); await page.clock.pauseAt(now);
}
async function hidden(page: Page, value: boolean) {
  await page.evaluate(value => { Object.defineProperty(document, 'hidden', { value, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); }, value);
}

test('batch counts, recent history, replay, and CSV use the completed dataset', async ({ page }, testInfo) => {
  await deterministicSource(page); await page.goto('/simulator/');
  await page.getByRole('button', { name: '200', exact: true }).click();
  await page.getByRole('button', { name: 'Start experiment', exact: true }).click();
  await expect(page.locator('[data-status]')).toHaveText('Complete. 200 local outcomes generated.');
  await expect(page.locator('[data-sample-total]')).toContainText('200 draws');
  await expect(page.locator('[data-recent] li')).toHaveCount(20);
  await expect(page.locator('[data-digit-count="0"]')).toHaveText('20');
  await expect(page.locator('[data-group-count="Violet"]')).toHaveText('40');
  await expect(page.locator('[data-latest-label]')).toHaveText('9 · Big · Green');
  await expect(page.locator('[data-game-trend] svg')).toBeVisible();
  await expect(page.locator('[data-game-trend] g title')).toHaveCount(10);
  await expect(page.locator('[data-game-trend] g title').first()).toHaveText('Draw 200: 9, Big, Green');
  await expect(page.locator('[data-game-trend] g title').last()).toHaveText('Draw 191: 0, Small, Red and Violet');
  await page.screenshot({ path: `artifacts/screenshots/phase-3/${testInfo.project.name}-simulator-complete.png`, fullPage: true, scale: 'css' });
  const original = await page.locator('[data-recent]').textContent();
  await page.getByRole('button', { name: 'Replay recorded run' }).click();
  await expect(page.locator('[data-status]')).toContainText('no new randomness');
  expect(await page.locator('[data-recent]').textContent()).toBe(original);
  const pending = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export completed run (CSV)' }).click();
  const download = await pending, stream = await download.createReadStream();
  const chunks: Buffer[] = []; for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const lines = Buffer.concat(chunks).toString('utf8').trim().split('\r\n');
  expect(lines).toHaveLength(201); expect(lines[1]).toBe('uniform-digits-v1,batch,200,1,0,Small,Red+Violet');
  expect(lines.at(-1)).toBe('uniform-digits-v1,batch,200,200,9,Big,Green');
  await page.locator('#sim-mode').selectOption('timed');
  await page.getByRole('button', { name: 'Start experiment' }).click();
  await page.getByRole('button', { name: 'Cancel run', exact: true }).click();
  await page.getByRole('button', { name: 'Replay recorded run' }).click();
  await expect(page.locator('[data-sample-total]')).toContainText('200 draws');
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(page.locator('[data-sample-total]')).toHaveText('No draws yet');
  await expect(page.getByRole('button', { name: 'Replay recorded run' })).toBeDisabled();
});

test('timed rounds pause, retain elapsed time, stop while hidden, and complete once', async ({ page }) => {
  await deterministicSource(page); await clock(page); await page.goto('/simulator/');
  await page.locator('#sim-mode').selectOption('timed'); await page.locator('#sim-count').fill('2');
  await page.getByRole('button', { name: 'Start experiment' }).click();
  await expect(page.getByRole('button', { name: 'Start experiment' })).toBeDisabled();
  await page.clock.runFor(2000); await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await page.clock.runFor(15_000); await expect(page.locator('[data-sample-total]')).toHaveText('No draws yet');
  await hidden(page, true); await hidden(page, false); await expect(page.locator('[data-simulator]')).toHaveAttribute('data-state', 'paused');
  await page.getByRole('button', { name: 'Resume', exact: true }).click(); await page.clock.runFor(3000);
  await expect(page.locator('[data-sample-total]')).toContainText('1 draws');
  await hidden(page, true); await page.clock.runFor(30_000); await expect(page.locator('[data-sample-total]')).toContainText('1 draws');
  await hidden(page, false); await page.clock.runFor(5000);
  await expect(page.locator('[data-status]')).toHaveText('Complete. 2 local outcomes generated.');
  await page.clock.runFor(30_000); await expect(page.locator('[data-sample-total]')).toContainText('2 draws');
});

test('maximum batch works and reset invalidates cancelled async work', async ({ page }) => {
  await deterministicSource(page); await page.goto('/simulator/');
  await page.locator('#sim-count').fill('10001'); await page.getByRole('button', { name: 'Start experiment' }).click();
  await expect(page.locator('#sim-count')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('[data-error]')).toContainText('1 to 10,000');
  await page.locator('#sim-count').fill('10000'); await page.getByRole('button', { name: 'Start experiment' }).click();
  await expect(page.locator('[data-status]')).toHaveText('Complete. 10,000 local outcomes generated.');
  await expect(page.locator('[data-recent] li')).toHaveCount(20);
  await expect(page.locator('[data-digit-count="0"]')).toHaveText('1,000');
  await page.getByRole('button', { name: 'Start experiment' }).click();
  await page.getByRole('button', { name: 'Cancel run', exact: true }).click();
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await page.locator('#sim-count').fill('1'); await page.getByRole('button', { name: 'Start experiment' }).click();
  await expect(page.locator('[data-status]')).toHaveText('Complete. 1 local outcomes generated.');
  await expect(page.locator('[data-sample-total]')).toContainText('1 draws');
  await expect(page.locator('[data-recent] li')).toHaveCount(1);
  const violations = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(violations.violations).toEqual([]);
});

test('calculator handles overlapping events, ordered blocks, tiny values, and errors', async ({ page }) => {
  await page.goto('/probability-calculator/');
  for (const [event, result] of [['7', '10%'], ['Big', '50%'], ['Small', '50%'], ['Red', '50%'], ['Green', '50%'], ['Violet', '20%'], ['Red-or-Violet', '60%'], ['Big-and-Red', '20%']]) {
    await page.locator('#calc-event').selectOption(event); await page.getByRole('button', { name: 'Calculate event', exact: true }).click();
    await expect(page.locator('[data-event-result]')).toContainText(`= ${result}`);
  }
  await page.locator('#calc-sequence').fill('7, 7'); await page.getByRole('button', { name: 'Calculate sequence', exact: true }).click();
  await expect(page.locator('[data-sequence-result]')).toContainText('= 1%');
  await page.getByRole('button', { name: 'Big, Big, Small', exact: true }).click();
  await expect(page.locator('[data-sequence-result]')).toContainText('= 12.5%');
  await page.locator('#calc-sequence').fill(Array(20).fill('7').join(', ')); await page.getByRole('button', { name: 'Calculate sequence', exact: true }).click();
  await expect(page.locator('[data-sequence-result]')).toContainText('1.00e-18%');
  await page.locator('#calc-sequence').fill('7,,7'); await page.getByRole('button', { name: 'Calculate sequence', exact: true }).click();
  await expect(page.locator('#calc-sequence')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('[data-sequence-error]')).toContainText('1–20 events');
  await page.locator('#calc-trials').fill('10001'); await page.getByRole('button', { name: 'Run comparison', exact: true }).click();
  await expect(page.locator('[data-trials-error]')).toContainText('1 to 10,000');
});

test('trial comparison reports a captured event and can cancel without a stale result', async ({ page }, testInfo) => {
  await deterministicSource(page); await page.goto('/probability-calculator/');
  await page.locator('#calc-event').selectOption('Violet'); await page.locator('#calc-trials').fill('200');
  await page.getByRole('button', { name: 'Run comparison', exact: true }).click();
  await expect(page.locator('[data-trials-result]')).toContainText('Violet · 200 local trials: theoretical 20%; observed 40/200 = 20%; expected count 40; gap +0.00');
  await page.screenshot({ path: `artifacts/screenshots/phase-3/${testInfo.project.name}-calculator-sampled.png`, fullPage: true, scale: 'css' });
  await page.locator('#calc-event').selectOption('Big'); await expect(page.locator('[data-trials-result]')).toContainText('Violet · 200');
  await page.locator('#calc-trials').fill('10000'); await page.getByRole('button', { name: 'Run comparison', exact: true }).click();
  await page.getByRole('button', { name: 'Cancel comparison', exact: true }).click();
  await expect(page.locator('[data-trials-result]')).toContainText('cancelled');
  await page.locator('#calc-trials').fill('20'); await page.getByRole('button', { name: 'Run comparison', exact: true }).click();
  await expect(page.locator('[data-trials-result]')).toContainText('Big · 20 local trials');
});

test('randomness samples show actual counts and longest runs without changing future probability', async ({ page }, testInfo) => {
  await deterministicSource(page); await page.goto('/patterns-and-randomness/');
  await expect(page.locator('[data-illustration]')).toBeVisible();
  await page.getByRole('button', { name: 'Generate two samples', exact: true }).click();
  await expect(page.locator('[data-randomness] [data-status]')).toContainText('Two generated samples complete');
  const cards = page.locator('.generated-sample'); await expect(cards).toHaveCount(2);
  await expect(cards.nth(0)).toContainText('Small: 10/20 (50%)');
  await expect(cards.nth(1)).toContainText('Small: 1,000/2,000 (50%)');
  await expect(cards.nth(1)).toContainText('Longest observed Big or Small run: 5.');
  await expect(page.locator('[data-randomness] [data-status]')).toContainText('next draw’s theoretical 50/50');
  await expect(page.locator('[data-illustration]')).toBeHidden();
  await page.screenshot({ path: `artifacts/screenshots/phase-3/${testInfo.project.name}-randomness-generated.png`, fullPage: true, scale: 'css' });
  const violations = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(violations.violations).toEqual([]);
});

test('randomness cancellation cannot publish a stale sample on the next run', async ({ page }) => {
  await deterministicSource(page); await clock(page); await page.goto('/patterns-and-randomness/');
  await page.getByRole('button', { name: 'Generate two samples', exact: true }).click();
  await page.getByRole('button', { name: 'Cancel sampling', exact: true }).click();
  await page.clock.runFor(1000);
  await expect(page.locator('[data-randomness] [data-status]')).toContainText('Sampling cancelled');
  await expect(page.locator('.generated-sample')).toHaveCount(0);
  await page.getByRole('button', { name: 'Generate two samples', exact: true }).click();
  await page.clock.runFor(2000);
  await expect(page.locator('[data-randomness] [data-status]')).toContainText('Two generated samples complete');
  await expect(page.locator('.generated-sample')).toHaveCount(2);
});

test('tool interactions stay local and do not persist outcomes', async ({ page, context }) => {
  const external: string[] = [], errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', event => { if (event.type() === 'error') errors.push(event.text()); });
  await page.route('**/*', route => {
    if (new URL(route.request().url()).hostname !== '127.0.0.1') { external.push(route.request().url()); return route.abort(); }
    return route.continue();
  });
  await page.goto('/simulator/'); await page.getByRole('button', { name: 'Start experiment' }).click();
  await expect(page.locator('[data-status]')).toContainText('Complete.');
  await page.reload(); await expect(page.locator('[data-sample-total]')).toHaveText('No draws yet');
  await page.goto('/probability-calculator/'); await page.getByRole('button', { name: 'Run comparison' }).click();
  await expect(page.locator('[data-trials-result]')).toContainText('local trials: theoretical');
  await page.goto('/patterns-and-randomness/'); await page.getByRole('button', { name: 'Generate two samples' }).click();
  await expect(page.locator('[data-randomness] [data-status]')).toContainText('Two generated samples complete');
  expect(external).toEqual([]); expect(errors).toEqual([]);
  expect(await context.cookies()).toEqual([]);
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
});

test('unavailable randomness disables sampling but keeps mathematics available', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(globalThis, 'crypto', { value: undefined, configurable: true }); });
  await page.goto('/simulator/'); await expect(page.getByRole('button', { name: 'Start experiment' })).toBeDisabled();
  await expect(page.locator('[data-error]')).toContainText('random-value API');
  await page.getByRole('button', { name: 'Reset', exact: true }).click(); await expect(page.locator('[data-error]')).toContainText('random-value API');
  await page.goto('/probability-calculator/'); await page.getByRole('button', { name: 'Calculate event', exact: true }).click();
  await expect(page.locator('[data-event-result]')).toContainText('= 10%');
  await expect(page.getByRole('button', { name: 'Run comparison' })).toBeDisabled();
});
