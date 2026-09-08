import { contactConfig } from '@/config/site';

/** Ids are stable keys; the visible wording comes from the dictionaries. */
export type SocialId = 'email' | 'whatsapp' | 'linkedin' | 'behance';

export type SocialLink = {
  id: SocialId;
  href: string;
  /**
   * A literal value to print beside the label — an address, a handle. Null when
   * there is nothing literal to show and the localised hint is used instead.
   *
   * This is the split that matters: an email address is the same string in
   * every language, "Message directly" is not. Returning an English label here
   * is what previously put `WhatsApp / Message directly` on the Arabic page.
   */
  handle: string | null;
};

/**
 * Only channels with a configured value are returned — no invented URLs and no
 * dead links. Fill in `contactConfig` in config/site.ts to activate a channel.
 */
export function getSocialLinks(): SocialLink[] {
  const links: SocialLink[] = [];

  if (contactConfig.email) {
    links.push({
      id: 'email',
      href: `mailto:${contactConfig.email}`,
      handle: contactConfig.email,
    });
  }
  if (contactConfig.whatsapp) {
    links.push({
      id: 'whatsapp',
      // wa.me takes digits only: country code first, no plus, no spaces.
      href: `https://wa.me/${contactConfig.whatsapp.replace(/\D/g, '')}`,
      handle: null,
    });
  }
  if (contactConfig.linkedin) {
    links.push({ id: 'linkedin', href: contactConfig.linkedin, handle: null });
  }
  if (contactConfig.behance) {
    links.push({ id: 'behance', href: contactConfig.behance, handle: null });
  }

  return links;
}

/**
 * Canonical option values. These are what the form SUBMITS and what the API
 * validates against, so they stay in one language regardless of what the
 * visitor sees - the labels are translated in the dictionaries.
 */
export const projectTypes = [
  'Website Design',
  'WordPress',
  'WooCommerce',
  'Graphic Design',
  'Other',
] as const;

export const budgetRanges = [
  'Under $500',
  '$500 – $1,500',
  '$1,500 – $3,000',
  '$3,000 – $6,000',
  '$6,000+',
  'Not sure yet',
] as const;
