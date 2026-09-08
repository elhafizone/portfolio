/**
 * Locale plumbing.
 *
 * Arabic is the default and is served from the bare path (`/`), because it is
 * the primary audience. English lives under `/en`. There is deliberately no
 * `/ar` URL in public circulation — middleware redirects it to `/` so a page
 * never exists at two addresses.
 */

export const locales = ['ar', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'ar';

/** Text direction per locale. Drives `dir` on <html> and the logical CSS. */
export const direction: Record<Locale, 'rtl' | 'ltr'> = {
  ar: 'rtl',
  en: 'ltr',
};

/** BCP-47 tags for `lang`, hreflang and OpenGraph. */
export const htmlLang: Record<Locale, string> = {
  ar: 'ar',
  en: 'en',
};

export const ogLocale: Record<Locale, string> = {
  ar: 'ar_AR',
  en: 'en_US',
};

/** Human name of each locale, written in that locale. */
export const localeName: Record<Locale, string> = {
  ar: 'العربية',
  en: 'English',
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * Public path for a locale. The default locale has no prefix, so the Arabic
 * home page is `/` and not `/ar`.
 */
export function localePath(locale: Locale, path = '/'): string {
  const clean = path === '/' ? '' : path;
  return locale === defaultLocale ? clean || '/' : `/${locale}${clean}`;
}

/** The other locale — used by the language switch, which only ever has two. */
export function otherLocale(locale: Locale): Locale {
  return locale === 'ar' ? 'en' : 'ar';
}
