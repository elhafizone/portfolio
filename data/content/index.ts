import { ar } from '@/data/content/ar';
import { en, type Dictionary } from '@/data/content/en';
import type { Locale } from '@/lib/i18n';

const dictionaries: Record<Locale, Dictionary> = { ar, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export type { Dictionary };

/**
 * Fills {placeholders} in a copy string.
 * Keeps interpolation out of the dictionaries, so translators only ever see
 * the sentence and the token names.
 */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in values ? String(values[key]) : match
  );
}
