import { NextResponse, type NextRequest } from 'next/server';

import { defaultLocale, locales } from '@/lib/i18n';

/**
 * Locale routing.
 *
 * The app tree lives under `app/[locale]`, but the default locale is served
 * without a prefix so Arabic — the primary audience — gets the bare domain.
 *
 *   /        -> rewritten to /ar   (URL stays "/")
 *   /ar      -> redirected to /    (one canonical address per page)
 *   /en      -> served as-is
 *
 * The rewrite is internal, so `/` never becomes a redirect hop, and the
 * redirect on `/ar` stops the same content answering at two URLs.
 */
/**
 * Metadata routes generated per locale by the App Router. They are ASSETS, not
 * pages: `/ar/opengraph-image` is the address Next itself puts in the `og:image`
 * tag, so redirecting it to `/opengraph-image` made every social crawler take a
 * 308 hop to fetch the share card — and the ones that do not follow redirects
 * got no image at all. They are served where Next says they are.
 */
const METADATA_ROUTES = ['opengraph-image', 'twitter-image', 'icon', 'apple-icon'];

function isMetadataRoute(pathname: string) {
  const last = pathname.split('/').pop() ?? '';
  // Next appends a cache-busting suffix, e.g. `opengraph-image-a1b2c3`.
  return METADATA_ROUTES.some((route) => last === route || last.startsWith(`${route}-`));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isMetadataRoute(pathname)) return NextResponse.next();

  // Strip the default-locale prefix: it is not a public URL.
  if (pathname === `/${defaultLocale}` || pathname.startsWith(`/${defaultLocale}/`)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(`/${defaultLocale}`.length) || '/';
    return NextResponse.redirect(url, 308);
  }

  // Any non-default locale already matches the route tree.
  const hasLocalePrefix = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  if (hasLocalePrefix) return NextResponse.next();

  // Everything else is the default locale, served from the bare path.
  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  /*
   * Skip Next internals, the API, and any path with a file extension —
   * robots.txt, sitemap.xml, the logo and everything under /public must be
   * served as-is rather than rewritten into a locale.
   */
  matcher: ['/((?!_next|api|.*\\.).*)'],
};
