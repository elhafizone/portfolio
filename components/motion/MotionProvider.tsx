'use client';

import Lenis from 'lenis';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { HEADER_OFFSET } from '@/config/motion';
import { forceRevealAll } from '@/lib/animations';
import { gsap, registerGsap, ScrollTrigger } from '@/lib/gsap';

type MotionContextValue = {
  /** True when the OS asks for reduced motion. Drives every animation decision. */
  reduced: boolean;
  /** True once the client has mounted - guards SSR/client mismatch. */
  ready: boolean;
  /** Smooth-scrolls to a selector or offset, honouring reduced motion. */
  scrollTo: (target: string | number, offset?: number) => void;
  /** Locks/unlocks page scroll (used by the mobile menu and the preloader). */
  setScrollLocked: (locked: boolean) => void;
};

const MotionContext = createContext<MotionContextValue>({
  reduced: false,
  ready: false,
  scrollTo: () => {},
  setScrollLocked: () => {},
});

export const useMotion = () => useContext(MotionContext);

/** Frames required within the watchdog window for motion to be considered viable. */
const MIN_FRAMES = 20;
const WATCHDOG_MS = 2500;

export function MotionProvider({ children }: { children: ReactNode }) {
  const [prefersReduced, setPrefersReduced] = useState(false);
  const [stalled, setStalled] = useState(false);
  const [ready, setReady] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);

  // A stalled frame loop is treated exactly like a reduced-motion preference:
  // no smooth scroll, no scroll-driven timelines, all content visible.
  const reduced = prefersReduced || stalled;

  /* --- reduced-motion tracking ------------------------------------------ */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      setPrefersReduced(mq.matches);
      document.documentElement.dataset.motion = mq.matches ? 'off' : 'on';
    };
    sync();
    setReady(true);
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  /* --- frame-loop watchdog ----------------------------------------------
   * requestAnimationFrame is not guaranteed to run: throttled webviews, some
   * embedded browsers, and tabs backgrounded through first paint can all starve
   * it indefinitely. Because the reveal system pre-hides elements, a dead frame
   * loop would otherwise leave a visitor staring at a blank page. setTimeout
   * keeps running in those conditions, so it makes a reliable referee.
   */
  useEffect(() => {
    if (prefersReduced || stalled) return;

    let frames = 0;
    let rafId = 0;
    let watchdog = 0;
    let cancelled = false;

    const stop = () => {
      cancelled = true;
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(watchdog);
    };

    const sample = () => {
      frames = 0;
      cancelled = false;

      // Counting frames rather than waiting for a single one: a loop that fires
      // once and then stalls is just as broken as one that never starts, and it
      // is the more common failure - the tab paints, then gets throttled.
      const tick = () => {
        if (cancelled) return;
        frames += 1;
        rafId = window.requestAnimationFrame(tick);
      };
      rafId = window.requestAnimationFrame(tick);

      watchdog = window.setTimeout(() => {
        window.cancelAnimationFrame(rafId);
        cancelled = true;

        // A hidden tab has no frame loop by design, and gets re-sampled when it
        // is shown. Judging it now would wrongly strip motion from a page the
        // visitor opened in the background.
        if (document.visibilityState !== 'visible') return;

        // MIN_FRAMES is roughly 8fps across the window; a healthy display
        // delivers well over 100. Below that, tweens barely advance, so
        // revealed content would crawl into view or stall outright.
        if (frames >= MIN_FRAMES) return;

        document.documentElement.dataset.motion = 'off';
        forceRevealAll();
        setStalled(true);
      }, WATCHDOG_MS);
    };

    const onVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      stop();
      sample();
    };

    sample();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [prefersReduced, stalled]);

  /* --- Lenis + ScrollTrigger, a single synchronised scroll system -------- */
  useEffect(() => {
    registerGsap();

    if (reduced) {
      // No smooth scrolling at all - native scrolling stays fully functional.
      lenisRef.current?.destroy();
      lenisRef.current = null;
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Touch devices keep their native scrolling - smoothing it feels wrong
      // and costs battery for no gain.
      syncTouch: false,
      touchMultiplier: 1.6,
      wheelMultiplier: 1,
    });
    lenisRef.current = lenis;

    // ScrollTrigger must read positions from Lenis, not from the raw scroll
    // event, or the two systems fight each other.
    lenis.on('scroll', ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  /* --- settle page-wide trigger state ------------------------------------
   * Sections register their own ScrollTriggers from their own effects, which
   * fire child-before-parent across a tree that re-runs when `ready` flips.
   * The sticky scenes size their scroll runways during `refreshInit`, so one
   * refresh after the tree has settled guarantees every runway is measured
   * against its final layout regardless of mount order. Sorting keeps
   * start/end resolution in document order.
   */
  useEffect(() => {
    if (!ready) return;
    const id = window.setTimeout(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    }, 0);
    return () => window.clearTimeout(id);
  }, [ready, reduced]);

  /* --- refresh triggers once webfonts settle ---------------------------- */
  useEffect(() => {
    if (!('fonts' in document)) return;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const scrollTo = useCallback(
    (target: string | number, offset?: number) => {
      // Anchors clear the fixed header by default; a numeric target is an
      // absolute position the caller already decided on, so it is left alone.
      const resolved =
        offset ?? (typeof target === 'string' ? -HEADER_OFFSET : 0);

      const lenis = lenisRef.current;
      if (lenis) {
        lenis.scrollTo(target, { offset: resolved, duration: 1.15 });
        return;
      }
      // Reduced-motion / no-Lenis path: plain, instant, still works.
      if (typeof target === 'number') {
        window.scrollTo({ top: target + resolved, behavior: 'auto' });
        return;
      }
      const el = document.querySelector(target);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY + resolved;
        window.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
      }
    },
    []
  );

  const setScrollLocked = useCallback((locked: boolean) => {
    const lenis = lenisRef.current;
    if (lenis) {
      if (locked) lenis.stop();
      else lenis.start();
    }
    document.documentElement.classList.toggle('lenis-stopped', locked);
    document.body.style.overflow = locked ? 'hidden' : '';
  }, []);

  const value = useMemo(
    () => ({ reduced, ready, scrollTo, setScrollLocked }),
    [reduced, ready, scrollTo, setScrollLocked]
  );

  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>;
}
