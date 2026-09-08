'use client';

import Image from 'next/image';
import { useRef } from 'react';

import { useLocale } from '@/components/i18n/LocaleProvider';
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
 * desktop and as a stacked card on smaller screens — same data, two layouts,
 * no forced horizontal scrolling on touch.
 *
 * Placeholder entries are visually and textually marked as reserved slots. They
 * are never dressed up as delivered client work.
 */
export function ProjectCard({ project, layout }: Props) {
  const ref = useRef<HTMLElement>(null);
  const { locale, t } = useLocale();
  const isPanel = layout === 'panel';
  const slotSpec = getSlot(project.id);
  const interactive = Boolean(project.caseStudyUrl || project.url);
  const href = project.caseStudyUrl || project.url;

  const media = (
    <div
      data-project-media
      /* One aspect ratio for both layouts, so a single source file serves the
         desktop rail and the stacked card without a second crop.
         In the rail the height is additionally capped against the viewport: the
         whole panel has to fit inside one screen minus the header, and at wide
         widths a pure 3:2 box grows taller than that. object-cover absorbs the
         difference. */
      className={`relative w-full overflow-hidden bg-surface ${projectImageSpec.aspectClass} ${
        isPanel ? 'lg:max-h-[38svh]' : ''
      }`}
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
              alt={project.imageAlt[locale]}
              fill
              priority={project.index === '01'}
              sizes={isPanel ? '(min-width: 1024px) 46vw, 90vw' : '(min-width: 640px) 45vw, 92vw'}
              /* object-top: these are page screenshots, and the hero is the
                 part worth showing if the box ever crops. */
              className="object-cover object-top transition-transform duration-[900ms] ease-editorial group-hover:scale-[1.03]"
            />
          ) : (
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
        <span className="label absolute top-4 rounded-full border border-rule bg-white/85 px-3 py-1.5 text-[0.5625rem] backdrop-blur end-4">
          {t.work.reservedSlot}
        </span>
      )}
    </div>
  );

  const body = (
    <div data-project-meta className={`flex flex-col gap-3 ${isPanel ? 'pt-6' : 'pt-5'}`}>
      <p className="label label--accent">{project.category[locale]}</p>

      {/* The project name carries the brand green in both locales. Both scripts
          take the SAME colour: an Arabic name set in grey beside a black Latin
          one reads as a caption rather than as half of one title. */}
      <h3
        className={`font-medium tracking-[-0.035em] text-accent-ink ${
          isPanel ? 'text-[clamp(1.75rem,2.4vw,2.6rem)]' : 'text-[clamp(1.5rem,6vw,2rem)]'
        } leading-[1.02]`}
      >
        {/* Brand names are proper nouns and stay in their own script; the Latin
            name is marked LTR so it never reflows inside an RTL paragraph. */}
        <span lang="en" dir="ltr" className="inline-block">
          {project.title}
        </span>
        {project.titleAr && (
          <>
            {' '}
            <span lang="ar" dir="rtl" className="font-arabic text-[0.68em] font-normal">
              {project.titleAr}
            </span>
          </>
        )}
      </h3>

      <p
        className={`max-w-md text-[0.9375rem] leading-relaxed text-ink-body text-pretty ${
          isPanel ? 'line-clamp-3' : ''
        }`}
      >
        {project.description[locale]}
      </p>

      <ul className="mt-1 flex flex-wrap gap-x-2 gap-y-2">
        {project.technologies.map((tech) => (
          <li
            key={tech}
            lang="en"
            dir="ltr"
            className="label rounded-full border border-rule px-3 py-1.5 text-[0.5625rem] text-ink-mute"
          >
            {tech}
          </li>
        ))}
      </ul>

      {project.isPlaceholder ? (
        <p className="label mt-2 text-ink-faint">{t.work.awaitingCaseStudy}</p>
      ) : (
        interactive && (
          <span className="label link-underline mt-2 inline-flex w-fit items-center gap-2 text-accent-ink">
            {t.work.visitLive} <span aria-hidden="true">&#8599;</span>
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

  const shared = `group flex flex-col ${
    isPanel ? 'w-[78vw] max-w-[860px] flex-none sm:w-[62vw] lg:w-[46vw]' : 'w-full'
  }`;

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
