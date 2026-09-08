import type { Metadata, Viewport } from 'next';
import { Almarai, Instrument_Serif, Inter_Tight, JetBrains_Mono } from 'next/font/google';
import { notFound } from 'next/navigation';

import { LocaleProvider } from '@/components/i18n/LocaleProvider';
import { SiteShell } from '@/components/layout/SiteShell';
import { contactConfig, siteConfig } from '@/config/site';
import { getDictionary } from '@/data/content';
import { profile } from '@/data/profile';
import {
  direction,
  htmlLang,
  isLocale,
  localePath,
  locales,
  ogLocale,
  type Locale,
} from '@/lib/i18n';

import '../globals.css';

const sans = Inter_Tight({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['300', '400', '500', '600'],
});

const serif = Instrument_Serif({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
  weight: ['400'],
  style: ['italic', 'normal'],
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
  weight: ['400', '500'],
});

/**
 * Arabic is the default locale, so this face carries the bulk of the site's
 * body copy — not just the quoted client reviews it was first added for.
 *
 * Almarai ships 300 / 400 / 700 / 800 and NOTHING BETWEEN 400 AND 700. The rest
 * of the design is built on 500 for headings and 600 for the accent word, and
 * CSS font matching resolves a missing 500 DOWN to 400 — so Arabic headings
 * would silently render at body weight. The RTL block in globals.css therefore
 * restates every display weight in terms Almarai actually has. Do not add a
 * weight here that the family does not publish.
 */
const arabic = Almarai({
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-arabic',
  weight: ['400', '700', '800'],
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const t = getDictionary(locale);

  /* hreflang for both locales plus x-default, pointing at the canonical
     addresses (Arabic has no prefix). */
  const languages = Object.fromEntries(
    locales.map((l) => [htmlLang[l], localePath(l)])
  ) as Record<string, string>;

  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: t.meta.title, template: `%s | ${siteConfig.name}` },
    description: t.meta.description,
    keywords: [...siteConfig.keywords],
    authors: [{ name: siteConfig.name }],
    creator: siteConfig.name,
    alternates: {
      canonical: localePath(locale),
      languages: { ...languages, 'x-default': localePath('ar') },
    },
    openGraph: {
      type: 'website',
      locale: ogLocale[locale],
      url: new URL(localePath(locale), siteConfig.url).toString(),
      siteName: siteConfig.name,
      title: t.meta.title,
      description: t.meta.description,
      // `images` is deliberately absent: app/[locale]/opengraph-image.tsx
      // generates the card and Next wires it up. Setting it here would win over
      // the generated one and put us back to having no image at all.
    },
    twitter: {
      card: 'summary_large_image',
      title: t.meta.title,
      description: t.meta.description,
    },
    robots: {
      index: siteConfig.indexable,
      follow: siteConfig.indexable,
      googleBot: {
        index: siteConfig.indexable,
        follow: siteConfig.indexable,
        'max-image-preview': 'large',
      },
    },
    icons: { icon: '/logo.png', apple: '/logo.png' },
  };
}

/**
 * Structured data. Deliberately conservative: a Person and what he does.
 * No PostalAddress, no aggregateRating, no awards - none of that is verifiable
 * from the supplied information, and inventing it would be a lie in a format
 * search engines treat as a factual claim.
 */
function buildJsonLd(locale: Locale) {
  const sameAs = [contactConfig.linkedin, contactConfig.behance].filter(Boolean);
  const t = getDictionary(locale);

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.role,
    alternateName: [...profile.alternateNames],
    nationality: { '@type': 'Country', name: profile.nationalityCountry },
    description: t.meta.description,
    url: new URL(localePath(locale), siteConfig.url).toString(),
    ...(sameAs.length ? { sameAs } : {}),
    // Only what Mohammed has published on the page itself. Structured data is
    // read as a factual claim, so it must not carry anything the site does not.
    ...(contactConfig.email ? { email: `mailto:${contactConfig.email}` } : {}),
    ...(contactConfig.whatsapp
      ? { telephone: `+${contactConfig.whatsapp.replace(/\D/g, '')}` }
      : {}),
    // The 3D, interior and motion entries come from the CV, where the career
    // actually begins — not from the WordPress work it arrived at.
    knowsAbout: [
      'WordPress Development',
      'WooCommerce',
      'Elementor',
      'Website Design',
      'Graphic Design',
      'Visual Design',
      'Print Design',
      'Responsive Web Design',
      '3D Visualization',
      'Interior Design',
      'Motion Graphics',
      'Video Editing',
    ],
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'Garden City University (UGC)' },
    knowsLanguage: ['ar', 'en'],
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const dictionary = getDictionary(locale);

  return (
    <html
      lang={htmlLang[locale]}
      dir={direction[locale]}
      className={`${sans.variable} ${serif.variable} ${mono.variable} ${arabic.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Set the motion flag before first paint. The CSS pre-hide states are
          scoped to html[data-motion="on"], so without this there would be a
          flash of visible content before the reveal states apply - and with JS
          disabled the flag never appears, leaving everything readable.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=window.matchMedia('(prefers-reduced-motion: reduce)').matches;document.documentElement.dataset.motion=m?'off':'on';}catch(e){document.documentElement.dataset.motion='off';}})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(locale)) }}
        />
        <meta name="format-detection" content="telephone=no" />
      </head>
      {/*
        Extensions routinely stamp attributes onto <body> before React hydrates
        — ColorZilla's `cz-shortcut-listen`, password managers, grammar tools.
        Every one of them is reported as a hydration mismatch that no change to
        this codebase can prevent, so the element opts out of the comparison.
        This suppresses attribute noise on <body> ONLY; real mismatches inside
        the tree are still reported.
      */}
      <body suppressHydrationWarning>
        <LocaleProvider locale={locale} dictionary={dictionary}>
          <SiteShell>{children}</SiteShell>
        </LocaleProvider>
      </body>
    </html>
  );
}
