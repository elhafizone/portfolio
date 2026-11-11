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
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden pb-8 pt-24 sm:pt-28 lg:h-[100svh] lg:min-h-[540px] lg:pb-5 lg:pt-24"
    >
      {/* the waves are gone: ORI, leaning out of the hero's bottom edge, is the hero now */}
      <RippleField calm />

      {/* Top metadata row */}
      <div className="shell pointer-events-none relative z-10" data-hero="meta">
        <div className="border-t border-rule/70 pt-5 text-start">
          <span className="label label-marked" data-fade>
            {t.identity.role}
          </span>
        </div>
      </div>

      {/* Text on the start side, ORI's window on the end side (mirrors itself in RTL) */}
      <div className="shell relative z-10 grid flex-1 grid-cols-1 items-center gap-6 py-10 lg:grid-cols-[1.08fr_0.92fr] lg:py-6">
        <div className="pointer-events-none text-start">
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
              className="mega !text-[clamp(2.3rem,min(5.2vw,9vh),5.6rem)]"
            />
          </div>

          <div data-hero-layer="copy" className="w-full">
            <p data-hero="intro" className="lead mt-5 max-w-xl lg:mt-[min(1.75rem,3vh)]">
              {t.hero.intro}
            </p>

            <div data-hero="cta" className="mt-6 flex flex-col items-start gap-3 sm:flex-row lg:mt-[min(2rem,3.5vh)]">
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

        {/* ORI's window: an empty anchor. OriCompanion sizes ORI to it and leans it on the
            section's bottom edge (the sill). */}
        <div data-ori-window aria-hidden="true" className="pointer-events-none h-[34svh] min-h-[220px] lg:h-full lg:min-h-[420px]" />
      </div>

      {/* Baseline: stats + scroll hint */}
      <div className="shell pointer-events-none relative z-10" data-hero-layer="baseline">
        <div
          data-hero="stats"
          className="flex flex-col gap-5 border-t border-rule/70 pt-5 sm:flex-row sm:items-center sm:gap-12 lg:max-w-[54%]"
        >
          <dl className="flex flex-wrap items-baseline justify-start gap-x-10 gap-y-3">
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
            className="label group pointer-events-auto flex items-center gap-3 self-start transition-colors hover:text-accent-ink sm:self-auto"
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
      {/* the sill ORI leans on */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-px bg-rule" />
    </section>
  );
}
