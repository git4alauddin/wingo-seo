export const MODEL_ID = 'uniform-digits-v1';
export type Size = 'Small' | 'Big';
export type Color = 'Red' | 'Green' | 'Violet';
export interface Outcome { digit: number; size: Size; colors: Color[] }

export function classify(digit: number): Outcome {
  if (!Number.isInteger(digit) || digit < 0 || digit > 9) throw new RangeError('Choose a whole digit from 0 to 9.');
  const colors: Color[] = [digit % 2 === 0 ? 'Red' : 'Green'];
  if (digit === 0 || digit === 5) colors.push('Violet');
  return { digit, size: digit < 5 ? 'Small' : 'Big', colors };
}

export const classifications = Array.from({ length: 10 }, (_, digit) => classify(digit));

export function parseCount(value: string, maximum = 10_000): number {
  if (!/^\d+$/.test(value.trim())) throw new RangeError(`Enter a whole sample size from 1 to ${maximum.toLocaleString('en-US')}.`);
  const count = Number(value.trim());
  if (!Number.isSafeInteger(count) || count < 1 || count > maximum) throw new RangeError(`Enter a whole sample size from 1 to ${maximum.toLocaleString('en-US')}.`);
  return count;
}
