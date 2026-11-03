import { describe, it, expect, vi } from 'vitest';
import { ACCEPT_BELOW, createSampler, browserWordSource, runBatch, TimedRun, replay, exportRun } from '../../src/lib/simulation';

describe('unbiased mapping and source errors', () => {
  it.each([[0, 0], [9, 9], [10, 0], [ACCEPT_BELOW - 1, 9]])('maps accepted word %s', (word, digit) => expect(createSampler(() => word)()).toBe(digit));
  it('rejects all six upper values before using the next accepted word', () => {
    const words = [...Array.from({ length: 6 }, (_, i) => ACCEPT_BELOW + i), 7];
    const source = vi.fn(() => words.shift()!);
    expect(createSampler(source)()).toBe(7); expect(source).toHaveBeenCalledTimes(7);
  });
  it('maps complete accepted residue groups equally', () => {
    let word = 0; const sample = createSampler(() => word++), counts = Array(10).fill(0);
    for (let i = 0; i < 1000; i++) counts[sample()]++;
    expect(counts).toEqual(Array(10).fill(100));
  });
  it.each([-1, 2 ** 32, .5, NaN, Infinity])('rejects invalid word %s', word => expect(() => createSampler(() => word)()).toThrow());
  it('bounds a broken source instead of looping forever', () => {
    const source = vi.fn(() => ACCEPT_BELOW);
    expect(() => createSampler(source)()).toThrow('accepted value'); expect(source).toHaveBeenCalledTimes(1024);
  });
  it('fails explicitly without browser randomness', () => {
    vi.stubGlobal('crypto', undefined);
    try { expect(() => browserWordSource()).toThrow('random-value API'); } finally { vi.unstubAllGlobals(); }
  });
});

describe('cancellable batches', () => {
  it('returns complete results and reports the entire run, not just recent rows', async () => {
    const seen: number[] = [];
    const digits = await runBatch(401, () => 5, { signal: new AbortController().signal, yieldTask: async () => {}, onProgress: digits => seen.push(digits.length) });
    expect(digits).toEqual(Array(401).fill(5)); expect(seen).toEqual([200, 400, 401]);
  });
  it('does no further sampling after cancellation during a yield', async () => {
    const controller = new AbortController(), sample = vi.fn(() => 0);
    await expect(runBatch(10_000, sample, { signal: controller.signal, yieldTask: async () => { controller.abort(); } })).rejects.toThrow();
    expect(sample).not.toHaveBeenCalled();
  });
  it('stops after a cancelled chunk and rejects the incomplete dataset', async () => {
    const controller = new AbortController(), sample = vi.fn(() => 0);
    await expect(runBatch(1000, sample, { signal: controller.signal, yieldTask: async () => {}, onProgress: () => controller.abort() })).rejects.toThrow();
    expect(sample).toHaveBeenCalledTimes(200);
  });
  it('supports the maximum sample and rejects invalid sizes/results', async () => {
    expect(await runBatch(10_000, () => 9, { signal: new AbortController().signal, yieldTask: async () => {} })).toHaveLength(10_000);
    await expect(runBatch(10_001, () => 0, { signal: new AbortController().signal })).rejects.toThrow();
    await expect(runBatch(1, () => 10, { signal: new AbortController().signal, yieldTask: async () => {} })).rejects.toThrow();
  });
});

describe('timed state and recorded data', () => {
  it('appends exactly once per round and completes only once', () => {
    const sample = vi.fn(() => 5), run = new TimedRun(2, sample); run.start();
    expect(() => run.start()).toThrow(); expect(run.advance(4999)).toBe(false); expect(run.remainingSeconds).toBe(1);
    expect(run.advance(1)).toBe(true); expect(run.digits).toEqual([5]);
    run.advance(5000); expect(run.state).toBe('complete'); run.advance(5000); expect(sample).toHaveBeenCalledTimes(2);
  });
  it('preserves partial elapsed time through pause and does not draw while paused', () => {
    const run = new TimedRun(1, () => 7); run.start(); run.advance(2000); run.pause(); run.advance(99_000);
    expect(run.digits).toEqual([]); expect(run.remainingSeconds).toBe(3); run.resume(); run.advance(3000); expect(run.digits).toEqual([7]);
  });
  it('never invents multiple background catch-up results', () => {
    const run = new TimedRun(10, () => 0); run.start(); run.advance(100_000); expect(run.digits).toEqual([0]); expect(run.remainingSeconds).toBe(5);
  });
  it('cancels pending progress permanently', () => {
    const sample = vi.fn(() => 0), run = new TimedRun(10, sample); run.start(); run.cancel(); run.resume(); run.advance(5000);
    expect(run.state).toBe('cancelled'); expect(sample).not.toHaveBeenCalled();
  });
  it('rejects bad targets and elapsed time', () => {
    expect(() => new TimedRun(0, () => 0)).toThrow(); expect(() => new TimedRun(101, () => 0)).toThrow();
    const run = new TimedRun(1, () => 0); expect(() => run.advance(-1)).toThrow(); expect(() => run.advance(Infinity)).toThrow();
  });
  it('replays a copy without changing the saved sequence and exports overlaps', () => {
    const saved = { mode: 'batch' as const, digits: Object.freeze([0, 5, 9]) };
    const restored = replay(saved); restored[0] = 8; expect(saved.digits).toEqual([0, 5, 9]);
    const csv = exportRun(saved).trim().split('\r\n'); expect(csv).toHaveLength(4);
    expect(csv[1]).toBe('uniform-digits-v1,batch,3,1,0,Small,Red+Violet');
    expect(csv[2]).toBe('uniform-digits-v1,batch,3,2,5,Big,Green+Violet');
    expect(() => exportRun({ mode: 'batch', digits: [] })).toThrow();
  });
});
