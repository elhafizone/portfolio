import type { ReactNode } from 'react';

import type { ContainerTag } from '@/lib/types';

type ParallaxProps = {
  children: ReactNode;
  /**
   * Drift factor. Positive trails the scroll, negative leads it.
   * Keep values small (0.05 - 0.25) or the layout starts to feel unstable.
   */
  speed?: number;
  as?: ContainerTag;
  className?: string;
};

/**
 * Transform-only parallax marker.
 *
 * The element just declares `data-speed`; the actual ScrollTrigger is created
 * centrally by `createParallax`, so there is one implementation to reason about
 * and one place to disable it for reduced motion or below-desktop widths.
 */
export function Parallax({ children, speed = 0.1, as: Tag = 'div', className }: ParallaxProps) {
  return (
    <Tag className={className} data-speed={speed}>
      {children}
    </Tag>
  );
}
