import { NextRequest, NextResponse } from 'next/server';
import { dailyPosts } from '@/data/dailyPosts';
import { articles } from '@/data/articles';
import { siteConfig } from '@/config/site';

export const dynamic = 'force-dynamic';

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET || process.env.AUTO_PUBLISH_SECRET;
  if (!secret) return true; // If no secret configured, allow internal requests
  const authHeader = req.headers.get('authorization');
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const querySecret = req.nextUrl.searchParams.get('secret');
  return bearer === secret || querySecret === secret;
}

async function handlePublish(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized: invalid secret key' }, { status: 401 });
  }

  const pageId = process.env.FACEBOOK_PAGE_ID || '266929726494930';
  const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  if (!accessToken) {
    return NextResponse.json(
      { error: 'Missing FACEBOOK_PAGE_ACCESS_TOKEN in environment' },
      { status: 500 }
    );
  }

  // Calculate day index for deterministic daily rotation
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Determine what to publish:
  // Check if a specific id, slug, or custom text is requested
  let customSlug = req.nextUrl.searchParams.get('slug');
  let customId = req.nextUrl.searchParams.get('id');

  if (req.method === 'POST') {
    const body = await req.json().catch(() => ({}));
    if (body.slug) customSlug = body.slug;
    if (body.id) customId = body.id;
  }

  let message = '';
  let link = '';
  let topic = '';

  if (customSlug) {
    const article = articles.find((a) => a.slug === customSlug);
    if (!article) {
      return NextResponse.json({ error: `Article not found: ${customSlug}` }, { status: 404 });
    }
    topic = article.title.ar;
    link = `${siteConfig.url}/ar/articles/${article.slug}`;
    message = `📌 مقال جديد على Hafi Zone:\n\n${article.title.ar}\n\n${article.summary.ar}\n\n🏷️ ${article.category.ar} | ${article.readTime.ar}\n\nاقرأ المقال كاملاً:\n${link}\n\n#HafiZone #WebDevelopment #WordPress #SoftwareEngineering`;
  } else if (customId) {
    const post = dailyPosts.find((p) => p.id === customId);
    if (!post) {
      return NextResponse.json({ error: `Daily post not found: ${customId}` }, { status: 404 });
    }
    topic = post.topic;
    message = post.message;
    link = post.link || siteConfig.url;
  } else {
    // Select daily rotation
    const postIndex = dayOfYear % dailyPosts.length;
    const selectedPost = dailyPosts[postIndex];
    topic = selectedPost.topic;
    message = selectedPost.message;
    link = selectedPost.link || siteConfig.url;
  }

  try {
    const graphUrl = `https://graph.facebook.com/v21.0/${pageId}/feed`;
    const params = new URLSearchParams({
      message,
      link,
      access_token: accessToken,
    });

    const response = await fetch(graphUrl, {
      method: 'POST',
      body: params,
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error('[Facebook Cron Publish] API Error:', data);
      return NextResponse.json(
        {
          status: 'error',
          error: data.error?.message || 'Facebook API error',
          details: data,
        },
        { status: response.status || 500 }
      );
    }

    return NextResponse.json({
      status: 'published',
      postId: data.id,
      topic,
      link,
      publishedAt: new Date().toISOString(),
      scheduledCycle: 'daily',
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown network error';
    console.error('[Facebook Cron Publish] Network Error:', error);
    return NextResponse.json({ status: 'error', message: errorMsg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return handlePublish(req);
}

export async function POST(req: NextRequest) {
  return handlePublish(req);
}
