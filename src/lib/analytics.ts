export const ANALYTICS_SIGNAL = 'learning-lab:measurement';
type SizeBucket = '1-20' | '21-200' | '201-2000' | '2001-10000';
export interface EventParameters {
  simulator_start: { tool: 'simulator' | 'randomness'; run_mode: 'batch' | 'timed' | 'comparison'; sample_size_bucket: SizeBucket };
  simulator_complete: EventParameters['simulator_start'];
  calculator_use: { calculator_action: 'event' | 'sequence' | 'trials' };
  course_interest_click: { destination: 'course_homepage' };
  contact_click: { channel: 'email' };
}
export type EventName = keyof EventParameters;
export interface MeasurementSignal { name: EventName; parameters: Record<string, unknown>; token?: object }
export const pageNames: Record<string, string> = {
  '/': 'Home', '/what-is-wingo/': 'What is WinGo', '/wingo-rules/': 'WinGo rules',
  '/big-small-explained/': 'Big and Small', '/number-probability/': 'Number probability',
  '/patterns-and-randomness/': 'Patterns and randomness', '/historical-analysis/': 'Historical analysis',
  '/simulator/': 'Simulator', '/probability-calculator/': 'Probability calculator', '/guides/': 'Guides',
  '/about/': 'About', '/contact/': 'Contact', '/privacy-policy/': 'Privacy', '/terms/': 'Terms',
};
export const guidePaths = ['/what-is-wingo/', '/wingo-rules/', '/big-small-explained/', '/number-probability/', '/patterns-and-randomness/', '/historical-analysis/'];
export function sizeBucket(count: number): SizeBucket {
  if (!Number.isInteger(count) || count < 1 || count > 10_000) throw new RangeError('Invalid analytics sample-size bucket.');
  return count <= 20 ? '1-20' : count <= 200 ? '21-200' : count <= 2000 ? '201-2000' : '2001-10000';
}
export function track<K extends EventName>(name: K, parameters: EventParameters[K], token?: object) {
  if (typeof document !== 'undefined') document.dispatchEvent(new CustomEvent(ANALYTICS_SIGNAL, { detail: { name, parameters, token } }));
}
const allowed: Record<EventName, Record<string, readonly string[]>> = {
  simulator_start: { tool: ['simulator', 'randomness'], run_mode: ['batch', 'timed', 'comparison'], sample_size_bucket: ['1-20', '21-200', '201-2000', '2001-10000'] },
  simulator_complete: { tool: ['simulator', 'randomness'], run_mode: ['batch', 'timed', 'comparison'], sample_size_bucket: ['1-20', '21-200', '201-2000', '2001-10000'] },
  calculator_use: { calculator_action: ['event', 'sequence', 'trials'] },
  course_interest_click: { destination: ['course_homepage'] }, contact_click: { channel: ['email'] },
};
export function sanitizeSignal(value: unknown): MeasurementSignal | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<MeasurementSignal>;
  if (typeof candidate.name !== 'string' || !Object.hasOwn(allowed, candidate.name) || !candidate.parameters || typeof candidate.parameters !== 'object') return null;
  if (candidate.token !== undefined && (!candidate.token || typeof candidate.token !== 'object')) return null;
  const rules = allowed[candidate.name], keys = Object.keys(candidate.parameters);
  if (keys.length !== Object.keys(rules).length || keys.some(key => !rules[key]?.includes(String(candidate.parameters![key])) || typeof candidate.parameters![key] !== 'string')) return null;
  if (candidate.name.startsWith('simulator_') && (!candidate.token || typeof candidate.token !== 'object')) return null;
  if (candidate.name.startsWith('simulator_')) {
    const p = candidate.parameters;
    if ((p.tool === 'randomness') !== (p.run_mode === 'comparison')) return null;
  }
  return { name: candidate.name, parameters: Object.fromEntries(keys.map(key => [key, candidate.parameters![key]])), token: candidate.token };
}

export const CONSENT_KEY = 'wingolab.analytics-consent.v1';
export const CONSENT_LIFETIME = 90 * 24 * 60 * 60 * 1000;
export type Choice = 'granted' | 'denied';
export function readChoice(raw: string | null, now: number): Choice | null {
  try {
    const data = JSON.parse(raw ?? 'null');
    if (data?.version !== 1 || !['granted', 'denied'].includes(data.choice) || !Number.isFinite(data.expiresAt) || data.expiresAt <= now || data.expiresAt > now + CONSENT_LIFETIME) return null;
    return data.choice;
  } catch { return null; }
}
export function savedChoice(choice: Choice, now: number) { return JSON.stringify({ version: 1, choice, expiresAt: now + CONSENT_LIFETIME }); }
export function cleanReferrer(raw: string, origin: string): string {
  try {
    const referrer = new URL(raw);
    if (!['http:', 'https:'].includes(referrer.protocol) || referrer.username || referrer.password) return '';
    if (referrer.origin === origin) return pageNames[referrer.pathname] ? origin + referrer.pathname : '';
    const searchHosts = ['google.com', 'www.google.com', 'google.co.in', 'www.google.co.in', 'bing.com', 'www.bing.com', 'duckduckgo.com', 'www.duckduckgo.com', 'search.yahoo.com'];
    return searchHosts.includes(referrer.hostname) ? referrer.origin + '/' : '';
  } catch { return ''; }
}
