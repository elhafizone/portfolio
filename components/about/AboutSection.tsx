'use client';

import { useRef } from 'react';

import { IdentityPlate } from '@/components/about/IdentityPlate';
import { useLocale } from '@/components/i18n/LocaleProvider';
import { Parallax } from '@/components/motion/Parallax';
import { SplitText } from '@/components/motion/SplitText';
import { useSectionMotion } from '@/components/motion/useSectionMotion';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { profile } from '@/data/profile';

export function AboutSection() {
  const rootRef = useRef<HTMLElement>(null);
  const { t } = useLocale();
  useSectionMotion(rootRef);

  return (
    <section
      ref={rootRef}
      id="about"
      className="section"
      aria-labelledby="about-heading"
      data-parallax-scope
    >
      <SectionHeading
        eyebrow={t.about.eyebrow}
        titleId="about-heading"
        title={[
          t.about.title[0],
          <span key="w" className="serif-accent">
            {t.about.title[1]}
          </span>,
        ]}
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
            {t.about.bio.map((paragraph, i) => (
              <p
                key={i}
                data-fade
                className={
                  i === 0
                    ? 'text-[clamp(1.375rem,2.4vw,2rem)] font-medium leading-[1.18] tracking-[-0.03em] text-ink text-pretty'
                    : 'mt-6 text-[1.0625rem] leading-relaxed text-ink-body text-pretty'
                }
              >
                {paragraph}
              </p>
            ))}

            {/* Background facts, straight from the CV. */}
            <dl data-fade className="mt-10 grid gap-x-8 gap-y-6 border-t border-rule pt-7 sm:grid-cols-2">
              <div>
                <dt className="label">{t.about.nationalityLabel}</dt>
                <dd className="mt-2 text-[1rem] tracking-[-0.015em] text-ink-soft">
                  {t.about.nationality}
                </dd>
              </div>

              <div>
                <dt className="label">{t.about.languagesLabel}</dt>
                <dd className="mt-2 text-[1rem] tracking-[-0.015em] text-ink-soft">
                  {t.about.languages.join(' · ')}
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="label">{t.about.disciplinesLabel}</dt>
                <dd className="mt-3 flex flex-wrap gap-2">
                  {t.about.disciplines.map((d) => (
                    <span
                      key={d}
                      className="label rounded-full border border-rule px-3 py-2 text-[0.5625rem] text-ink-mute"
                    >
                      {d}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>

            <ul data-fade className="mt-9 grid gap-3 border-t border-rule pt-7 sm:grid-cols-2">
              {t.about.principles.map((principle) => (
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
          <p className="label label-marked mx-auto w-fit">{t.about.philosophyLabel}</p>

          <SplitText
            as="p"
            lines={[
              t.about.philosophy[0],
              <span key="l2">
                <span className="serif-accent">{t.about.philosophyAccent}</span>{' '}
                {t.about.philosophy[1]}
              </span>,
            ]}
            className="mx-auto mt-9 max-w-4xl text-[clamp(2rem,5.6vw,4.5rem)] font-medium leading-[1.02] tracking-[-0.045em]"
          />
        </div>
      </div>
    </section>
  );
}
