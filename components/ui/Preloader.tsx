'use client';

import { useEffect, useRef, useState } from 'react';

import { gsap, registerGsap } from '@/lib/gsap';
import { useLocale } from '@/components/i18n/LocaleProvider';
import { useMotion } from '@/components/motion/MotionProvider';
import { Logo } from '@/components/ui/Logo';

/**
 * Minimal preloader: logo, a hairline progress rule, and a count.
 *
 * Deliberately short (~1.2s first visit, skipped entirely for repeat visits in
 * the same session via sessionStorage). It resolves on `window.load` or after a
 * hard 0.7s cap, whichever comes first, so a slow asset can never hold the page
 * hostage. Under reduced motion it never renders at all.
 */
export function Preloader({ onDone }: { onDone: () => void }) {
  const { reduced, setScrollLocked } = useMotion();
  const { t } = useLocale();
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const doneRef = useRef(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;

    if (reduced) {
      onDone();
      return;
    }

    // Skip entirely for repeat visits in the same browser session. The intro
    // is charming once; on a reload it is 1+ second of blank page in front of
    // content that is already cached and ready to read.
    try {
      if (sessionStorage.getItem('intro-seen')) {
        onDone();
        return;
      }
      sessionStorage.setItem('intro-seen', '1');
    } catch {
      /* storage blocked (private mode) — show the intro as usual */
    }

    const root = rootRef.current;
    const bar = barRef.current;
    const count = countRef.current;
    if (!root || !bar || !count) {
      onDone();
      return;
    }

    registerGsap();
    setScrollLocked(true);

    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      setScrollLocked(false);
      onDone();
    };

    // Absolute escape hatch, on setTimeout rather than the frame loop: if
    // rAF never runs, the GSAP timeline never completes and the preloader
    // would otherwise sit over the page forever with scroll locked.
    const bail = window.setTimeout(() => {
      finish();
      if (root) {
        root.style.transition = 'none';
        root.style.transform = 'translateY(-100%)';
        root.style.pointerEvents = 'none';
      }
    }, 1600);

    const ctx = gsap.context(() => {
      const state = { p: 0 };
      const tl = gsap.timeline();

      tl.to(state, {
        p: 100,
        duration: 0.45,
        ease: 'power2.inOut',
        onUpdate: () => {
          const v = Math.round(state.p);
          count.textContent = String(v).padStart(3, '0');
          gsap.set(bar, { scaleX: state.p / 100 });
        },
      })
        .to(root.querySelectorAll('[data-pre-fade]'), {
          opacity: 0,
          duration: 0.2,
          ease: 'power2.in',
        })
        .to(root, {
          yPercent: -100,
          duration: 0.55,
          ease: 'expo.inOut',
          onComplete: finish,
        });

      // Hard cap: never let the intro outstay its welcome.
      const cap = window.setTimeout(() => {
        tl.timeScale(3.5);
      }, 700);

      return () => window.clearTimeout(cap);
    }, root);

    return () => {
      window.clearTimeout(bail);
      ctx.revert();
      setScrollLocked(false);
    };
  }, [mounted, reduced, onDone, setScrollLocked]);

  if (!mounted || reduced) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] flex flex-col justify-between bg-paper px-[var(--gutter)] py-8"
      role="status"
      aria-live="polite"
      aria-label={t.preloader.loading}
    >
      <div data-pre-fade className="flex items-center justify-between">
        <Logo height={30} priority />
        <span className="label numeral">
          <span ref={countRef}>000</span>
        </span>
      </div>

      <div data-pre-fade className="flex flex-col gap-6">
        <p className="label">{t.identity.role}</p>
        <div className="h-px w-full bg-rule">
          <div
            ref={barRef}
            className="h-px w-full origin-left bg-accent"
            style={{ transform: 'scaleX(0)' }}
          />
        </div>
        <p className="text-[clamp(1.5rem,4vw,2.75rem)] font-medium leading-none tracking-[-0.035em]">
          {t.identity.name}
        </p>
      </div>
    </div>
  );
}
