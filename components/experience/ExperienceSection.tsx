'use client';

import { useRef } from 'react';

import { Parallax } from '@/components/motion/Parallax';
import { useSectionMotion } from '@/components/motion/useSectionMotion';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { experienceCopy, timeline } from '@/data/experience';

/**
 * Career timeline.
 *
 * Note on content: there are no company names, job titles or employment dates
 * here, because none were supplied. The markers are disciplines and one real
 * date - 2020 - which is the only year the source material actually states.
 */
export function ExperienceSection() {
  const rootRef = useRef<HTMLElement>(null);
  useSectionMotion(rootRef);

  return (
    <section
      ref={rootRef}
      id="experience"
      className="section border-t border-rule"
      aria-labelledby="experience-heading"
      data-parallax-scope
    >
      <SectionHeading
        eyebrow={experienceCopy.eyebrow}
        titleId="experience-heading"
        index="06"
        title={['10+ Years of', <span key="c" className="serif-accent">Creative Experience</span>]}
        intro={experienceCopy.intro}
      />

      <div className="shell mt-16 lg:mt-24">
        <ol className="relative">
          {/* Spine */}
          <span
            aria-hidden="true"
            className="absolute left-[7px] top-2 hidden h-[calc(100%-2rem)] w-px bg-rule sm:block lg:left-[calc(16.6667%+7px)]"
          />

          {timeline.map((entry, i) => (
            <li
              key={entry.id}
              data-fade
              className="relative grid gap-4 border-b border-rule py-10 sm:grid-cols-[auto_1fr] sm:gap-8 lg:grid-cols-12 lg:gap-8 lg:py-14"
            >
              {/* Marker */}
              <div className="flex items-center gap-4 sm:block lg:col-span-2">
                <span className="label numeral text-ink-faint lg:block">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>

              {/* Node + label */}
              <div className="relative flex items-start gap-5 lg:col-span-3">
                <span
                  aria-hidden="true"
                  className={`relative z-10 mt-2 hidden h-[15px] w-[15px] flex-none rounded-full border-2 sm:block ${
                    entry.id === '2020' || entry.id === 'today'
                      ? 'border-accent bg-accent'
                      : 'border-rule-strong bg-paper'
                  }`}
                />
                <span
                  className={`label ${
                    entry.id === '2020' || entry.id === 'today' ? 'label--accent' : ''
                  }`}
                >
                  {entry.marker}
                </span>
              </div>

              {/* Content */}
              <div className="lg:col-span-7">
                <Parallax speed={i % 2 === 0 ? 0.03 : 0.06}>
                  <h3 className="text-[clamp(1.75rem,3.4vw,2.75rem)] font-medium leading-none tracking-[-0.035em]">
                    {entry.title}
                  </h3>
                  <p className="mt-5 max-w-xl text-[1rem] leading-relaxed text-ink-mute text-pretty">
                    {entry.description}
                  </p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {entry.tags.map((tag) => (
                      <li
                        key={tag}
                        className="label rounded-full border border-rule px-3 py-2 text-[0.5625rem]"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </Parallax>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
