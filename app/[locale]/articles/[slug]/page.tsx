import { notFound } from 'next/navigation';
import Link from 'next/link';
import { articles } from '@/data/articles';
import { siteConfig } from '@/config/site';

interface ArticlePageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const locales = ['ar', 'en'];
  const params: { locale: string; slug: string }[] = [];

  for (const locale of locales) {
    for (const article of articles) {
      params.push({ locale, slug: article.slug });
    }
  }

  return params;
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { locale, slug } = await params;
  const isAr = locale === 'ar';
  const article = articles.find((a) => a.slug === slug);

  if (!article) return {};

  const title = isAr ? article.title.ar : article.title.en;
  const description = isAr ? article.summary.ar : article.summary.en;

  return {
    title: `${title} | ${siteConfig.name}`,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: article.date,
      authors: [siteConfig.name],
    },
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { locale, slug } = await params;
  const isAr = locale === 'ar';
  const article = articles.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  const title = isAr ? article.title.ar : article.title.en;
  const category = isAr ? article.category.ar : article.category.en;
  const readTime = isAr ? article.readTime.ar : article.readTime.en;
  const content = isAr ? article.content.ar : article.content.en;

  const shareUrl = encodeURIComponent(`${siteConfig.url}/${locale}/articles/${article.slug}`);
  const shareTitle = encodeURIComponent(title);

  return (
    <article className="min-h-screen pt-32 pb-24 bg-bg text-text">
      <div className="shell max-w-4xl mx-auto">
        {/* Navigation back */}
        <div className="mb-10">
          <Link
            href={`/${locale}#articles`}
            className="inline-flex items-center gap-2 text-xs font-mono text-muted hover:text-accent transition-colors"
          >
            <span aria-hidden="true">{isAr ? '→' : '←'}</span>
            <span>{isAr ? 'العودة إلى المقالات' : 'Back to Articles'}</span>
          </Link>
        </div>

        {/* Header */}
        <header className="border-b border-rule/50 pb-10">
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-muted mb-6">
            <span className="text-accent font-semibold px-2.5 py-1 rounded bg-accent/10">
              {category}
            </span>
            <span>{readTime}</span>
            <span>•</span>
            <time dateTime={article.date}>{article.date}</time>
          </div>

          <h1 className="h1 text-text leading-tight">{title}</h1>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-surface border border-rule flex items-center justify-center font-mono text-xs font-bold text-accent">
                HA
              </div>
              <div>
                <p className="text-sm font-medium text-text">{siteConfig.name}</p>
                <p className="text-xs text-muted">Creative Designer & WordPress Developer</p>
              </div>
            </div>

            {/* Social Share to Facebook */}
            <div className="flex items-center gap-3">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-mono px-3.5 py-2 rounded-lg border border-rule hover:border-accent hover:text-accent transition-colors bg-surface/50"
              >
                <span>مشاركة على فيسبوك</span>
              </a>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-invert max-w-none mt-12 text-muted leading-relaxed font-sans space-y-6 text-base sm:text-lg">
          {content.split('\n\n').map((paragraph, index) => {
            if (paragraph.startsWith('### ')) {
              return (
                <h2
                  key={index}
                  className="h3 text-text font-serif pt-6 pb-2 border-b border-rule/30"
                >
                  {paragraph.replace('### ', '')}
                </h2>
              );
            }
            if (paragraph.startsWith('- ')) {
              const items = paragraph.split('\n').map((item) => item.replace('- ', ''));
              return (
                <ul key={index} className="list-disc list-inside space-y-2 my-4 text-muted/90">
                  {items.map((it, i) => (
                    <li key={i}>{it}</li>
                  ))}
                </ul>
              );
            }
            if (/^\d+\.\s/.test(paragraph)) {
              const items = paragraph.split('\n').map((item) => item.replace(/^\d+\.\s/, ''));
              return (
                <ol key={index} className="list-decimal list-inside space-y-2 my-4 text-muted/90">
                  {items.map((it, i) => (
                    <li key={i}>{it}</li>
                  ))}
                </ol>
              );
            }
            return <p key={index}>{paragraph}</p>;
          })}
        </div>

        {/* Footer CTA */}
        <footer className="mt-16 pt-10 border-t border-rule/50">
          <div className="rounded-2xl border border-rule/60 bg-surface/40 p-8 text-center sm:p-12">
            <h3 className="h3 text-text">
              {isAr ? 'هل تحتاج لموقع ووردبريس فائق السرعة والأداء؟' : 'Ready for a high-performance custom website?'}
            </h3>
            <p className="mt-3 text-sm text-muted max-w-lg mx-auto">
              {isAr
                ? 'دعنا نحول فكرتك إلى تجربة رقمية حقيقية تحقق نتائج ملموسة لمشروعك.'
                : 'Turn your vision into a distinctive, high-converting digital experience.'}
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                href={`/${locale}#contact`}
                className="btn btn-primary"
              >
                {isAr ? 'ابدأ مشروعك الآن' : 'Start Your Project'}
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </article>
  );
}
