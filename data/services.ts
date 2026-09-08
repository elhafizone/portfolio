/**
 * Service structure. All copy lives in the dictionaries and is zipped with this
 * list by position, so a translation can never reorder or drop a service.
 */
export const serviceIds = [
  'website-design',
  'wordpress-development',
  'custom-wordpress',
  'woocommerce',
  'creative-design',
  'responsive-design',
] as const;

export type ServiceId = (typeof serviceIds)[number];
