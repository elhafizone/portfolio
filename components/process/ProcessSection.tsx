'use client';

import { useEffect, useRef, useState } from 'react';

import { useMotion } from '@/components/motion/MotionProvider';
import { useSectionMotion } from '@/components/motion/useSectionMotion';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { processCopy, processSteps } from '@/data/process';
import { createProcessTimeline } from '@/lib/animations';
import { gsap, registerGsap } from '@/lib/gsap';

/**
 * From Idea to Launch.
 *
 * Desktop: sticky stage, one oversized numeral, the statement swapping beneath
 * it, and a progress line across the bottom. Below lg: a numbered list.
 * Client-facing language throughout - no methodology jargon.
 */
export function ProcessSection() {
  const rootRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const runwayRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { reduced, ready } = useMotion();

  // Same reasoning as Services: no pinning means no way to advance the steps.
  const stageEnabled = ready && !reduced;

  useSectionMotion(rootRef);

  useEffect(() => {
    if (!ready) return;
    const scene = sceneRef.current;
    if (!scene) return;

    registerGsap();
    const ctx = gsap.context(() => {
      createProcessTimeline(runwayRef.current, {
        reduced,
        count: processSteps.length,
        onChange: setActive,
        line: lineRef.current,
      });
    }, scene);

    return () => ctx.revert();
  }, [reduced, ready]);

  const step = processSteps[active];

  return (
    <section
      ref={rootRef}
      id="process"
      className="section border-t border-rule bg-surface"
      aria-labelledby="process-heading"
    >
      <SectionHeading
        eyebrow={processCopy.eyebrow}
        titleId="process-heading"
        index="07"
        title={['From Idea to', <span key="l" className="serif-accent">Launch.</span>]}
        intro={processCopy.intro}
      />

      {/* Desktop: sticky stage - CSS holds it, ScrollTrigger only reports progress */}
      <div ref={sceneRef} className={`mt-20 ${stageEnabled ? 'hidden lg:block' : 'hidden'}`}>
        <div ref={runwayRef} className="relative">
          <div data-process-stage className="sticky top-0 flex h-[100svh] flex-col justify-center">
          <div className="shell">
            <div className="grid grid-cols-12 items-center gap-8">
              <div className="col-span-4">
                <span
                  key={`n-${step.id}`}
                  className="numeral block text-[clamp(7rem,16vw,15rem)] font-medium leading-[0.78] tracking-[-0.06em] text-accent"
                  style={{ animation: reduced ? undefined : 'prcIn 0.65s var(--ease-editorial) both' }}
                >
                  {step.index}
                </span>
              </div>

              <div className="col-span-7 col-start-6">
                <span className="label label--accent">{step.title}</span>
                <p
                  key={`s-${step.id}`}
                  className="mt-6 text-[clamp(2rem,3.6vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.04em]"
                  style={{ animation: reduced ? undefined : 'prcIn 0.65s 0.05s var(--ease-editorial) both' }}
                >
                  {step.statement}
                </p>
                <p
                  key={`d-${step.id}`}
                  className="lead mt-7 max-w-xl"
                  style={{ animation: reduced ? undefined : 'prcIn 0.65s 0.11s var(--ease-editorial) both' }}
                >
                  {step.detail}
                </p>
              </div>
            </div>

            {/* Progress line + step index */}
            <div className="mt-20">
              <div className="h-px w-full bg-rule-strong">
                <div
                  ref={lineRef}
                  className="h-px w-full origin-left bg-accent"
                  style={{ transform: 'scaleX(0)' }}
                />
              </div>
              <ol className="mt-5 flex items-center justify-between">
                {processSteps.map((s, i) => (
                  <li key={s.id}>
                    <span
                      className={`label transition-colors duration-500 ${
                        i <= active ? 'text-ink' : 'text-ink-faint'
                      }`}
                    >
                      {s.index} {s.title}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Below lg: numbered list */}
      <div className={`shell mt-12 ${stageEnabled ? 'lg:hidden' : ''}`}>
        <ol data-fade-group className="border-t border-rule">
          {processSteps.map((s) => (
            <li key={s.id} data-fade className="border-b border-rule py-8">
              <div className="flex items-baseline gap-5">
                <span className="numeral text-[2rem] font-medium leading-none text-accent">
                  {s.index}
                </span>
                <div>
                  <span className="label label--accent">{s.title}</span>
                  <p className="mt-3 text-[clamp(1.375rem,5.5vw,1.75rem)] font-medium leading-[1.06] tracking-[-0.03em]">
                    {s.statement}
                  </p>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-mute text-pretty">
                    {s.detail}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <style>{`
        @keyframes prcIn {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes prcIn { from { opacity: 1; } to { opacity: 1; } }
        }
      `}</style>
    </section>
  );
}
