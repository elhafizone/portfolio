import type { ReactNode } from 'react';

import type { ContainerTag } from '@/lib/types';

type RevealProps = {
  children: ReactNode;
  as?: ContainerTag;
  className?: string;
  /**
   * Groups children so they stagger together as one unit rather than each
   * firing on its own trigger. Put this on the wrapper, `Reveal` on the items.
   */
  group?: boolean;
};

/**
 * Declarative fade/rise reveal.
 *
 * The element is pre-hidden by CSS only when html[data-motion="on"] is set,
 * which requires JS to have run and motion to be allowed. If the animation
 * layer fails or JS is disabled, the content simply renders visible.
 */
export function Reveal({ children, as: Tag = 'div', className, group }: RevealProps) {
  const flag = group ? { 'data-fade-group': '' } : { 'data-fade': '' };
  return (
    <Tag className={className} {...flag}>
      {children}
    </Tag>
  );
}
