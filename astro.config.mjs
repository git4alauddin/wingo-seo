import { defineConfig } from 'astro/config';
import { siteConfig } from './config/site.mjs';

export default defineConfig({
  site: siteConfig.origin,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
});
