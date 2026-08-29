'use client';

import { useEffect, type RefObject } from 'react';

import { createParallax, createSectionReveals } from '@/lib/animations';
import { gsap, registerGsap } from '@/lib/gsap';
import { useMotion } from '@/components/motion/MotionProvider';

/**
 * Attaches the standard reveal + parallax behaviour to a section.
 *
 * Everything runs inside a `gsap.context()` scoped to the section element, so
 * unmounting reverts every tween and kills every ScrollTrigger it created.
 * This is the only place most sections touch GSAP at all.
 */
export function useSectionMotion(ref: RefObject<HTMLElement | null>) {
  const { reduced, ready } = useMotion();

  useEffect(() => {
    if (!ready) return;
    const root = ref.current;
    if (!root) return;

    registerGsap();
    const ctx = gsap.context(() => {
      createSectionReveals(root, { reduced });
      createParallax(root, { reduced });
    }, root);

    return () => ctx.revert();
  }, [ref, reduced, ready]);
}
