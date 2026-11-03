import { parseCount } from '../lib/model';
import { createSampler, exportRun, replay, runBatch, TimedRun, type RecordedRun, type Sampler } from '../lib/simulation';
import { integer, message, renderStatistics, required, text } from './tool-ui';

const root = document.querySelector<HTMLElement>('[data-simulator]');
if (root) initialize(root);

function initialize(root: HTMLElement) {
  const form = required<HTMLFormElement>(root, '[data-run-form]');
  const mode = required<HTMLSelectElement>(root, '#sim-mode');
  const count = required<HTMLInputElement>(root, '#sim-count');
  const start = required<HTMLButtonElement>(root, '[data-start]');
  const pause = required<HTMLButtonElement>(root, '[data-pause]');
  const cancel = required<HTMLButtonElement>(root, '[data-cancel]');
  const reset = required<HTMLButtonElement>(root, '[data-reset]');
  const replayButton = required<HTMLButtonElement>(root, '[data-replay]');
  const exportButton = required<HTMLButtonElement>(root, '[data-export]');
  const presets = root.querySelectorAll<HTMLButtonElement>('[data-preset]');
  let generation = 0, timer: ReturnType<typeof setInterval> | undefined;
  let batch: AbortController | undefined, timed: TimedRun | undefined, recorded: RecordedRun | undefined;
  let active = false, autoPaused = false, previousTime = 0;
  let sample: Sampler | undefined;
  let capabilityError = '';

  required<HTMLElement>(root, '[data-enhanced]').hidden = false;
  required<HTMLElement>(root, '[data-fallback]').hidden = true;
  try { sample = createSampler(); } catch (error) { capabilityError = message(error); text(root, '[data-error]', capabilityError); }

  function controls() {
    start.disabled = active || !sample; mode.disabled = active; count.disabled = active;
    presets.forEach(button => { button.disabled = active; });
    cancel.disabled = !active; pause.hidden = !active || !timed;
    pause.textContent = timed?.state === 'paused' ? 'Resume' : 'Pause';
    replayButton.disabled = active || !recorded; exportButton.disabled = active || !recorded;
    root.dataset.state = active ? timed?.state ?? 'running' : root.dataset.state ?? 'idle';
  }
  function stopPending() {
    generation++; batch?.abort(); batch = undefined;
    if (timer !== undefined) clearInterval(timer); timer = undefined;
    timed?.cancel(); active = false; autoPaused = false;
  }
  function completed(modeValue: 'batch' | 'timed', digits: readonly number[]) {
    recorded = { mode: modeValue, digits: Object.freeze([...digits]) };
    active = false; root.dataset.state = 'complete';
    if (timer !== undefined) clearInterval(timer); timer = undefined;
    text(root, '[data-status]', `Complete. ${integer(digits.length)} local outcomes generated.`);
    text(root, '[data-countdown]', ''); text(root, '[data-progress]', `Completed ${integer(digits.length)} draws.`);
    controls();
  }
  function update(digits: readonly number[], target: number) {
    renderStatistics(root, digits);
    text(root, '[data-result-kind]', digits.length ? 'LOCALLY GENERATED OUTCOME' : 'WAITING FOR A LOCAL OUTCOME');
    text(root, '[data-progress]', `${integer(digits.length)} of ${integer(target)} draws.`);
  }
  function tick() {
    if (!timed || !active) return;
    try {
      const now = performance.now(), changed = timed.advance(now - previousTime); previousTime = now;
      if (changed) { update(timed.digits, timed.target); text(root, '[data-status]', `Round ${timed.digits.length} completed.`); }
      text(root, '[data-countdown]', `${timed.remainingSeconds}s to next draw`);
      if (timed.state === 'complete') completed('timed', timed.digits);
    } catch (error) { stopPending(); root.dataset.state = 'error'; text(root, '[data-error]', message(error)); text(root, '[data-status]', 'Run stopped. No complete dataset recorded.'); controls(); }
  }

  mode.addEventListener('change', () => {
    count.value = mode.value === 'timed' ? '10' : '20'; count.max = mode.value === 'timed' ? '100' : '10000';
    text(root, '[data-count-label]', mode.value === 'timed' ? 'Number of rounds (1–100)' : 'Sample size (1–10,000)');
    required<HTMLElement>(root, '[data-presets]').hidden = mode.value === 'timed';
    count.removeAttribute('aria-invalid'); text(root, '[data-error]', capabilityError);
  });
  presets.forEach(button => button.addEventListener('click', () => { count.value = button.dataset.preset!; count.removeAttribute('aria-invalid'); text(root, '[data-error]', capabilityError); }));
  form.addEventListener('submit', async event => {
    event.preventDefault(); if (active || !sample) return;
    let target: number;
    try { target = parseCount(count.value, mode.value === 'timed' ? 100 : 10_000); }
    catch (error) { count.setAttribute('aria-invalid', 'true'); text(root, '[data-error]', message(error)); count.focus(); return; }
    if (!['batch', 'timed'].includes(mode.value)) { text(root, '[data-error]', 'Choose a supported experiment mode.'); return; }
    stopPending(); const token = generation; timed = undefined;
    active = true; root.dataset.state = 'running'; text(root, '[data-error]', ''); count.removeAttribute('aria-invalid'); update([], target);
    text(root, '[data-status]', `Started ${mode.value === 'timed' ? 'timed' : 'batch'} experiment.`);
    if (mode.value === 'timed') {
      timed = new TimedRun(target, sample); timed.start(); previousTime = performance.now();
      if (document.hidden) { timed.pause(); autoPaused = true; text(root, '[data-status]', 'Paused while this page is hidden.'); }
      text(root, '[data-countdown]', '5s to next draw'); controls(); timer = setInterval(tick, 100);
    } else {
      batch = new AbortController(); controls();
      try {
        const digits = await runBatch(target, sample, { signal: batch.signal, onProgress: digits => { if (token === generation) update(digits, target); } });
        if (token === generation) completed('batch', digits);
      } catch (error) {
        if (token !== generation) return;
        stopPending(); root.dataset.state = 'error'; text(root, '[data-error]', message(error)); text(root, '[data-status]', 'Run stopped. No complete dataset recorded.'); controls();
      }
    }
  });
  pause.addEventListener('click', () => {
    if (!timed || !active) return;
    autoPaused = false;
    if (timed.state === 'paused') { timed.resume(); previousTime = performance.now(); text(root, '[data-status]', 'Timed run resumed.'); }
    else { timed.pause(); text(root, '[data-status]', 'Timed run paused.'); }
    controls();
  });
  cancel.addEventListener('click', () => {
    if (!active) return;
    stopPending(); root.dataset.state = 'cancelled'; text(root, '[data-countdown]', '');
    text(root, '[data-status]', 'Run cancelled. Partial counts are shown; this run is not recorded for replay or export.'); controls();
  });
  reset.addEventListener('click', () => {
    stopPending(); timed = undefined; recorded = undefined; root.dataset.state = 'idle'; renderStatistics(root, []);
    text(root, '[data-error]', capabilityError); count.removeAttribute('aria-invalid');
    text(root, '[data-status]', 'Reset. No outcomes or recorded run remain.'); text(root, '[data-countdown]', '');
    text(root, '[data-progress]', 'Nothing runs automatically.'); text(root, '[data-result-kind]', 'NO LOCAL OUTCOME YET'); controls();
  });
  replayButton.addEventListener('click', () => {
    if (active || !recorded) return;
    const digits = replay(recorded); renderStatistics(root, digits); root.dataset.state = 'replay';
    text(root, '[data-status]', `Recorded replay. ${integer(digits.length)} outcomes restored; no new randomness.`);
    text(root, '[data-result-kind]', 'RECORDED REPLAY · NOT A FRESH DRAW'); text(root, '[data-progress]', `${integer(digits.length)} recorded draws.`);
    text(root, '[data-error]', ''); controls();
  });
  exportButton.addEventListener('click', () => {
    if (active || !recorded) return;
    const url = URL.createObjectURL(new Blob([exportRun(recorded)], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `learning-lab-${recorded.mode}.csv`; anchor.hidden = true;
    document.body.append(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    text(root, '[data-status]', `Exported the last completed ${recorded.mode} run: ${integer(recorded.digits.length)} recorded outcomes.`);
  });
  document.addEventListener('visibilitychange', () => {
    if (!active || !timed) return;
    if (document.hidden && timed.state === 'running') { timed.pause(); autoPaused = true; text(root, '[data-status]', 'Paused while this page is hidden. No background draws.'); }
    else if (!document.hidden && autoPaused && timed.state === 'paused') { timed.resume(); autoPaused = false; previousTime = performance.now(); text(root, '[data-status]', 'Resumed after returning to this page.'); }
    controls();
  });
  window.addEventListener('pagehide', () => {
    if (active) { stopPending(); root.dataset.state = 'cancelled'; text(root, '[data-status]', 'Run cancelled when leaving the page. No background draws.'); text(root, '[data-countdown]', ''); controls(); }
  });
  controls();
}
