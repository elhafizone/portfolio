import type { ReactNode } from 'react';

import { Reveal } from '@/components/motion/Reveal';
import { SplitText } from '@/components/motion/SplitText';

type SectionHeadingProps = {
  /** Small mono label above the title, e.g. "Selected Work". */
  eyebrow: string;
  /** id for the rendered heading, so the section aria-labelledby resolves. */
  titleId?: string;
  /** Title lines - author the breaks rather than measuring them. */
  title: readonly (string | ReactNode)[];
  intro?: string;
  /** Optional right-hand slot: a link, a stat, a note. */
  aside?: ReactNode;
  className?: string;
  titleClassName?: string;
};

export function SectionHeading({
  eyebrow,
  titleId,
  title,
  intro,
  aside,
  className = '',
  titleClassName = 'h2',
}: SectionHeadingProps) {
  return (
    <header className={`shell ${className}`}>
      <div className="border-t border-rule pt-5">
        <span className="label label-marked">{eyebrow}</span>
      </div>

      <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-12 lg:gap-12">
        <SplitText
          as="h2"
          id={titleId}
          lines={title}
          className={`${titleClassName} lg:col-span-7`}
        />

        {(intro || aside) && (
          <div className="flex flex-col justify-end gap-6 lg:col-span-4 lg:col-start-9">
            {intro && (
              <Reveal>
                <p className="lead max-w-md">{intro}</p>
              </Reveal>
            )}
            {aside}
          </div>
        )}
      </div>
    </header>
  );
}
