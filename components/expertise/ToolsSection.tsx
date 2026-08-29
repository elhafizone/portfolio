'use client';

import { useMemo, useRef, useState } from 'react';

import { useSectionMotion } from '@/components/motion/useSectionMotion';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { profile } from '@/data/profile';
import { tools, toolsCopy } from '@/data/expertise';

/**
 * Tools constellation.
 *
 * A deliberate radial layout, not a tag cloud: fixed angles, one ring, hairline
 * connectors to a single centre. Hovering or focusing a tool lights its
 * connector. Below lg it collapses to a grouped list, because a radial diagram
 * on a phone is decoration pretending to be information.
 */
export function ToolsSection() {
  const rootRef = useRef<HTMLElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
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
        x: 50 + Math.cos(angle) * rx,
        y: 50 + Math.sin(angle) * ry,
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
      className="section border-t border-rule"
      aria-labelledby="tools-heading"
    >
      <SectionHeading
        eyebrow={toolsCopy.eyebrow}
        titleId="tools-heading"
        index="05"
        title={['What the work is', <span key="b" className="serif-accent">built with.</span>]}
        intro={toolsCopy.intro}
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
            <span className="label label--accent">Centre</span>
            <p className="mt-2 whitespace-nowrap text-[clamp(1.25rem,2vw,1.75rem)] font-medium leading-none tracking-[-0.03em]">
              {profile.name}
            </p>
            <p className="mt-2 max-w-[14rem] text-xs leading-snug text-ink-mute">
              {profile.role}
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
              aria-describedby="tools-legend"
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

        <p id="tools-legend" className="label mt-10 text-center text-ink-faint">
          {grouped.map(([group, items]) => `${group} (${items.length})`).join('  /  ')}
        </p>
      </div>

      {/* Below lg: grouped list */}
      <div className="shell mt-12 lg:hidden">
        <div data-fade-group className="grid gap-8 sm:grid-cols-3">
          {grouped.map(([group, items]) => (
            <div key={group} data-fade>
              <p className="label label-marked border-t border-rule pt-4">{group}</p>
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
