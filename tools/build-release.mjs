import { spawnSync } from 'node:child_process';
import { resolve, sep } from 'node:path';

const workspace = resolve('.');
const output = resolve('artifacts/release');
if (!output.startsWith(workspace + sep)) throw new Error('Release candidate must stay inside the workspace.');
const env = {
  ...process.env, SITE_ENV: 'production', SITE_ORIGIN: 'https://dmplay.kalam.trade', SITE_INDEXABLE: 'true',
  SITE_CHECK_DIR: output, ANALYTICS_ENABLED: 'false', GA4_MEASUREMENT_ID: '', ANALYTICS_CONSENT_MODE: 'unconfigured',
  SEARCH_CONSOLE_VERIFICATION_TOKEN: '', CONTACT_EMAIL: '', COURSE_INFO_URL: '',
};
delete env.CF_PAGES; delete env.CF_PAGES_BRANCH;
delete env.WORKERS_CI; delete env.WORKERS_CI_BRANCH;
for (const args of [['tools/astro.mjs', 'build', '--outDir', output], ['tools/check-site.mjs']]) {
  const result = spawnSync(process.execPath, args, { env, stdio: 'inherit' });
  if (result.error || result.status !== 0) throw result.error ?? new Error('Release candidate validation failed.');
}
console.log('Production candidate validated in artifacts/release/. Analytics and optional owner configuration are off. Nothing was uploaded; default dist/ is unchanged.');
