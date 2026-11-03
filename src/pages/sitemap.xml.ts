import type { APIRoute } from 'astro';
import { publishedGuides } from '../lib/guides';
import { staticRoutes } from '../data/routes.mjs';
import { sitemapXml } from '../../config/seo.mjs';
import { siteConfig } from '../../config/site.mjs';

export const GET: APIRoute = async () => {
  const guides = await publishedGuides();
  const paths = [...staticRoutes, ...guides.map(guide => `/${guide.data.slug}/`)];
  return new Response(sitemapXml(paths, siteConfig.origin, siteConfig.indexable), { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
