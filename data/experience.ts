/**
 * Career timeline. Deliberately contains no employers, no job titles at named
 * companies and no employment dates — none of that was supplied. Only the
 * disciplines and the 2020 WordPress shift are factual.
 */

export type TimelineEntry = {
  id: string;
  marker: string;
  title: string;
  description: string;
  tags: string[];
};

export const timeline: TimelineEntry[] = [
  {
    id: 'foundation',
    marker: 'Foundation',
    title: 'Design Foundation',
    description:
      'A career that started across several design disciplines at once — the years that built the eye before they built the websites.',
    tags: ['Graphic Design', 'Print Design', 'Social Media Design', 'Visual Design'],
  },
  {
    id: 'digital',
    marker: 'Next',
    title: 'Digital Design',
    description:
      'Design moved to the screen. Website design, UI-focused thinking and digital experiences became the centre of the practice.',
    tags: ['Website Design', 'UI-focused Design', 'Digital Experiences'],
  },
  {
    id: '2020',
    marker: '2020',
    title: 'WordPress Development',
    description:
      'A stronger focus on building, not just designing. WordPress became the platform where the design work actually gets delivered.',
    tags: ['WordPress', 'Elementor', 'WooCommerce', 'Custom Builds'],
  },
  {
    id: 'today',
    marker: 'Today',
    title: 'Creative Designer & WordPress Developer',
    description:
      'Both halves in one place — the visual decision and the technical one made by the same person, on the same project.',
    tags: ['Design', 'Development', 'Digital Experiences'],
  },
];

export const experienceCopy = {
  eyebrow: 'Experience',
  title: '10+ Years of Creative Experience',
  intro:
    'Not a straight line from one discipline to another — a widening one. Each stage still shows up in the work.',
} as const;
