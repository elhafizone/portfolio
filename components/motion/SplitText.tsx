import type { ReactNode } from 'react';

import type { ContainerTag } from '@/lib/types';

type SplitTextProps = {
  /** Explicit lines. Authoring the line breaks beats measuring them. */
  lines: readonly (string | ReactNode)[];
  as?: ContainerTag;
  className?: string;
  lineClassName?: string;
  /** Word-level masks instead of line-level. Only pass plain strings. */
  mode?: 'lines' | 'words';
} & Record<string, unknown>;

/**
 * Masked text reveal primitive.
 *
 * Accessibility notes:
 *  - The real text stays in the DOM, in order, separated by real whitespace,
 *    so screen readers and text selection behave normally.
 *  - Masks are plain block/inline-block wrappers with no aria attributes, so
 *    nothing is hidden from assistive tech.
 *  - Nothing is transformed unless html[data-motion="on"] is set, which only
 *    happens when JS runs and motion is allowed. With JS off, text renders
 *    plainly.
 *  - Wrapping is safe in both modes: in `words` mode each word carries its own
 *    mask, so a wrapped line still reveals correctly.
 */
export function SplitText({
  lines,
  as: Tag = 'span',
  className,
  lineClassName,
  mode = 'lines',
  ...rest
}: SplitTextProps) {
  return (
    <Tag className={className} data-reveal="" {...rest}>
      {lines.map((line, i) => {
        if (mode === 'words' && typeof line === 'string') {
          return (
            <span key={i} className={lineClassName ?? 'block'}>
              {line.split(' ').map((word, w, arr) => (
                <span key={w}>
                  <span className="reveal-line" style={{ display: 'inline-block' }}>
                    <span>{word}</span>
                  </span>
                  {w < arr.length - 1 ? ' ' : ''}
                </span>
              ))}
            </span>
          );
        }

        return (
          <span key={i} className={`reveal-line ${lineClassName ?? ''}`}>
            <span>{line}</span>
          </span>
        );
      })}
    </Tag>
  );
}
