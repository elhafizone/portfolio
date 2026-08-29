export type Service = {
  id: string;
  index: string;
  title: string;
  summary: string;
  detail: string;
  deliverables: string[];
};

export const services: Service[] = [
  {
    id: 'website-design',
    index: '01',
    title: 'Website Design',
    summary: 'Modern, clear website design built around how people actually read and decide.',
    detail:
      'Layout, hierarchy, typography and visual rhythm designed for the message the business needs to land — not a template filled with content afterwards.',
    deliverables: ['Visual direction', 'Page design', 'Design system', 'Responsive layouts'],
  },
  {
    id: 'wordpress-development',
    index: '02',
    title: 'WordPress Development',
    summary: 'The design built properly in WordPress — fast, stable and easy to manage.',
    detail:
      'Elementor and Blocksy used with intent, structured content, clean settings, and an editing experience the owner can actually use without breaking the design.',
    deliverables: ['Theme build', 'Elementor / Blocksy', 'Fluent Forms', 'Amelia booking'],
  },
  {
    id: 'custom-wordpress',
    index: '03',
    title: 'Custom WordPress Websites',
    summary: 'Customized builds rather than a ready-made solution stretched to fit.',
    detail:
      'When a project needs behaviour a stock template cannot give it, the site is shaped around the requirement — custom sections, custom logic, custom structure.',
    deliverables: ['Custom sections', 'Custom post types', 'Tailored admin', 'Integrations'],
  },
  {
    id: 'woocommerce',
    index: '04',
    title: 'WooCommerce Websites',
    summary: 'Online stores designed to sell and built to be maintained.',
    detail:
      'Product presentation, category structure, cart and checkout flow treated as design problems — because that is where stores lose customers.',
    deliverables: ['Store design', 'Product templates', 'Checkout flow', 'Store setup'],
  },
  {
    id: 'creative-design',
    index: '05',
    title: 'Creative & Visual Design',
    summary: 'Graphic, print, social and marketing design with a consistent visual voice.',
    detail:
      'Ten years of design practice across print, social media and promotional work — applied so a brand looks like itself everywhere it appears.',
    deliverables: ['Graphic design', 'Print design', 'Social media design', 'Marketing design'],
  },
  {
    id: 'responsive-design',
    index: '06',
    title: 'Responsive Web Design',
    summary: 'One design idea, held together across every screen size.',
    detail:
      'Mobile is designed, not shrunk. Spacing, type scale and interaction are reconsidered at each breakpoint so the experience stays deliberate.',
    deliverables: ['Mobile design', 'Tablet layouts', 'Performance', 'Accessibility'],
  },
];
