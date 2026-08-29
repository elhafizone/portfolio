'use client';

import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { MagneticButton } from '@/components/motion/MagneticButton';
import { useMotion } from '@/components/motion/MotionProvider';

type Variant = 'primary' | 'secondary' | 'ghost';

const base =
  'group relative inline-flex items-center justify-center gap-3 rounded-full text-[0.9375rem] font-medium leading-none transition-colors duration-500 ease-editorial focus-visible:outline-2 focus-visible:outline-offset-4';

const sizes = 'px-7 py-4 sm:px-8 sm:py-[1.15rem]';

const variants: Record<Variant, string> = {
  primary:
    'bg-ink text-white hover:bg-accent-deep focus-visible:outline-accent-ink',
  secondary:
    'border border-rule-strong text-ink hover:border-accent hover:text-accent-ink focus-visible:outline-accent-ink',
  ghost: 'text-ink hover:text-accent-ink px-0 py-0 focus-visible:outline-accent-ink',
};

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  /** Label shown inside the custom cursor while hovering. */
  cursorLabel?: string;
  /** Disables the magnetic pull for buttons in tight layouts. */
  magnetic?: boolean;
  withArrow?: boolean;
};

type AnchorProps = CommonProps & { href: string } & Omit<
    ComponentPropsWithoutRef<'a'>,
    keyof CommonProps | 'href'
  >;

type NativeButtonProps = CommonProps & { href?: undefined } & Omit<
    ComponentPropsWithoutRef<'button'>,
    keyof CommonProps
  >;

export type ButtonProps = AnchorProps | NativeButtonProps;

/**
 * Shared CTA. Handles in-page anchors through Lenis so the smooth-scroll system
 * stays the single scroll authority, and falls back to native navigation for
 * real URLs.
 */
export function Button(props: ButtonProps) {
  const {
    children,
    variant = 'primary',
    className = '',
    cursorLabel = 'OPEN',
    magnetic = true,
    withArrow = false,
  } = props;
  const { scrollTo } = useMotion();

  const classes = `${base} ${variant === 'ghost' ? '' : sizes} ${variants[variant]} ${className}`;

  const inner = (
    <>
      <span className="relative z-10">{children}</span>
      {withArrow && (
        <span
          aria-hidden="true"
          className="relative z-10 transition-transform duration-500 ease-editorial group-hover:translate-x-1"
        >
          &#8599;
        </span>
      )}
    </>
  );

  let element: ReactNode;

  if ('href' in props && props.href) {
    const { href, ...rest } = props as AnchorProps;
    const isAnchor = href.startsWith('#');

    if (isAnchor) {
      element = (
        <a
          {...stripCommon(rest)}
          href={href}
          className={classes}
          data-cursor-label={cursorLabel}
          onClick={(e) => {
            e.preventDefault();
            scrollTo(href);
            history.replaceState(null, '', href);
          }}
        >
          {inner}
        </a>
      );
    } else {
      const external = href.startsWith('http') || href.startsWith('mailto:');
      element = (
        <Link
          {...stripCommon(rest)}
          href={href}
          className={classes}
          data-cursor-label={cursorLabel}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
        >
          {inner}
        </Link>
      );
    }
  } else {
    const rest = props as NativeButtonProps;
    element = (
      <button {...stripCommon(rest)} className={classes} data-cursor-label={cursorLabel}>
        {inner}
      </button>
    );
  }

  if (!magnetic) return element;
  return <MagneticButton>{element}</MagneticButton>;
}

/** Removes the component-only props before spreading onto a DOM element. */
function stripCommon<T extends Record<string, unknown>>(props: T) {
  const {
    children: _children,
    variant: _variant,
    className: _className,
    cursorLabel: _cursorLabel,
    magnetic: _magnetic,
    withArrow: _withArrow,
    ...rest
  } = props as T & CommonProps;
  return rest;
}
