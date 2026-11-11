/**
 * What ORI may recommend: the site's real projects and services, nothing else. Pure data shaping
 * (no '@/' imports) so it runs under `node --test` and on the server route alike.
 */

export type Lang = 'ar' | 'en';
export type Text = { en: string; ar: string };
export type OriItem = { type: 'project' | 'service'; id: string };
export type CatalogEntry = OriItem & { title: Text; line: Text; href: string };

export type ProjectLike = {
  id: string;
  title: string;
  titleAr?: string;
  category: Text;
  description: Text;
  url: string;
  caseStudyUrl: string;
  isPlaceholder: boolean;
};
export type ServiceCopy = { title: string; summary: string };

export function buildCatalog(
  projects: ProjectLike[],
  services: { en: ServiceCopy[]; ar: ServiceCopy[] },
  ids: readonly string[],
): CatalogEntry[] {
  const fromProjects: CatalogEntry[] = projects
    .filter((p) => !p.isPlaceholder)
    .map((p) => ({
      type: 'project',
      id: p.id,
      title: { en: p.title, ar: p.titleAr ?? p.title },
      line: p.category,
      href: p.caseStudyUrl || p.url || '#work',
    }));
  const fromServices: CatalogEntry[] = ids.map((id, i) => ({
    type: 'service',
    id,
    title: { en: services.en[i]?.title ?? id, ar: services.ar[i]?.title ?? id },
    line: { en: services.en[i]?.summary ?? '', ar: services.ar[i]?.summary ?? '' },
    href: '#services',
  }));
  return [...fromProjects, ...fromServices];
}

/** Turns untrusted item lists (from the model or a chip) into known catalogue entries. */
export function resolveItems(items: unknown, catalog: CatalogEntry[], max = 2): CatalogEntry[] {
  if (!Array.isArray(items)) return [];
  const out: CatalogEntry[] = [];
  for (const raw of items) {
    if (out.length >= max) break;
    if (!raw || typeof raw !== 'object') continue;
    const { type, id } = raw as Record<string, unknown>;
    const hit = catalog.find((c) => c.type === type && c.id === id);
    if (hit && !out.includes(hit)) out.push(hit);
  }
  return out;
}

export type ChipKey = 'store' | 'clinic' | 'brand' | 'work';
export const CHIPS: { key: ChipKey; items: OriItem[]; flyTo?: string }[] = [
  { key: 'store', items: [{ type: 'service', id: 'woocommerce' }] },
  { key: 'clinic', items: [{ type: 'project', id: 'dr-helmi' }, { type: 'project', id: 'pets-vet' }] },
  { key: 'brand', items: [{ type: 'project', id: 'haboob' }] },
  { key: 'work', items: [], flyTo: '#work' },
];

/** A homepage anchor from wherever the visitor is: Arabic lives at `/`, English at `/en`. */
export function anchorHref(locale: Lang, hash: string, onHome: boolean): string {
  if (onHome) return hash;
  return (locale === 'en' ? '/en' : '/') + hash;
}
