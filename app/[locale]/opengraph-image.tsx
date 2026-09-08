import { ImageResponse } from 'next/og';

import { siteConfig } from '@/config/site';
import { isLocale, locales, type Locale } from '@/lib/i18n';

/**
 * The social share card, generated rather than designed.
 *
 * This slot was an outstanding asset request — a 1200x630 file someone had to
 * make in Photoshop and remember to keep in step with the site. Nothing shipped,
 * so `og:image` was absent and every link to the site pasted into WhatsApp,
 * LinkedIn or Slack rendered as a bare grey box.
 *
 * Drawing it here means it always exists, always matches the brand tokens, and
 * costs nothing to maintain.
 *
 * DELIBERATELY LATIN-ONLY. `ImageResponse` has no Arabic-capable font unless one
 * is fetched and embedded at build time, and a missing glyph would render as
 * tofu boxes on the Arabic card — visibly worse than English on both. The name
 * is Latin in the logo anyway, so the card reads correctly either way.
 */
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = `${siteConfig.name} — ${siteConfig.title}`;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? (raw as Locale) : 'ar';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#ffffff',
          backgroundImage:
            'radial-gradient(60% 55% at 92% 6%, rgba(112,186,101,0.30) 0%, rgba(255,255,255,0) 78%),' +
            'radial-gradient(50% 46% at 6% 96%, rgba(112,186,101,0.22) 0%, rgba(255,255,255,0) 72%)',
          padding: '72px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{ width: 18, height: 18, borderRadius: 999, background: '#70BA65' }}
          />
          <div
            style={{
              fontSize: 26,
              letterSpacing: 6,
              textTransform: 'uppercase',
              color: '#333333',
            }}
          >
            {locale === 'ar' ? 'Portfolio' : 'Portfolio'}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 92,
              fontWeight: 700,
              letterSpacing: -3,
              lineHeight: 1.05,
              color: '#0D0D0D',
            }}
          >
            {siteConfig.name}
          </div>
          <div
            style={{
              marginTop: 22,
              fontSize: 40,
              lineHeight: 1.25,
              color: '#3E7A36',
            }}
          >
            {siteConfig.title}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '2px solid #E7E7E1',
            paddingTop: 28,
            fontSize: 26,
            color: '#333333',
          }}
        >
          <div style={{ display: 'flex' }}>10+ years of design</div>
          <div style={{ display: 'flex' }}>WordPress since 2020</div>
          <div style={{ display: 'flex', color: '#3E7A36' }}>
            {siteConfig.url.replace(/^https?:\/\//, '')}
          </div>
        </div>
      </div>
    ),
    size
  );
}
