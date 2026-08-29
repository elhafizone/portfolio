'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { MagneticButton } from '@/components/motion/MagneticButton';
import { useMotion } from '@/components/motion/MotionProvider';
import { Logo } from '@/components/ui/Logo';
import { navLinks } from '@/config/site';
import { profile } from '@/data/profile';
import { gsap, registerGsap } from '@/lib/gsap';

export function Navbar() {
  const { scrollTo, setScrollLocked, reduced } = useMotion();
  const [elevated, setElevated] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>('');
  const overlayRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  /* --- elevate after leaving the hero --------------------------------- */
  useEffect(() => {
    const onScroll = () => setElevated(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* --- track which section is in view --------------------------------- */
  useEffect(() => {
    const ids = navLinks.map((l) => l.href.slice(1));
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5] }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  /* --- overlay open/close animation ----------------------------------- */
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    setScrollLocked(open);

    if (reduced) {
      gsap.set(overlay, { autoAlpha: open ? 1 : 0 });
      return;
    }

    registerGsap();
    const ctx = gsap.context(() => {
      const items = overlay.querySelectorAll('[data-menu-item]');
      if (open) {
        gsap
          .timeline()
          .set(overlay, { autoAlpha: 1 })
          .fromTo(
            overlay,
            { clipPath: 'inset(0 0 100% 0)' },
            { clipPath: 'inset(0 0 0% 0)', duration: 0.7, ease: 'expo.out' }
          )
          .fromTo(
            items,
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, ease: 'power3.out' },
            '-=0.35'
          );
      } else {
        gsap.to(overlay, {
          clipPath: 'inset(0 0 100% 0)',
          duration: 0.5,
          ease: 'expo.inOut',
          onComplete: () => gsap.set(overlay, { autoAlpha: 0 }),
        });
      }
    }, overlay);

    return () => ctx.revert();
  }, [open, reduced, setScrollLocked]);

  /* --- escape to close, and return focus to the toggle ---------------- */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      // Let the overlay start closing before the scroll begins.
      window.setTimeout(() => scrollTo(href), reduced ? 0 : 180);
      history.replaceState(null, '', href);
    },
    [scrollTo, reduced]
  );

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      <header
        className={`fixed inset-x-0 top-0 z-[90] transition-all duration-500 ease-editorial ${
          elevated ? 'py-3' : 'py-5'
        }`}
      >
        <div className="shell">
          <div
            className={`flex items-center justify-between gap-6 rounded-full transition-all duration-500 ease-editorial ${
              elevated
                ? 'border border-rule bg-white/80 px-5 py-2.5 shadow-[0_1px_24px_rgba(13,13,13,0.06)] backdrop-blur-xl sm:px-6'
                : 'border border-transparent px-0 py-1'
            }`}
          >
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                scrollTo(0);
              }}
              className="flex items-center gap-3"
              aria-label={`${profile.name} - back to top`}
              data-cursor-label="TOP"
            >
              <Logo height={elevated ? 32 : 38} priority />
            </a>

            <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
              {navLinks.map((link) => {
                const id = link.href.slice(1);
                const isActive = activeId === id;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      go(link.href);
                    }}
                    aria-current={isActive ? 'true' : undefined}
                    className={`relative rounded-full px-4 py-2 text-[0.9375rem] transition-colors duration-300 ${
                      isActive ? 'text-accent-ink' : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    {link.label}
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-4 bottom-1 h-px origin-left bg-accent transition-transform duration-500 ease-editorial ${
                        isActive ? 'scale-x-100' : 'scale-x-0'
                      }`}
                    />
                  </a>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <MagneticButton className="hidden sm:inline-block">
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    go('#contact');
                  }}
                  data-cursor-label="TALK"
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[0.875rem] font-medium text-white transition-colors duration-500 ease-editorial hover:bg-accent-deep"
                >
                  Let&rsquo;s Talk
                  <span aria-hidden="true" className="text-accent">
                    &#9679;
                  </span>
                </a>
              </MagneticButton>

              <button
                ref={toggleRef}
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="mobile-menu"
                className="relative z-[102] flex h-11 w-11 items-center justify-center rounded-full border border-rule-strong lg:hidden"
              >
                <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
                <span aria-hidden="true" className="flex h-3 w-5 flex-col justify-between">
                  <span
                    className={`block h-px w-full bg-ink transition-transform duration-400 ease-editorial ${
                      open ? 'translate-y-[5.5px] rotate-45' : ''
                    }`}
                  />
                  <span
                    className={`block h-px w-full bg-ink transition-transform duration-400 ease-editorial ${
                      open ? '-translate-y-[5.5px] -rotate-45' : ''
                    }`}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        ref={overlayRef}
        id="mobile-menu"
        className="fixed inset-0 z-[95] flex flex-col justify-between bg-paper px-[var(--gutter)] pb-10 pt-28 lg:hidden"
        style={{ visibility: 'hidden', opacity: 0 }}
        aria-hidden={!open}
      >
        <nav aria-label="Mobile" className="flex flex-col">
          {navLinks.map((link, i) => (
            <a
              key={link.href}
              data-menu-item
              href={link.href}
              tabIndex={open ? 0 : -1}
              onClick={(e) => {
                e.preventDefault();
                go(link.href);
              }}
              className="flex items-baseline gap-4 border-b border-rule py-5 text-[clamp(2rem,9vw,3rem)] font-medium leading-none tracking-[-0.04em]"
            >
              <span className="label numeral text-ink-faint">
                {String(i + 1).padStart(2, '0')}
              </span>
              {link.label}
            </a>
          ))}
        </nav>

        <div data-menu-item className="flex flex-col gap-5">
          <a
            href="#contact"
            tabIndex={open ? 0 : -1}
            onClick={(e) => {
              e.preventDefault();
              go('#contact');
            }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-4 text-base font-medium text-white"
          >
            Let&rsquo;s Talk
            <span aria-hidden="true" className="text-accent">
              &#9679;
            </span>
          </a>
          <p className="label">{profile.role}</p>
        </div>
      </div>
    </>
  );
}
