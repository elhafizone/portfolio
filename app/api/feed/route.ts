import { NextResponse } from 'next/server';
import { articles } from '@/data/articles';
import { siteConfig } from '@/config/site';

export const dynamic = 'force-static';
export const revalidate = 3600;

export async function GET() {
  const baseUrl = siteConfig.url || 'https://hafizone.dev';

  const rssItems = articles
    .map((article) => {
      const url = `${baseUrl}/ar/articles/${article.slug}`;
      const pubDate = new Date(article.date).toUTCString();

      return `
    <item>
      <title><![CDATA[${article.title.ar}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description><![CDATA[${article.summary.ar}]]></description>
      <category><![CDATA[${article.category.ar}]]></category>
      <pubDate>${pubDate}</pubDate>
      <author>${siteConfig.name} (${siteConfig.url})</author>
    </item>`;
    })
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${siteConfig.name} | أفكار ومقالات التصميم وتطوير الويب]]></title>
    <link>${baseUrl}</link>
    <description><![CDATA[مقالات وأفكار احترافية في تصميم وتطوير مواقع ووردبريس والمتاجر الإلكترونية وتجارب الويب الحديثة بقلم محمد الحافظ]]></description>
    <language>ar</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/api/feed" rel="self" type="application/rss+xml"/>
    ${rssItems}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
