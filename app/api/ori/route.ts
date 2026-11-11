import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

import { resolveItems } from '@/lib/ori/catalog';
import { createLimiter } from '@/lib/ori/limits';
import { replySchema, systemPrompt } from '@/lib/ori/prompt';
import { siteCatalog } from '@/lib/ori/siteCatalog';

/**
 * ORI's free-text answers. POST { locale, history, message } → { reply, items }.
 * Errors: 400 bad body, 429 limit, 503 no key, 502 upstream. The key stays server-side.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODEL = 'claude-haiku-5-5';
const MAX_INPUT = 300;
const MAX_TURN = 600;
const MAX_HISTORY = 6;

type Body = { locale?: unknown; history?: unknown; message?: unknown };
type Turn = { role: 'user' | 'assistant'; text: string };

const g = globalThis as typeof globalThis & {
  __oriLimiter?: ReturnType<typeof createLimiter>;
  __oriClient?: Anthropic;
};
const limiter = (g.__oriLimiter ??= createLimiter({ perHour: 10, perDay: 300 }));
const SYSTEM = systemPrompt(siteCatalog);

function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  return (fwd?.split(',')[0] ?? req.headers.get('x-real-ip') ?? 'unknown').trim();
}

function parseHistory(raw: unknown): Turn[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (t): t is Turn =>
        !!t && typeof t === 'object' && (t.role === 'user' || t.role === 'assistant') && typeof t.text === 'string' && t.text.trim() !== '',
    )
    .slice(-MAX_HISTORY)
    .map((t) => ({ role: t.role, text: t.text.slice(0, MAX_TURN) }));
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: 'off' }, { status: 503 });

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'bad' }, { status: 400 });
  }
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message || message.length > MAX_INPUT) return NextResponse.json({ error: 'bad' }, { status: 400 });

  const verdict = limiter.take(clientIp(req), Date.now());
  if (verdict !== 'ok') return NextResponse.json({ error: 'limit' }, { status: 429 });

  // the API wants the first message from the user: drop leading assistant turns
  const history = parseHistory(body.history);
  while (history[0]?.role === 'assistant') history.shift();
  const messages: Anthropic.MessageParam[] = [
    ...history.map((t) => ({ role: t.role, content: t.text })),
    { role: 'user', content: message },
  ];

  const client = (g.__oriClient ??= new Anthropic({ timeout: 20_000, maxRetries: 1 }));
  try {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 500, // room for three Arabic sentences inside the JSON wrapper
      thinking: { type: 'disabled' },
      output_config: { effort: 'low', format: { type: 'json_schema', schema: replySchema } },
      system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
      messages,
    });
    if (res.stop_reason === 'refusal') return NextResponse.json({ error: 'upstream' }, { status: 502 });
    const text = res.content.find((b): b is Anthropic.TextBlock => b.type === 'text')?.text ?? '';
    const parsed = JSON.parse(text) as { reply?: unknown; items?: unknown };
    const reply = typeof parsed.reply === 'string' ? parsed.reply.trim() : '';
    if (!reply) return NextResponse.json({ error: 'upstream' }, { status: 502 });
    return NextResponse.json({ reply, items: resolveItems(parsed.items, siteCatalog) });
  } catch (err) {
    if (err instanceof Anthropic.APIError) console.error('[ori] upstream', err.status, err.message);
    else console.error('[ori] failed', err);
    return NextResponse.json({ error: 'upstream' }, { status: 502 });
  }
}
