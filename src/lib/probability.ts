import { classify } from './model';

export const eventOptions = [
  ...Array.from({ length: 10 }, (_, n) => ({ value: String(n), label: `Digit ${n}` })),
  ...['Big', 'Small', 'Red', 'Green', 'Violet'].map(value => ({ value, label: value })),
  { value: 'Red-or-Violet', label: 'Red OR Violet (one draw)' },
  { value: 'Big-and-Red', label: 'Big AND Red (one draw)' },
];

export function eventDigits(event: string): number[] {
  if (!eventOptions.some(option => option.value === event)) throw new RangeError('Choose a supported digit, size, or color event.');
  if (/^[0-9]$/.test(event)) return [Number(event)];
  return Array.from({ length: 10 }, (_, n) => n).filter(n => {
    const result = classify(n);
    if (event === 'Red-or-Violet') return result.colors.includes('Red') || result.colors.includes('Violet');
    if (event === 'Big-and-Red') return result.size === 'Big' && result.colors.includes('Red');
    return result.size === event || result.colors.some(color => color === event);
  });
}

export const eventProbability = (event: string) => eventDigits(event).length / 10;

export function parseSequence(value: string): string[] {
  const sequence = value.split(',').map(token => token.trim());
  if (sequence.length < 1 || sequence.length > 20 || sequence.some(token => !token)) {
    throw new RangeError('Enter 1–20 events separated by commas. For example: Big, Big, Small.');
  }
  return sequence.map(token => {
    const option = eventOptions.find(item => item.value.toLowerCase() === token.toLowerCase());
    if (!option) throw new RangeError(`Unsupported event “${token.slice(0, 30)}”. Use digits 0–9, Big, Small, Red, Green, or Violet.`);
    return option.value;
  });
}

export function sequenceProbability(sequence: readonly string[]): number {
  if (sequence.length < 1 || sequence.length > 20) throw new RangeError('A sequence must contain 1–20 events.');
  return sequence.reduce((product, event) => product * eventProbability(event), 1);
}

export function formatProbability(p: number): string {
  if (!Number.isFinite(p) || p < 0 || p > 1) throw new RangeError('Probability must be between 0 and 1.');
  const percent = p * 100;
  if (percent > 0 && percent < 0.0001) return `${percent.toExponential(2)}%`;
  return `${percent.toLocaleString('en-US', { maximumSignificantDigits: 6 })}%`;
}
