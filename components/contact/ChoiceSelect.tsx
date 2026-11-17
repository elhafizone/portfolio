'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';

/**
 * A select that opens right under its field, always.
 *
 * The native <select> popup is placed by the browser at the moment it opens. With Lenis smooth
 * scrolling the page is often still gliding when the visitor clicks, so the native list opened
 * where the field *was* and the page slid away from it: "it opened somewhere far". This list is
 * part of the page (absolutely positioned inside the field), so it travels with the field.
 *
 * Keyboard: Enter / Space / ArrowDown open; arrows move; Enter picks; Escape / Tab close.
 * It is a button + listbox (aria-activedescendant), labelled by the field's <label htmlFor>.
 */

export type Choice = { value: string; label: string };

export function ChoiceSelect({
  id,
  name,
  value,
  options,
  onChange,
  invalid,
  describedBy,
  className,
}: {
  id: string;
  name: string;
  value: string;
  options: Choice[]; // the first one is the empty choice ("Select…" / "Prefer not to say")
  onChange: (value: string) => void;
  invalid?: boolean;
  describedBy?: string;
  className: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const selected = Math.max(0, options.findIndex((o) => o.value === value));

  useEffect(() => {
    if (!open) return;
    setActive(selected);
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open, selected]);

  const pick = (i: number) => {
    onChange(options[i].value);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === 'Escape' || e.key === 'Tab') {
      if (e.key === 'Escape') e.preventDefault();
      setOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(options.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActive(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActive(options.length - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      pick(active);
    }
  };

  const empty = !value;

  return (
    <div ref={rootRef} className="relative">
      {/* keeps the field in any native form submission / autofill tooling */}
      <input type="hidden" name={name} value={value} />
      <button
        ref={buttonRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKey}
        className={`${className} flex items-center justify-between gap-3 text-start ${empty ? 'text-ink-faint' : ''}`}
      >
        {/* dir="auto": a range like "500$ – 1,500$" reads left to right even on an Arabic page */}
        <span dir="auto" className="truncate">{options[selected]?.label}</span>
        <svg
          aria-hidden="true"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className={`shrink-0 text-ink-mute transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        >
          <path d="M2 4.5 6 8.5l4-4" />
        </svg>
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={id}
          data-lenis-prevent=""
          className="absolute inset-x-0 top-full z-[45] mt-1 max-h-72 overflow-y-auto overscroll-contain rounded-xl border border-rule bg-paper py-1.5 shadow-[0_18px_40px_-20px_rgba(13,13,13,0.35)]"
        >
          {options.map((o, i) => (
            <li
              key={o.value || 'empty'}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === selected}
              onPointerEnter={() => setActive(i)}
              onClick={() => pick(i)}
              className={`cursor-pointer px-4 py-2.5 text-[0.9375rem] transition-colors ${
                i === active ? 'bg-accent-wash text-ink' : 'text-ink-body'
              } ${i === selected ? 'font-medium text-accent-ink' : ''}`}
            >
              <span dir="auto">{o.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
