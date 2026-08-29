export type ProcessStep = {
  id: string;
  index: string;
  title: string;
  statement: string;
  detail: string;
};

export const processSteps: ProcessStep[] = [
  {
    id: 'discover',
    index: '01',
    title: 'Discover',
    statement: 'Understand the business before designing anything for it.',
    detail:
      'What the business actually sells, who needs to be convinced, and what the website has to do for it. Design decisions get much easier after this.',
  },
  {
    id: 'plan',
    index: '02',
    title: 'Plan',
    statement: 'Decide the structure while it is still cheap to change.',
    detail:
      'Pages, sections, content order and priorities agreed up front — so the design phase is about how it looks, not what goes on it.',
  },
  {
    id: 'design',
    index: '03',
    title: 'Design',
    statement: 'Give it a visual voice that fits the business.',
    detail:
      'Typography, layout, colour and imagery built into a consistent system, designed to work on a phone as deliberately as on a desktop.',
  },
  {
    id: 'build',
    index: '04',
    title: 'Build',
    statement: 'Build it in WordPress without losing the design.',
    detail:
      'Clean implementation, sensible structure, forms and bookings wired up, and an admin the owner can use with confidence.',
  },
  {
    id: 'refine',
    index: '05',
    title: 'Refine',
    statement: 'Test, tighten, and hand over something finished.',
    detail:
      'Responsive checks, performance, details and revisions — then handover with the site working, not just delivered.',
  },
];

export const processCopy = {
  eyebrow: 'Process',
  title: 'From Idea to Launch.',
  intro: 'Five steps, no mystery. You always know which one we are in.',
} as const;
