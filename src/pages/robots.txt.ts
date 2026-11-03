import type { APIRoute } from 'astro';
import { robotsText } from '../../config/seo.mjs';
import { siteConfig } from '../../config/site.mjs';

export const GET: APIRoute = () => new Response(robotsText(siteConfig), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
