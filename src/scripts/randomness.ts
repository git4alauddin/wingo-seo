import { createSampler, runBatch, type Sampler } from '../lib/simulation';
import { statistics } from '../lib/statistics';
import { formatProbability } from '../lib/probability';
import { integer, message, required, text } from './tool-ui';

const root = document.querySelector<HTMLElement>('[data-randomness]');
if (root) initialize(root);
function initialize(root: HTMLElement) {
  const generate = required<HTMLButtonElement>(root, '[data-generate]');
  const cancel = required<HTMLButtonElement>(root, '[data-cancel]');
  const results = required<HTMLElement>(root, '[data-results]');
  let operation: AbortController | undefined, generation = 0, sample: Sampler | undefined;
  required<HTMLElement>(root, '[data-enhanced]').hidden = false; required<HTMLElement>(root, '[data-fallback]').hidden = true;
  try { sample = createSampler(); } catch (error) { generate.disabled = true; text(root, '[data-error]', message(error)); }
  generate.addEventListener('click', async () => {
    if (operation || !sample) return;
    const controller = new AbortController(); operation = controller; const token = ++generation;
    generate.disabled = true; cancel.disabled = false; text(root, '[data-error]', '');
    results.hidden = true; results.replaceChildren();
    required<HTMLElement>(root, '[data-illustration]').hidden = true;
    text(root, '[data-status]', 'Generating separate samples of 20 and 2,000 local draws.');
    try {
      const small = await runBatch(20, sample, { signal: controller.signal });
      const large = await runBatch(2000, sample, { signal: controller.signal });
      if (token !== generation) return;
      for (const digits of [small, large]) {
        const data = statistics(digits), card = document.createElement('section'); card.className = 'generated-sample';
        const heading = document.createElement('h3'); heading.textContent = `${integer(data.count)} generated draws`;
        const bar = document.createElement('div'); bar.className = 'sample-bar'; bar.setAttribute('aria-hidden', 'true');
        const fill = document.createElement('span'); fill.style.width = `${data.sizes.Small / data.count * 100}%`; bar.append(fill);
        const counts = document.createElement('p'); counts.textContent = `Small: ${integer(data.sizes.Small)}/${integer(data.count)} (${formatProbability(data.sizes.Small / data.count)}). Big: ${integer(data.sizes.Big)}/${integer(data.count)} (${formatProbability(data.sizes.Big / data.count)}).`;
        const longest = document.createElement('p'); longest.textContent = `Longest observed Big or Small run: ${data.longest}.`;
        const gap = document.createElement('p'); gap.textContent = `Small frequency gap from 50%: ${(data.sizes.Small / data.count * 100 - 50).toFixed(2)} percentage points.`;
        card.append(heading, bar, counts, longest, gap); results.append(card);
      }
      results.hidden = false;
      text(root, '[data-status]', 'Two generated samples complete. Neither history changes the next draw’s theoretical 50/50 size probability. A larger sample is not guaranteed to be closer.');
    } catch (error) { if (token === generation) { text(root, '[data-error]', message(error)); text(root, '[data-status]', 'Sampling did not complete. No generated comparison is shown.'); } }
    finally { if (token === generation) { operation = undefined; generate.disabled = !sample; cancel.disabled = true; } }
  });
  cancel.addEventListener('click', () => {
    if (!operation) return;
    generation++; operation.abort(); operation = undefined; generate.disabled = !sample; cancel.disabled = true;
    results.hidden = true; results.replaceChildren();
    text(root, '[data-status]', 'Sampling cancelled. No generated comparison is shown.');
  });
  window.addEventListener('pagehide', () => {
    if (operation) { generation++; operation.abort(); operation = undefined; generate.disabled = !sample; cancel.disabled = true; text(root, '[data-status]', 'Sampling cancelled when leaving the page.'); }
  });
}
