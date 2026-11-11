'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from 'react';

import { useLocale } from '@/components/i18n/LocaleProvider';
import { useMotion } from '@/components/motion/MotionProvider';
import { oriEmit, oriOn } from '@/lib/ori/bus';
import { CHIPS, anchorHref, resolveItems, type CatalogEntry, type ChipKey } from '@/lib/ori/catalog';
import { siteCatalog } from '@/lib/ori/siteCatalog';

/**
 * ORI's speech bubble (Level 2: the guide). Opens from a click on ORI (bus 'open') or the
 * keyboard-only "Talk to ORI" button, anchored above ORI's park corner (bottom, inline-start).
 * Ready chips answer from local data; free text goes to /api/ori when the server has a key.
 * Loaded lazily after the intro by SiteShell, so it adds nothing to first-load JS.
 */

type Turn = { who: 'ori' | 'me'; text: string; items?: CatalogEntry[] };
const MAX_INPUT = 300;

export default function OriGuide({ aiEnabled }: { aiEnabled: boolean }) {
  const { t, locale, dir } = useLocale();
  const copy = t.ori;
  const { scrollTo } = useMotion();
  const pathname = usePathname();
  const onHome = pathname === '/' || pathname === '/en';
  const titleId = useId();

  const [open, setOpen] = useState(false);
  const [log, setLog] = useState<Turn[]>([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    oriEmit('close');
  }, []);

  // ORI was clicked (or the trigger was used): open with a greeting
  useEffect(
    () =>
      oriOn('open', () => {
        setOpen(true);
        setLog((l) => (l.length ? l : [{ who: 'ori', text: copy.greeting }]));
      }),
    [copy.greeting],
  );

  // focus in on open; Esc and outside presses close
  useEffect(() => {
    if (!open) return;
    const b = bubbleRef.current;
    const first =
      b?.querySelector<HTMLElement>('[data-ori-first]') ?? b?.querySelector<HTMLElement>('input') ?? b?.querySelector<HTMLElement>('button');
    first?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        triggerRef.current?.focus({ preventScroll: true });
      }
    };
    const onDown = (e: PointerEvent) => {
      const el = e.target as Element | null;
      // a press on ORI itself is swallowed by OriCompanion before it gets here
      if (bubbleRef.current?.contains(el) || el === triggerRef.current) return;
      close();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open, close]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [log]);

  const goTo = (hash: string) => {
    if (onHome) {
      scrollTo(hash);
      oriEmit('fly-to', { selector: hash, clip: hash === '#work' ? 'Point' : 'Present' });
    } else {
      window.location.href = anchorHref(locale, hash, false);
    }
  };

  const onChip = (key: ChipKey) => {
    const chip = CHIPS.find((c) => c.key === key)!;
    const items = resolveItems(chip.items, siteCatalog);
    setLog((l) => [...l, { who: 'me', text: copy.chips[key] }, { who: 'ori', text: copy.replies[key], items }]);
    oriEmit('reply');
    if (chip.flyTo) goTo(chip.flyTo);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const message = input.trim().slice(0, MAX_INPUT);
    if (!message) {
      setError(copy.empty);
      return;
    }
    if (busy) return;
    const history = log
      .filter((x) => x.text !== copy.greeting)
      .slice(-6)
      .map((x) => ({ role: x.who === 'me' ? 'user' : 'assistant', text: x.text }));
    setLog((l) => [...l, { who: 'me', text: message }]);
    setInput('');
    setBusy(true);
    oriEmit('think');
    try {
      const res = await fetch('/api/ori', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ locale, history, message }),
      });
      if (res.status === 429) {
        setLog((l) => [...l, { who: 'ori', text: copy.limit }]);
      } else if (!res.ok) {
        setLog((l) => [...l, { who: 'ori', text: copy.fallback }]);
      } else {
        const data = (await res.json()) as { reply?: unknown; items?: unknown };
        const text = typeof data.reply === 'string' && data.reply.trim() ? data.reply.trim() : copy.fallback;
        setLog((l) => [...l, { who: 'ori', text, items: resolveItems(data.items, siteCatalog) }]);
        oriEmit('reply');
      }
    } catch {
      setLog((l) => [...l, { who: 'ori', text: copy.fallback }]);
    } finally {
      setBusy(false);
    }
  };

  const chipRow = (first: boolean) => (
    <div className="flex flex-wrap gap-2">
      {CHIPS.map((c, i) => (
        <button
          key={c.key}
          type="button"
          data-ori-first={first && i === 0 ? '' : undefined}
          onClick={() => onChip(c.key)}
          className="rounded-full border border-[var(--rule-strong)] bg-[var(--paper)] px-3 py-1.5 text-[0.8125rem] leading-snug text-[var(--ink)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-veil)]"
        >
          {copy.chips[c.key]}
        </button>
      ))}
    </div>
  );

  const card = (item: CatalogEntry) => {
    const external = item.href.startsWith('http');
    const label = item.type === 'project' ? copy.open.project : copy.open.service;
    const body = (
      <>
        <span className="block text-[0.6875rem] uppercase tracking-[0.08em] text-[var(--ink-mute)]">{copy.cardKind[item.type]}</span>
        <span className="block font-medium text-[var(--ink)]">{item.title[locale]}</span>
        <span className="block text-[0.8125rem] text-[var(--ink-mute)]">{item.line[locale]}</span>
        <span className="mt-1 block text-[0.8125rem] font-medium text-[var(--accent-ink)]">{label}</span>
      </>
    );
    const cls = 'block rounded-xl border border-[var(--rule)] px-3 py-2.5 text-start transition-colors hover:border-[var(--accent)]';
    if (external || item.href.startsWith('/')) {
      return (
        <a
          key={item.id}
          href={item.href}
          className={cls}
          {...(external ? { target: '_blank', rel: 'noopener' } : {})}
          onClick={() => oriEmit('card-open')}
        >
          {body}
        </a>
      );
    }
    return (
      <button
        key={item.id}
        type="button"
        className={`${cls} w-full`}
        onClick={() => {
          oriEmit('card-open');
          goTo(item.href);
        }}
      >
        {body}
      </button>
    );
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? close() : oriEmit('open'))}
        aria-expanded={open}
        className="sr-only fixed bottom-4 start-4 z-50 rounded-full bg-[var(--ink)] px-4 py-2 text-sm text-[var(--paper)] focus:not-sr-only"
      >
        {copy.talk}
      </button>

      {open && (
        <div
          ref={bubbleRef}
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          dir={dir}
          className="fixed start-3 z-50 flex max-h-[min(560px,calc(100dvh-clamp(140px,19vw,250px)-20px-var(--header-h)))] w-[min(360px,calc(100vw-24px))] flex-col rounded-2xl border border-[var(--rule)] bg-[var(--paper)] text-[0.9375rem] leading-relaxed text-[var(--ink-body)] shadow-[0_18px_50px_-20px_rgba(13,13,13,0.35)] sm:start-5"
          style={{ bottom: 'calc(clamp(140px, 19vw, 250px) + 20px)' }}
        >
          <div className="flex items-center justify-between gap-3 border-b border-[var(--rule)] px-4 py-2.5">
            <span id={titleId} className="text-[0.8125rem] font-medium text-[var(--ink)]">
              {copy.dialogLabel}
            </span>
            <button
              type="button"
              onClick={() => {
                close();
                triggerRef.current?.focus({ preventScroll: true });
              }}
              aria-label={copy.close}
              className="-me-1 grid h-8 w-8 place-items-center rounded-full text-[var(--ink-mute)] hover:bg-[var(--surface)]"
            >
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M2 2l10 10M12 2L2 12" />
              </svg>
            </button>
          </div>

          <div ref={logRef} aria-live="polite" className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-3">
            {log.map((turn, i) =>
              turn.who === 'me' ? (
                <p key={i} className="max-w-[85%] self-end rounded-2xl bg-[var(--accent-wash)] px-3 py-1.5 text-[0.875rem] text-[var(--accent-deep)]">
                  {turn.text}
                </p>
              ) : (
                <div key={i} className="flex flex-col gap-2">
                  <p className="text-[var(--ink)]">{turn.text}</p>
                  {turn.items?.map(card)}
                </div>
              ),
            )}
            {busy && <p className="text-[0.8125rem] text-[var(--ink-mute)]">{copy.thinking}</p>}
            {/* the ready answers stay available under the latest reply */}
            {!busy && chipRow(log.length <= 1)}
          </div>

          {aiEnabled && (
            <form onSubmit={onSubmit} className="border-t border-[var(--rule)] px-4 pb-3 pt-2.5" noValidate>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  maxLength={MAX_INPUT}
                  onChange={(e) => {
                    setInput(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder={copy.placeholder}
                  aria-label={copy.placeholder}
                  aria-invalid={error ? true : undefined}
                  className="min-w-0 flex-1 rounded-full border border-[var(--rule-strong)] bg-[var(--paper)] px-3.5 py-2 text-[0.875rem] text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:border-[var(--accent-ink)]"
                />
                <button
                  type="submit"
                  aria-label={copy.send}
                  aria-busy={busy || undefined}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--ink-soft)]"
                >
                  <svg aria-hidden="true" width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" className="rtl:-scale-x-100">
                    <path d="M2 8h11M9 3.5 13.5 8 9 12.5" />
                  </svg>
                </button>
              </div>
              {error && <p className="mt-1.5 text-[0.8125rem] text-[#b3261e]">{error}</p>}
              <p className="mt-1.5 text-[0.6875rem] text-[var(--ink-faint)]">{copy.privacy}</p>
            </form>
          )}
        </div>
      )}
    </>
  );
}
