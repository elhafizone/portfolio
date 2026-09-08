import type { MetadataRoute } from 'next';

import { siteConfig } from '@/config/site';
import { htmlLang, localePath, locales } from '@/lib/i18n';

/**
 * One entry per locale, each carrying the full alternates set so a crawler
 * discovers both languages from either URL. Arabic is the canonical home and
 * uses the unprefixed path.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    locales.map((locale) => [
      htmlLang[locale],
      new URL(localePath(locale), siteConfig.url).toString(),
    ])
  );

  return locales.map((locale) => ({
    url: new URL(localePath(locale), siteConfig.url).toString(),
    /*
      A FIXED date, not `new Date()`.
      `new Date()` re-stamps every page as "modified" on each build, so a
      deploy that only changed a stylesheet tells Google the content is new.
      Crawlers learn to distrust the field, and it stops helping. Bump
      `contentUpdatedAt` in config/site.ts when the copy or the work actually
      changes.
    */
    lastModified: siteConfig.contentUpdatedAt,
    changeFrequency: 'monthly' as const,
    priority: locale === 'ar' ? 1 : 0.9,
    alternates: { languages },
  }));
}
