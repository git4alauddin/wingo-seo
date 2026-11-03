import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, sep, join } from 'node:path';

const workspace = resolve('.');
const profiles = [
  { name: 'preview', variables: { SITE_ENV: 'preview', SITE_INDEXABLE: 'false' } },
  { name: 'production', variables: { SITE_ENV: 'production', SITE_INDEXABLE: 'true' } },
  { name: 'cloudflare-branch-preview', variables: { SITE_ENV: 'production', SITE_INDEXABLE: 'true', CF_PAGES: '1', CF_PAGES_BRANCH: 'feature/seo-check' } },
];
for (const profile of profiles) {
  const output = resolve('artifacts', 'seo', profile.name);
  if (!output.startsWith(workspace + sep)) throw new Error('SEO build output must stay inside the workspace.');
  const env = { ...process.env, SITE_ORIGIN: 'https://learn.kalam.trade', SITE_CHECK_DIR: output };
  delete env.CF_PAGES; delete env.CF_PAGES_BRANCH;
  Object.assign(env, profile.variables);
  mkdirSync(resolve('artifacts', 'seo'), { recursive: true });
  let log = '';
  for (const args of [['tools/astro.mjs', 'build', '--outDir', output], ['tools/check-site.mjs']]) {
    const result = spawnSync(process.execPath, args, { env, encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 });
    log += (result.stdout ?? '') + (result.stderr ?? '');
    if (result.error || result.status !== 0) {
      writeFileSync(join(workspace, 'artifacts', 'seo', `${profile.name}.log`), log);
      console.error(log.slice(-12_000)); throw result.error ?? new Error(`SEO profile failed: ${profile.name}`);
    }
  }
  writeFileSync(join(workspace, 'artifacts', 'seo', `${profile.name}.log`), log);
  console.log(`PASS: ${profile.name} build and generated-output validation (${output}).`);
}
console.log('Default dist/ remains untouched; profile artifacts/logs are in artifacts/seo/.');
