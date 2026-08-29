import type { Metadata, Viewport } from 'next';
import {
  IBM_Plex_Sans_Arabic,
  Instrument_Serif,
  Inter_Tight,
  JetBrains_Mono,
} from 'next/font/google';

import { SiteShell } from '@/components/layout/SiteShell';
import { contactConfig, siteConfig } from '@/config/site';
import { ogImage, ogImageSpec } from '@/data/images';
import { profile } from '@/data/profile';

import './globals.css';

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

// Latin faces carry no Arabic glyphs. Client reviews are quoted in their
// original Arabic, so the site needs a real Arabic face rather than a browser
// fallback that would break the typographic voice.
const arabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  display: 'swap',
  variable: '--font-arabic',
  weight: ['400', '500'],
});

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | ${siteConfig.title}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} | ${siteConfig.title}`,
    description: siteConfig.description,
    // Emitted only once the file exists — a share card pointing at a missing
    // image renders worse in link previews than no image tag at all.
    ...(ogImage
      ? {
          images: [
            {
              url: ogImage,
              width: ogImageSpec.width,
              height: ogImageSpec.height,
              alt: `${siteConfig.name} — ${siteConfig.title}`,
            },
          ],
        }
      : {}),
  },
  twitter: {
    card: ogImage ? 'summary_large_image' : 'summary',
    title: `${siteConfig.name} | ${siteConfig.title}`,
    description: siteConfig.description,
    ...(ogImage ? { images: [ogImage] } : {}),
  },
  // Kept in step with app/robots.ts: a temporary or preview host is not the
  // canonical site, so it must not advertise itself as indexable either.
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

/**
 * Structured data. Deliberately conservative: a Person and the services offered.
 * No PostalAddress, no aggregateRating, no awards - none of that is verifiable
 * from the supplied information, and inventing it would be a lie in a format
 * search engines treat as a factual claim.
 */
function buildJsonLd() {
  const sameAs = [contactConfig.linkedin, contactConfig.mostaql, contactConfig.behance].filter(
    Boolean
  );

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.role,
    alternateName: [...profile.alternateNames],
    description: siteConfig.description,
    url: siteConfig.url,
    ...(sameAs.length ? { sameAs } : {}),
    ...(contactConfig.email ? { email: `mailto:${contactConfig.email}` } : {}),
    knowsAbout: [
      'WordPress Development',
      'WooCommerce',
      'Elementor',
      'Website Design',
      'Graphic Design',
      'Visual Design',
      'Print Design',
      'Responsive Web Design',
    ],
    knowsLanguage: ['en', 'ar'],
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang={siteConfig.locale}
      dir="ltr"
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd()) }}
        />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
