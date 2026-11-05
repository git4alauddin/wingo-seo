import { classify } from './model';

/** Presentation only; uses the educational model's existing classifications. */
export function gameBall(digit: number): HTMLSpanElement {
  const result = classify(digit), ball = document.createElement('span'), value = document.createElement('b');
  ball.className = `digit ${result.colors[0].toLowerCase()}${result.colors.length > 1 ? ' dual' : ''}`;
  ball.setAttribute('aria-hidden', 'true'); value.textContent = String(digit); ball.append(value);
  return ball;
}

/** Studio-style trend drawing. SVG labels identify local draw numbers, never live periods. */
export function gameTrend(digits: readonly number[]): string {
  const recent = digits.slice(-10).reverse();
  if (!recent.length) return '';
  const x = (digit: number) => 90 + digit * 28;
  const y = (index: number) => 68 + index * 54;
  const color = (digit: number) => classify(digit).colors[0] === 'Green' ? '#40b985' : '#ff535c';
  const height = 42 + recent.length * 54;
  const rows = recent.map((digit,index) => {
    const result = classify(digit), draw = digits.length-index, cy=y(index), cx=x(digit);
    const outline = Array.from({length:10},(_,n) => `<circle cx="${x(n)}" cy="${cy}" r="8" fill="#fff" stroke="#dcdff0"/><text x="${x(n)}" y="${cy+4}" text-anchor="middle" fill="#69758b">${n}</text>`).join('');
    const selected = `<circle cx="${cx}" cy="${cy}" r="8" fill="${color(digit)}"/>${result.colors.length > 1 ? `<path d="M${cx} ${cy-8}a8 8 0 0 1 0 16Z" fill="#df49e8"/>` : ''}<text x="${cx}" y="${cy+4}" fill="#00264d" text-anchor="middle" font-weight="700">${digit}</text>`;
    return `<g><title>Draw ${draw}: ${digit}, ${result.size}, ${result.colors.join(' and ')}</title><path d="M0 ${cy+27}H400" stroke="#dcdff0"/><text x="12" y="${cy+4}" fill="#00264d">${draw}</text>${outline}${selected}<circle cx="380" cy="${cy}" r="9" fill="${result.size === 'Big' ? '#f7a12c' : '#6ca4ef'}"/><text x="380" y="${cy+4}" text-anchor="middle" fill="#00264d" font-weight="700">${result.size[0]}</text></g>`;
  }).join('');
  const points = recent.map((digit,index) => `${x(digit)},${y(index)}`).join(' ');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 ${height}" role="img" aria-label="Number trend for the latest ${recent.length} local or illustrative draws, latest first" font-family="Arial,Helvetica,sans-serif" font-size="12"><rect width="400" height="${height}" fill="white"/><path d="M0 0H400V42H0Z" fill="#ff563f"/><g fill="#00264d" font-weight="700"><text x="12" y="27">Draw</text><text x="204" y="27" text-anchor="middle">Number</text><text x="380" y="27" text-anchor="middle">Size</text></g><polyline points="${points}" fill="none" stroke="#f55c6b" stroke-width="1"/>${rows}</svg>`;
}
