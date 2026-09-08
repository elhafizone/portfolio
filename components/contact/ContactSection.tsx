'use client';

import { useRef } from 'react';

import { ContactForm } from '@/components/contact/ContactForm';
import { useLocale } from '@/components/i18n/LocaleProvider';
import { SplitText } from '@/components/motion/SplitText';
import { useSectionMotion } from '@/components/motion/useSectionMotion';
import { Button } from '@/components/ui/Button';
import { getSocialLinks } from '@/data/social';

/**
 * Final CTA + contact.
 *
 * Channels render only when configured in `config/site.ts` - no invented email
 * addresses, no dead social links. When nothing is configured the section says
 * so and leans on the form, rather than showing links that go nowhere.
 */
export function ContactSection() {
  const rootRef = useRef<HTMLElement>(null);
  const socials = getSocialLinks();
  const { t } = useLocale();
  useSectionMotion(rootRef);

  return (
    <section
      ref={rootRef}
      id="contact"
      className="section"
      aria-labelledby="contact-heading"
    >
      {/* Final CTA */}
      <div className="shell relative z-10">
        <div className="border-t border-rule pt-5">
          <span className="label label-marked">{t.contact.eyebrow}</span>
        </div>

        <SplitText
          as="h2"
          id="contact-heading"
          lines={[
            t.contact.title[0],
            <span key="l2">
              {t.contact.titlePrefix}{' '}
              <span className="serif-accent">{t.contact.title[1]}</span>
            </span>,
          ]}
          className="mega mt-10 lg:mt-14"
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-8">
          <p data-fade className="lead max-w-xl lg:col-span-6">
            {t.contact.intro}
          </p>

          <div data-fade className="flex items-start lg:col-span-4 lg:col-start-9 lg:justify-end">
            <Button href="#contact-name" cursorLabel="SEND" withArrow>
              {t.contact.cta}
            </Button>
          </div>
        </div>
      </div>

      {/* Form + channels */}
      <div className="shell relative z-10 mt-20 grid gap-14 lg:mt-28 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <ContactForm />
        </div>

        <aside className="lg:col-span-4 lg:col-start-9">
          <div className="border-t border-rule-strong pt-8">
            <p className="label label-marked">{t.contact.directChannels}</p>

            {socials.length > 0 ? (
              <ul data-fade-group className="mt-7 space-y-1">
                {socials.map((social) => {
                  const channel = t.contact.channels[social.id];
                  return (
                    <li key={social.id} data-fade>
                      <a
                        href={social.href}
                        target={social.href.startsWith('http') ? '_blank' : undefined}
                        rel={
                          social.href.startsWith('http') ? 'noopener noreferrer' : undefined
                        }
                        data-cursor-label="OPEN"
                        className="group flex items-baseline justify-between gap-4 border-b border-rule py-4 transition-colors hover:border-accent"
                      >
                        <span className="text-[1.0625rem] tracking-[-0.015em] text-ink transition-colors group-hover:text-accent-ink">
                          {channel.label}
                        </span>
                        {/* An address is printed as-is and forced LTR; anything
                            else falls back to the localised hint. */}
                        <span
                          {...(social.handle ? { lang: 'en', dir: 'ltr' as const } : {})}
                          className={`label ${
                            social.handle ? 'normal-case' : ''
                          } text-ink-faint transition-colors group-hover:text-accent-ink`}
                        >
                          {social.handle ?? channel.hint} &#8599;
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p data-fade className="mt-7 text-[0.9375rem] leading-relaxed text-ink-body">
                {t.contact.unconfiguredNotice}
              </p>
            )}

            {/* Name, role and positioning come from the DICTIONARY, not from
                `profile`. `profile` holds the English source of record, and
                printing it here left an English signature block sitting at the
                bottom of the Arabic page. */}
            <div data-fade className="mt-10 border-t border-rule pt-6">
              <p className="text-[1.0625rem] leading-snug tracking-[-0.02em] text-ink">
                {t.identity.name}
              </p>
              <p className="mt-1 text-sm text-ink-body">{t.identity.role}</p>
              <p className="mt-6 max-w-xs text-sm leading-relaxed text-ink-body text-pretty">
                {t.contact.positioning}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
