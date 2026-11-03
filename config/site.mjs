// Build-time configuration only. No account credentials belong here.
const environment = process.env.SITE_ENV ?? 'preview';
if (!['development', 'preview', 'production'].includes(environment)) {
  throw new Error('SITE_ENV must be development, preview, or production.');
}
const configuredOrigin = process.env.SITE_ORIGIN;
if (environment === 'production' && !configuredOrigin) {
  throw new Error('Production requires explicit SITE_ORIGIN. Domain authorization is a separate release step.');
}
const origin = new URL(configuredOrigin ?? 'https://learn.kalam.trade');
if (origin.protocol !== 'https:' || origin.origin !== 'https://learn.kalam.trade' || origin.pathname !== '/' || origin.search || origin.hash || origin.username || origin.password) {
  throw new Error('SITE_ORIGIN must be https://learn.kalam.trade without a path, query, or credentials.');
}
export const siteConfig = Object.freeze({
  environment,
  origin: origin.origin,
  // Indexing stays off throughout the staged build. Phase 4 owns launch eligibility.
  indexable: false,
});
