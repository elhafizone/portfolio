'use client';

import { useEffect, useRef, useState } from 'react';

import { useMotion } from '@/components/motion/MotionProvider';
import { useSectionMotion } from '@/components/motion/useSectionMotion';
import { Quote } from '@/components/testimonials/Quote';
import { RatingsPanel } from '@/components/testimonials/RatingsPanel';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { profile } from '@/data/profile';
import { ratingSource, testimonials, testimonialsCopy } from '@/data/testimonials';
import { createCounter, createTestimonialsTimeline } from '@/lib/animations';
import { gsap, registerGsap } from '@/lib/gsap';

/**
 * Client feedback.
 *
 * Honesty constraints, enforced in the markup:
 *  - Reviews are quoted verbatim in the language the client wrote them, inside
 *    a real <blockquote> with the correct lang/dir.
 *  - The English underneath is labelled "Translation", never presented as the
 *    client's own words.
 *  - Client names, project titles and every number come from the public
 *    Mostaql profile, which is linked from the ratings panel so a visitor can
 *    check them.
 *  - The stats strip labels each number with what it actually measures.
 */
export function TestimonialsSection() {
  const rootRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const runwayRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const { reduced, ready } = useMotion();

  // Reduced motion reads every testimonial as a stacked list rather than being
  // stuck on entry 01 inside a stage that never advances.
  const stageEnabled = ready && !reduced;

  useSectionMotion(rootRef);

  useEffect(() => {
    if (!ready) return;
    const scene = sceneRef.current;
    if (!scene) return;

    registerGsap();
    const ctx = gsap.context(() => {
      createTestimonialsTimeline(runwayRef.current, {
        reduced,
        count: testimonials.length,
        onChange: setActive,
      });
    }, scene);

    return () => ctx.revert();
  }, [reduced, ready]);

  useEffect(() => {
    if (!ready) return;
    const ctx = gsap.context(() => {
      createCounter(countRef.current, ratingSource.totalRatings, { reduced });
    });
    return () => ctx.revert();
  }, [reduced, ready]);

  const current = testimonials[active];

  return (
    <section
      ref={rootRef}
      id="reviews"
      className="section border-t border-rule"
      aria-labelledby="reviews-heading"
    >
      <SectionHeading
        eyebrow={testimonialsCopy.eyebrow}
        titleId="reviews-heading"
        index="08"
        title={['What clients', <span key="s" className="serif-accent">say.</span>]}
        intro={testimonialsCopy.sourceNote}
      />

      {/* Credibility strip */}
      <div className="shell mt-14">
        <dl data-fade-group className="grid gap-x-8 gap-y-8 border-t border-rule pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {profile.facts.map((fact) => (
            <div key={fact.label} data-fade>
              <dt className="sr-only">{fact.label}</dt>
              <dd>
                <span className="numeral block text-[clamp(2.5rem,4.5vw,3.75rem)] font-medium leading-none tracking-[-0.045em] text-ink">
                  {fact.value === String(ratingSource.totalRatings) ? (
                    <span ref={countRef}>{ratingSource.totalRatings}</span>
                  ) : (
                    fact.value
                  )}
                </span>
                <span className="mt-3 block max-w-[15rem] text-sm leading-snug text-ink-mute">
                  {fact.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Ratings breakdown */}
      <div className="shell mt-16">
        <div data-fade-group>
          <RatingsPanel />
        </div>
      </div>

      {/* Desktop: sticky editorial reader */}
      <div ref={sceneRef} className={`mt-24 ${stageEnabled ? 'hidden lg:block' : 'hidden'}`}>
        <div ref={runwayRef} className="relative">
          <div data-testimonial-stage className="sticky top-0 flex h-[100svh] items-center">
          <div className="shell w-full">
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-7">
                <p className="label label--accent">Client review</p>
                <div
                  key={`q-${current.id}`}
                  className="mt-8"
                  style={{ animation: reduced ? undefined : 'tstIn 0.7s var(--ease-editorial) both' }}
                >
                  <Quote item={current} size="lg" />
                </div>
              </div>

              <div className="col-span-4 col-start-9 flex flex-col justify-end">
                <div
                  key={`m-${current.id}`}
                  className="border-t border-rule-strong pt-5"
                  style={{ animation: reduced ? undefined : 'tstIn 0.7s 0.08s var(--ease-editorial) both' }}
                >
                  <p className="label">Project</p>
                  <p
                    lang="ar"
                    dir="rtl"
                    className="mt-3 font-arabic text-[1.0625rem] leading-snug text-ink-soft text-pretty"
                  >
                    {current.projectTitle}
                  </p>
                  <p className="mt-2 text-[0.9375rem] leading-snug text-ink-mute text-pretty">
                    {current.projectTitleEn}
                  </p>

                  <p className="label mt-8">Client</p>
                  <p className="mt-3 text-[1.0625rem] tracking-[-0.015em] text-ink-soft">
                    {current.client}
                  </p>
                  <p className="label mt-2 text-ink-faint">
                    Verified on {current.platform}
                  </p>
                </div>
              </div>
            </div>

            {/* Counter */}
            <div className="mt-16 flex items-center gap-6 border-t border-rule pt-5">
              <span className="label numeral text-ink">
                {String(active + 1).padStart(2, '0')}
              </span>
              <div className="h-px flex-1 bg-rule">
                <div
                  className="h-px origin-left bg-accent transition-transform duration-500 ease-editorial"
                  style={{ transform: `scaleX(${(active + 1) / testimonials.length})` }}
                />
              </div>
              <span className="label numeral text-ink-faint">
                {String(testimonials.length).padStart(2, '0')}
              </span>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Below lg: vertical stack */}
      <div className={`shell mt-14 ${stageEnabled ? 'lg:hidden' : ''}`}>
        <ol data-fade-group className="border-t border-rule">
          {testimonials.map((item) => (
            <li key={item.id} data-fade className="border-b border-rule py-9">
              <p className="label label--accent">Client review</p>
              <div className="mt-4">
                <Quote item={item} size="sm" />
              </div>
              <p
                lang="ar"
                dir="rtl"
                className="mt-6 font-arabic text-sm leading-snug text-ink-mute"
              >
                {item.projectTitle}
              </p>
              <p className="mt-1 text-sm leading-snug text-ink-mute">{item.projectTitleEn}</p>
              <p className="label mt-3 text-ink-faint">
                {item.client} &middot; Verified on {item.platform}
              </p>
            </li>
          ))}
        </ol>
      </div>

      {/* Standing disclosure */}
      <div className="shell mt-10">
        <p
          data-fade
          className="max-w-2xl border-l-2 border-accent pl-4 text-sm leading-relaxed text-ink-mute"
        >
          {testimonialsCopy.translationNote}
        </p>
      </div>

      <style>{`
        @keyframes tstIn {
          from { opacity: 0; transform: translateY(20px); clip-path: inset(0 0 100% 0); }
          to { opacity: 1; transform: translateY(0); clip-path: inset(0 0 0% 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes tstIn { from { opacity: 1; } to { opacity: 1; } }
        }
      `}</style>
    </section>
  );
}
