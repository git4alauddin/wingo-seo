import { classify } from './model';
import { eventDigits, eventProbability } from './probability';

export function statistics(digits: readonly number[]) {
  const counts = Array<number>(10).fill(0);
  const sizes = { Small: 0, Big: 0 };
  const colors = { Red: 0, Green: 0, Violet: 0 };
  let longest = 0, run = 0, previous = '';
  for (const digit of digits) {
    const result = classify(digit);
    counts[digit]++; sizes[result.size]++;
    result.colors.forEach(color => colors[color]++);
    run = result.size === previous ? run + 1 : 1;
    previous = result.size; longest = Math.max(longest, run);
  }
  return { count: digits.length, counts, sizes, colors, longest, recent: digits.slice(-20).reverse() };
}

export function compareEvent(digits: readonly number[], event: string) {
  const allowed = eventDigits(event);
  let count = 0;
  for (const digit of digits) { classify(digit); if (allowed.includes(digit)) count++; }
  const p = eventProbability(event), n = digits.length;
  return { count, n, theoretical: p, observed: n ? count / n : null, expected: n * p, gap: n ? (count / n - p) * 100 : null };
}
