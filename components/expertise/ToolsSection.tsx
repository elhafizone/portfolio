'use client';

import { useMemo, useRef, useState } from 'react';

import { useLocale } from '@/components/i18n/LocaleProvider';
import { useSectionMotion } from '@/components/motion/useSectionMotion';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { tools } from '@/data/expertise';

/**
 * Tools constellation.
 *
 * A deliberate radial layout, not a tag cloud: fixed angles, one ring, hairline
 * connectors to a single centre. Hovering or focusing a tool lights its
 * connector. Below lg it collapses to a grouped list, because a radial diagram
 * on a phone is decoration pretending to be information.
 */
/**
 * Rounds a coordinate to two decimals, which is what keeps this component
 * hydrating cleanly.
 *
 * ECMAScript does not require `Math.sin`/`Math.cos` to be bit-identical across
 * implementations, and they are not: Node rendered one node at
 * `y = 84.28939561022754` while V8 in the browser computed `...56` for the same
 * angle. React compares the two as strings, so a difference in the last unit of
 * least precision is still a hydration mismatch — and the browser's own
 * serialisation of a long percentage in a `style` attribute widened the gap
 * further.
 *
 * Two decimals is ~0.01% of the container, well under a tenth of a pixel here,
 * and it absorbs the discrepancy on both sides.
 */
const round2 = (n: number) => Math.round(n * 100) / 100;

export function ToolsSection() {
  const rootRef = useRef<HTMLElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const { t } = useLocale();
  useSectionMotion(rootRef);

  const nodes = useMemo(() => {
    const count = tools.length;
    const rx = 40; // % of container width
    const ry = 38; // % of container height
    return tools.map((tool, i) => {
      // Start at the top and go clockwise; offset keeps labels off the axes.
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2 + 0.16;
      return {
        ...tool,
        x: round2(50 + Math.cos(angle) * rx),
        y: round2(50 + Math.sin(angle) * ry),
      };
    });
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, string[]>();
    tools.forEach((t) => {
      map.set(t.group, [...(map.get(t.group) ?? []), t.name]);
    });
    return Array.from(map.entries());
  }, []);

  return (
    <section
      ref={rootRef}
      id="tools"
      className="section"
      aria-labelledby="tools-heading"
    >
      <SectionHeading
        eyebrow={t.tools.eyebrow}
        titleId="tools-heading"
        title={[
          t.tools.title[0],
          <span key="b" className="serif-accent">
            {t.tools.title[1]}
          </span>,
        ]}
        intro={t.tools.intro}
      />

      {/* Desktop: radial constellation */}
      <div className="shell mt-20 hidden lg:block">
        <div
          data-fade
          className="relative mx-auto aspect-[16/10] w-full max-w-4xl"
        >
          {/* connectors */}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <ellipse
              cx="50"
              cy="50"
              rx="40"
              ry="38"
              fill="none"
              stroke="#e7e7e1"
              strokeWidth="0.15"
              vectorEffect="non-scaling-stroke"
            />
            {nodes.map((node) => (
              <line
                key={node.name}
                x1="50"
                y1="50"
                x2={node.x}
                y2={node.y}
                stroke={hovered === node.name ? '#70ba65' : '#e7e7e1'}
                strokeWidth={hovered === node.name ? 0.9 : 0.4}
                vectorEffect="non-scaling-stroke"
                className="transition-[stroke,stroke-width] duration-500"
              />
            ))}
          </svg>

          {/* centre */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <span className="label label--accent">{t.tools.centreLabel}</span>
            <p className="mt-2 whitespace-nowrap text-[clamp(1.25rem,2vw,1.75rem)] font-medium leading-none tracking-[-0.03em]">
              {t.identity.name}
            </p>
            <p className="mt-2 max-w-[14rem] text-xs leading-snug text-ink-body">
              {t.identity.role}
            </p>
          </div>

          {/* nodes */}
          {nodes.map((node) => (
            <button
              key={node.name}
              type="button"
              onMouseEnter={() => setHovered(node.name)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(node.name)}
              onBlur={() => setHovered(null)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border px-4 py-2 text-[0.8125rem] tracking-[-0.01em] transition-all duration-500 ease-editorial ${
                hovered === node.name
                  ? 'border-accent bg-accent text-white'
                  : 'border-rule bg-paper text-ink-soft hover:border-accent hover:text-accent-ink'
              }`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              {node.name}
            </button>
          ))}
        </div>
      </div>

      {/* Below lg: grouped list */}
      <div className="shell mt-12 lg:hidden">
        <div data-fade-group className="grid gap-8 sm:grid-cols-3">
          {grouped.map(([group, items]) => (
            <div key={group} data-fade>
              <p className="label label-marked border-t border-rule pt-4">
                {t.tools.groups[group as keyof typeof t.tools.groups]}
              </p>
              <ul className="mt-4 space-y-2">
                {items.map((item) => (
                  <li key={item} className="text-[1.0625rem] tracking-[-0.015em] text-ink-soft">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
