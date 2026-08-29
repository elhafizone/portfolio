'use client';

import { useEffect, useRef } from 'react';

import { HeroImage } from '@/components/hero/HeroImage';
import { useIntroDone } from '@/components/layout/SiteShell';
import { useMotion } from '@/components/motion/MotionProvider';
import { SplitText } from '@/components/motion/SplitText';
import { Button } from '@/components/ui/Button';
import { heroCopy, profile } from '@/data/profile';
import { createHeroScrollTransition, createHeroTimeline } from '@/lib/animations';
import { gsap, registerGsap } from '@/lib/gsap';

/**
 * Two independent motion systems share this section, so they are kept strictly
 * apart:
 *
 *   - The ENTRANCE timeline animates inner nodes  ([data-hero="..."]).
 *   - The SCROLL transition animates layer wrappers ([data-hero-layer="..."]).
 *
 * No element is touched by both. That separation is what lets the scroll
 * trigger be created immediately rather than being deferred until the entrance
 * finishes - a deferred trigger registers out of document order, which left the
 * scenes below it resolving against stale measurements.
 *
 * The right-hand cell holds a fixed-ratio image, not a canvas. A WebGL canvas
 * sized itself from its container while the container was `height: 100%`, and
 * the pair grew on every resize.
 */
export function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const { reduced, ready, scrollTo } = useMotion();
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
      <div className="grid-lines" aria-hidden="true" />

      {/* Top metadata row */}
      <div className="shell relative z-10" data-hero="meta">
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-t border-rule pt-5">
          <span className="label label-marked" data-fade>
            {profile.role}
          </span>
          <span className="label numeral text-ink-faint" data-fade>
            01 &mdash; Introduction
          </span>
        </div>
      </div>

      {/* Headline + visual */}
      <div className="shell relative z-10 grid flex-1 content-center gap-10 py-12 lg:grid-cols-12 lg:gap-6 lg:py-8">
        <div className="lg:col-span-8 lg:pr-6 xl:col-span-7">
          <h1 id="hero-heading" className="sr-only">
            {profile.name} &mdash; {profile.role}
          </h1>

          <div data-hero-layer="headline">
            <SplitText
              aria-hidden="true"
              as="div"
              data-hero="headline"
              lines={[
                heroCopy.headline[0],
                <>
                  Building <span className="serif-accent">digital</span>
                </>,
                heroCopy.headline[2],
              ]}
              className="mega"
            />
          </div>

          <div data-hero-layer="copy">
            <p data-hero="intro" className="lead mt-8 max-w-xl lg:mt-10">
              {heroCopy.intro}
            </p>

            <div
              data-hero="cta"
              className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center lg:mt-11"
            >
              <span data-fade>
                <Button href={heroCopy.primaryCta.href} cursorLabel="VIEW" withArrow>
                  {heroCopy.primaryCta.label}
                </Button>
              </span>
              <span data-fade>
                <Button
                  href={heroCopy.secondaryCta.href}
                  variant="secondary"
                  cursorLabel="TALK"
                >
                  {heroCopy.secondaryCta.label}
                </Button>
              </span>
            </div>
          </div>
        </div>

        {/* Visual object */}
        <div
          data-hero-layer="visual"
          className="lg:col-span-4 lg:-mr-6 lg:self-center xl:col-span-5"
        >
          <div data-hero="visual" className="mx-auto w-full max-w-[26rem] lg:max-w-none">
            <HeroImage />
          </div>
        </div>
      </div>

      {/* Baseline: stats + scroll hint */}
      <div className="shell relative z-10" data-hero-layer="baseline">
        <div
          data-hero="stats"
          className="flex flex-col gap-5 border-t border-rule pt-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <dl className="flex flex-wrap items-baseline gap-x-10 gap-y-3">
            {heroCopy.meta.map((item) => (
              <div key={item.label} data-fade className="flex items-baseline gap-3">
                <dt className="label text-ink-faint">{item.label}</dt>
                <dd className="text-[0.9375rem] tracking-[-0.01em] text-ink">{item.value}</dd>
              </div>
            ))}
          </dl>

          <button
            type="button"
            data-fade
            onClick={() => scrollTo('#work')}
            className="label group flex items-center gap-3 self-start transition-colors hover:text-accent-ink sm:self-auto"
            data-cursor-label="VIEW"
          >
            Scroll to work
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
