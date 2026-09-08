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
   * Al-Hafiz interchangeably. Declaring both keeps the site findable under
   * either name.
   */
  alternateNames: [
    'Mohammed Al-Kamali',
    'Mohammed Ahmad El-Kamali',
    'محمد الكمالي',
    'محمد الحافظ',
  ],

  /** Stated on the CV. */
  nationality: 'Sudanese',
  nationalityCountry: 'Sudan',

  role: 'Creative Designer & WordPress Developer',

  positioning:
    'I combine creative design and WordPress development to create modern, practical, and distinctive digital experiences.',

  positioningAlt:
    'Designing and building professional digital experiences, end to end.',

  oneLine:
    'Creative Designer & WordPress Developer building modern, professional digital experiences.',

  bio: [
    'Creative Designer and WordPress Developer with over 10 years of experience across 3D, graphic, visual, print and digital design.',
    'A Sudanese designer with a multimedia degree from Garden City University (UGC). The career began in 3D — interior, exterior and product visualisation — and widened through motion graphics, print and promotional work before the focus moved to the browser.',
    'Since 2020 that focus has been on building professional WordPress websites — combining modern design, usability, performance and functionality around the needs of each project.',
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
   * Verifiable facts only, both taken from the CV.
   *
   * The two freelance-platform figures that used to sit here (completed
   * projects, client ratings) were removed along with the platform itself. Do
   * not reintroduce a number that the site no longer shows its source for.
   */
  facts: [
    { value: '10+', label: 'Years of design experience' },
    { value: '2020', label: 'WordPress development focus since' },
  ],

  /**
   * Portrait. Supplied by Mohammed; cropped to 4:5 and encoded to WebP without
   * upscaling, so what ships is the real detail of the original rather than an
   * interpolated version of it.
   *
   * NOTE: the source is 896x1200. The slot renders at roughly 600 CSS px wide,
   * so this covers a standard display but is short of the 1200x1500 a retina
   * screen would use. A higher-resolution export would sharpen it — drop it in
   * at the same path and nothing else changes.
   */
  portrait: {
    src: '/about/portrait.webp',
    alt: 'Mohammed Al-Hafiz, arms folded, in a denim shirt against a plain light backdrop',
  } as { src: string; alt: string } | null,
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
