import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { guideSlugs } from './data/site';

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string().min(10),
    shortTitle: z.string(),
    description: z.string().min(50).max(200),
    slug: z.enum(guideSlugs),
    topic: z.string(),
    summary: z.string(),
    takeaway: z.string(),
    order: z.number().int().positive(),
    minutes: z.number().int().positive(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    publisher: z.literal('project'),
    related: z.array(z.enum(guideSlugs)).min(2),
    sources: z.array(z.object({ title: z.string(), url: z.url() })).min(1),
    cta: z.enum(['simulator', 'calculator']),
    draft: z.boolean().default(false),
  }),
});

export const collections = { guides };
