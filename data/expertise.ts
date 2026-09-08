/**
 * Tool names are product names — they are not translated, because that is not
 * how they are written or searched for in Arabic technical writing. Only the
 * group headings are localised, via the dictionary.
 */
export type ToolGroup = 'WordPress' | 'Design' | 'Approach';

export type Tool = {
  name: string;
  group: ToolGroup;
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
  { name: 'Print Design', group: 'Design' },
  { name: 'Social Media Design', group: 'Design' },
  { name: 'Responsive Design', group: 'Approach' },
];

/** Column ids for the Design / Development pairing. */
export const expertiseColumnIds = ['design', 'development'] as const;
