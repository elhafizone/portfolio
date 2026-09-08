'use client';

import { useEffect, useRef } from 'react';

import { useLocale } from '@/components/i18n/LocaleProvider';
import { RippleField } from '@/components/hero/RippleField';
import { useIntroDone } from '@/components/layout/SiteShell';
import { useMotion } from '@/components/motion/MotionProvider';
import { SplitText } from '@/components/motion/SplitText';
import { Button } from '@/components/ui/Button';
import { createHeroScrollTransition, createHeroTimeline } from '@/lib/animations';
import { gsap, registerGsap } from '@/lib/gsap';

/**
 * Centred hero over a live water surface.
 *
 * Two independent motion systems share this section, so they are kept strictly
 * apart:
 *
 *   - The ENTRANCE timeline animates inner nodes  ([data-hero="..."]).
 *   - The SCROLL transition animates layer wrappers ([data-hero-layer="..."]).
 *
 * No element is touched by both. That separation is what lets the scroll
 * trigger be created immediately rather than being deferred until the entrance
 * finishes — a deferred trigger registers out of document order, which left the
 * scenes below it resolving against stale measurements.
 *
 * The background is `RippleField`, which paints its own CSS gradient and only
 * then layers a WebGL water simulation on top of it. It sits in its own
 * absolutely-positioned layer BEHIND the content, and the text sits in a
 * `pointer-events-none` wrapper so the whole hero surface stays reachable by the
 * pointer — the ripples must respond across the full section, not only in the
 * gaps between words. The links and buttons re-enable pointer events for
 * themselves.
 */
export function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const { reduced, ready, scrollTo } = useMotion();
  const { t } = useLocale();
  const introDone = useIntroDone();

  // The scroll transition is independent of the preloader and is created up
  // front so page-wide trigger order is correct.
  useEffect(() => {
    if (!ready) return;
    const root = rootRef.current;
    if (!root) return;

    registerGsap();
    const ctx = gsap.context(() => {
      createHeroScrollTransition(root, { reduced });
    }, root);

    return () => ctx.revert();
  }, [ready, reduced]);

  // The entrance waits for the preloader so it is not played behind a curtain.
  useEffect(() => {
    if (!ready) return;
    const root = rootRef.current;
    if (!root) return;
    if (!introDone && !reduced) return;

    registerGsap();
    const ctx = gsap.context(() => {
      createHeroTimeline(root, { reduced });
    }, root);

    return () => ctx.revert();
  }, [ready, reduced, introDone]);

  return (
    <section
      ref={rootRef}
      id="top"
      aria-labelledby="hero-heading"
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden pb-10 pt-28 sm:pt-32 lg:pb-14 lg:pt-36"
    >
      <RippleField />

      {/* Top metadata row */}
      <div className="shell pointer-events-none relative z-10" data-hero="meta">
        <div className="border-t border-rule/70 pt-5 text-center">
          <span className="label label-marked" data-fade>
            {t.identity.role}
          </span>
        </div>
      </div>

      {/* Centred headline + copy */}
      <div className="shell pointer-events-none relative z-10 flex flex-1 flex-col items-center justify-center py-12 text-center lg:py-8">
        <h1 id="hero-heading" className="sr-only">
          {t.identity.name} &mdash; {t.identity.role}
        </h1>

        <div data-hero-layer="headline" className="w-full">
          <SplitText
            aria-hidden="true"
            as="div"
            data-hero="headline"
            lines={[
              t.hero.headline[0],
              <>
                {t.hero.headline[1]} <span className="serif-accent">{t.hero.accentWord}</span>
              </>,
              t.hero.headline[2],
            ]}
            className="mega mx-auto max-w-5xl"
          />
        </div>

        <div data-hero-layer="copy" className="w-full">
          <p data-hero="intro" className="lead mx-auto mt-8 max-w-2xl lg:mt-10">
            {t.hero.intro}
          </p>

          <div
            data-hero="cta"
            className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:mt-11"
          >
            <span data-fade className="pointer-events-auto">
              <Button href="#work" cursorLabel="VIEW" withArrow>
                {t.hero.primaryCta}
              </Button>
            </span>
            <span data-fade className="pointer-events-auto">
              <Button href="#contact" variant="secondary" cursorLabel="TALK">
                {t.hero.secondaryCta}
              </Button>
            </span>
          </div>
        </div>
      </div>

      {/* Baseline: stats + scroll hint */}
      <div className="shell pointer-events-none relative z-10" data-hero-layer="baseline">
        <div
          data-hero="stats"
          className="flex flex-col gap-5 border-t border-rule/70 pt-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <dl className="flex flex-wrap items-baseline justify-center gap-x-10 gap-y-3 sm:justify-start">
            {t.hero.meta.map((item) => (
              <div key={item.label} data-fade className="flex items-baseline gap-3">
                <dt className="label text-ink-mute">{item.label}</dt>
                <dd className="text-[0.9375rem] tracking-[-0.01em] text-ink">{item.value}</dd>
              </div>
            ))}
          </dl>

          <button
            type="button"
            data-fade
            onClick={() => scrollTo('#work')}
            className="label group pointer-events-auto flex items-center gap-3 self-center transition-colors hover:text-accent-ink sm:self-auto"
            data-cursor-label="VIEW"
          >
            {t.hero.scrollHint}
            <span
              aria-hidden="true"
              className="inline-block transition-transform duration-500 ease-editorial group-hover:translate-y-0.5"
            >
              &darr;
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
