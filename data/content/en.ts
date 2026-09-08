/**
 * English copy.
 *
 * This file is the source of truth for the dictionary SHAPE — `Dictionary` is
 * derived from it, so `ar.ts` is type-checked against it and cannot drift or
 * miss a key.
 *
 * Facts (names, dates, employers, URLs) do not live here. They stay in the data
 * files so a translation can never quietly change one.
 *
 * Voice: first person, singular. One person does this work, so the copy says
 * "I" — never the agency "we", and never the passive voice used to avoid
 * choosing between them.
 */
export const en = {
  meta: {
    title: 'Mohammed Al-Hafiz | Creative Designer & WordPress Developer',
    description:
      'Mohammed Al-Hafiz is a Sudanese Creative Designer and WordPress Developer with over 10 years of experience across 3D, graphic, visual, print and digital design. Since 2020 he has focused on building professional WordPress websites that combine modern design, usability and functionality.',
  },

  identity: {
    name: 'Mohammed Al-Hafiz',
    role: 'Creative Designer & WordPress Developer',
    plateFacts: ['10+ Years', 'WordPress since 2020'],
  },

  nav: {
    links: [
      { label: 'Work', href: '#work' },
      { label: 'Services', href: '#services' },
      { label: 'About', href: '#about' },
      { label: 'Reviews', href: '#reviews' },
      { label: 'Contact', href: '#contact' },
    ],
    cta: 'Let’s Talk',
    skipToContent: 'Skip to content',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    backToTopAria: 'back to top',
  },

  preloader: {
    loading: 'Loading',
  },

  hero: {
    headline: ['Designing Ideas.', 'Building', 'Experiences.'],
    /** The word set in the serif accent face, inside line 2. */
    accentWord: 'digital',
    intro:
      'Creative Designer & WordPress Developer. For over ten years I have been turning brands, ideas and businesses into clear, modern digital experiences.',
    meta: [
      { label: 'Experience', value: '10+ Years of Design' },
      { label: 'Focus', value: 'WordPress since 2020' },
    ],
    primaryCta: 'View My Work',
    secondaryCta: 'Let’s Work Together',
    scrollHint: 'Scroll to work',
  },

  work: {
    eyebrow: 'Selected Work',
    title: ['Selected', 'Work'],
    intro: 'A selection of the websites and digital experiences I have designed and built.',
    visitLive: 'Visit live site',
    scrollToAdvance: 'Scroll to advance',
    reservedSlot: 'Reserved slot',
    awaitingCaseStudy: 'Awaiting case study',
    placeholderNotice:
      'Case studies are being prepared. These entries are reserved slots, not published client work.',
  },

  services: {
    eyebrow: 'Services',
    title: ['What I', 'Do'],
    intro:
      'Six things I do myself. Most projects need two or three of them at once — and having them in one place saves you coordinating between two.',
    items: [
      {
        title: 'Website Design',
        summary: 'Modern, clear design built around how people actually read and decide.',
        detail:
          'I set the layout, hierarchy, typography and visual rhythm so the message your business needs actually lands — not a template filled with content afterwards.',
        deliverables: ['Visual direction', 'Page design', 'Design system', 'Responsive layouts'],
      },
      {
        title: 'WordPress Development',
        summary: 'The design built properly in WordPress — fast, stable and easy to manage.',
        detail:
          'I use Elementor and Blocksy with intent, structure the content, keep the settings clean, and leave you an editing experience you can use without breaking the design.',
        deliverables: ['Theme build', 'Elementor / Blocksy', 'Fluent Forms', 'Amelia booking'],
      },
      {
        title: 'Custom WordPress Websites',
        summary: 'Built to fit, rather than a ready-made solution stretched to fit.',
        detail:
          'When a project needs behaviour a stock template cannot give it, I build the site around the requirement itself — custom sections, custom logic, custom structure.',
        deliverables: ['Custom sections', 'Custom post types', 'Tailored admin', 'Integrations'],
      },
      {
        title: 'WooCommerce Websites',
        summary: 'Stores designed to sell, and built to be run after handover.',
        detail:
          'I treat product presentation, category structure, cart and checkout as design problems — because that is exactly where stores lose customers.',
        deliverables: ['Store design', 'Product templates', 'Checkout flow', 'Store setup'],
      },
      {
        title: 'Creative & Visual Design',
        summary: 'Graphic, print, social and marketing design held to one visual line.',
        detail:
          'Ten years of practice across print, social media and promotional work, applied so your business looks consistent everywhere it appears.',
        deliverables: ['Graphic design', 'Print design', 'Social media design', 'Marketing design'],
      },
      {
        title: 'Responsive Web Design',
        summary: 'One design idea, held together across every screen size.',
        detail:
          'I design mobile rather than shrinking it. Spacing, type scale and interaction get reconsidered at each breakpoint so nothing on a phone is an accident.',
        deliverables: ['Mobile design', 'Tablet layouts', 'Performance', 'Accessibility'],
      },
    ],
  },

  expertise: {
    eyebrow: 'Expertise',
    title: ['Design Meets', 'Development.'],
    intro:
      'Most projects lose something in the handover between designer and developer — either the design is compromised to fit the build, or the build is fought to fit the design. I handle both, so that gap never opens.',
    columns: [
      {
        label: 'Visual',
        title: 'Design',
        summary:
          'Ten years of visual practice — the part that decides whether your business looks like it means it.',
        items: [
          'Graphic Design',
          'Visual Design',
          'Print Design',
          'UI-focused Web Design',
          'Marketing & Promotional Design',
        ],
      },
      {
        label: 'Technical',
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
    ],
    intersectionLabel: 'The intersection',
    equation: { left: 'Creative', right: 'Technical', result: 'Better digital experiences' },
    outcome:
      'When I understand a project from both the visual and the technical side, the decision gets made once, by one person, with the whole picture in view.',
  },

  tools: {
    eyebrow: 'Tools & Technology',
    title: ['What I', 'build with.'],
    intro:
      'A practical toolset, chosen deliberately. I customise where a project needs it, and stay standard where standard is genuinely better.',
    centreLabel: 'Centre',
    groups: { WordPress: 'WordPress', Design: 'Design', Approach: 'Approach' },
  },

  experience: {
    eyebrow: 'Experience',
    title: ['10+ Years of', 'Creative Experience'],
    intro:
      'Not a straight line from one discipline to another — a widening one. I started in 3D and multimedia, and every stage of it still shows up in the work.',
    entries: [
      {
        marker: '2007 — 2011',
        title: 'Multimedia, B.Sc.',
        description:
          'I studied multimedia at Garden City University (UGC) in Sudan, then took specialist diplomas in architectural visualisation at CG Way in Egypt, in small-project management, and in sales.',
      },
      {
        marker: '2011 — 2019',
        title: '3D & Visual Design',
        description:
          'Eight years across agencies and studios in 3D and 2D — interior, exterior and product visualisation, motion graphics and video, alongside print and promotional work.',
      },
      {
        marker: 'Since 2020',
        title: 'Web Design & WordPress',
        description:
          'I moved my focus to the browser. Freelance web design from 2020, building the practice the work on this site comes from, with 2D design for Orecal along the way.',
      },
      {
        marker: 'Today',
        title: 'Creative Designer & WordPress Developer',
        description:
          'Both halves in one place — I make the visual decision and the technical one myself, on the same project. Every build carries the whole design career behind it.',
      },
    ],
  },

  process: {
    eyebrow: 'Process',
    title: ['From Idea to', 'Launch.'],
    intro: 'Five steps, no mystery. You always know which one we are on.',
    steps: [
      {
        title: 'Discover',
        statement: 'I learn the business before I design anything for it.',
        detail:
          'What you actually sell, who you need to convince, and what the site has to do about it. Every design decision after this one gets easier.',
      },
      {
        title: 'Plan',
        statement: 'I map the site, and we agree it before design starts.',
        detail:
          'Pages, sections, content order and priorities settled up front — so the design stage is about how it looks, not about what goes on it.',
      },
      {
        title: 'Design',
        statement: 'I design every page, phone screen included.',
        detail:
          'Type, layout, colour and imagery built into one consistent system — and the phone layout designed on purpose rather than shrunk from the desktop one.',
      },
      {
        title: 'Build',
        statement: 'I build it in WordPress without losing the design.',
        detail:
          'Clean implementation, sensible structure, forms and bookings wired up, and an admin you can use without worrying you will break something.',
      },
      {
        title: 'Refine',
        statement: 'I test it, tighten it, and hand over something finished.',
        detail:
          'Responsive checks, performance, the small details and your revisions — then handover with the site working, not just delivered.',
      },
    ],
  },

  reviews: {
    eyebrow: 'Client Feedback',
    title: ['What clients', 'say.'],
    intro: 'Written by the clients themselves, after their projects were delivered.',
    translation: 'Translation',
    translationNote:
      'Each review is quoted in the client’s own words. The English beneath it is a translation.',
  },

  about: {
    eyebrow: 'About',
    title: ['Who I', 'Am'],
    bio: [
      'Creative Designer and WordPress Developer with over 10 years of experience across 3D, graphic, visual, print and digital design.',
      'I am a Sudanese designer and I studied multimedia at Garden City University (UGC). I started in 3D — interior, exterior and product visualisation — then widened into motion graphics, print and promotional work before moving my focus to the browser.',
      'Since 2020 that focus has been on building professional WordPress websites, combining modern design, usability, performance and function around what each project actually needs.',
      'I work where creativity meets technology: I read a project from both the visual and the technical side, and turn the idea into a clear, distinctive and effective digital experience.',
    ],
    nationalityLabel: 'Nationality',
    nationality: 'Sudanese',
    languagesLabel: 'Languages',
    languages: ['Arabic', 'English'],
    disciplinesLabel: 'Also practises',
    disciplines: [
      'Web Designer',
      'Interior Designer',
      'Exterior Designer',
      'Products Designer',
      'Motion Graphic Artist',
      'Video Editor',
    ],
    principles: [
      'I design with purpose.',
      'I build with precision.',
      'I keep it simple.',
      'I make it useful.',
    ],
    philosophyLabel: 'Philosophy',
    philosophy: ['Good design should look clear.', 'design should also work.'],
    philosophyAccent: 'Great',
    imageSlot: 'Image',
  },

  contact: {
    eyebrow: 'Contact',
    title: ['Have a Project', 'Mind?'],
    titlePrefix: 'in',
    intro: 'Send me the idea, and let’s turn it into a clear, modern and effective digital experience.',
    cta: 'Start a Conversation',
    directChannels: 'Direct channels',
    /** Keyed by SocialId. `hint` is used only where there is no literal handle. */
    channels: {
      email: { label: 'Email', hint: 'Write to me' },
      whatsapp: { label: 'WhatsApp', hint: 'Message directly' },
      linkedin: { label: 'LinkedIn', hint: 'Professional profile' },
      behance: { label: 'Portfolio', hint: 'More work' },
    },
    positioning:
      'I combine creative design and WordPress development to create modern, practical and distinctive digital experiences.',
    unconfiguredNotice:
      'Contact channels are not published yet — use the form and the message will reach the configured inbox.',
  },

  form: {
    name: 'Name',
    namePlaceholder: 'Your full name',
    email: 'Email',
    emailPlaceholder: 'you@company.com',
    phone: 'Phone',
    phonePlaceholder: '+000 000 0000',
    projectType: 'Project type',
    budget: 'Budget',
    message: 'Message',
    messagePlaceholder: 'What are you building, and what does it need to do?',
    optional: 'Optional',
    selectOption: 'Select an option',
    preferNotToSay: 'Prefer not to say',
    submit: 'Start a Conversation',
    submitting: 'Sending',
    replyNote: 'I usually reply within one working day.',
    successLabel: 'Message sent',
    successTitle: 'Thank you — your message is on its way.',
    successBody: 'I read every enquiry myself and will reply as soon as I can.',
    sendAnother: 'Send another message',
    projectTypes: [
      'Website Design',
      'WordPress',
      'WooCommerce',
      'Graphic Design',
      'Other',
    ],
    budgetRanges: [
      'Under $500',
      '$500 – $1,500',
      '$1,500 – $3,000',
      '$3,000 – $6,000',
      '$6,000+',
      'Not sure yet',
    ],
    errors: {
      name: 'Please enter your name.',
      nameLong: 'That name is too long.',
      emailRequired: 'Please enter your email address.',
      emailInvalid: 'That email address does not look right.',
      phone: 'Please enter a valid phone number, or leave it empty.',
      projectTypeRequired: 'Please choose a project type.',
      optionInvalid: 'Please choose one of the listed options.',
      messageShort: 'Tell me a little more about the project.',
      messageLong: 'Please keep this under {max} characters.',
      generic: 'Something went wrong sending your message. Please try again.',
      network: 'Could not reach the server. Please check your connection and try again.',
      notConfigured:
        'The contact form is not connected to an inbox yet. Please reach out through one of the listed channels.',
      deliveryFailed: 'The message could not be delivered. Please try again shortly.',
      rateLimited: 'Too many messages sent. Please try again a little later.',
      invalidBody: 'Invalid request.',
    },
  },

  footer: {
    navigate: 'Navigate',
    contact: 'Contact',
    noChannels:
      'Direct channels are not published yet. Use the contact form above and the message reaches the configured inbox.',
    builtInHouse: 'Designed & built in-house',
    backToTop: 'Back to top',
  },

  notFound: {
    label: 'Error',
    title: 'This page doesn’t exist.',
    body: 'The link may be out of date, or the page may have moved.',
    cta: 'Back to the homepage',
  },
};

/**
 * The dictionary shape every locale must satisfy.
 *
 * `en` is deliberately NOT `as const`: a const assertion would make every value
 * its own literal type, and Arabic copy would then fail to satisfy it. Widened
 * types are what is wanted here — the shape must match, the words must not.
 */
export type Dictionary = typeof en;
