import { ar } from '@/data/content/ar';
import { en } from '@/data/content/en';
import { projects } from '@/data/projects';
import { serviceIds } from '@/data/services';
import { buildCatalog } from '@/lib/ori/catalog';

/** The site's own catalogue, shared by the guide bubble and the /api/ori route. */
export const siteCatalog = buildCatalog(projects, { en: en.services.items, ar: ar.services.items }, serviceIds);
