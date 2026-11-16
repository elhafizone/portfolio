/**
 * Thin, safe wrapper around the Meta Pixel's `fbq`.
 *
 * Every call is a no-op when the pixel is not configured, not loaded yet, or
 * blocked by the visitor's browser - tracking must never break the page.
 * Only standard events are used so Meta can optimise ads for them without any
 * custom-conversion setup.
 */
type StandardEvent = 'PageView' | 'Lead' | 'Contact' | 'ViewContent';

type Fbq = (command: 'track', event: StandardEvent, params?: Record<string, unknown>) => void;

/** The same moments, reported to Google Analytics 4 under its recommended names. */
const gaName: Partial<Record<StandardEvent, string>> = {
  Lead: 'generate_lead',
  Contact: 'contact',
};

type Gtag = (command: 'event', name: string, params?: Record<string, unknown>) => void;

export function trackMeta(event: StandardEvent, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  const ga = gaName[event];
  if (ga && typeof gtag === 'function') {
    try {
      gtag('event', ga, params);
    } catch {
      /* ignore */
    }
  }
  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  if (typeof fbq !== 'function') return;
  try {
    fbq('track', event, params);
  } catch {
    /* A blocked or half-loaded pixel is not the page's problem. */
  }
}
