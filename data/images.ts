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
 * Every project image shares one aspect ratio so a single file works in both
 * the desktop rail and the stacked mobile card.
 *
 * All six project slots are filled with live screenshots, so they no longer
 * appear in `imageSlots` — that list is what is still outstanding.
 */
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

export const imageSlots: ImageSlot[] = [
  {
    slot: 1,
    id: 'portrait',
    label: 'Portrait of Mohammed — vertical crop, plain background',
    where: 'About section, left column',
    ...portraitImageSpec,
    path: '/about/portrait.webp',
    wiredIn: 'data/profile.ts → profile.portrait',
  },
];

/** Formats a slot's size for display, e.g. "1800 × 1200". */
export function formatSize(width: number, height: number) {
  return `${width} × ${height}`;
}

export function getSlot(id: string): ImageSlot | undefined {
  return imageSlots.find((s) => s.id === id);
}
