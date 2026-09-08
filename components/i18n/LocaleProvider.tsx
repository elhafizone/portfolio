'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { fill, type Dictionary } from '@/data/content';
import { direction, otherLocale, type Locale } from '@/lib/i18n';

type LocaleContextValue = {
  locale: Locale;
  dir: 'rtl' | 'ltr';
  isRtl: boolean;
  /** The dictionary for the active locale. */
  t: Dictionary;
  /** Fills {placeholders} in a dictionary string. */
  fill: typeof fill;
  /** The locale the language switch points at. */
  other: Locale;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

/**
 * Makes the active locale and its dictionary available to every client
 * component, so sections read copy from context instead of importing a
 * single-language module.
 */
export function LocaleProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: ReactNode;
}) {
  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      dir: direction[locale],
      isRtl: direction[locale] === 'rtl',
      t: dictionary,
      fill,
      other: otherLocale(locale),
    }),
    [locale, dictionary]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used inside <LocaleProvider>');
  }
  return ctx;
}
