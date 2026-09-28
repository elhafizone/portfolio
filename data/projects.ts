/**
 * PROJECT DATA
 *
 * These are real, live client sites. Every field is grounded:
 *
 *  - Titles, sectors and languages come from visiting each site.
 *  - `technologies` come from inspecting each site's actual markup, not from
 *    assumption. Haboob, for example, is Elementor without WooCommerce, so it
 *    is not listed as a store.
 *  - `image` is a screenshot of the live homepage, captured at one viewport so
 *    the set reads as a set.
 *  - `year` is left as an em dash: launch dates were not supplied, and a
 *    plausible-looking year would be an invented fact.
 *
 * Order is deliberate — strongest design first, and the sectors alternate so
 * the rail does not show two lookalike sites back to back.
 *
 * To add another project: capture a 1800x1200 top-of-page screenshot into
 * /public/work/, fill in the fields, and keep `isPlaceholder: false` only if
 * every field is true.
 */

export type LocalizedText = { en: string; ar: string };

export type Project = {
  id: string;
  index: string;
  title: string;
  /** Native-language name, where the brand has one. */
  titleAr?: string;
  category: LocalizedText;
  year: string;
  description: LocalizedText;
  technologies: string[];
  /** Path under /public. Null renders a numbered placeholder plate. */
  image: string | null;
  imageAlt: LocalizedText;
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
    id: 'haboob',
    index: '01',
    title: 'Haboob',
    titleAr: 'هبوب',
    category: {
      en: 'Brand Website / WordPress',
      ar: 'موقع علامة تجارية / ووردبريس',
    },
    year: '—',
    description: {
      en:
        'An Arabic oud and fragrance brand built around atmosphere rather than catalogue — deep burgundy, gold, and custom Arabic display typography carrying the whole page.',
      ar: 'موقع لعلامة عربية متخصّصة في العود والعطور. صمّمت التجربة حول الإحساس والهوية قبل عرض المنتجات، مع عنابي عميق وذهبي وخط عربي مخصّص يمنح الصفحة طابعها الخاص.',
    },
    technologies: ['WordPress', 'Elementor', 'Arabic RTL'],
    image: '/work/haboob.webp',
    imageAlt: {
      en:
        'Haboob homepage: a dark burgundy hero with gold Arabic display typography and a single call to action',
      ar: 'الصفحة الرئيسية لهبوب بتصميم عنابي داكن، وخط عربي ذهبي بارز، ودعوة واضحة لاتخاذ الإجراء.',
    },
    video: null,
    url: 'https://tryhaboob.com/',
    caseStudyUrl: '',
    featured: true,
    isPlaceholder: false,
  },
  {
    id: 'dr-helmi',
    index: '02',
    title: "Dr. Helmi's Dental Centre",
    category: {
      en: 'Clinic Website / WordPress',
      ar: 'موقع عيادة / ووردبريس',
    },
    year: '—',
    description: {
      en:
        'A specialist implantology and cosmetic dentistry centre in Dubai. Editorial layout, navy and gold, with every route on the page leading to a booked appointment.',
      ar: 'موقع لمركز متخصّص في زراعة الأسنان وطب الأسنان التجميلي في دبي. اعتمدت فيه تخطيطًا تحريريًا وألوانًا كحلية وذهبية، مع توجيه واضح نحو حجز الموعد.',
    },
    technologies: ['WordPress', 'Elementor', 'Appointment booking'],
    image: '/work/dr-helmi.webp',
    imageAlt: {
      en: "Dr. Helmi's Dental Centre homepage: editorial hero reading Smile With Confidence beside an arched clinic photograph",
      ar: 'الصفحة الرئيسية لمركز د. حلمي بتصميم تحريري وصورة مقوّسة للعيادة بجانب المحتوى.',
    },
    video: null,
    url: 'https://drhelmisdentalcenter.com/',
    caseStudyUrl: '',
    featured: true,
    isPlaceholder: false,
  },
  {
    id: 'akram-abubakr',
    index: '03',
    title: 'Akram Abubakr, Attorney at Law',
    titleAr: 'أكرم أبوبكر المحامي',
    category: {
      en: 'Law Firm / WordPress',
      ar: 'مكتب محاماة / ووردبريس',
    },
    year: '—',
    description: {
      en:
        'A litigation and legal consultancy practice. Deep navy and gold with the lawyer himself anchoring the hero — authority is the product, so the design leads with it.',
      ar: 'موقع لمكتب متخصص في الترافع والاستشارات القانونية. استخدمت الكحلي العميق والذهبي، وجعلت حضور المحامي في الواجهة جزءًا أساسيًا من بناء الثقة والهوية.',
    },
    technologies: ['WordPress', 'Elementor', 'Fluent Forms', 'Arabic RTL'],
    image: '/work/akram-abubakr.webp',
    imageAlt: {
      en:
        'Akram Abubakr law practice homepage: a navy Arabic hero with a portrait of the lawyer in his office and a consultation call to action',
      ar: 'الصفحة الرئيسية لمكتب أكرم أبوبكر، بتصميم كحلي وصورة للمحامي في مكتبه ودعوة للاستشارة.',
    },
    video: null,
    url: 'https://akramabubakr.com/',
    caseStudyUrl: '',
    featured: true,
    isPlaceholder: false,
  },
  {
    id: 'tebra',
    index: '04',
    title: 'Tebra',
    titleAr: 'تبرا',
    category: {
      en: 'Corporate Services / WordPress',
      ar: 'خدمات مؤسسية / ووردبريس',
    },
    year: '—',
    description: {
      en:
        'An international support desk for expatriates and businesses operating in Saudi Arabia. Four languages, a dense service offering, and a hero that still reads in one breath.',
      ar: 'موقع لمكتب دعم دولي يخدم المقيمين والشركات العاملة في السعودية. رغم تعدد الخدمات واللغات، حرصت على أن تبقى الرسالة واضحة وسهلة القراءة من اللحظة الأولى.',
    },
    technologies: ['WordPress', 'Elementor', 'Fluent Forms', 'Multilingual'],
    image: '/work/tebra.webp',
    imageAlt: {
      en:
        'Tebra homepage: a blue gradient hero over a night skyline reading International Support Desk, with a four-language switcher',
      ar: 'الصفحة الرئيسية لتبرا بتدرج أزرق فوق أفق ليلي، مع خيار واضح للتنقل بين اللغات الأربع.',
    },
    video: null,
    url: 'https://tebra-info.com/',
    caseStudyUrl: '',
    featured: true,
    isPlaceholder: false,
  },
  {
    id: 'mahmoud-hassan',
    index: '05',
    title: 'Eng. Mahmoud Hassan',
    category: {
      en: 'Personal Brand / WooCommerce',
      ar: 'علامة شخصية / ووكومرس',
    },
    year: '—',
    description: {
      en:
        'A personal platform for a mechanical maintenance engineer — authority site, technical blog, newsletter and store in one, held together by a single blue and white system.',
      ar: 'منصّة شخصية لمهندس صيانة ميكانيكية، تجمع بين الموقع التعريفي والمدونة التقنية والنشرة البريدية والمتجر، ضمن نظام بصري أزرق وأبيض متماسك.',
    },
    technologies: ['WordPress', 'WooCommerce', 'Elementor', 'Fluent Forms'],
    image: '/work/mahmoud-hassan.webp',
    imageAlt: {
      en:
        'Eng. Mahmoud Hassan homepage: a blue and white personal brand hero with a portrait and newsletter call to action',
      ar: 'الصفحة الرئيسية للمهندس محمود حسن، بتصميم أزرق وأبيض وصورة شخصية ودعوة للاشتراك في النشرة.',
    },
    video: null,
    url: 'https://engmahmoudhassan.com/',
    caseStudyUrl: '',
    featured: true,
    isPlaceholder: false,
  },
  {
    id: 'pets-vet',
    index: '06',
    title: 'Pets Veterinary Clinic',
    category: {
      en: 'Clinic / Booking & WooCommerce',
      ar: 'عيادة / حجوزات وووكومرس',
    },
    year: '—',
    description: {
      en:
        'A veterinary clinic in Doha positioned on comfort rather than clinical distance. Warm cream and gold, online booking through Amelia, and a store alongside it.',
      ar: 'موقع عيادة بيطرية في الدوحة صمّمته ليكون دافئًا ومريحًا بدل المظهر الطبي البارد، مع لوحة كريمية وذهبية، وحجز إلكتروني عبر Amelia، ومتجر متكامل إلى جانب الموقع.',
    },
    technologies: ['WordPress', 'WooCommerce', 'Amelia', 'Elementor', 'Fluent Forms'],
    image: '/work/pets-vet.webp',
    imageAlt: {
      en:
        'Pets Veterinary Clinic homepage: a warm cream hero with gold headline type and a cut-out photograph of a small dog',
      ar: 'الصفحة الرئيسية للعيادة البيطرية، بتصميم كريمي دافئ وعنوان ذهبي وصورة لكلب صغير.',
    },
    video: null,
    url: 'https://petsveterinaryclinic.com/',
    caseStudyUrl: '',
    featured: true,
    isPlaceholder: false,
  },
  {
    id: 'apex-air',
    index: '07',
    title: 'Apex Air',
    titleAr: 'أبيكس اير',
    category: {
      en: 'Industrial HVAC / WordPress',
      ar: 'تهوية وتكييف صناعي / ووردبريس',
    },
    year: '—',
    description: {
      en:
        'An Egyptian ventilation, industrial exhaust and central air-conditioning specialist with 13+ years in the field. Dark navy and a single green accent, with the project count and years of experience stated in the first screen.',
      ar: 'شركة مصرية متخصّصة في أنظمة التهوية والشفط الصناعي والتكييف المركزي، بخبرة تتجاوز 13 عامًا. اعتمدت كحليًا داكنًا ولمسة خضراء واحدة، وأظهرت عدد المشاريع المنفّذة وسنوات الخبرة من أول شاشة.',
    },
    technologies: ['WordPress', 'Elementor', 'Arabic RTL', 'Multilingual'],
    image: '/work/apex-air.webp',
    imageAlt: {
      en:
        'Apex Air homepage: a dark navy hero with green display type and geometric shapes, above a stats row of projects completed and years of experience',
      ar: 'الصفحة الرئيسية لأبيكس اير، بتصميم كحلي داكن وخط أخضر بارز، مع شريط إحصائيات للمشاريع المنفّذة وسنوات الخبرة.',
    },
    video: null,
    url: 'https://apexair-eg.com/',
    caseStudyUrl: '',
    featured: true,
    isPlaceholder: false,
  },
  {
    id: 'nibras-academy',
    index: '08',
    title: 'Al-Nibras Academy',
    titleAr: 'أكاديمية النبراس',
    category: {
      en: 'Online Education / Custom WordPress Theme',
      ar: 'تعليم عن بُعد / ثيم ووردبريس مخصّص',
    },
    year: '—',
    description: {
      en:
        'A Saudi-curriculum online academy for Quran memorization and school subjects. Hand-built WordPress theme rather than a page builder, in a soft lavender palette aimed squarely at parents booking a first free session.',
      ar: 'أكاديمية تعليم عن بُعد لتحفيظ القرآن الكريم وتدريس المنهج السعودي. بنيت لها ثيم ووردبريس مخصّص بالكامل بدل الاعتماد على أحد أدوات البناء الجاهزة، بلوحة ألوان بنفسجية هادئة تخاطب ولي الأمر مباشرة نحو حجز الحصة التجريبية.',
    },
    technologies: ['WordPress', 'Custom Theme', 'Arabic RTL'],
    image: '/work/nibras-academy.webp',
    imageAlt: {
      en:
        'Al-Nibras Academy homepage: a lavender Arabic hero reading "Your son\'s future starts with an Ayah" beside an illustration of a student',
      ar: 'الصفحة الرئيسية لأكاديمية النبراس، بتصميم بنفسجي وعنوان "مستقبل ابنك يبدأ بآية" بجانب رسمة لطالب.',
    },
    video: null,
    url: 'https://academyamelnibras.com/',
    caseStudyUrl: '',
    featured: true,
    isPlaceholder: false,
  },
  {
    id: 'si-austral',
    index: '09',
    title: 'Si Austral',
    category: {
      en: 'Events & Attractions / WordPress',
      ar: 'فعاليات وترفيه / ووردبريس',
    },
    year: '—',
    description: {
      en:
        'Family attractions and event trains across Australia. Bright, high-energy, and built so venue operators can find the safety and logistics answers they need quickly.',
      ar: 'موقع لخدمات الترفيه العائلي وقطارات الفعاليات في أستراليا. صمّمته بروح مشرقة وحيوية، مع ترتيب المحتوى بحيث يصل مشغّلو المواقع بسرعة إلى معلومات السلامة واللوجستيات.',
    },
    technologies: ['WordPress', 'Elementor', 'Fluent Forms'],
    image: '/work/si-austral.webp',
    imageAlt: {
      en:
        'Si Austral homepage: a bright hero with a photograph of a red and green event train inside a shopping centre',
      ar: 'الصفحة الرئيسية لـ Si Austral، بتصميم مشرق وصورة لقطار فعاليات أحمر وأخضر داخل مركز تجاري.',
    },
    video: null,
    url: 'https://siaustral.com.au/',
    caseStudyUrl: '',
    featured: true,
    isPlaceholder: false,
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
