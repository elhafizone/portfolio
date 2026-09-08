import type { MetadataRoute } from 'next';

import { siteConfig } from '@/config/site';

export default function robots(): MetadataRoute.Robots {
  // Preview and temporary deployments are not the canonical site — keep them
  // out of search results rather than letting a throwaway host rank.
  if (!siteConfig.indexable) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }

  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
