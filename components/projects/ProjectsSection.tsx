'use client';

import { useEffect, useRef, useState } from 'react';

import { useLocale } from '@/components/i18n/LocaleProvider';
import { useMotion } from '@/components/motion/MotionProvider';
import { useSectionMotion } from '@/components/motion/useSectionMotion';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { projects } from '@/data/projects';
import { createHorizontalProjects } from '@/lib/animations';
import { gsap, registerGsap } from '@/lib/gsap';

/**
 * Selected Work.
 *
 * Desktop (>= lg): the rail sticks and vertical scroll drives it
 * horizontally, with imagery and typography moving at different speeds.
 * Below lg: a plain vertical list. Horizontal scrolling is never forced onto
 * touch devices, and the markup is identical either way - only the layout and
 * the ScrollTrigger differ.
 */
export function ProjectsSection() {
  const rootRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const runwayRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { reduced, ready } = useMotion();
  const { t, isRtl } = useLocale();

  // The sticky rail is the ONLY way to reach projects 2-4 on desktop, so when
  // motion is off it must not render at all - the vertical list takes over at
  // every width instead. Renders false during SSR, which is the safe default.
  const stageEnabled = ready && !reduced;

  useSectionMotion(rootRef);

  useEffect(() => {
    if (!ready) return;
    const rail = railRef.current;
    if (!rail) return;

    registerGsap();
    const ctx = gsap.context(() => {
      createHorizontalProjects(rail, {
        reduced,
        rtl: isRtl,
        runway: runwayRef.current,
        track: trackRef.current,
        progressBar: progressRef.current,
        onIndexChange: setActive,
      });
    }, rail);

    return () => ctx.revert();
  }, [reduced, ready, isRtl]);

  const anyPlaceholder = projects.some((p) => p.isPlaceholder);

  return (
    <section ref={rootRef} id="work" className="section" aria-labelledby="work-heading">
      <SectionHeading
        eyebrow={t.work.eyebrow}
        titleId="work-heading"
        title={[
          t.work.title[0],
          <span key="w" className="serif-accent">
            {t.work.title[1]}
          </span>,
        ]}
        intro={t.work.intro}
        aside={
          anyPlaceholder ? (
            <p
              data-fade
              className="max-w-sm border-s-2 border-accent ps-4 text-sm leading-relaxed text-ink-body"
            >
              {t.work.placeholderNotice}
            </p>
          ) : undefined
        }
      />

      {/* Desktop: sticky horizontal rail */}
      <div ref={railRef} className={`mt-16 ${stageEnabled ? 'hidden lg:block' : 'hidden'}`}>
        <div ref={runwayRef} className="relative">
          <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden pt-[var(--header-h)]">
          <div
            ref={trackRef}
            /* Trailing padding is breathing room at the end of the rail, not a
               panel slot. It was sized for four projects; with nine it would be
               ~1300px of empty horizontal scrolling. */
            className="flex items-start gap-[6vw] ps-[var(--gutter)] pe-[12vw] will-change-transform"
          >
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} layout="panel" />
            ))}
          </div>

          {/* Progress + counter */}
          <div className="shell mt-10">
            <div className="flex items-center gap-6">
              <span className="label numeral text-ink">
                {String(active + 1).padStart(2, '0')}
              </span>
              <div className="h-px flex-1 bg-rule">
                <div
                  ref={progressRef}
                  className="h-px w-full origin-left bg-accent"
                  style={{ transform: 'scaleX(0)' }}
                />
              </div>
              <span className="label numeral text-ink-faint">
                {String(projects.length).padStart(2, '0')}
              </span>
              <span className="label hidden text-ink-faint xl:inline">
                {t.work.scrollToAdvance}
              </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Below lg: vertical storytelling */}
      <div className={`shell mt-14 grid gap-14 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-16 ${stageEnabled ? 'lg:hidden' : ''}`}>
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} layout="card" />
        ))}
      </div>
    </section>
  );
}
