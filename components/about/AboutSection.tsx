'use client';

import { useRef } from 'react';

import { IdentityPlate } from '@/components/about/IdentityPlate';
import { Parallax } from '@/components/motion/Parallax';
import { SplitText } from '@/components/motion/SplitText';
import { useSectionMotion } from '@/components/motion/useSectionMotion';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { profile } from '@/data/profile';

export function AboutSection() {
  const rootRef = useRef<HTMLElement>(null);
  useSectionMotion(rootRef);

  return (
    <section
      ref={rootRef}
      id="about"
      className="section border-t border-rule"
      aria-labelledby="about-heading"
      data-parallax-scope
    >
      <SectionHeading
        eyebrow="About"
        titleId="about-heading"
        index="09"
        title={['Behind the', <span key="w" className="serif-accent">Work</span>]}
      />

      <div className="shell mt-14 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-10">
        {/* Identity */}
        <div className="lg:col-span-5">
          <Parallax speed={0.05}>
            <div data-fade>
              <IdentityPlate />
            </div>
          </Parallax>
        </div>

        {/* Bio */}
        <div className="lg:col-span-6 lg:col-start-7">
          <div data-fade-group>
            {profile.bio.map((paragraph, i) => (
              <p
                key={i}
                data-fade
                className={
                  i === 0
                    ? 'text-[clamp(1.375rem,2.4vw,2rem)] font-medium leading-[1.18] tracking-[-0.03em] text-ink text-pretty'
                    : 'mt-6 text-[1.0625rem] leading-relaxed text-ink-mute text-pretty'
                }
              >
                {paragraph}
              </p>
            ))}

            <ul data-fade className="mt-10 grid gap-3 border-t border-rule pt-7 sm:grid-cols-2">
              {profile.manifesto.principles.map((principle) => (
                <li key={principle} className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 flex-none rounded-full bg-accent"
                  />
                  <span className="text-[1rem] tracking-[-0.015em] text-ink-soft">
                    {principle}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Manifesto band */}
      <div className="shell mt-24 lg:mt-36">
        <div className="border-t border-rule-strong pt-12 text-center lg:pt-16">
          <p className="label label-marked mx-auto w-fit">Philosophy</p>

          <SplitText
            as="p"
            lines={[
              profile.manifesto.line1,
              <span key="l2">
                <span className="serif-accent">Great</span> design should also work.
              </span>,
            ]}
            className="mx-auto mt-9 max-w-4xl text-[clamp(2rem,5.6vw,4.5rem)] font-medium leading-[1.02] tracking-[-0.045em]"
          />
        </div>
      </div>
    </section>
  );
}
