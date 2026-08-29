import type { Testimonial } from '@/data/testimonials';

type Props = {
  item: Testimonial;
  /** Display size. The sticky reader runs large, the mobile list runs smaller. */
  size: 'lg' | 'sm';
};

/**
 * A single client review.
 *
 * The quotation is the client's own language, marked with the right `lang` and
 * `dir` so browsers and screen readers shape and read it correctly. The English
 * underneath is explicitly labelled a translation, because it is not what the
 * client wrote — presenting a translation as the quote would misattribute
 * words to a real, named person.
 */
export function Quote({ item, size }: Props) {
  const isRtl = item.lang === 'ar';
  const quoteClass =
    size === 'lg'
      ? 'text-[clamp(1.6rem,2.7vw,2.5rem)] leading-[1.35]'
      : 'text-[clamp(1.2rem,4.6vw,1.5rem)] leading-[1.45]';

  return (
    <figure className="m-0">
      <blockquote
        lang={item.lang}
        dir={isRtl ? 'rtl' : 'ltr'}
        className={`${quoteClass} ${isRtl ? 'font-arabic' : ''} font-medium tracking-[-0.01em] text-ink text-pretty`}
      >
        {item.text}
      </blockquote>

      <figcaption className="mt-6">
        <p className="label label--accent">Translation</p>
        <p
          lang="en"
          dir="ltr"
          className={`mt-2 max-w-2xl ${
            size === 'lg' ? 'text-[1.0625rem]' : 'text-[0.9375rem]'
          } leading-relaxed text-ink-mute text-pretty`}
        >
          {item.textEn}
        </p>
      </figcaption>
    </figure>
  );
}
