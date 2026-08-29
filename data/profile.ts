/**
 * Authoritative personal profile. Every claim here comes from information
 * supplied by Mohammed Al-Hafiz. Do not add employers, degrees, awards,
 * certifications, revenue figures or client names that are not supplied.
 */

export const profile = {
  /**
   * The name the site is branded under, matching the `hafizone` logo.
   * This single field feeds the navbar, footer, About, page title, OpenGraph
   * and JSON-LD — change it here and it changes everywhere.
   */
  name: 'Mohammed Al-Hafiz',

  /** Full legal name. Both family names below are drawn from it. */
  fullName: 'محمد أحمد الكمالي محمد الحافظ',

  /**
   * Other names the same person is known by. Mohammed uses Al-Kamali and
   * Al-Hafiz interchangeably, and the Mostaql profile the reviews link to is
   * under Al-Kamali. Declaring them keeps the site findable under either name
   * and stops the review link looking like it belongs to someone else.
   */
  alternateNames: ['Mohammed Al-Kamali', 'محمد الكمالي', 'محمد الحافظ'],

  role: 'Creative Designer & WordPress Developer',

  positioning:
    'I combine creative design and WordPress development to create modern, practical, and distinctive digital experiences.',

  positioningAlt:
    'Designing modern visual identities and building professional digital experiences.',

  oneLine:
    'Creative Designer & WordPress Developer creating modern visual identities and professional digital experiences.',

  bio: [
    'Creative Designer and WordPress Developer with over 10 years of experience across graphic, visual, print and digital design.',
    'Since 2020 the focus has shifted more strongly toward building professional WordPress websites — combining modern design, usability, performance and functionality around the needs of each project.',
    'The work bridges creativity and technology: understanding a project from both the visual and the technical side, and turning an idea into a clear, distinctive and effective digital experience.',
  ],

  manifesto: {
    line1: 'Good design should look clear.',
    line2: 'Great design should also work.',
    principles: [
      'Design with purpose.',
      'Build with precision.',
      'Keep it simple.',
      'Make it useful.',
    ],
  },

  /**
   * Verifiable facts only. The last two are read straight off the public
   * Mostaql profile, which the Reviews section links to — so a visitor can
   * check them rather than take them on trust.
   */
  facts: [
    { value: '10+', label: 'Years of design experience' },
    { value: '2020', label: 'WordPress development focus since' },
    { value: '30', label: 'Projects completed on Mostaql' },
    { value: '23', label: 'Client ratings on Mostaql' },
  ],

  /** Portrait is optional. No portrait is fabricated — the About section falls
   *  back to a typographic identity treatment when this stays null. */
  portrait: null as { src: string; alt: string } | null,
} as const;

export const heroCopy = {
  headline: ['Designing Ideas.', 'Building Digital', 'Experiences.'],
  /** Word (0-indexed within its line) rendered in the serif accent face. */
  accent: { line: 1, word: 1 },
  intro:
    'Creative Designer & WordPress Developer. Over ten years turning brands, ideas and businesses into clear, modern digital experiences.',
  meta: [
    { label: 'Experience', value: '10+ Years of Design' },
    { label: 'Focus', value: 'WordPress since 2020' },
  ],
  primaryCta: { label: 'View My Work', href: '#work' },
  secondaryCta: { label: "Let's Work Together", href: '#contact' },
} as const;
