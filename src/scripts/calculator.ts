import { parseCount } from '../lib/model';
import { eventDigits, formatProbability, parseSequence, sequenceProbability } from '../lib/probability';
import { createSampler, runBatch, type Sampler } from '../lib/simulation';
import { compareEvent } from '../lib/statistics';
import { integer, message, required, text } from './tool-ui';
import { track } from '../lib/analytics';

const root = document.querySelector<HTMLElement>('[data-calculator]');
if (root) initialize(root);
function initialize(root: HTMLElement) {
  required<HTMLElement>(root, '[data-enhanced]').hidden = false; required<HTMLElement>(root, '[data-fallback]').hidden = true;
  const event = required<HTMLSelectElement>(root, '#calc-event');
  const sequence = required<HTMLTextAreaElement>(root, '#calc-sequence');
  const sequenceForm = required<HTMLFormElement>(root, '[data-sequence-form]');
  const count = required<HTMLInputElement>(root, '#calc-trials');
  const start = required<HTMLButtonElement>(root, '[data-trials-start]');
  const cancel = required<HTMLButtonElement>(root, '[data-trials-cancel]');
  let active: AbortController | undefined, generation = 0, sample: Sampler | undefined;
  try { sample = createSampler(); } catch (error) { text(root, '[data-trials-error]', message(error)); start.disabled = true; }

  required<HTMLFormElement>(root, '[data-event-form]').addEventListener('submit', e => {
    e.preventDefault();
    try {
      const digits = eventDigits(event.value);
      text(root, '[data-event-result]', `${event.value}: ${digits.length}/10 = ${formatProbability(digits.length / 10)}. Favorable digits: ${digits.join(', ')}.`);
      text(root, '[data-event-error]', ''); event.removeAttribute('aria-invalid');
      track('calculator_use', { calculator_action: 'event' });
    } catch (error) { text(root, '[data-event-error]', message(error)); event.setAttribute('aria-invalid', 'true'); }
  });
  sequenceForm.addEventListener('submit', e => {
    e.preventDefault();
    try {
      const events = parseSequence(sequence.value), p = sequenceProbability(events);
      const factors = events.map(item => `${eventDigits(item).length}/10`).join(' × ');
      text(root, '[data-sequence-result]', `${events.join(' → ')}: ${factors} = ${formatProbability(p)} (decimal probability ${p < 0.000001 ? p.toExponential(4) : Number(p.toPrecision(8))}). Applies to the next specified ${events.length} draws in this order, assuming independence.`);
      text(root, '[data-sequence-error]', ''); sequence.removeAttribute('aria-invalid');
      track('calculator_use', { calculator_action: 'sequence' });
    } catch (error) { text(root, '[data-sequence-error]', message(error)); sequence.setAttribute('aria-invalid', 'true'); sequence.focus(); }
  });
  root.querySelectorAll<HTMLButtonElement>('[data-sequence-example]').forEach(button => button.addEventListener('click', () => { sequence.value = button.dataset.sequenceExample!; sequenceForm.requestSubmit(); }));
  function ready() { start.disabled = !sample; count.disabled = false; cancel.disabled = true; }
  required<HTMLFormElement>(root, '[data-trials-form]').addEventListener('submit', async e => {
    e.preventDefault(); if (active || !sample) return;
    let n: number, selected: string;
    try { n = parseCount(count.value); selected = event.value; eventDigits(selected); }
    catch (error) { text(root, '[data-trials-error]', message(error)); count.setAttribute('aria-invalid', 'true'); count.focus(); return; }
    count.removeAttribute('aria-invalid'); text(root, '[data-trials-error]', '');
    const operation = new AbortController(); active = operation; const token = ++generation;
    start.disabled = true; count.disabled = true; cancel.disabled = false;
    text(root, '[data-trials-result]', `Sampling ${integer(n)} local draws for ${selected}.`);
    text(root, '[data-trials-progress]', 'No completed comparison yet.');
    try {
      const digits = await runBatch(n, sample, { signal: operation.signal, onProgress: digits => { if (token === generation) text(root, '[data-trials-progress]', `${integer(digits.length)} of ${integer(n)} draws.`); } });
      if (token !== generation) return;
      const comparison = compareEvent(digits, selected);
      track('calculator_use', { calculator_action: 'trials' });
      text(root, '[data-trials-result]', `${selected} · ${integer(n)} local trials: theoretical ${formatProbability(comparison.theoretical)}; observed ${integer(comparison.count)}/${integer(n)} = ${formatProbability(comparison.observed!)}; expected count ${Number(comparison.expected.toPrecision(8))}; gap ${comparison.gap! >= 0 ? '+' : ''}${comparison.gap!.toFixed(2)} percentage points.`);
    } catch (error) { if (token === generation) { text(root, '[data-trials-error]', message(error)); text(root, '[data-trials-result]', 'Comparison did not complete.'); } }
    finally { if (token === generation) { active = undefined; ready(); } }
  });
  cancel.addEventListener('click', () => {
    if (!active) return; generation++; active.abort(); active = undefined; ready();
    text(root, '[data-trials-result]', 'Comparison cancelled. No completed estimate from this run.'); text(root, '[data-trials-progress]', '');
  });
  window.addEventListener('pagehide', () => {
    if (active) { generation++; active.abort(); active = undefined; ready(); text(root, '[data-trials-result]', 'Comparison cancelled when leaving the page.'); }
  });
}
