import { describe, expect, it } from 'vitest';
import { resolveMeasurementConfig } from '../../config/measurement.mjs';
import { cleanReferrer, CONSENT_LIFETIME, readChoice, savedChoice, sanitizeSignal, sizeBucket } from '../../src/lib/analytics';

const origin = 'https://learn.kalam.trade';
const site = { environment: 'production', origin, cloudflarePreview: false };
const enabled = { ANALYTICS_ENABLED: 'true', GA4_MEASUREMENT_ID: 'G-TEST123456', ANALYTICS_CONSENT_MODE: 'required' };
describe('measurement release configuration', () => {
  it('requires all opt-ins and the production environment', () => {
    expect(resolveMeasurementConfig(enabled, site).enabled).toBe(true);
    for (const key of Object.keys(enabled)) {
      const incomplete: Record<string, string> = { ...enabled }; delete incomplete[key];
      expect(resolveMeasurementConfig(incomplete, site).enabled).toBe(false);
    }
    expect(resolveMeasurementConfig({}, site).enabled).toBe(false);
    expect(resolveMeasurementConfig(enabled, { ...site, environment: 'preview' }).enabled).toBe(false);
    expect(resolveMeasurementConfig(enabled, { ...site, cloudflarePreview: true }).enabled).toBe(false);
  });
  it.each([
    { ANALYTICS_ENABLED: 'yes' }, { GA4_MEASUREMENT_ID: 'G-bad' }, { ANALYTICS_CONSENT_MODE: 'none' },
    { SEARCH_CONSOLE_VERIFICATION_TOKEN: '<script>' }, { CONTACT_EMAIL: 'a@example.com?subject=x' },
    { COURSE_INFO_URL: 'https://example.com/' },
  ])('rejects malformed public configuration %j', env => { expect(() => resolveMeasurementConfig(env, site)).toThrow(); });
  it('only emits verification in production, and leaves optional destinations absent by default', () => {
    const env = { SEARCH_CONSOLE_VERIFICATION_TOKEN: 'test-verification-token' };
    expect(resolveMeasurementConfig(env, site).verificationToken).toBe(env.SEARCH_CONSOLE_VERIFICATION_TOKEN);
    expect(resolveMeasurementConfig(env, { ...site, cloudflarePreview: true }).verificationToken).toBe('');
    expect(resolveMeasurementConfig(env, { ...site, environment: 'preview' }).verificationToken).toBe('');
    expect(resolveMeasurementConfig({}, site)).toMatchObject({ contactEmail: '', courseUrl: '' });
  });
});
describe('minimal consent record', () => {
  const now = 1_800_000_000_000;
  it.each(['granted', 'denied'] as const)('persists only a version, %s choice and expiry', choice => {
    const raw = savedChoice(choice, now);
    expect(JSON.parse(raw)).toEqual({ version: 1, choice, expiresAt: now + CONSENT_LIFETIME });
    expect(readChoice(raw, now + 1)).toBe(choice);
    expect(readChoice(raw, now + CONSENT_LIFETIME)).toBeNull();
  });
  it.each([null, '', '{', '{}', 'null', '{"version":1,"choice":"yes","expiresAt":1800000000001}'])('keeps malformed choice %j off', raw => {
    expect(readChoice(raw, now)).toBeNull();
  });
  it('rejects old versions and implausible future expiry', () => {
    expect(readChoice(JSON.stringify({ version: 2, choice: 'granted', expiresAt: now + 1 }), now)).toBeNull();
    expect(readChoice(savedChoice('granted', now + 1), now)).toBeNull();
  });
});
describe('coarse event contract', () => {
  it.each([[1, '1-20'], [20, '1-20'], [21, '21-200'], [200, '21-200'], [201, '201-2000'], [2000, '201-2000'], [2001, '2001-10000'], [10000, '2001-10000']] as const)('buckets %i as %s', (count, expected) => { expect(sizeBucket(count)).toBe(expected); });
  it.each([0, -1, 1.5, 10001, NaN])('rejects invalid count %s', count => { expect(() => sizeBucket(count)).toThrow(); });
  it('allows categories but rejects raw inputs, unknown events and missing run tokens', () => {
    const signal = { name: 'calculator_use', parameters: { calculator_action: 'sequence' } };
    expect(sanitizeSignal(signal)?.parameters).toEqual(signal.parameters);
    expect(sanitizeSignal({ ...signal, parameters: { ...signal.parameters, sequence: '7,7' } })).toBeNull();
    expect(sanitizeSignal({ ...signal, parameters: { calculator_action: 'email@example.com' } })).toBeNull();
    expect(sanitizeSignal({ ...signal, token: 'invalid-token' })).toBeNull();
    expect(sanitizeSignal({ name: '__proto__', parameters: {} })).toBeNull();
    const run = { name: 'simulator_start', parameters: { tool: 'simulator', run_mode: 'batch', sample_size_bucket: '1-20' } };
    expect(sanitizeSignal(run)).toBeNull();
    expect(sanitizeSignal({ ...run, token: {} })?.parameters).toEqual(run.parameters);
    expect(sanitizeSignal({ ...run, token: {}, parameters: { ...run.parameters, tool: 'randomness' } })).toBeNull();
  });
  it.each([
    [origin + '/simulator/?email=secret#outcome', origin + '/simulator/'],
    ['https://www.google.com/search?q=secret', 'https://www.google.com/'],
    ['https://other.example/private?email=secret', ''], [origin + '/private/', ''],
    ['https://user:password@www.google.com/', ''], ['javascript:alert(1)', ''], ['not-a-url', ''],
  ])('sanitizes referrer %s', (raw, expected) => { expect(cleanReferrer(raw, origin)).toBe(expected); });
});
