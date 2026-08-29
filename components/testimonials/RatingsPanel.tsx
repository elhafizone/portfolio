'use client';

import { useEffect, useRef } from 'react';

import { useMotion } from '@/components/motion/MotionProvider';
import { profile } from '@/data/profile';
import { ratingSource } from '@/data/testimonials';
import { gsap, registerGsap } from '@/lib/gsap';

/**
 * Platform ratings, presented as exactly what they are.
 *
 * Every number on this panel comes from the source rating page. The panel names
 * the platform in its own heading, states the sample size, and never rolls the
 * six categories into a single invented "overall score" - because the source
 * does not show one.
 */
export function RatingsPanel() {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced, ready } = useMotion();

  useEffect(() => {
    if (!ready) return;
    const root = ref.current;
    if (!root) return;

    registerGsap();
    const ctx = gsap.context(() => {
      const bars = root.querySelectorAll<HTMLElement>('[data-rating-bar]');

      if (reduced) {
        bars.forEach((bar) => {
          bar.style.transform = `scaleX(${bar.dataset.ratingBar ?? '1'})`;
        });
        return;
      }

      bars.forEach((bar) => {
        gsap.fromTo(
          bar,
          { scaleX: 0 },
          {
            scaleX: Number(bar.dataset.ratingBar ?? 1),
            duration: 1.1,
            ease: 'power3.out',
            scrollTrigger: { trigger: root, start: 'top 82%', toggleActions: 'play none none none' },
          }
        );
      });
    }, root);

    return () => ctx.revert();
  }, [reduced, ready]);

  return (
    <div ref={ref} className="border-t border-rule-strong pt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h3 className="label label-marked">
          {ratingSource.platform} client ratings
        </h3>
        <p className="label text-ink-faint">
          {ratingSource.totalRatings} ratings &middot; 6 criteria &middot; scale of{' '}
          {ratingSource.scale}
        </p>
      </div>

      <dl className="mt-8 grid gap-x-12 gap-y-6 sm:grid-cols-2">
        {ratingSource.categories.map((category) => (
          <div key={category.label} data-fade className="flex flex-col gap-2.5">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-[0.9375rem] tracking-[-0.01em] text-ink-soft">
                {category.label}
              </dt>
              <dd className="numeral text-[1.0625rem] font-medium text-ink">
                {category.score.toFixed(1)}
              </dd>
            </div>
            <div className="h-px w-full bg-rule" aria-hidden="true">
              <div
                data-rating-bar={category.score / ratingSource.scale}
                className="h-px w-full origin-left bg-accent"
                style={{ transform: 'scaleX(0)' }}
              />
            </div>
          </div>
        ))}
      </dl>

      {ratingSource.profileUrl ? (
        <div className="mt-8">
          <a
            href={ratingSource.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="label link-underline inline-flex items-center gap-2 text-accent-ink"
          >
            Verify on {ratingSource.platform} <span aria-hidden="true">&#8599;</span>
          </a>
          <p className="label mt-3 text-ink-faint">
            Profile listed as{' '}
            <span lang="ar" dir="rtl" className="font-arabic">
              {ratingSource.profileName}
            </span>{' '}
            &mdash; {profile.name} also works under this family name
          </p>
        </div>
      ) : (
        <p className="label mt-8 text-ink-faint">
          Source: {ratingSource.platform} client rating page
        </p>
      )}
    </div>
  );
}
