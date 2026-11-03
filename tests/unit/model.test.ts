import { describe, it, expect } from 'vitest';
import { classify, parseCount } from '../../src/lib/model';
import { eventDigits, eventProbability, parseSequence, sequenceProbability, formatProbability } from '../../src/lib/probability';
import { compareEvent, statistics } from '../../src/lib/statistics';

describe('classification and input contracts', () => {
  const expected = [
    ['Small', ['Red', 'Violet']], ['Small', ['Green']], ['Small', ['Red']], ['Small', ['Green']], ['Small', ['Red']],
    ['Big', ['Green', 'Violet']], ['Big', ['Red']], ['Big', ['Green']], ['Big', ['Red']], ['Big', ['Green']],
  ];
  expected.forEach(([size, colors], digit) => it(`classifies ${digit} completely`, () => expect(classify(digit)).toEqual({ digit, size, colors })));
  it.each([-1, 10, .1, NaN, Infinity])('rejects invalid digit %s', n => expect(() => classify(n)).toThrow());
  it.each(['', ' ', '1.2', '1e3', '0x10', '-1', '0', '10001', 'NaN', 'Infinity'])('rejects count %s', value => expect(() => parseCount(value)).toThrow());
  it('accepts count boundaries and applies the timed limit', () => {
    expect(parseCount(' 1 ')).toBe(1); expect(parseCount('10000')).toBe(10_000);
    expect(parseCount('100', 100)).toBe(100); expect(() => parseCount('101', 100)).toThrow();
  });
});

describe('probabilities from event sets', () => {
  it.each([['7', .1], ['Big', .5], ['Small', .5], ['Red', .5], ['Green', .5], ['Violet', .2], ['Red-or-Violet', .6], ['Big-and-Red', .2]] as const)('%s has the correct marginal', (event, p) => expect(eventProbability(event)).toBe(p));
  it('never double counts overlap or assumes independence inside a draw', () => {
    expect(eventDigits('Red-or-Violet')).toEqual([0, 2, 4, 5, 6, 8]);
    expect(eventDigits('Big-and-Red')).toEqual([6, 8]);
    expect(eventDigits('Red').filter(n => eventDigits('Violet').includes(n))).toEqual([0]);
  });
  it('computes ordered products with no history input', () => {
    expect(sequenceProbability(['7', '7'])).toBeCloseTo(.01, 14);
    expect(sequenceProbability(['Big', 'Big', 'Small'])).toBe(.125);
    expect(sequenceProbability(['Violet', 'Green'])).toBe(.1);
  });
  it('parses named events case-insensitively and preserves order', () => expect(parseSequence(' big, 7, VIOLET ')).toEqual(['Big', '7', 'Violet']));
  it.each(['', '7,,7', '7,', '7;7', 'alert(1)', '10', Array(21).fill('7').join(',')])('rejects invalid sequence %s', value => expect(() => parseSequence(value)).toThrow());
  it('does not round tiny positive probabilities to zero', () => {
    const p = sequenceProbability(Array(20).fill('7'));
    expect(p).toBeCloseTo(1e-20, 30); expect(formatProbability(p)).toBe('1.00e-18%');
  });
  it('rejects unsupported events and empty sequence arrays', () => {
    expect(() => eventDigits('blue')).toThrow(); expect(() => sequenceProbability([])).toThrow();
    expect(() => formatProbability(Infinity)).toThrow();
  });
});

describe('sample statistics', () => {
  it('uses full counts while limiting recent results, including overlap', () => {
    const digits = Array.from({ length: 40 }, (_, i) => i % 10), stats = statistics(digits);
    expect(stats.count).toBe(40); expect(stats.counts).toEqual(Array(10).fill(4));
    expect(stats.sizes).toEqual({ Small: 20, Big: 20 });
    expect(stats.colors).toEqual({ Red: 20, Green: 20, Violet: 8 });
    expect(stats.recent).toHaveLength(20); expect(stats.recent[0]).toBe(9); expect(stats.longest).toBe(5);
  });
  it('includes a terminal streak and handles ties', () => {
    expect(statistics([0, 1, 5, 6, 7]).longest).toBe(3);
    expect(statistics([0, 1, 5, 6]).longest).toBe(2);
  });
  it('distinguishes empty frequency from zero observed matches', () => {
    expect(compareEvent([], '7')).toMatchObject({ observed: null, gap: null, expected: 0 });
    expect(compareEvent([0, 1], '7')).toMatchObject({ observed: 0, count: 0, expected: .2, gap: -10 });
    expect(statistics([])).toMatchObject({ count: 0, longest: 0, recent: [] });
  });
  it('compares expected and observed with a percentage-point gap', () => expect(compareEvent([0, 5, 2, 7], 'Violet')).toEqual({ n: 4, count: 2, theoretical: .2, expected: .8, observed: .5, gap: 30 }));
});
