'use client';

import { useLocale } from '@/components/i18n/LocaleProvider';
import type { Testimonial } from '@/data/testimonials';

type Props = {
  item: Testimonial;
};

/**
 * A single client review.
 *
 * The quotation is always the client's own language, marked with the right
 * `lang` and `dir` so browsers and screen readers shape and read it correctly.
 *
 * The English translation is shown only to English readers. On the Arabic site
 * the quote already IS Arabic, so printing a translation beneath it would be
 * noise — and worse, it would imply the Arabic was itself translated from
 * somewhere.
 *
 * Nothing here identifies the client: no name, no project, no platform. The
 * words are the whole point.
 */
export function Quote({ item }: Props) {
  const { locale, t } = useLocale();
  const isRtl = item.lang === 'ar';
  const showTranslation = locale !== item.lang;

  return (
    <figure className="m-0">
      <span
        aria-hidden="true"
        className="serif-accent block text-[2.25rem] leading-[0.6] text-accent"
      >
        &ldquo;
      </span>

      <blockquote
        lang={item.lang}
        dir={isRtl ? 'rtl' : 'ltr'}
        className={`mt-5 text-[clamp(1rem,1.35vw,1.1875rem)] leading-[1.6] ${
          isRtl ? 'font-arabic' : ''
        } font-medium text-ink text-pretty`}
      >
        {item.text}
      </blockquote>

      {showTranslation && (
        <figcaption className="mt-5">
          <p className="label label--accent">{t.reviews.translation}</p>
          <p
            lang="en"
            dir="ltr"
            className="mt-2 text-[0.875rem] leading-relaxed text-ink-body text-pretty"
          >
            {item.textEn}
          </p>
        </figcaption>
      )}
    </figure>
  );
}
