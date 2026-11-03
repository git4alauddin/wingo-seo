import { site } from '../data/site';
import { siteConfig } from '../../config/site.mjs';
import { canonicalUrl } from '../../config/seo.mjs';

export interface ArticleMetadata { headline: string; published: Date; modified?: Date }
export function pageSchema(path: string, title: string, description: string, article?: ArticleMetadata) {
  const origin = siteConfig.origin, url = canonicalUrl(path, origin);
  const publisher = `${origin}/#publisher`, website = `${origin}/#website`, webpage = `${url}#webpage`;
  const image = { '@type': 'ImageObject', url: `${origin}/images/learning-lab-social.png`, width: 1200, height: 630 };
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': publisher, name: site.publisher, alternateName: site.name, url: `${origin}/about/` },
      { '@type': 'WebSite', '@id': website, name: site.name, url: `${origin}/`, publisher: { '@id': publisher }, inLanguage: 'en' },
      { '@type': 'WebPage', '@id': webpage, url, name: title, description, isPartOf: { '@id': website }, inLanguage: 'en', primaryImageOfPage: image },
      ...(article ? [{
        '@type': 'Article', '@id': `${url}#article`, headline: article.headline, description,
        datePublished: article.published.toISOString(), ...(article.modified ? { dateModified: article.modified.toISOString() } : {}),
        author: { '@id': publisher }, publisher: { '@id': publisher },
        mainEntityOfPage: { '@id': webpage }, image, inLanguage: 'en',
      }] : []),
    ],
  };
}

export function breadcrumbSchema(items: { label: string; href?: string }[], currentPath: string) {
  const trail = [{ label: 'Home', href: '/' }, ...items];
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, index) => ({
      '@type': 'ListItem', position: index + 1, name: item.label,
      item: canonicalUrl(item.href ?? currentPath, siteConfig.origin),
    })),
  };
}
