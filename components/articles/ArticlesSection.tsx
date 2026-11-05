'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useLocale } from '@/components/i18n/LocaleProvider';
import { useSectionMotion } from '@/components/motion/useSectionMotion';
import { Reveal } from '@/components/motion/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { articles } from '@/data/articles';

export function ArticlesSection() {
  const rootRef = useRef<HTMLElement>(null);
  const { locale } = useLocale();
  const isAr = locale === 'ar';

  useSectionMotion(rootRef);

  return (
    <section
      id="articles"
      ref={rootRef}
      aria-labelledby="articles-heading"
      className="section-spacious relative overflow-hidden bg-bg"
    >
      <SectionHeading
        eyebrow={isAr ? 'الأفكار والمقالات' : 'Insights & Articles'}
        titleId="articles-heading"
        title={
          isAr
            ? ['أفكار وتجارب.', 'في التصميم وتطوير الويب.']
            : ['Thoughts & Insights.', 'On Design & WordPress.']
        }
        intro={
          isAr
            ? 'مقالات عملية حول هندسة وتطوير مواقع ووردبريس، تحسين سرعة المتاجر الإلكترونية، وقرارات التصميم التي تصنع الفارق.'
            : 'Practical insights into custom WordPress engineering, e-commerce speed optimization, and intentional design.'
        }
        aside={
          <div className="flex items-center gap-3 pt-2">
            <a
              href="/feed.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-mono tracking-wider text-muted hover:text-accent transition-colors"
              title="RSS Feed"
            >
              <span className="inline-block h-2 w-2 rounded-full bg-accent animate-pulse" />
              <span>RSS FEED (النشر التلقائي)</span>
            </a>
          </div>
        }
      />

      <div className="shell mt-14 lg:mt-20">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, index) => {
            const title = isAr ? article.title.ar : article.title.en;
            const summary = isAr ? article.summary.ar : article.summary.en;
            const category = isAr ? article.category.ar : article.category.en;
            const readTime = isAr ? article.readTime.ar : article.readTime.en;

            return (
              <Reveal key={article.slug} className='h-full'>
                <article className="group relative flex h-full flex-col justify-between rounded-xl border border-rule/60 bg-surface/30 p-7 transition-all duration-300 hover:border-accent/40 hover:bg-surface/60 hover:shadow-2xl">
                  <div>
                    {/* Meta bar */}
                    <div className="flex items-center justify-between text-xs font-mono text-muted mb-4">
                      <span className="text-accent font-medium">{category}</span>
                      <span>{readTime}</span>
                    </div>

                    {/* Title */}
                    <h3 className="h4 text-text transition-colors duration-200 group-hover:text-accent">
                      <Link href={`/${locale}/articles/${article.slug}`}>
                        {title}
                      </Link>
                    </h3>

                    {/* Summary */}
                    <p className="mt-3 text-sm leading-relaxed text-muted line-clamp-3">
                      {summary}
                    </p>
                  </div>

                  <div className="mt-6 pt-5 border-t border-rule/40">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-mono uppercase tracking-wider text-muted/80 bg-rule/20 px-2 py-0.5 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Action link */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted/60 font-mono">
                        {article.date}
                      </span>
                      <Link
                        href={`/${locale}/articles/${article.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-accent transition-transform group-hover:translate-x-1"
                      >
                        <span>{isAr ? 'قراءة المقال' : 'Read Article'}</span>
                        <span aria-hidden="true">{isAr ? '←' : '→'}</span>
                      </Link>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
