import { mkdir, writeFile } from 'node:fs/promises';
import { releaseTargets, checkRelease } from './release-checks.mjs';

const targets = releaseTargets(process.argv.slice(2));
console.log('Read-only public HTTPS checks. This command does not deploy, change DNS, run page JavaScript, or submit anything to Google.');
const report = await checkRelease(targets);
await mkdir('artifacts/release-check', { recursive: true });
await writeFile('artifacts/release-check/latest.json', JSON.stringify(report, null, 2));
for (const row of report.checks) console.log(`${row.passed ? 'PASS' : 'FAIL'} ${row.name}${row.error ? ': ' + row.error : ''}`);
if (!report.passed) process.exitCode = 1;
console.log('Report: artifacts/release-check/latest.json. Review browser behavior, certificate/domain status, and owner account settings separately.');
