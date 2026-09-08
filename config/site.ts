/**
 * Central site configuration.
 *
 * NOTE: Values marked `TODO` are intentionally empty placeholders. Nothing in the
 * UI invents a URL — any link left empty is either hidden or rendered as an
 * inert "coming soon" state. Fill these in and the UI activates automatically.
 */

/**
 * Absolute site origin — feeds canonical, OpenGraph, sitemap and robots.
 *
 * Resolution order:
 *   1. `NEXT_PUBLIC_SITE_URL` — set this to the real domain in production.
 *   2. `VERCEL_URL` — the current deployment's own host, so preview and
 *      temporary deployments describe themselves instead of pointing at the
 *      placeholder.
 *   3. the placeholder below.
 *
 * TODO: set `NEXT_PUBLIC_SITE_URL` (or replace the placeholder) once the
 * production domain exists.
 */
const resolvedSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
  'https://example.com';

/**
 * Only a deliberately configured domain is treated as the canonical, indexable
 * site. Preview and temporary deployments fall back to `VERCEL_URL`, and those
 * hosts are kept out of search results by `app/robots.ts`.
 */
const isCanonicalDomain = Boolean(process.env.NEXT_PUBLIC_SITE_URL);

export const siteConfig = {
  name: 'Mohammed Al-Hafiz',
  title: 'Creative Designer & WordPress Developer',
  url: resolvedSiteUrl,
  indexable: isCanonicalDomain,
  /**
   * When the CONTENT last genuinely changed — the copy, the work, the services.
   * Feeds `lastModified` in the sitemap. Bump it when you change what the site
   * says, not when you change how it looks or redeploy.
   */
  contentUpdatedAt: new Date('2026-09-08'),
  locale: 'en',
  description:
    'Mohammed Al-Hafiz is a Sudanese Creative Designer and WordPress Developer with over 10 years of experience across 3D, graphic, visual, print and digital design. Since 2020 he has focused on building professional WordPress websites that combine modern design, usability and functionality.',
  keywords: [
    'Creative Designer',
    'WordPress Developer',
    'Website Design',
    'WooCommerce',
    'Elementor',
    'Visual Design',
    'Graphic Design',
    'Custom WordPress Websites',
  ],
} as const;

type ContactConfig = {
  email: string;
  whatsapp: string;
  linkedin: string;
  behance: string;
  location: string;
};

/** Contact channels. Empty string = not configured yet, link is hidden. */
export const contactConfig: ContactConfig = {
  /** Published by Mohammed on 8 September 2026 for public display. */
  email: 'hello@hafizone.dev',
  /**
   * International format. Non-digits are stripped when the wa.me link is built,
   * so the spacing here is purely for reading: 20 = Egypt, then the number.
   */
  whatsapp: '+20 12 11758105',
  /** TODO: add the LinkedIn profile URL. */
  linkedin: '',
  /** TODO: add the Behance / Dribbble / other portfolio URL. */
  behance: '',
  /** Optional location string shown in the footer, e.g. "Riyadh, Saudi Arabia". */
  location: '',
} as const;

/**
 * Contact form delivery. No backend is bundled — the API route validates the
 * payload and then hands off to whichever provider is configured via env vars.
 * Until one is configured the route responds with a clear "not configured"
 * error instead of pretending the message was sent.
 */
export const formConfig = {
  endpoint: '/api/contact',
  maxMessageLength: 2000,
} as const;

/** Analytics is an opt-in integration point. Nothing loads unless an ID is set. */
export const analyticsConfig = {
  /** TODO: set NEXT_PUBLIC_ANALYTICS_ID to enable. */
  id: process.env.NEXT_PUBLIC_ANALYTICS_ID ?? '',
  enabled: Boolean(process.env.NEXT_PUBLIC_ANALYTICS_ID),
} as const;

export const navLinks = [
  { label: 'Work', href: '#work' },
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'Contact', href: '#contact' },
] as const;
