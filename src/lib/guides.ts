import { getCollection } from 'astro:content';
import { guideSlugs } from '../data/site';

export async function publishedGuides() {
  const guides = await getCollection('guides', ({ data }) => !data.draft);
  const slugs = guides.map(({ data }) => data.slug);
  if (new Set(slugs).size !== slugs.length) throw new Error('Duplicate published guide slug.');
  for (const guide of guides) {
    if (!guideSlugs.includes(guide.data.slug)) throw new Error('Unapproved guide route.');
    for (const related of guide.data.related) {
      if (related === guide.data.slug || !slugs.includes(related)) {
        throw new Error(`Invalid or unpublished related guide: ${related}`);
      }
    }
  }
  return guides.sort((a, b) => a.data.order - b.data.order);
}
