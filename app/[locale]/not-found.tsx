'use client';

import Link from 'next/link';

import { useLocale } from '@/components/i18n/LocaleProvider';
import { Logo } from '@/components/ui/Logo';
import { profile } from '@/data/profile';
import { localePath } from '@/lib/i18n';

/**
 * A client component so it can read the active locale from context. `not-found`
 * receives no route params, so the dictionary cannot be resolved on the server
 * here — but the provider above it already knows which language is rendering.
 */
export default function NotFound() {
  const { t, locale } = useLocale();

  return (
    <section className="flex min-h-[100svh] flex-col justify-between pb-12 pt-32">
      <div className="shell">
        <div className="border-t border-rule pt-5">
          <span className="label label-marked">{t.notFound.label}</span>
        </div>
      </div>

      <div className="shell">
        <p className="numeral text-[clamp(5rem,18vw,14rem)] font-medium leading-[0.8] tracking-[-0.05em] text-accent">
          404
        </p>
        <h1 className="mt-8 text-[clamp(2rem,5vw,3.5rem)] font-medium leading-[1.02]">
          {t.notFound.title}
        </h1>
        <p className="lead mt-5 max-w-md">{t.notFound.body}</p>
        <Link
          href={localePath(locale)}
          className="mt-9 inline-flex items-center gap-3 rounded-full bg-ink px-7 py-4 text-[0.9375rem] font-medium text-white transition-colors duration-500 hover:bg-accent-deep"
        >
          {t.notFound.cta}
          <span aria-hidden="true">&#8599;</span>
        </Link>
      </div>

      <div className="shell">
        <div className="flex items-center justify-between gap-6 border-t border-rule pt-5">
          <Logo height={26} />
          <span className="label">{profile.role}</span>
        </div>
      </div>
    </section>
  );
}
