/**
 * Career timeline — the parts that are facts rather than prose.
 *
 * SOURCE: Mohammed's CV, supplied 7 September 2026. Employers, institutions and
 * years are proper nouns and stay identical in both languages; the surrounding
 * narrative is localised through the dictionaries and zipped by position.
 *
 * Years appear beside company names on the CV with no end dates, so they are
 * presented as the years attached to each engagement, not as continuous
 * employment spans.
 */
export const timelineTags: string[][] = [
  ['Garden City University (UGC)', 'CG Way Egypt', 'Architecture Visualization', 'Multimedia'],
  ['Al Murooj Agricultural', 'Must Events', 'Pazzle 6', 'Easy Tech', 'Innovate', 'The S'],
  ['Freelance Web Design', 'Orecal', 'WordPress', 'WooCommerce'],
  ['Design', 'Development', 'Digital Experiences'],
];

/** Entries that should carry the accent marker on the timeline spine. */
export const timelineHighlighted = [false, false, true, true];
