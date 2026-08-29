'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let registered = false;

/**
 * Registers GSAP plugins exactly once. Safe to call from any client component.
 * Returns the shared gsap instance so callers never import the plugin directly.
 */
export function registerGsap() {
  if (typeof window === 'undefined') return { gsap, ScrollTrigger };
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger);
    // Recalculating on every resize tick is expensive on mobile where the URL
    // bar collapse fires constant resizes; ignore height-only changes.
    ScrollTrigger.config({ ignoreMobileResize: true });
    // NOTE: deliberately no global `overwrite` default. With overwrite:'auto'
    // a scrub timeline created after an entrance timeline silently kills the
    // entrance tweens on the same elements, stranding them at their from-state.
    // Conflicts are resolved by sequencing instead - see createHeroTimeline.
    registered = true;
  }
  return { gsap, ScrollTrigger };
}

export { gsap, ScrollTrigger };

/** True when the visitor has asked the OS to reduce motion. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** True for precise pointers only - excludes touch and coarse input. */
export function hasFinePointer(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

/** Cheap WebGL capability probe used to gate the 3D layer. */
export function supportsWebGL(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}
