import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { siteConfig } from '@/config/site';
import { getDictionary } from '@/data/content';
import { htmlLang, isLocale, localePath, locales, type Locale } from '@/lib/i18n';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const t = getDictionary(locale).privacy;

  const languages = Object.fromEntries(
    locales.map((l) => [htmlLang[l], localePath(l, '/privacy')])
  ) as Record<string, string>;

  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: localePath(locale, '/privacy'),
      languages: { ...languages, 'x-default': localePath('ar', '/privacy') },
    },
    openGraph: {
      title: `${t.metaTitle} | ${siteConfig.name}`,
      description: t.metaDescription,
      url: new URL(localePath(locale, '/privacy'), siteConfig.url).toString(),
    },
  };
}

/**
 * Privacy policy. Plain, readable, server-rendered text: no motion, no 3D.
 * Every statement here must match what the site actually does - update it
 * whenever a tracking script, form provider or AI provider changes.
 */
export default async function PrivacyPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = getDictionary(locale).privacy;

  return (
    <article className="pb-24 pt-32 lg:pb-32 lg:pt-40">
      <div className="shell">
        <div className="border-t border-rule pt-5">
          <span className="label label-marked">{t.label}</span>
        </div>

        <div className="mt-10 max-w-[44rem]">
          <h1 className="text-[clamp(2.25rem,5vw,3.75rem)] font-medium leading-[1.05]">
            {t.title}
          </h1>
          <p className="label mt-5 normal-case">{t.updated}</p>
          <p className="lead mt-8">{t.intro}</p>

          {t.sections.map((section) => (
            <section key={section.title} className="mt-12 border-t border-rule pt-8">
              <h2 className="text-[clamp(1.25rem,2.2vw,1.625rem)] font-medium leading-[1.2]">
                {section.title}
              </h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="mt-4 leading-relaxed text-ink-body">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}

          <Link
            href={localePath(locale)}
            className="mt-14 inline-flex items-center gap-3 rounded-full bg-ink px-7 py-4 text-[0.9375rem] font-medium text-white transition-colors duration-500 hover:bg-accent-deep"
          >
            {t.back}
            <span aria-hidden="true">&#8599;</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
