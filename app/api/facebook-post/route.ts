import { NextRequest, NextResponse } from 'next/server';
import { articles } from '@/data/articles';
import { siteConfig } from '@/config/site';

/**
 * Facebook Auto-Publishing Endpoint.
 * Publishes an article or custom post directly to the Facebook Page
 * via Meta Graph API v21.0.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const secret = process.env.AUTO_PUBLISH_SECRET;

    // Check authorization token if secret is configured
    if (secret && authHeader !== `Bearer ${secret}`) {
      const urlSecret = req.nextUrl.searchParams.get('secret');
      if (urlSecret !== secret) {
        return NextResponse.json(
          { error: 'Unauthorized: invalid secret key' },
          { status: 401 }
        );
      }
    }

    const pageId = process.env.FACEBOOK_PAGE_ID;
    const pageToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

    if (!pageId || !pageToken) {
      return NextResponse.json(
        { error: 'Missing FACEBOOK_PAGE_ID or FACEBOOK_PAGE_ACCESS_TOKEN in environment' },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { slug, customMessage, customLink } = body;

    let message = '';
    let link = '';

    if (slug) {
      const article = articles.find((a) => a.slug === slug);
      if (!article) {
        return NextResponse.json({ error: `Article not found: ${slug}` }, { status: 404 });
      }

      link = `${siteConfig.url}/ar/articles/${article.slug}`;
      message = `📌 مقال جديد: ${article.title.ar}\n\n${article.summary.ar}\n\n🏷️ ${article.category.ar} | ${article.readTime.ar}\n\nاقرأ المقال كاملاً:\n${link}`;
    } else if (customMessage) {
      message = customMessage;
      link = customLink || siteConfig.url;
    } else {
      // Default: publish the latest article
      const latest = articles[0];
      link = `${siteConfig.url}/ar/articles/${latest.slug}`;
      message = `📌 مقال جديد: ${latest.title.ar}\n\n${latest.summary.ar}\n\n🏷️ ${latest.category.ar} | ${latest.readTime.ar}\n\nاقرأ المقال كاملاً:\n${link}`;
    }

    // Call Meta Graph API
    const graphUrl = `https://graph.facebook.com/v21.0/${pageId}/feed`;
    const params = new URLSearchParams({
      message,
      link,
      access_token: pageToken,
    });

    const fbRes = await fetch(graphUrl, {
      method: 'POST',
      body: params,
    });

    const fbData = await fbRes.json();

    if (!fbRes.ok) {
      return NextResponse.json(
        { error: 'Facebook API error', details: fbData },
        { status: fbRes.status }
      );
    }

    return NextResponse.json({
      success: true,
      postId: fbData.id,
      publishedMessage: message,
      link,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', message: error?.message },
      { status: 500 }
    );
  }
}
