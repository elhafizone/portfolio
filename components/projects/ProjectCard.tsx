'use client';

import Image from 'next/image';
import { useRef } from 'react';

import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';
import { getSlot, projectImageSpec } from '@/data/images';
import type { Project } from '@/data/projects';

type Props = {
  project: Project;
  /** Horizontal panel (desktop rail) or stacked card (mobile list). */
  layout: 'panel' | 'card';
};

/**
 * A single project. Renders as a wide panel inside the horizontal rail on
 * desktop and as a stacked card on smaller screens - same data, two layouts,
 * no forced horizontal scrolling on touch.
 *
 * Placeholder entries are visually and textually marked as reserved slots. They
 * are never dressed up as delivered client work.
 */
export function ProjectCard({ project, layout }: Props) {
  const ref = useRef<HTMLElement>(null);
  const isPanel = layout === 'panel';
  // Project ids match image-slot ids, so the on-screen number is authoritative.
  const slotSpec = getSlot(project.id);
  const interactive = Boolean(project.caseStudyUrl || project.url);
  const href = project.caseStudyUrl || project.url;

  const media = (
    <div
      data-project-media
      /* One aspect ratio for both layouts, so a single source file serves the
         desktop rail and the stacked card without a second crop. */
      className={`relative w-full overflow-hidden bg-surface ${projectImageSpec.aspectClass}`}
    >
      <div data-mask-image className="absolute inset-0">
        <div className="absolute inset-0">
          {project.video ? (
            <video
              className="h-full w-full object-cover transition-transform duration-[900ms] ease-editorial group-hover:scale-[1.03]"
              src={project.video}
              muted
              loop
              playsInline
              preload="none"
              poster={project.image ?? undefined}
            />
          ) : project.image ? (
            <Image
              src={project.image}
              alt={project.imageAlt}
              fill
              sizes={isPanel ? '(min-width: 1024px) 46vw, 90vw' : '(min-width: 640px) 45vw, 92vw'}
              className="object-cover transition-transform duration-[900ms] ease-editorial group-hover:scale-[1.03]"
            />
          ) : (
            /* Numbered slot - states the exact asset size it is waiting for. */
            <ImagePlaceholder
              slot={slotSpec?.slot ?? Number(project.index)}
              width={projectImageSpec.width}
              height={projectImageSpec.height}
              ratio={projectImageSpec.ratio}
              hint={slotSpec?.label}
            />
          )}
        </div>
      </div>

      {project.isPlaceholder && (
        <span className="label absolute right-4 top-4 rounded-full border border-rule bg-white/85 px-3 py-1.5 text-[0.5625rem] backdrop-blur">
          Reserved slot
        </span>
      )}
    </div>
  );

  const body = (
    <div
      data-project-meta
      className={`flex flex-col gap-3 ${isPanel ? 'pt-6' : 'pt-5'}`}
    >
      <div className="flex items-baseline justify-between gap-4 border-t border-rule pt-4">
        <span className="label numeral">{project.index}</span>
        <span className="label text-ink-faint">{project.year}</span>
      </div>

      <p className="label label--accent">{project.category}</p>

      <h3
        className={`font-medium tracking-[-0.035em] ${
          isPanel ? 'text-[clamp(1.75rem,2.4vw,2.6rem)]' : 'text-[clamp(1.5rem,6vw,2rem)]'
        } leading-[1.02]`}
      >
        {project.title}
      </h3>

      <p className="max-w-md text-[0.9375rem] leading-relaxed text-ink-mute text-pretty">
        {project.description}
      </p>

      <ul className="mt-1 flex flex-wrap gap-x-2 gap-y-2">
        {project.technologies.map((tech) => (
          <li
            key={tech}
            className="label rounded-full border border-rule px-3 py-1.5 text-[0.5625rem] text-ink-mute"
          >
            {tech}
          </li>
        ))}
      </ul>

      {project.isPlaceholder ? (
        <p className="label mt-2 text-ink-faint">Awaiting case study</p>
      ) : (
        interactive && (
          <span className="label link-underline mt-2 inline-flex w-fit items-center gap-2 text-accent-ink">
            View project <span aria-hidden="true">&#8599;</span>
          </span>
        )
      )}
    </div>
  );

  const inner = (
    <>
      {media}
      {body}
    </>
  );

  const shared = `group flex flex-col ${isPanel ? 'w-[78vw] max-w-[860px] flex-none sm:w-[62vw] lg:w-[46vw]' : 'w-full'}`;

  if (interactive && !project.isPlaceholder) {
    return (
      <article ref={ref} data-project-panel className={shared}>
        <a
          href={href}
          className="flex flex-col"
          data-cursor-label="VIEW"
          target={href.startsWith('http') ? '_blank' : undefined}
          rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
        >
          {inner}
        </a>
      </article>
    );
  }

  return (
    <article
      ref={ref}
      data-project-panel
      className={shared}
      data-cursor-label={project.isPlaceholder ? undefined : 'EXPLORE'}
    >
      {inner}
    </article>
  );
}
