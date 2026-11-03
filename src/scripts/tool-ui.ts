import { classify } from '../lib/model';
import { formatProbability } from '../lib/probability';
import { statistics } from '../lib/statistics';

export function required<T extends Element = HTMLElement>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Missing tool element: ${selector}`);
  return element;
}
export const message = (error: unknown) => error instanceof Error ? error.message : 'The experiment could not finish. Please try again.';
export const integer = (n: number) => n.toLocaleString('en-US');
export function text(root: ParentNode, selector: string, value: string) { required(root, selector).textContent = value; }

export function renderStatistics(root: HTMLElement, digits: readonly number[]) {
  const stats = statistics(digits), total = stats.count;
  text(root, '[data-sample-total]', total ? `${integer(total)} draws · complete current run` : 'No draws yet');
  stats.counts.forEach((count, n) => {
    text(root, `[data-digit-count="${n}"]`, total ? integer(count) : '—');
    text(root, `[data-digit-frequency="${n}"]`, total ? formatProbability(count / total) : '—');
    required<HTMLElement>(root, `[data-digit-bar="${n}"]`).style.width = total ? `${count / total * 100}%` : '0%';
  });
  Object.entries({ ...stats.sizes, ...stats.colors }).forEach(([group, count]) => {
    text(root, `[data-group-count="${group}"]`, total ? integer(count) : '—');
    text(root, `[data-group-frequency="${group}"]`, total ? formatProbability(count / total) : '—');
  });
  text(root, '[data-longest-run]', total ? String(stats.longest) : '—');
  const list = required<HTMLOListElement>(root, '[data-recent]'); list.replaceChildren();
  if (!total) { const li = document.createElement('li'); li.textContent = 'No local outcomes yet.'; list.append(li); }
  stats.recent.forEach((digit, i) => {
    const result = classify(digit), li = document.createElement('li');
    const number = document.createElement('span'); number.className = `digit ${result.colors[0].toLowerCase()}${result.colors.length === 2 ? ' dual' : ''}`; number.textContent = String(digit); number.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span'); label.textContent = `Draw ${integer(total - i)}: ${digit} · ${result.size} · ${result.colors.join(' + ')}`;
    li.append(number, label); list.append(li);
  });
  const last = digits.at(-1), outcome = last === undefined ? null : classify(last);
  const latest = required<HTMLElement>(root, '[data-latest]');
  latest.textContent = outcome ? String(outcome.digit) : '—';
  latest.className = outcome ? `digit ${outcome.colors[0].toLowerCase()}${outcome.colors.length === 2 ? ' dual' : ''}` : 'digit';
  text(root, '[data-latest-label]', outcome ? `${outcome.digit} · ${outcome.size} · ${outcome.colors.join(' + ')}` : 'Start when you’re ready.');
}
