// Build-time configuration only. These flags neither deploy nor authorize a domain change.
/** @param {Record<string, string | undefined>} env */
export function resolveSiteConfig(env = process.env) {
  const environment = env.SITE_ENV ?? 'preview';
  if (!['development', 'preview', 'production'].includes(environment)) {
    throw new Error('SITE_ENV must be development, preview, or production.');
  }
  if (environment === 'production' && !env.SITE_ORIGIN) {
    throw new Error('Production requires explicit SITE_ORIGIN. Domain authorization is a separate release step.');
  }
  const origin = new URL(env.SITE_ORIGIN ?? 'https://learn.kalam.trade');
  if (origin.protocol !== 'https:' || origin.origin !== 'https://learn.kalam.trade' || origin.pathname !== '/' || origin.search || origin.hash || origin.username || origin.password) {
    throw new Error('SITE_ORIGIN must be https://learn.kalam.trade without a path, query, or credentials.');
  }
  const flag = env.SITE_INDEXABLE ?? 'false';
  if (!['true', 'false'].includes(flag)) throw new Error('SITE_INDEXABLE must be true or false.');
  const cloudflarePreview = (env.CF_PAGES === '1' && !!env.CF_PAGES_BRANCH && env.CF_PAGES_BRANCH !== 'main') ||
    (env.WORKERS_CI === '1' && env.WORKERS_CI_BRANCH !== 'main');
  return Object.freeze({
    environment, origin: origin.origin, cloudflarePreview,
    indexable: environment === 'production' && flag === 'true' && !cloudflarePreview,
  });
}
export const siteConfig = resolveSiteConfig();
