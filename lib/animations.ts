'use client';

import { DURATION, EASE, MEDIA, SCROLL, STAGGER } from '@/config/motion';
import { gsap, registerGsap, ScrollTrigger } from '@/lib/gsap';

/**
 * Centralised ScrollTrigger / timeline factories.
 *
 * Every animated section calls one of these from inside a `gsap.context()` so
 * teardown is a single `ctx.revert()`. No component creates a raw ScrollTrigger
 * of its own, and no magic numbers live outside config/motion.ts.
 *
 * Contract for all factories:
 *   - they receive a root element and return nothing (context handles cleanup)
 *   - they must be safe to call when the DOM nodes they target do not exist
 *   - they must leave content VISIBLE if they bail out early
 */

type Root = HTMLElement | null;

/**
 * Emergency sweep: strips every motion-applied inline style in the document.
 *
 * Used when the animation loop turns out not to be running at all - a throttled
 * webview, a starved compositor, a tab that was backgrounded through first
 * paint. Without this, elements that GSAP had already moved to their from-state
 * would stay hidden forever, because nothing is left to animate them out of it.
 */
export function forceRevealAll(root: ParentNode = document) {
  registerGsap();

  const targets = root.querySelectorAll<HTMLElement>(
    [
      '[data-fade]',
      '[data-reveal] .reveal-line > span',
      '[data-mask-image] > *',
      '[data-hero="intro"]',
      '[data-hero="visual"]',
      '[data-hero="scroll-hint"]',
      '[data-hero="headline"]',
      '[data-hero="cta"]',
    ].join(',')
  );

  if (!targets.length) return;
  gsap.killTweensOf(targets);
  gsap.set(targets, { clearProps: 'all' });
}

/** Clears the CSS pre-hide states so content is never stranded invisible. */
function forceVisible(root: HTMLElement) {
  gsap.set(root.querySelectorAll('[data-fade]'), { opacity: 1, clearProps: 'opacity' });
  gsap.set(root.querySelectorAll('[data-reveal] .reveal-line > span'), {
    y: 0,
    clearProps: 'transform',
  });
  gsap.set(root.querySelectorAll('[data-mask-image] > *'), {
    clipPath: 'inset(0 0 0 0)',
    clearProps: 'clipPath',
  });
}

/* -------------------------------------------------------------------------- */
/* HERO                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * One coherent master entrance timeline: logo -> metadata -> headline ->
 * supporting copy -> CTA -> visual object. Not six independent tweens.
 */
export function createHeroTimeline(root: Root, opts: { reduced: boolean }) {
  if (!root) return;
  registerGsap();

  if (opts.reduced) {
    forceVisible(root);
    return;
  }

  const q = gsap.utils.selector(root);
  const tl = gsap.timeline({
    defaults: { ease: EASE.out, duration: DURATION.base },
    delay: 0.08,
  });

  tl.to(q('[data-hero="meta"] [data-fade]'), {
    opacity: 1,
    duration: DURATION.fast,
    stagger: STAGGER.items,
  })
    .to(
      q('[data-hero="headline"] .reveal-line > span'),
      { y: '0%', duration: DURATION.reveal, stagger: STAGGER.lines, ease: EASE.mask },
      '-=0.15'
    )
    .fromTo(
      q('[data-hero="intro"]'),
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: DURATION.base },
      '-=0.55'
    )
    .fromTo(
      q('[data-hero="cta"] [data-fade]'),
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: DURATION.base, stagger: STAGGER.items },
      '-=0.5'
    )
    .to(q('[data-hero="stats"] [data-fade]'), { opacity: 1, stagger: 0.06 }, '-=0.6');

  return tl;
}

/**
 * Scroll choreography: the hero compresses into the next scene rather than
 * simply scrolling away. Background stays white throughout.
 *
 * This targets ONLY [data-hero-layer] wrappers. The entrance timeline owns the
 * inner nodes, so the two never write to the same property on the same element
 * and this trigger can be created immediately - keeping page-wide trigger order
 * correct for the pinned sections below.
 */
