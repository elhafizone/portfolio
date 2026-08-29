import { NextResponse } from 'next/server';

import { validateContact, type ContactPayload } from '@/lib/contact';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Contact endpoint.
 *
 * There is deliberately no bundled mail backend. This route validates the
 * payload and hands it to whichever delivery provider is configured through
 * environment variables:
 *
 *   RESEND_API_KEY + CONTACT_TO_EMAIL   -> sends via Resend
 *   CONTACT_WEBHOOK_URL                 -> POSTs the JSON payload
 *
 * With neither configured it returns 501 and says so plainly. It never returns
 * a success the visitor would read as "your message was sent" when nothing was
 * actually delivered.
 */

type DeliveryResult = { ok: true } | { ok: false; status: number; error: string };

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function checkRate(key: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimit.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_PER_WINDOW) return false;

  entry.count += 1;
  return true;
}

function renderEmail(payload: ContactPayload) {
  const lines = [
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    payload.phone ? `Phone: ${payload.phone}` : null,
    `Project type: ${payload.projectType}`,
    payload.budget ? `Budget: ${payload.budget}` : null,
    '',
    payload.message,
  ].filter(Boolean);

  return lines.join('\n');
}

async function deliver(payload: ContactPayload): Promise<DeliveryResult> {
  const resendKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL ?? 'onboarding@resend.dev';

  if (resendKey && to) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: payload.email,
        subject: `New enquiry - ${payload.projectType} - ${payload.name}`,
        text: renderEmail(payload),
      }),
    });

    if (!response.ok) {
      return {
        ok: false,
        status: 502,
        error: 'The message could not be delivered. Please try again shortly.',
      };
    }
    return { ok: true };
  }

  const webhook = process.env.CONTACT_WEBHOOK_URL;
  if (webhook) {
    const response = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return {
        ok: false,
        status: 502,
        error: 'The message could not be delivered. Please try again shortly.',
      };
    }
    return { ok: true };
  }

  return {
    ok: false,
    status: 501,
    error:
      'The contact form is not connected to an inbox yet. Please reach out through one of the listed channels.',
  };
}

export async function POST(request: Request) {
  let body: Partial<ContactPayload>;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  // Honeypot: silently accept so bots do not learn they were caught, but do
  // not deliver anything.
  if (body.company) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const errors = validateContact(body);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown';

  if (!checkRate(ip)) {
    return NextResponse.json(
      { error: 'Too many messages sent. Please try again a little later.' },
      { status: 429 }
    );
  }

  const payload: ContactPayload = {
    name: String(body.name).trim(),
    email: String(body.email).trim(),
    phone: String(body.phone ?? '').trim(),
    projectType: String(body.projectType).trim(),
    budget: String(body.budget ?? '').trim(),
    message: String(body.message).trim(),
  };

  const result = await deliver(payload);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
