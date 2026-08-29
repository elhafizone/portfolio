'use client';

import { useEffect, useRef, type ReactNode } from 'react';

import { DURATION, EASE } from '@/config/motion';
import { gsap, hasFinePointer, prefersReducedMotion, registerGsap } from '@/lib/gsap';

type MagneticProps = {
  children: ReactNode;
  /** Pull strength as a fraction of the pointer offset. Keep it subtle. */
  strength?: number;
  /** How far outside the element the pull starts, in px. */
  radius?: number;
  className?: string;
};

/**
 * Wraps an interactive element so it leans slightly toward the pointer.
 *
 * Disabled entirely on touch/coarse pointers and under reduced motion. The
 * wrapper never intercepts events - it only moves - so the child button or
 * link keeps its normal click, focus and keyboard behaviour.
 */
export function MagneticButton({
  children,
  strength = 0.28,
  radius = 90,
  className,
}: MagneticProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!hasFinePointer() || prefersReducedMotion()) return;

    registerGsap();
    const ctx = gsap.context(() => {
      const inner = el.firstElementChild as HTMLElement | null;
      if (!inner) return;

      const setX = gsap.quickTo(el, 'x', { duration: 0.55, ease: EASE.magnetic });
      const setY = gsap.quickTo(el, 'y', { duration: 0.55, ease: EASE.magnetic });
      const setIX = gsap.quickTo(inner, 'x', { duration: 0.75, ease: EASE.magnetic });
      const setIY = gsap.quickTo(inner, 'y', { duration: 0.75, ease: EASE.magnetic });

      const onMove = (e: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const distance = Math.hypot(dx, dy);
        const reach = Math.max(rect.width, rect.height) / 2 + radius;

        if (distance > reach) {
          setX(0);
          setY(0);
          setIX(0);
          setIY(0);
          return;
        }

        const falloff = 1 - distance / reach;
        setX(dx * strength * falloff);
        setY(dy * strength * falloff);
        // The label trails the container slightly - that lag is what sells it.
        setIX(dx * strength * 0.35 * falloff);
        setIY(dy * strength * 0.35 * falloff);
      };

      const reset = () => {
        gsap.to([el, inner], {
          x: 0,
          y: 0,
          duration: DURATION.fast,
          ease: EASE.magnetic,
        });
      };

      window.addEventListener('pointermove', onMove, { passive: true });
      el.addEventListener('pointerleave', reset);

      return () => {
        window.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerleave', reset);
      };
    }, el);

    return () => ctx.revert();
  }, [radius, strength]);

  return (
    <span ref={ref} className={className} style={{ display: 'inline-block', willChange: 'transform' }}>
      {children}
    </span>
  );
}
