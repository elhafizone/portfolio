'use client';

import { useLocale } from '@/components/i18n/LocaleProvider';
import { useMotion } from '@/components/motion/MotionProvider';
import { Logo } from '@/components/ui/Logo';
import { contactConfig } from '@/config/site';
import { getSocialLinks } from '@/data/social';

export function Footer() {
  const { scrollTo } = useMotion();
  const { t } = useLocale();
  const socials = getSocialLinks();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-rule bg-paper">
      <div className="shell py-14 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Identity */}
          <div className="lg:col-span-5">
            <Logo height={32} />
            <p className="mt-6 max-w-xs text-[1.0625rem] leading-snug tracking-[-0.02em] text-ink">
              {t.identity.name}
            </p>
            <p className="mt-1 text-ink-body">{t.identity.role}</p>
            {contactConfig.location && <p className="label mt-6">{contactConfig.location}</p>}
          </div>

          {/* Navigation */}
          <nav aria-label="Footer" className="lg:col-span-3">
            <p className="label label-marked">{t.footer.navigate}</p>
            <ul className="mt-6 space-y-3">
              {t.nav.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollTo(link.href);
                      history.replaceState(null, '', link.href);
                    }}
                    className="link-underline text-ink-soft transition-colors hover:text-accent-ink"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div className="lg:col-span-4">
            <p className="label label-marked">{t.footer.contact}</p>
            {socials.length > 0 ? (
              <ul className="mt-6 space-y-3">
                {socials.map((social) => {
                  const channel = t.contact.channels[social.id];
                  return (
                    <li key={social.id}>
                      <a
                        href={social.href}
                        target={social.href.startsWith('http') ? '_blank' : undefined}
                        rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="group flex items-baseline justify-between gap-4 border-b border-rule pb-3 transition-colors hover:border-accent"
                      >
                        <span className="text-ink-soft transition-colors group-hover:text-accent-ink">
                          {channel.label}
                        </span>
                        <span
                          {...(social.handle ? { lang: 'en', dir: 'ltr' as const } : {})}
                          className={`label ${
                            social.handle ? 'normal-case' : ''
                          } text-ink-faint transition-colors group-hover:text-accent-ink`}
                        >
                          {social.handle ?? channel.hint}
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-6 max-w-xs text-sm leading-relaxed text-ink-body">
                {t.footer.noChannels}
              </p>
            )}
          </div>
        </div>

        {/* Baseline */}
        {/* One row at every width. The type steps down below sm so three items
            still fit a 360px screen instead of stacking. */}
        <div className="mt-16 flex flex-row items-center justify-between gap-x-3 border-t border-rule pt-6 text-[0.5625rem] sm:gap-x-6 sm:text-[0.6875rem]">
          <p className="label whitespace-nowrap text-[length:inherit]">
            &copy; {year} {t.identity.name}
          </p>
          <p className="footer-credit label flex items-center gap-2 whitespace-nowrap text-[length:inherit]">
            <span
              aria-hidden="true"
              className="inline-block h-1.5 w-1.5 flex-none rounded-full bg-accent"
            />
            {t.footer.builtInHouse}
          </p>
          <button
            type="button"
            onClick={() => scrollTo(0)}
            className="label link-underline whitespace-nowrap text-[length:inherit] text-ink-soft transition-colors hover:text-accent-ink"
            data-cursor-label="TOP"
          >
            {t.footer.backToTop} &#8599;
          </button>
        </div>
      </div>
    </footer>
  );
}
