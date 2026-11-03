import { classify, MODEL_ID } from './model';

export type Sampler = () => number;
export type WordSource = () => number;
export const ACCEPT_BELOW = 4_294_967_290;

export function browserWordSource(): WordSource {
  if (!globalThis.crypto || typeof globalThis.crypto.getRandomValues !== 'function') {
    throw new Error('Your browser does not provide the required random-value API. Reading and calculations still work, but sampling is unavailable.');
  }
  const buffer = new Uint32Array(128);
  let index = buffer.length;
  return () => {
    if (index === buffer.length) { globalThis.crypto.getRandomValues(buffer); index = 0; }
    return buffer[index++];
  };
}

export function createSampler(source: WordSource = browserWordSource()): Sampler {
  return () => {
    for (let attempt = 0; attempt < 1024; attempt++) {
      const word = source();
      if (!Number.isInteger(word) || word < 0 || word >= 2 ** 32) throw new RangeError('The random source returned an invalid unsigned 32-bit integer.');
      if (word < ACCEPT_BELOW) return word % 10;
    }
    throw new Error('The random source could not provide an accepted value. Please try again.');
  };
}

export interface BatchOptions {
  signal: AbortSignal;
  onProgress?: (digits: readonly number[]) => void;
  yieldTask?: () => Promise<void>;
}

export async function runBatch(count: number, sample: Sampler, options: BatchOptions): Promise<number[]> {
  if (!Number.isInteger(count) || count < 1 || count > 10_000) throw new RangeError('Sample size must be a whole number from 1 to 10,000.');
  const digits: number[] = [];
  const yieldTask = options.yieldTask ?? (() => new Promise<void>(resolve => setTimeout(resolve, 16)));
  while (digits.length < count) {
    options.signal.throwIfAborted();
    // Yield before every chunk so cancel/reset can invalidate pending work.
    await yieldTask();
    options.signal.throwIfAborted();
    const end = Math.min(digits.length + 200, count);
    while (digits.length < end) { const digit = sample(); classify(digit); digits.push(digit); }
    options.onProgress?.([...digits]);
  }
  options.signal.throwIfAborted();
  return digits;
}

export type RunState = 'idle' | 'running' | 'paused' | 'complete' | 'cancelled';

export class TimedRun {
  state: RunState = 'idle';
  readonly digits: number[] = [];
  elapsed = 0;
  constructor(readonly target: number, private sample: Sampler) {
    if (!Number.isInteger(target) || target < 1 || target > 100) throw new RangeError('Choose 1–100 timed rounds.');
  }
  start() { if (this.state !== 'idle') throw new Error('A run can only start once.'); this.state = 'running'; }
  pause() { if (this.state === 'running') this.state = 'paused'; }
  resume() { if (this.state === 'paused') this.state = 'running'; }
  cancel() { if (this.state === 'running' || this.state === 'paused') this.state = 'cancelled'; }
  advance(delta: number): boolean {
    if (!Number.isFinite(delta) || delta < 0) throw new RangeError('Elapsed time must be finite and nonnegative.');
    if (this.state !== 'running') return false;
    this.elapsed += delta;
    if (this.elapsed < 5000) return false;
    // One expired teaching round, never an invented catch-up history.
    const digit = this.sample(); classify(digit); this.digits.push(digit); this.elapsed = 0;
    if (this.digits.length === this.target) this.state = 'complete';
    return true;
  }
  get remainingSeconds() { return Math.max(0, Math.ceil((5000 - this.elapsed) / 1000)); }
}

export interface RecordedRun { mode: 'batch' | 'timed'; digits: readonly number[] }
export function replay(run: RecordedRun): number[] { return run.digits.map(digit => classify(digit).digit); }
export function exportRun(run: RecordedRun): string {
  if (!run.digits.length || run.digits.length > 10_000 || !['batch', 'timed'].includes(run.mode)) throw new Error('Only a completed local run can be exported.');
  const rows = run.digits.map((digit, i) => { const result = classify(digit); return `${MODEL_ID},${run.mode},${run.digits.length},${i + 1},${digit},${result.size},${result.colors.join('+')}`; });
  return ['model,mode,sample_size,draw,digit,size,colors', ...rows].join('\r\n') + '\r\n';
}
