'use client';

import { useRef } from 'react';

import { Reveal } from '@/components/motion/Reveal';
import { useSectionMotion } from '@/components/motion/useSectionMotion';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { expertiseColumns, expertiseCopy } from '@/data/expertise';

/**
 * The positioning section: one person holding both halves of the project.
 *
 * The two columns are deliberately symmetrical and the intersection sits
 * between them as a literal equation, because the claim being made is about
 * the overlap - not about either list being longer.
 */
export function ExpertiseSection() {
  const rootRef = useRef<HTMLElement>(null);
  useSectionMotion(rootRef);

  return (
    <section
      ref={rootRef}
      id="expertise"
      className="section border-t border-rule bg-surface"
      aria-labelledby="expertise-heading"
      data-parallax-scope
    >
      <SectionHeading
        eyebrow={expertiseCopy.eyebrow}
        titleId="expertise-heading"
        index="04"
        title={['Design Meets', <span key="d" className="serif-accent">Development.</span>]}
        intro={expertiseCopy.intro}
      />

      <div className="shell mt-16 lg:mt-24">
        <div className="relative grid gap-12 lg:grid-cols-12 lg:gap-8">
          {expertiseColumns.map((column, colIndex) => (
            <div
              key={column.id}
              data-fade-group
              className={
                colIndex === 0
                  ? 'lg:col-span-5'
                  : 'lg:col-span-5 lg:col-start-8'
              }
            >
              <div data-fade className="flex items-baseline justify-between border-t border-rule-strong pt-5">
                <span className="label numeral text-accent-ink">{column.index}</span>
                <span className="label">{column.id === 'design' ? 'Visual' : 'Technical'}</span>
              </div>

              <h3
                data-fade
                className="mt-7 text-[clamp(2.25rem,4vw,3.5rem)] font-medium leading-none tracking-[-0.04em]"
              >
                {column.title}
              </h3>

              <p data-fade className="mt-5 max-w-sm text-[1rem] leading-snug text-ink-mute text-pretty">
                {column.summary}
              </p>

              <ul className="mt-9">
                {column.items.map((item) => (
                  <li
                    key={item}
                    data-fade
                    className="group flex items-center justify-between border-b border-rule py-4 transition-colors hover:border-accent"
                  >
                    <span className="text-[1.0625rem] tracking-[-0.015em] text-ink transition-colors group-hover:text-accent-ink">
                      {item}
                    </span>
                    <span
                      aria-hidden="true"
                      className="h-1.5 w-1.5 rounded-full bg-rule-strong transition-colors duration-500 group-hover:bg-accent"
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* The seam between the two columns. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-1/2 hidden -translate-x-1/2 lg:flex lg:flex-col lg:items-center"
          >
            <span className="w-px flex-1 bg-rule-strong" />
            <span className="my-4 flex h-11 w-11 items-center justify-center rounded-full border border-accent bg-paper text-accent-ink">
              <span className="text-lg leading-none">+</span>
            </span>
            <span className="w-px flex-1 bg-rule-strong" />
          </div>
        </div>

        {/* The intersection, stated plainly. */}
        <Reveal group>
          <div className="mt-20 border-t border-rule-strong pt-12 lg:mt-28">
            <div className="flex flex-col items-center gap-6 text-center">
              <p data-fade className="label label-marked">
                The intersection
              </p>

              <p
                data-fade
                className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[clamp(1.75rem,5.2vw,4rem)] font-medium leading-none tracking-[-0.04em]"
              >
                <span>{expertiseCopy.equation.left}</span>
                <span aria-hidden="true" className="text-accent">
                  +
                </span>
                <span>{expertiseCopy.equation.right}</span>
                <span aria-hidden="true" className="text-accent">
                  =
                </span>
                <span className="serif-accent">{expertiseCopy.equation.result}</span>
              </p>

              <p data-fade className="lead mt-4 max-w-2xl">
                {expertiseCopy.outcome}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
