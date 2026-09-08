/**
 * CLIENT FEEDBACK
 *
 * SOURCE: the public review pages for Mohammed's freelance profile, supplied as
 * screenshots on 29 August 2026 and transcribed from them.
 *
 * Every `text` below is VERBATIM — the client's own Arabic, copied from the
 * review exactly as it appears on the source page. No paraphrasing, no tidying,
 * no merging of separate reviews. If a quote reads roughly, it reads roughly.
 *
 * `textEn` is a translation and is labelled as one in the UI. It is never
 * presented as the client's own words, because it is not: the client wrote
 * Arabic. The Arabic is rendered as the quotation; the English sits beneath it
 * as an aid, and only for English readers.
 *
 * Client names, project titles and the source platform were deliberately
 * REMOVED at Mohammed's request. What remains is the review text itself and
 * nothing that identifies who wrote it — so do not reintroduce a name, a
 * project title, a rating figure or a platform badge here.
 *
 * Do not add an entry that is not on the source page.
 */

export type Testimonial = {
  id: string;
  /** The client's own words, in the language they wrote them. */
  text: string;
  /** BCP-47 tag for `text`. Drives lang/dir on the quotation. */
  lang: 'ar' | 'en';
  /** Translation of `text`. Labelled as a translation, never as the quote. */
  textEn: string;
  /** True = `text` is the client's exact wording from the source page. */
  verbatim: boolean;
};

export const testimonials: Testimonial[] = [
  {
    id: 'feedback-01',
    text: 'الأستاذ محمد مطوّر ذو خبرة عالية وإنسان رائع صراحةً. كانت تجربتي معه أكثر من رائعة، وبالتأكيد سيتم التواصل معه مجددًا في حال وجود مشاريع مستقبلية. 10/10',
    lang: 'ar',
    textEn:
      'Mohammed is a highly experienced developer and, frankly, a wonderful person. My experience with him was more than excellent, and I will certainly be in touch again for future projects. 10/10',
    verbatim: true,
  },
  {
    id: 'feedback-02',
    text: 'بصراحة شخص متمكن جداً و ملتزم جداً بكل تفاصيل المشروع، احترافية في التواصل، جودة عمل عالية جداً وسريع في التعديلات و حد فاهم بجد العميل عايز ايه. أكيد انصح بالتعامل معاه و بشدة',
    lang: 'ar',
    textEn:
      'Honestly, someone very capable and very committed to every detail of the project. Professional in communication, very high quality of work, fast with revisions, and someone who genuinely understands what the client wants. I definitely recommend working with him.',
    verbatim: true,
  },
  {
    id: 'feedback-03',
    text: 'الأستاذ محمد شخص محترف ومتعاون جداً, صدره رحب وأخلاقه عاليه أنصح بالتعامل معه وبشده.',
    lang: 'ar',
    textEn:
      'Mohammed is professional and very cooperative, patient and of high character. I strongly recommend working with him.',
    verbatim: true,
  },
  {
    id: 'feedback-04',
    text: 'من افضل المستقلين اللي اشتغلت معاهم انصح بالتعامل معه بقووووة الله يعطيك العافية',
    lang: 'ar',
    textEn:
      'One of the best freelancers I have worked with. I strongly recommend working with him.',
    verbatim: true,
  },
  {
    id: 'feedback-05',
    text: 'الاستاذ محمد جدا محترم ومحترف. انصح بالتعامل معه كما اني مع اقرب فرصة في اي مشروع اخر ساتعامل معه مرة اخري شكرا جزيلا',
    lang: 'ar',
    textEn:
      'Mohammed is very respectful and professional. I recommend working with him, and at the first opportunity on another project I will work with him again. Many thanks.',
    verbatim: true,
  },
  {
    id: 'feedback-06',
    text: 'ماشاء الله تبارك الله، مشى معي خطوه وبخطوه . وماكان يقصر بشي',
    lang: 'ar',
    textEn:
      'He walked me through it step by step, and never fell short on anything.',
    verbatim: true,
  },
];
