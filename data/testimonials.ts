/**
 * CLIENT FEEDBACK & RATINGS
 *
 * SOURCE: the public Mostaql review pages for this profile, supplied as
 * screenshots on 29 August 2026 and transcribed from them.
 *
 * These entries are now VERBATIM. Every `text` below is the client's own
 * Arabic, copied from the review as it appears on the source page — no
 * paraphrasing, no tidying, no merging of separate reviews.
 *
 * `textEn` is a translation and is labelled as one in the UI. It is never
 * presented as the client's own words, because it is not: the client wrote
 * Arabic. The Arabic is rendered as the quotation; the English sits beneath it
 * as an aid.
 *
 * Rules that still hold:
 *  - Ratings are Mostaql platform ratings and are never relabelled as Google,
 *    Trustpilot, or an invented aggregate score.
 *  - Client names appear exactly as the platform displays them publicly
 *    (given name plus an initial). Nothing is expanded or guessed.
 *  - Do not add an entry that is not on the source page.
 */

export type RatingCategory = {
  label: string;
  score: number;
};

export const ratingSource = {
  platform: 'Mostaql',
  profileUrl: 'https://mostaql.com/u/Kamali-MGD',
  /**
   * The name the source profile is listed under. Shown next to the verify link
   * because it differs from the name the site is branded under — both are
   * Mohammed's, but a visitor clicking through deserves to know that before
   * they land on it, not after.
   */
  profileName: 'محمد الكمالي',
  totalRatings: 23,
  scale: 5,
  /** Verified on the source page: 30 completed projects, member since 2019. */
  completedProjects: 30,
  memberSince: '2019',
  /** Scores as shown on the source page. */
  categories: [
    { label: 'Professionalism in dealing', score: 5.0 },
    { label: 'Communication & follow-up', score: 4.9 },
    { label: 'Quality of delivered work', score: 5.0 },
    { label: 'Experience in the project field', score: 5.0 },
    { label: 'Timely delivery', score: 4.9 },
    { label: 'Would work with again', score: 5.0 },
  ] satisfies RatingCategory[],
} as const;

export type Testimonial = {
  id: string;
  index: string;
  /** The client's own words, in the language they wrote them. */
  text: string;
  /** BCP-47 tag for `text`. Drives lang/dir on the quotation. */
  lang: 'ar' | 'en';
  /** Translation of `text`. Labelled as a translation, never as the quote. */
  textEn: string;
  /** True = `text` is the client's exact wording from the source page. */
  verbatim: boolean;
  /** Name exactly as the platform displays it publicly. */
  client: string;
  /** Project title as listed on the source page. */
  projectTitle: string;
  /** English gloss of the project title. */
  projectTitleEn: string;
  platform: string;
};

export const testimonials: Testimonial[] = [
  {
    id: 'feedback-01',
    index: '01',
    text: 'الأستاذ محمد مطوّر ذو خبرة عالية وإنسان رائع صراحةً. كانت تجربتي معه أكثر من رائعة، وبالتأكيد سيتم التواصل معه مجددًا في حال وجود مشاريع مستقبلية. 10/10',
    lang: 'ar',
    textEn:
      'Mohammed is a highly experienced developer and, frankly, a wonderful person. My experience with him was more than excellent, and I will certainly be in touch again for future projects. 10/10',
    verbatim: true,
    client: 'Faisal A.',
    projectTitle: 'مطور wordpress (WooCommerce) لبناء موقع تجارة الكترونية',
    projectTitleEn: 'WordPress (WooCommerce) developer for an e-commerce site',
    platform: ratingSource.platform,
  },
  {
    id: 'feedback-02',
    index: '02',
    text: 'بصراحة شخص متمكن جداً و ملتزم جداً بكل تفاصيل المشروع، احترافية في التواصل، جودة عمل عالية جداً وسريع في التعديلات و حد فاهم بجد العميل عايز ايه. أكيد انصح بالتعامل معاه و بشدة',
    lang: 'ar',
    textEn:
      'Honestly, someone very capable and very committed to every detail of the project. Professional in communication, very high quality of work, fast with revisions, and someone who genuinely understands what the client wants. I definitely recommend working with him.',
    verbatim: true,
    client: 'Seif A.',
    projectTitle: 'إنشاء موقع دليل أعمال باستخدام ووردبريس',
    projectTitleEn: 'Building a business directory website with WordPress',
    platform: ratingSource.platform,
  },
  {
    id: 'feedback-03',
    index: '03',
    text: 'الأستاذ محمد شخص محترف ومتعاون جداً, صدره رحب وأخلاقه عاليه أنصح بالتعامل معه وبشده.',
    lang: 'ar',
    textEn:
      'Mohammed is professional and very cooperative, patient and of high character. I strongly recommend working with him.',
    verbatim: true,
    client: 'Ibtaa E.',
    projectTitle: 'إنشاء متجر WooCommerce متكامل',
    projectTitleEn: 'Building a complete WooCommerce store',
    platform: ratingSource.platform,
  },
  {
    id: 'feedback-04',
    index: '04',
    text: 'من افضل المستقلين اللي اشتغلت معاهم انصح بالتعامل معه بقووووة الله يعطيك العافية',
    lang: 'ar',
    textEn:
      'One of the best freelancers I have worked with. I strongly recommend working with him.',
    verbatim: true,
    client: 'Abdul Rahman A.',
    projectTitle: 'انشاء موقع وورد برس',
    projectTitleEn: 'Building a WordPress website',
    platform: ratingSource.platform,
  },
  {
    id: 'feedback-05',
    index: '05',
    text: 'الاستاذ محمد جدا محترم ومحترف. انصح بالتعامل معه كما اني مع اقرب فرصة في اي مشروع اخر ساتعامل معه مرة اخري شكرا جزيلا',
    lang: 'ar',
    textEn:
      'Mohammed is very respectful and professional. I recommend working with him, and at the first opportunity on another project I will work with him again. Many thanks.',
    verbatim: true,
    client: 'محمود ح.',
    projectTitle: 'إنشاء موقع إلكتروني شخصي لمهندس صيانة مع مدونة تقنية احترافية',
    projectTitleEn: 'Personal website for a maintenance engineer with a technical blog',
    platform: ratingSource.platform,
  },
  {
    id: 'feedback-06',
    index: '06',
    text: 'ماشاء الله تبارك الله، مشى معي خطوه وبخطوه . وماكان يقصر بشي',
    lang: 'ar',
    textEn:
      'He walked me through it step by step, and never fell short on anything.',
    verbatim: true,
    client: 'فيصل بن ت.',
    projectTitle: 'انشاء موقع الكتروني وورد بريس',
    projectTitleEn: 'Building a WordPress website',
    platform: ratingSource.platform,
  },
];

export const testimonialsCopy = {
  eyebrow: 'Client Feedback',
  title: 'What clients say.',
  sourceNote: `${ratingSource.totalRatings} client ratings on ${ratingSource.platform}, across six satisfaction criteria.`,
  /** Shown under the reviews. States exactly what the reader is looking at. */
  translationNote:
    'Reviews are quoted in the client’s own words from the public Mostaql profile. English text beneath each quote is a translation.',
} as const;
