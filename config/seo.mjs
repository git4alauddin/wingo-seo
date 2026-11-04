/** @param {string} path @param {string} origin */
export function canonicalUrl(path, origin) {
  const url = new URL(path, origin);
  if (url.origin !== origin) throw new Error('Canonical paths must stay on the production origin.');
  let pathname = url.pathname.replace(/\/index\.html$/, '/');
  if (!pathname.endsWith('/')) pathname += '/';
  if (!/^\/(?:[a-z0-9-]+\/)*$/.test(pathname)) throw new Error(`Unsupported canonical page path: ${path}`);
  return new URL(pathname, origin).href;
}

/** Serialize only data, never executable HTML. @param {unknown} value */
export function serializeSchema(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

/** @param {string[]} paths @param {string} origin @param {boolean} indexable */
export function sitemapXml(paths, origin, indexable) {
  const urls = indexable ? [...new Set(paths.map(path => canonicalUrl(path, origin)))].sort() : [];
  return '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map(url => `  <url><loc>${url}</loc></url>`).join('\n') + '\n</urlset>\n';
}

/** @param {{origin: string, indexable: boolean}} config */
export function robotsText(config) {
  return '# Crawling is allowed so crawlers can read page-level indexing directives.\nUser-agent: *\nAllow: /\n' +
    (config.indexable ? `\nSitemap: ${config.origin}/sitemap.xml\n` : '\n# Non-indexable build: no sitemap is advertised.\n');
}

/** @param {{indexable: boolean}} config */
export function headersText(config) {
  return config.indexable
    ? '# Keep host aliases excluded without blocking the custom production domain.\nhttps://:worker.:account.workers.dev/*\n  X-Robots-Tag: noindex, follow\n\nhttps://:project.pages.dev/*\n  X-Robots-Tag: noindex, follow\n\nhttps://:version.:project.pages.dev/*\n  X-Robots-Tag: noindex, follow\n\n/404.html\n  X-Robots-Tag: noindex, follow\n'
    : '# Nonproduction/unreleased builds must stay out of search.\n/*\n  X-Robots-Tag: noindex, follow\n';
}

/** Normalize known page aliases only; never add an SPA fallback. @param {string[]} paths */
export function redirectsText(paths) {
  const rules = ['/index.html / 301'];
  for (const path of [...new Set(paths)].sort()) {
    if (path === '/') continue;
    if (!/^\/(?:[a-z0-9-]+\/)+$/.test(path)) throw new Error(`Unexpected page redirect path: ${path}`);
    rules.push(`${path.slice(0, -1)} ${path} 301`, `${path}index.html ${path} 301`);
  }
  return '# Normalize known static page aliases; missing paths keep their 404 response.\n' + rules.join('\n') + '\n';
}
