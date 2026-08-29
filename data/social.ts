import { contactConfig } from '@/config/site';

export type SocialLink = {
  id: string;
  label: string;
  href: string;
  handleLabel: string;
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
      label: 'Email',
      href: `mailto:${contactConfig.email}`,
      handleLabel: contactConfig.email,
    });
  }
  if (contactConfig.whatsapp) {
    links.push({
      id: 'whatsapp',
      label: 'WhatsApp',
      href: `https://wa.me/${contactConfig.whatsapp.replace(/\D/g, '')}`,
      handleLabel: 'Message directly',
    });
  }
  if (contactConfig.linkedin) {
    links.push({
      id: 'linkedin',
      label: 'LinkedIn',
      href: contactConfig.linkedin,
      handleLabel: 'Professional profile',
    });
  }
  if (contactConfig.mostaql) {
    links.push({
      id: 'mostaql',
      label: 'Mostaql',
      href: contactConfig.mostaql,
      handleLabel: 'Client ratings',
    });
  }
  if (contactConfig.behance) {
    links.push({
      id: 'behance',
      label: 'Portfolio',
      href: contactConfig.behance,
      handleLabel: 'More work',
    });
  }

  return links;
}

export const contactCopy = {
  eyebrow: 'Contact',
  title: 'Have a Project in Mind?',
  intro:
    "Let's turn your idea into a clear, modern, and effective digital experience.",
  cta: 'Start a Conversation',
  unconfiguredNotice:
    'Contact channels are not published yet — use the form and the message will reach the configured inbox.',
} as const;

export const projectTypes = [
  'Website Design',
  'WordPress',
  'WooCommerce',
  'Branding',
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