export function createHeroScrollTransition(root: Root, opts: { reduced: boolean }) {
  if (!root || opts.reduced) return;
  registerGsap();

  const mm = gsap.matchMedia();

  mm.add(MEDIA.desktop, () => {
    const q = gsap.utils.selector(root);
    gsap
      .timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      })
      .to(q('[data-hero-layer="headline"]'), { yPercent: -14, scale: 0.94, opacity: 0.15 }, 0)
      .to(q('[data-hero-layer="copy"]'), { yPercent: -34, opacity: 0 }, 0)
      .to(q('[data-hero-layer="baseline"]'), { opacity: 0 }, 0);
  });

  return mm;
}

/* -------------------------------------------------------------------------- */
/* GENERIC REVEALS                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Wires every [data-reveal] / [data-fade] / [data-mask-image] element inside a
 * root to a scroll-triggered reveal. This is the workhorse used by most
 * sections, so individual components never write ScrollTrigger code.
 */
export function createSectionReveals(root: Root, opts: { reduced: boolean }) {
  if (!root) return;
  registerGsap();

  if (opts.reduced) {
    forceVisible(root);
    return;
  }

  // Line/word reveals.
  root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    const lines = el.querySelectorAll('.reveal-line > span');
    if (!lines.length) return;
    gsap.to(lines, {
      y: '0%',
      duration: DURATION.reveal,
      ease: EASE.mask,
      stagger: STAGGER.lines,
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
    });
  });

  // Simple fades, optionally staggered as a group via [data-fade-group].
  root.querySelectorAll<HTMLElement>('[data-fade-group]').forEach((group) => {
    const items = group.querySelectorAll('[data-fade]');
    if (!items.length) return;
    gsap.fromTo(
      items,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: DURATION.base,
        ease: EASE.out,
        stagger: STAGGER.items,
        clearProps: 'transform',
        scrollTrigger: { trigger: group, start: 'top 88%', toggleActions: 'play none none none' },
      }
    );
  });

  root.querySelectorAll<HTMLElement>('[data-fade]').forEach((el) => {
    if (el.closest('[data-fade-group]')) return;
    gsap.fromTo(
      el,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: DURATION.base,
        ease: EASE.out,
        clearProps: 'transform',
        scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
      }
    );
  });

  // Image mask reveals: inset wipe plus a settling scale.
  root.querySelectorAll<HTMLElement>('[data-mask-image]').forEach((el) => {
    const inner = el.firstElementChild;
    if (!inner) return;
    gsap
      .timeline({ scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' } })
      .to(inner, {
        clipPath: 'inset(0 0% 0 0)',
        duration: DURATION.reveal,
        ease: EASE.mask,
      })
      .fromTo(
        inner,
        { scale: 1.08 },
        { scale: 1, duration: DURATION.slow, ease: EASE.out },
        0
      );
  });
}

/* -------------------------------------------------------------------------- */
/* PARALLAX                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Reusable parallax driven by `data-speed`. Positive moves slower than scroll,
 * negative moves against it. Transform-only, so it never triggers layout.
 */
export function createParallax(root: Root, opts: { reduced: boolean }) {
  if (!root || opts.reduced) return;
  registerGsap();

  const mm = gsap.matchMedia();

  mm.add(MEDIA.desktop, () => {
    root.querySelectorAll<HTMLElement>('[data-speed]').forEach((el) => {
      const speed = parseFloat(el.dataset.speed ?? '0');
      if (!speed) return;
      gsap.to(el, {
        yPercent: speed * 100,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('[data-parallax-scope]') ?? el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });
  });

  return mm;
}

/* -------------------------------------------------------------------------- */
/* STICKY STAGES                                                               */
/* -------------------------------------------------------------------------- */

/*
 * All four scroll-driven scenes use the same shape:
 *
 *   <runway style="height: Npx">        <- provides the scroll distance
 *     <stage class="sticky top-0 h-svh"> <- holds still while the runway passes
 *
 * The stage is held by CSS `position: sticky`, NOT by ScrollTrigger's `pin`.
 * That is deliberate. Pinning reparents the element into a generated
 * `.pin-spacer`, switches it to `position: fixed`, and depends on every trigger
 * on the page being refreshed in document order. With four pinned scenes, a
 * smooth-scroll layer, and React re-running effects, any one of those going
 * stale makes scenes render on top of each other - the glitching and overlap
 * seen while scrolling.
 *
 * Sticky has none of those failure modes: it is ordinary layout, so scenes
 * cannot overlap, nothing is reparented, and a stale ScrollTrigger can at worst
 * leave the active index wrong - never the layout broken.
 *
 * ScrollTrigger is therefore reduced to what it is genuinely good at here:
 * reporting progress. It no longer owns any layout.
 */

/** Keeps a runway's height in sync with the scroll distance a scene needs. */
function sizeRunway(runway: HTMLElement, extraPx: () => number) {
  const apply = () => {
    runway.style.height = `${window.innerHeight + Math.max(0, extraPx())}px`;
  };
  apply();
  return apply;
}

/** Maps scroll progress (0-1) onto a discrete step index. */
function stepFromProgress(progress: number, count: number) {
  return Math.min(count - 1, Math.max(0, Math.floor(progress * count * 0.999)));
}

/* -------------------------------------------------------------------------- */
/* HORIZONTAL PROJECTS                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Converts vertical scroll into horizontal travel across the project rail.
 *
 * Desktop only - below lg the markup is a plain vertical list and this never
 * runs, so touch devices are never forced into horizontal scrolling.
 */
export function createHorizontalProjects(
  root: Root,
  opts: {
    reduced: boolean;
    /** Reverses the travel so the rail reads right-to-left in Arabic. */
    rtl?: boolean;
    runway: HTMLElement | null;
    track: HTMLElement | null;
    progressBar: HTMLElement | null;
    onIndexChange?: (index: number) => void;
  }
) {
  if (!root || !opts.track || !opts.runway || opts.reduced) return;
  registerGsap();

  const mm = gsap.matchMedia();

  mm.add(MEDIA.desktop, () => {
    const track = opts.track;
    const runway = opts.runway;
    if (!track || !runway) return;

    const panels = gsap.utils.toArray<HTMLElement>('[data-project-panel]', track);
    if (panels.length < 2) return;

    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const resize = sizeRunway(runway, () => distance() + window.innerHeight * SCROLL.horizontalPadding);
    ScrollTrigger.addEventListener('refreshInit', resize);

    // In RTL the overflow extends to the left, so the track travels the
    // other way: the gallery starts at the right edge, as Arabic reads.
    const sign = opts.rtl ? 1 : -1;

    /*
      Depth pass.

      This used to be two `containerAnimation` ScrollTriggers per panel. That
      technique assumes the container travels in the NEGATIVE x direction — the
      only direction a left-to-right rail moves. In RTL the track tweens to
      `x: +distance`, so `start: 'left right'` never resolved into a progressing
      range and every panel stayed frozen at its from-state, which read on the
      page as a translucent sheet lying over the whole Arabic section.

      So position is measured instead of inferred. Each panel's offset inside
      the track is captured once per refresh; the paint below derives where that
      panel currently sits on screen from the track's own x. No assumption about
      travel direction survives, and LTR and RTL run the identical code path.
    */
    type PanelGeom = {
      off: number;
      w: number;
      media: HTMLElement | null;
      meta: HTMLElement | null;
    };
    let geom: PanelGeom[] = [];
    /** Where the track sits with x = 0. */
    let originX = 0;

    const trackX = () => (gsap.getProperty(track, 'x') as number) || 0;

    const measure = () => {
      const x = trackX();
      const trackLeft = track.getBoundingClientRect().left;
      originX = trackLeft - x;
      geom = panels.map((panel) => {
        const r = panel.getBoundingClientRect();
        return {
          off: r.left - trackLeft,
          w: r.width,
          media: panel.querySelector<HTMLElement>('[data-project-media]'),
          meta: panel.querySelector<HTMLElement>('[data-project-meta]'),
        };
      });
    };

    /** Entering edge: panels arrive from the right in LTR, the left in RTL. */
    const enterSide = opts.rtl ? -1 : 1;

    /*
      NO OPACITY IS APPLIED TO THE TEXT. Do not reintroduce it.

      The rail used to fade each panel's text from 0.45 up to 1 as it travelled
      towards the centre. Two things were wrong with that:

        - Only one panel is ever near the centre, so at any given moment most
          project names on screen were sitting at 45% — which is simply a pale
          project name, whatever the intent behind it.
        - The rail stops at `scrollWidth - innerWidth`, so the LAST panel never
          reaches the centre at all and could never finish fading in.

      Depth now comes from the horizontal drift alone, which costs the text
      nothing in legibility.
    */
    const paint = () => {
      const x = trackX();
      const half = window.innerWidth / 2;
      for (const g of geom) {
        // -1 = hard against the left edge, 0 = centred, +1 = against the right.
        const s = gsap.utils.clamp(-1, 1, (originX + x + g.off + g.w / 2 - half) / (half + g.w / 2));

        // Imagery drifts with screen position, so it counter-moves the travel
        // in whichever direction the rail happens to run.
        if (g.media) gsap.set(g.media, { xPercent: 6 * s });

        // Typography drifts against the imagery, at a third of the distance.
        if (g.meta) gsap.set(g.meta, { xPercent: enterSide * -2 * s });
      }
    };

    const remeasure = () => {
      measure();
      paint();
    };

    gsap.to(track, {
      x: () => sign * distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: runway,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.8,
        invalidateOnRefresh: true,
        onRefresh: remeasure,
        onUpdate: (self) => {
          if (opts.progressBar) gsap.set(opts.progressBar, { scaleX: self.progress });
          opts.onIndexChange?.(stepFromProgress(self.progress, panels.length));
          paint();
        },
      },
    });

    remeasure();

    return () => {
      ScrollTrigger.removeEventListener('refreshInit', resize);
      runway.style.height = '';
      // These are painted from a scroll callback, so the context that owns this
      // scene never recorded them and cannot revert them for us.
      geom.forEach((g) => {
        if (g.media) gsap.set(g.media, { clearProps: 'transform' });
        if (g.meta) gsap.set(g.meta, { clearProps: 'transform' });
      });
    };
  });

  return mm;
}

/* -------------------------------------------------------------------------- */
/* STEPPED SCENES (services, process, testimonials)                            */
/* -------------------------------------------------------------------------- */

/**
 * Shared driver for every scene that advances through a list of steps as the
 * runway scrolls past its sticky stage.
 */
function createSteppedScene(
  runway: HTMLElement | null,
  opts: {
    reduced: boolean;
    count: number;
    stepFactor: number;
    onChange: (index: number) => void;
    onProgress?: (progress: number) => void;
  }
) {
  if (!runway || opts.reduced || opts.count < 2) return;
  registerGsap();

  const mm = gsap.matchMedia();

  mm.add(MEDIA.desktop, () => {
    const resize = sizeRunway(
      runway,
      () => window.innerHeight * opts.stepFactor * (opts.count - 1)
    );
    ScrollTrigger.addEventListener('refreshInit', resize);

    ScrollTrigger.create({
      trigger: runway,
      start: 'top top',
      end: 'bottom bottom',
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        opts.onChange(stepFromProgress(self.progress, opts.count));
        opts.onProgress?.(self.progress);
      },
    });

    return () => {
      ScrollTrigger.removeEventListener('refreshInit', resize);
      runway.style.height = '';
    };
  });

  return mm;
}

/** Services: the numeral, the typography and the line drawing change together. */
export function createServiceTimeline(
  runway: HTMLElement | null,
  opts: {
    reduced: boolean;
    count: number;
    onChange: (index: number) => void;
    progressBar?: HTMLElement | null;
  }
) {
  return createSteppedScene(runway, {
    reduced: opts.reduced,
    count: opts.count,
    stepFactor: SCROLL.servicePerStep,
    onChange: opts.onChange,
    onProgress: (p) => {
      if (opts.progressBar) gsap.set(opts.progressBar, { scaleY: p });
    },
  });
}

/** Process: big numeral, changing statement, progress line. */
export function createProcessTimeline(
  runway: HTMLElement | null,
  opts: {
    reduced: boolean;
    count: number;
    onChange: (index: number) => void;
    line?: HTMLElement | null;
  }
) {
  return createSteppedScene(runway, {
    reduced: opts.reduced,
    count: opts.count,
    stepFactor: SCROLL.processPerStep,
    onChange: opts.onChange,
    onProgress: (p) => {
      if (opts.line) gsap.set(opts.line, { scaleX: p });
    },
  });
}
