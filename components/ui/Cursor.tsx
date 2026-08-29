'use client';

import { useEffect, useRef, useState } from 'react';

import { gsap, hasFinePointer, prefersReducedMotion, registerGsap } from '@/lib/gsap';

type CursorState = {
  active: boolean;
  label: string;
};

/**
 * Minimal premium cursor.
 *
 * Rules:
 *  - Desktop fine pointers only. Never rendered for touch or coarse input.
 *  - Never rendered under prefers-reduced-motion.
 *  - Purely decorative: aria-hidden, pointer-events none. It cannot intercept
 *    a click, block a focus ring, or change what a keyboard user experiences.
 *  - Labels come from `data-cursor-label` on the hovered element, so sections
 *    declare their own copy ("VIEW", "OPEN", "EXPLORE").
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const stateRef = useRef<CursorState>({ active: false, label: '' });

  useEffect(() => {
    const allowed = hasFinePointer() && !prefersReducedMotion();
    setEnabled(allowed);
    document.documentElement.dataset.cursor = allowed ? 'on' : 'off';
    return () => {
      document.documentElement.dataset.cursor = 'off';
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const root = rootRef.current;
    const dot = dotRef.current;
    const label = labelRef.current;
    if (!root || !dot || !label) return;

    registerGsap();

    const ctx = gsap.context(() => {
      gsap.set(root, { xPercent: -50, yPercent: -50, opacity: 0 });

      const moveX = gsap.quickTo(root, 'x', { duration: 0.32, ease: 'power3' });
      const moveY = gsap.quickTo(root, 'y', { duration: 0.32, ease: 'power3' });
      let visible = false;

      const onMove = (e: PointerEvent) => {
        if (!visible) {
          visible = true;
          gsap.to(root, { opacity: 1, duration: 0.25 });
        }
        moveX(e.clientX);
        moveY(e.clientY);
      };

      const onOver = (e: PointerEvent) => {
        const target = e.target as HTMLElement | null;
        if (!target || typeof target.closest !== 'function') return;

        const labelled = target.closest<HTMLElement>('[data-cursor-label]');
        const interactive = target.closest(
          'a, button, input, textarea, select, [role="button"]'
        );

        const nextLabel = labelled?.dataset.cursorLabel ?? '';
        const nextActive = Boolean(labelled || interactive);
        const prev = stateRef.current;
        if (prev.active === nextActive && prev.label === nextLabel) return;
        stateRef.current = { active: nextActive, label: nextLabel };

        if (nextLabel) {
          label.textContent = nextLabel;
          gsap.to(dot, { width: 72, height: 72, backgroundColor: 'var(--accent)', duration: 0.35, ease: 'power3.out' });
          gsap.to(label, { opacity: 1, duration: 0.25 });
        } else {
          gsap.to(dot, {
            width: nextActive ? 40 : 10,
            height: nextActive ? 40 : 10,
            backgroundColor: nextActive ? 'var(--accent)' : 'var(--ink)',
            duration: 0.35,
            ease: 'power3.out',
          });
          gsap.to(label, { opacity: 0, duration: 0.15 });
        }
      };

      const onLeaveWindow = () => {
        visible = false;
        gsap.to(root, { opacity: 0, duration: 0.2 });
      };

      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerover', onOver, { passive: true });
      document.addEventListener('pointerleave', onLeaveWindow);
      window.addEventListener('blur', onLeaveWindow);

      return () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerover', onOver);
        document.removeEventListener('pointerleave', onLeaveWindow);
        window.removeEventListener('blur', onLeaveWindow);
      };
    }, root);

    return () => ctx.revert();
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={rootRef} className="cursor-root" aria-hidden="true">
      <div
        ref={dotRef}
        className="flex items-center justify-center rounded-full"
        style={{ width: 10, height: 10, backgroundColor: 'var(--ink)' }}
      >
        <span
          ref={labelRef}
          className="label text-[0.5625rem] tracking-[0.2em] text-white opacity-0"
          style={{ color: '#fff' }}
        />
      </div>
    </div>
  );
}
