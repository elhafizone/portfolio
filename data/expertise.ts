export type ExpertiseColumn = {
  id: 'design' | 'development';
  index: string;
  title: string;
  summary: string;
  items: string[];
};

export const expertiseColumns: ExpertiseColumn[] = [
  {
    id: 'design',
    index: '01',
    title: 'Design',
    summary:
      'Ten years of visual practice — the part that decides whether a business looks like it means it.',
    items: [
      'Graphic Design',
      'Visual Design',
      'Print Design',
      'Branding',
      'UI-focused Web Design',
      'Marketing & Promotional Design',
    ],
  },
  {
    id: 'development',
    index: '02',
    title: 'Development',
    summary:
      'The part that decides whether the design survives contact with a real website and a real owner.',
    items: [
      'WordPress',
      'Elementor',
      'WooCommerce',
      'Blocksy',
      'Fluent Forms',
      'Amelia',
    ],
  },
];

export const expertiseCopy = {
  eyebrow: 'Expertise',
  title: 'Design Meets Development.',
  intro:
    'Most projects lose something in the handover — the design is compromised to fit the build, or the build is fought to fit the design. Handling both removes that gap.',
  equation: {
    left: 'Creative',
    right: 'Technical',
    result: 'Better digital experiences',
  },
  outcome:
    'Understanding a project from both the visual and the technical side means decisions get made once, by one person, with the whole picture in view.',
} as const;

export type Tool = {
  name: string;
  group: 'WordPress' | 'Design' | 'Approach';
};

export const tools: Tool[] = [
  { name: 'WordPress', group: 'WordPress' },
  { name: 'Elementor', group: 'WordPress' },
  { name: 'WooCommerce', group: 'WordPress' },
  { name: 'Blocksy', group: 'WordPress' },
  { name: 'Fluent Forms', group: 'WordPress' },
  { name: 'Amelia', group: 'WordPress' },
  { name: 'UI Design', group: 'Design' },
  { name: 'Visual Design', group: 'Design' },
  { name: 'Branding', group: 'Design' },
  { name: 'Print Design', group: 'Design' },
  { name: 'Social Media Design', group: 'Design' },
  { name: 'Responsive Design', group: 'Approach' },
];

export const toolsCopy = {
  eyebrow: 'Tools & Technology',
  title: 'What the work is built with.',
  intro:
    'A deliberately practical toolset. Customized where a project needs it, standard where standard is genuinely better.',
} as const;
