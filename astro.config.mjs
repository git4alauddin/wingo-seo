import { defineConfig } from 'astro/config';
import { siteConfig } from './config/site.mjs';
import { headersText, redirectsText } from './config/seo.mjs';
import { writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

export default defineConfig({
  site: siteConfig.origin,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
  integrations: [{
    name: 'static-seo-host-rules',
    hooks: {
      'astro:build:done': async ({ dir, pages }) => {
        const paths = pages.map(page => `/${page.pathname.replace(/^\/+|\/+$/g, '')}/`.replace(/^\/\/$/, '/')).filter(path => !path.includes('.') && existsSync(new URL(`.${path}index.html`, dir)));
        await writeFile(new URL('_headers', dir), headersText(siteConfig));
        await writeFile(new URL('_redirects', dir), redirectsText(paths));
      },
    },
  }],
});
