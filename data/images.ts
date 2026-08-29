/**
 * IMAGE SLOTS — single source of truth for every image the site expects.
 *
 * Slots are numbered in the order they appear down the page, and each number is
 * printed on the placeholder shown in the live page — so "IMAGE 03" on screen
 * maps directly to a row here. Prepare an asset at the stated pixel size, drop
 * it at `path`, then point the matching data file at it and the placeholder
 * disappears.
 *
 * Pixel sizes are 2x the largest size the slot is ever displayed at, so the
 * image stays sharp on retina screens without shipping anything oversized.
 * Next.js generates the smaller responsive variants automatically.
 */

export type ImageSlot = {
  /** Number printed on the on-screen placeholder. Follows page order. */
  slot: number;
  id: string;
  /** What the image should show. */
  label: string;
  /** Where it appears in the page. */
  where: string;
  width: number;
  height: number;
  ratio: string;
  /** Where to save the file, relative to /public. */
  path: string;
  /** Which data file to update once the file exists. */
  wiredIn: string;
};

/**
 * Hero visual.
 *
 * Square on purpose. The slot previously held a live WebGL canvas, which grew
 * without bound inside its grid cell: the canvas measured its container, the
 * container was `height: 100%`, and each resize fed the next. A fixed aspect
 * ratio removes the feedback loop entirely — the box cannot grow.
 */
export const heroImageSpec = {
  width: 1400,
  height: 1400,
  ratio: '1:1',
  aspectClass: 'aspect-square',
} as const;

/** Every project image shares one aspect ratio so a single file works in both
 *  the desktop rail and the stacked mobile card. */
export const projectImageSpec = {
  width: 1800,
  height: 1200,
  ratio: '3:2',
  aspectClass: 'aspect-[3/2]',
} as const;

export const portraitImageSpec = {
  width: 1200,
  height: 1500,
  ratio: '4:5',
  aspectClass: 'aspect-[4/5]',
} as const;

export const ogImageSpec = {
  width: 1200,
  height: 630,
  ratio: '1.91:1',
} as const;

export const imageSlots: ImageSlot[] = [
  {
    slot: 1,
    id: 'hero',
    label: 'Hero visual — signature image beside the headline',
    where: 'Hero, right of the headline',
    ...heroImageSpec,
    path: '/hero/hero-visual.webp',
    wiredIn: 'data/images.ts → heroImage',
  },
  {
    slot: 2,
    id: 'project-01',
    label: 'WordPress business website — full-page shot or device mockup',
    where: 'Selected Work, first panel',
    ...projectImageSpec,
    path: '/work/project-01.webp',
    wiredIn: 'data/projects.ts → projects[0].image',
  },
  {
    slot: 3,
    id: 'project-02',
    label: 'WooCommerce store — storefront or product page',
    where: 'Selected Work, second panel',
    ...projectImageSpec,
    path: '/work/project-02.webp',
    wiredIn: 'data/projects.ts → projects[1].image',
  },
  {
    slot: 4,
    id: 'project-03',
    label: 'Brand / visual identity — print, social or identity board',
    where: 'Selected Work, third panel',
    ...projectImageSpec,
    path: '/work/project-03.webp',
    wiredIn: 'data/projects.ts → projects[2].image',
  },
  {
    slot: 5,
    id: 'project-04',
    label: 'Booking or service website — booking flow or landing page',
    where: 'Selected Work, fourth panel',
    ...projectImageSpec,
    path: '/work/project-04.webp',
    wiredIn: 'data/projects.ts → projects[3].image',
  },
  {
    slot: 6,
    id: 'portrait',
    label: 'Portrait of Mohammed Al-Hafiz — vertical crop, plain background',
    where: 'About section, left column',
    ...portraitImageSpec,
    path: '/about/portrait.webp',
    wiredIn: 'data/profile.ts → profile.portrait',
  },
  {
    slot: 7,
    id: 'og',
    label: 'Social share card — logo, name and role on a white field',
    where: 'Link previews on WhatsApp, LinkedIn, X, Slack',
    ...ogImageSpec,
    path: '/og.jpg',
    wiredIn: 'data/images.ts → ogImage',
  },
];

/**
 * Hero visual source. Empty = the numbered placeholder is shown instead.
 * TODO: create /public/hero/hero-visual.webp at 1400x1400 and set this.
 */
export const heroImage = '';

/** Alt text for the hero visual. Required once `heroImage` is set. */
export const heroImageAlt = '';

/**
 * Social share image. Empty = no image tag is emitted, which is better than
 * pointing link previews at a file that does not exist.
 * TODO: create /public/og.jpg at 1200x630 and set this to '/og.jpg'.
 */
export const ogImage = '';

/** Formats a slot's size for display, e.g. "1800 × 1200". */
export function formatSize(width: number, height: number) {
  return `${width} × ${height}`;
}

export function getSlot(id: string): ImageSlot | undefined {
  return imageSlots.find((s) => s.id === id);
}
