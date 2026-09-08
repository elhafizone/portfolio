/**
 * Single source of truth for motion. Nothing in the animation layer should
 * hard-code a duration, easing or breakpoint.
 */

export const DURATION = {
  micro: 0.24,
  fast: 0.4,
  base: 0.7,
  slow: 1.05,
  reveal: 0.9,
  preloader: 0.6,
} as const;

export const EASE = {
  /** Primary editorial ease — long, confident settle. */
  out: 'power3.out',
  inOut: 'power2.inOut',
  /** Used for masks and clip-path reveals. */
  mask: 'expo.out',
  /** Magnetic / elastic pointer response. */
  magnetic: 'power2.out',
} as const;

export const STAGGER = {
  words: 0.045,
  lines: 0.08,
  items: 0.09,
} as const;

export const BREAKPOINT = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

/** GSAP matchMedia query strings, kept identical across every timeline. */
export const MEDIA = {
  desktop: `(min-width: ${BREAKPOINT.lg}px)`,
  belowDesktop: `(max-width: ${BREAKPOINT.lg - 1}px)`,
  motionOk: '(prefers-reduced-motion: no-preference)',
  motionReduced: '(prefers-reduced-motion: reduce)',
} as const;

/** Scroll distance multipliers for pinned sections (× viewport height). */
export const SCROLL = {
  horizontalPadding: 0.6,
  servicePerStep: 0.85,
  processPerStep: 0.7,
} as const;

/**
 * Height reserved for the fixed header when scrolling to an in-page anchor.
 * Without it a section lands underneath the navbar and reads as two sections
 * overlapping. Lenis does not honour CSS scroll-margin-top, so this has to be
 * applied by the scroll call itself.
 */
export const HEADER_OFFSET = 92;

/** WebGL guard rails. */
export const WEBGL = {
  maxDpr: 1.6,
  minDpr: 1,
} as const;
