import { siteConfig } from './site.mjs';

/** @param {Record<string, string | undefined>} env @param {{environment: string, origin: string, cloudflarePreview: boolean}} site */
export function resolveMeasurementConfig(env, site) {
  const flag = env.ANALYTICS_ENABLED ?? 'false';
  if (!['true', 'false'].includes(flag)) throw new Error('ANALYTICS_ENABLED must be true or false.');
  const id = env.GA4_MEASUREMENT_ID?.trim() ?? '';
  if (id && !/^G-[A-Z0-9]{10}$/.test(id)) throw new Error('GA4_MEASUREMENT_ID must use the G-XXXXXXXXXX format.');
  const consent = env.ANALYTICS_CONSENT_MODE ?? 'unconfigured';
  if (!['unconfigured', 'required'].includes(consent)) throw new Error('ANALYTICS_CONSENT_MODE must be required or unconfigured.');
  const token = env.SEARCH_CONSOLE_VERIFICATION_TOKEN?.trim() ?? '';
  if (token && !/^[A-Za-z0-9_-]{10,200}$/.test(token)) throw new Error('Invalid public Search Console verification token.');
  const contactEmail = env.CONTACT_EMAIL?.trim() ?? '';
  if (contactEmail && !/^[A-Za-z0-9._+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(contactEmail)) throw new Error('CONTACT_EMAIL must be a plain public email address.');
  const courseUrl = env.COURSE_INFO_URL?.trim() ?? '';
  if (courseUrl && courseUrl !== 'https://course.kalam.trade/') throw new Error('COURSE_INFO_URL must be the reviewed course homepage https://course.kalam.trade/.');
  return Object.freeze({
    enabled: flag === 'true' && !!id && consent === 'required' && site.environment === 'production' && !site.cloudflarePreview,
    measurementId: id, origin: site.origin,
    verificationToken: site.environment === 'production' && !site.cloudflarePreview ? token : '',
    contactEmail, courseUrl,
  });
}
export const measurementConfig = resolveMeasurementConfig(process.env, siteConfig);
