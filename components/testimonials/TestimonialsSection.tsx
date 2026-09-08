'use client';

import { useRef } from 'react';

import { useLocale } from '@/components/i18n/LocaleProvider';
import { useSectionMotion } from '@/components/motion/useSectionMotion';
import { Quote } from '@/components/testimonials/Quote';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { testimonials } from '@/data/testimonials';

/**
 * Client feedback.
 *
 * A plain two-column reading grid — no sticky stage, no counter, no platform
 * badge. The reviews are short, so a reader takes them in faster side by side
 * than one at a time through a scroll-driven carousel.
 *
 * Honesty constraints, enforced in the markup:
 *  - Reviews are quoted verbatim in the language the client wrote them, inside
 *    a real <blockquote> with the correct lang/dir.
 *  - The English underneath is labelled "Translation", never presented as the
 *    client's own words, and is hidden from Arabic readers who do not need it.
 *  - Nothing identifies the client. Names, project titles and platform were
 *    removed at Mohammed's request — do not add them back.
 */
export function TestimonialsSection() {
  const rootRef = useRef<HTMLElement>(null);
  const { t } = useLocale();

  useSectionMotion(rootRef);

  return (
    <section ref={rootRef} id="reviews" className="section" aria-labelledby="reviews-heading">
      <SectionHeading
        eyebrow={t.reviews.eyebrow}
        titleId="reviews-heading"
        title={[
          t.reviews.title[0],
          <span key="s" className="serif-accent">
            {t.reviews.title[1]}
          </span>,
        ]}
        intro={t.reviews.intro}
      />

      <div className="shell mt-14 lg:mt-20">
        <ul data-fade-group className="grid gap-x-10 gap-y-0 border-t border-rule sm:grid-cols-2">
          {testimonials.map((item) => (
            <li
              key={item.id}
              data-fade
              /* The vertical rule sits between the pair, so it is drawn on the
                 second column only and only from the point the grid actually
                 has two columns. */
              className="border-b border-rule py-9 sm:[&:nth-child(even)]:border-s sm:[&:nth-child(even)]:ps-10"
            >
              <Quote item={item} />
            </li>
          ))}
        </ul>
      </div>

      {/* Standing disclosure */}
      <div className="shell mt-10">
        <p
          data-fade
          className="max-w-2xl border-s-2 border-accent ps-4 text-sm leading-relaxed text-ink-body"
        >
          {t.reviews.translationNote}
        </p>
      </div>
    </section>
  );
}
