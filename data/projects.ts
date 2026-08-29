/**
 * PROJECT DATA
 *
 * IMPORTANT — READ BEFORE EDITING
 * -------------------------------
 * No real client project has been published here yet. Every entry below is a
 * structural placeholder with `isPlaceholder: true`, and the UI labels those
 * entries honestly ("Placeholder entry — awaiting case study") instead of
 * presenting them as delivered client work.
 *
 * To publish a real project:
 *   1. Drop the image into /public/work/ (AVIF or WebP, ~1600px wide).
 *   2. Fill in the fields below and set `isPlaceholder: false`.
 *   3. The placeholder label disappears automatically.
 *
 * Do not set `isPlaceholder: false` on an entry that is still invented copy.
 */

export type Project = {
  id: string;
  index: string;
  title: string;
  category: string;
  year: string;
  description: string;
  technologies: string[];
  /** Path under /public. Null renders a typographic placeholder plate. */
  image: string | null;
  imageAlt: string;
  /** Optional short video loop (mp4/webm) shown instead of the image. */
  video: string | null;
  /** Live site URL. Empty string = no link rendered. */
  url: string;
  /** Internal case-study route, e.g. "/work/project-slug". */
  caseStudyUrl: string;
  featured: boolean;
  isPlaceholder: boolean;
};

export const projects: Project[] = [
  {
    id: 'project-01',
    index: '01',
    title: 'WordPress Business Website',
    category: 'Website Design / WordPress',
    year: '—',
    description:
      'Slot reserved for a complete WordPress website build — design, development and handover.',
    technologies: ['WordPress', 'Elementor', 'Fluent Forms'],
    image: null,
    imageAlt: '',
    video: null,
    url: '',
    caseStudyUrl: '',
    featured: true,
    isPlaceholder: true,
  },
  {
    id: 'project-02',
    index: '02',
    title: 'WooCommerce Store',
    category: 'E-commerce / WooCommerce',
    year: '—',
    description:
      'Slot reserved for an online store project — product presentation, category structure and checkout flow.',
    technologies: ['WordPress', 'WooCommerce', 'Blocksy'],
    image: null,
    imageAlt: '',
    video: null,
    url: '',
    caseStudyUrl: '',
    featured: true,
    isPlaceholder: true,
  },
  {
    id: 'project-03',
    index: '03',
    title: 'Brand & Visual Identity',
    category: 'Creative / Visual Design',
    year: '—',
    description:
      'Slot reserved for a visual identity or creative design project across print, social and marketing material.',
    technologies: ['Brand Design', 'Print', 'Social Media'],
    image: null,
    imageAlt: '',
    video: null,
    url: '',
    caseStudyUrl: '',
    featured: true,
    isPlaceholder: true,
  },
  {
    id: 'project-04',
    index: '04',
    title: 'Booking & Service Website',
    category: 'Website Design / WordPress',
    year: '—',
    description:
      'Slot reserved for a service or clinic website with online booking and enquiry handling.',
    technologies: ['WordPress', 'Amelia', 'Fluent Forms'],
    image: null,
    imageAlt: '',
    video: null,
    url: '',
    caseStudyUrl: '',
    featured: true,
    isPlaceholder: true,
  },
];

export const projectsCopy = {
  eyebrow: 'Selected Work',
  title: 'Selected Work',
  intro: 'A selection of digital experiences, websites, and creative projects.',
  placeholderNotice:
    'Case studies are being prepared. These entries are reserved slots, not published client work.',
} as const;

export const hasPublishedProjects = projects.some((p) => !p.isPlaceholder);
