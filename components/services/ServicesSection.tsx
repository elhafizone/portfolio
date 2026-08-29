'use client';

import { useEffect, useRef, useState } from 'react';

import { useMotion } from '@/components/motion/MotionProvider';
import { useSectionMotion } from '@/components/motion/useSectionMotion';
import { ServiceVisual } from '@/components/services/ServiceVisual';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { services } from '@/data/services';
import { createServiceTimeline } from '@/lib/animations';
import { gsap, registerGsap } from '@/lib/gsap';

/**
 * What I Do.
 *
 * Desktop: the stage sticks and scroll advances the active service - the numeral,
 * the typography and the line drawing all change together, driven by one
 * ScrollTrigger rather than six.
 * Below lg: an editorial list. Every service is present and readable either way,
 * so nothing depends on the pinning working.
 */
export function ServicesSection() {
  const rootRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const runwayRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const { reduced, ready } = useMotion();

  // Without the pinned scroll the stage would show service 01 and nothing else,
  // so reduced motion falls back to the full editorial list at every width.
  const stageEnabled = ready && !reduced;

  useSectionMotion(rootRef);

  useEffect(() => {
    if (!ready) return;
    const scene = sceneRef.current;
    if (!scene) return;

    registerGsap();
    const ctx = gsap.context(() => {
      createServiceTimeline(runwayRef.current, {
        reduced,
        count: services.length,
        onChange: setActive,
        progressBar: progressRef.current,
      });
    }, scene);

    return () => ctx.revert();
  }, [reduced, ready]);

  const current = services[active];

  return (
    <section
      ref={rootRef}
      id="services"
      className="section border-t border-rule"
      aria-labelledby="services-heading"
    >
      <SectionHeading
        eyebrow="Services"
        titleId="services-heading"
        index="03"
        title={['What I', <span key="d" className="serif-accent">Do</span>]}
        intro="Six things, done properly. Most projects need two or three of them at once — which is the point of having both halves in one place."
      />

      {/* Desktop: sticky scene - CSS holds the stage, ScrollTrigger only reports progress */}
      <div ref={sceneRef} className={`mt-20 ${stageEnabled ? 'hidden lg:block' : 'hidden'}`}>
        <div ref={runwayRef} className="relative">
          <div data-services-stage className="sticky top-0 flex h-[100svh] items-center">
          <div className="shell w-full">
            <div className="grid grid-cols-12 items-center gap-8">
              {/* Active service */}
              <div className="col-span-7 flex flex-col">
                <div className="flex items-start gap-8">
                  <span
                    key={`n-${current.id}`}
                    className="numeral mt-2 text-[clamp(3rem,5vw,5rem)] font-medium leading-none text-accent"
                  >
                    {current.index}
                  </span>

                  <div className="min-h-[19rem]">
                    <h3
                      key={`t-${current.id}`}
                      className="text-[clamp(2.5rem,4.4vw,4.25rem)] font-medium leading-[0.98] tracking-[-0.04em]"
                      style={{ animation: reduced ? undefined : 'svcIn 0.6s var(--ease-editorial) both' }}
                    >
                      {current.title}
                    </h3>

                    <p
                      key={`s-${current.id}`}
                      className="lead mt-6 max-w-lg"
                      style={{ animation: reduced ? undefined : 'svcIn 0.6s 0.06s var(--ease-editorial) both' }}
                    >
                      {current.summary}
                    </p>

                    <p
                      key={`d-${current.id}`}
                      className="mt-4 max-w-lg text-[0.9375rem] leading-relaxed text-ink-mute text-pretty"
                      style={{ animation: reduced ? undefined : 'svcIn 0.6s 0.12s var(--ease-editorial) both' }}
                    >
                      {current.detail}
                    </p>

                    <ul
                      key={`l-${current.id}`}
                      className="mt-7 flex flex-wrap gap-2"
                      style={{ animation: reduced ? undefined : 'svcIn 0.6s 0.18s var(--ease-editorial) both' }}
                    >
                      {current.deliverables.map((d) => (
                        <li
                          key={d}
                          className="label rounded-full border border-rule px-3 py-2 text-[0.5625rem]"
                        >
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Index of every service - always visible, active one marked. */}
                <ol className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-rule pt-5">
                  {services.map((service, i) => (
                    <li key={service.id}>
                      <span
                        className={`label transition-colors duration-500 ${
                          i === active ? 'text-accent-ink' : 'text-ink-faint'
                        }`}
                      >
                        {service.index} {service.title}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Scroll-linked visual */}
              <div className="col-span-4 col-start-9">
                <div className="relative aspect-square w-full">
                  {services.map((service, i) => (
                    <ServiceVisual key={service.id} index={i} active={i === active} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Vertical progress rail */}
          <div className="absolute right-[calc(var(--gutter)/2)] top-1/2 hidden h-40 w-px -translate-y-1/2 bg-rule xl:block">
            <div
              ref={progressRef}
              className="h-full w-px origin-top bg-accent"
              style={{ transform: 'scaleY(0)' }}
            />
          </div>
          </div>
        </div>
      </div>

      {/* Below lg: editorial list */}
      <div className={`shell mt-14 ${stageEnabled ? 'lg:hidden' : ''}`}>
        <ol className="border-t border-rule">
          {services.map((service, i) => (
            <li key={service.id} data-fade className="border-b border-rule py-9">
              <div className="flex items-baseline gap-5">
                <span className="numeral text-lg font-medium text-accent">{service.index}</span>
                <div className="flex-1">
                  <h3 className="text-[clamp(1.75rem,7vw,2.25rem)] font-medium leading-none tracking-[-0.035em]">
                    {service.title}
                  </h3>
                  <p className="mt-4 text-[1rem] leading-snug text-ink-soft">{service.summary}</p>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-mute text-pretty">
                    {service.detail}
                  </p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {service.deliverables.map((d) => (
                      <li
                        key={d}
                        className="label rounded-full border border-rule px-3 py-2 text-[0.5625rem]"
                      >
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 h-24 w-24 opacity-70">
                <div className="relative h-full w-full">
                  <ServiceVisual index={i} active />
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <style>{`
        @keyframes svcIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes svcIn { from { opacity: 1; } to { opacity: 1; } }
        }
      `}</style>
    </section>
  );
}
