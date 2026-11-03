import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Keep build-tool telemetry off, including in restricted Windows environments.
const packagePath = fileURLToPath(import.meta.resolve('astro/package.json'));
const metadata = JSON.parse(readFileSync(packagePath, 'utf8'));
const command = resolve(dirname(packagePath), metadata.bin.astro);
// Run in this process so dev/preview lifecycle signals reach Astro directly.
process.env.ASTRO_TELEMETRY_DISABLED = '1';
await import(pathToFileURL(command).href);
