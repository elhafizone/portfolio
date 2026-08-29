'use client';

import { useRef } from 'react';

import { ContactForm } from '@/components/contact/ContactForm';
import { SplitText } from '@/components/motion/SplitText';
import { useSectionMotion } from '@/components/motion/useSectionMotion';
import { Button } from '@/components/ui/Button';
import { contactCopy, getSocialLinks } from '@/data/social';
import { profile } from '@/data/profile';

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
  useSectionMotion(rootRef);

  return (
    <section
      ref={rootRef}
      id="contact"
      className="section border-t border-rule"
      aria-labelledby="contact-heading"
    >
      <div className="grid-lines" aria-hidden="true" />

      {/* Final CTA */}
      <div className="shell relative z-10">
        <div className="flex items-baseline justify-between gap-6 border-t border-rule pt-5">
          <span className="label label-marked">{contactCopy.eyebrow}</span>
          <span className="label numeral text-ink-faint">10</span>
        </div>

        <SplitText
          as="h2"
          id="contact-heading"
          lines={[
            'Have a Project',
            <span key="l2">
              in <span className="serif-accent">Mind?</span>
            </span>,
          ]}
          className="mega mt-10 lg:mt-14"
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-8">
          <p data-fade className="lead max-w-xl lg:col-span-6">
            {contactCopy.intro}
          </p>

          <div data-fade className="flex items-start lg:col-span-4 lg:col-start-9 lg:justify-end">
            <Button href="#contact-name" cursorLabel="SEND" withArrow>
              {contactCopy.cta}
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
            <p className="label label-marked">Direct channels</p>

            {socials.length > 0 ? (
              <ul data-fade-group className="mt-7 space-y-1">
                {socials.map((social) => (
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
                        {social.label}
                      </span>
                      <span className="label text-ink-faint transition-colors group-hover:text-accent-ink">
                        {social.handleLabel} &#8599;
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p data-fade className="mt-7 text-[0.9375rem] leading-relaxed text-ink-mute">
                {contactCopy.unconfiguredNotice}
              </p>
            )}

            <div data-fade className="mt-10 border-t border-rule pt-6">
              <p className="text-[1.0625rem] leading-snug tracking-[-0.02em] text-ink">
                {profile.name}
              </p>
              <p className="mt-1 text-sm text-ink-mute">{profile.role}</p>
              <p className="mt-6 max-w-xs text-sm leading-relaxed text-ink-mute text-pretty">
                {profile.positioning}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
