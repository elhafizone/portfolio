import { test } from 'node:test';
import assert from 'node:assert/strict';

import { CHIPS, anchorHref, buildCatalog, resolveItems } from './catalog.ts';

const projects = [
  {
    id: 'haboob',
    title: 'Haboob',
    titleAr: 'هبوب',
    category: { en: 'Brand Website / WordPress', ar: 'موقع علامة تجارية / ووردبريس' },
    description: { en: 'An Arabic oud brand.', ar: 'موقع لعلامة عود.' },
    url: 'https://tryhaboob.com/',
    caseStudyUrl: '',
    isPlaceholder: false,
  },
  {
    id: 'dr-helmi',
    title: "Dr. Helmi's Dental Centre",
    category: { en: 'Clinic / WordPress', ar: 'عيادة / ووردبريس' },
    description: { en: 'A dental clinic.', ar: 'عيادة أسنان.' },
    url: '',
    caseStudyUrl: '/work/dr-helmi',
    isPlaceholder: false,
  },
  {
    id: 'pets-vet',
    title: 'Pets Veterinary Clinic',
    category: { en: 'Clinic', ar: 'عيادة' },
    description: { en: 'A vet.', ar: 'بيطري.' },
    url: 'https://pets.example/',
    caseStudyUrl: '',
    isPlaceholder: false,
  },
  {
    id: 'slot',
    title: 'Reserved',
    category: { en: '—', ar: '—' },
    description: { en: '—', ar: '—' },
    url: '',
    caseStudyUrl: '',
    isPlaceholder: true,
  },
];
const ids = ['website-design', 'woocommerce'] as const;
const services = {
  en: [
    { title: 'Website design', summary: 'Clear design.' },
    { title: 'WooCommerce stores', summary: 'Stores that sell.' },
  ],
  ar: [
    { title: 'تصميم المواقع', summary: 'تصميم واضح.' },
    { title: 'متاجر ووكومرس', summary: 'متاجر تبيع.' },
  ],
};
const catalog = buildCatalog(projects, services, ids);

test('buildCatalog maps projects and services with their links', () => {
  const haboob = catalog.find((c) => c.id === 'haboob');
  assert.equal(haboob?.href, 'https://tryhaboob.com/');
  assert.equal(haboob?.title.ar, 'هبوب');
  assert.equal(catalog.find((c) => c.id === 'dr-helmi')?.href, '/work/dr-helmi');
  const woo = catalog.find((c) => c.id === 'woocommerce');
  assert.equal(woo?.type, 'service');
  assert.equal(woo?.href, '#services');
  assert.equal(woo?.title.ar, 'متاجر ووكومرس');
});

test('buildCatalog leaves placeholder projects out', () => {
  assert.equal(catalog.some((c) => c.id === 'slot'), false);
});

test('resolveItems keeps only known, unique, well-formed items, max 2', () => {
  const out = resolveItems(
    [
      { type: 'project', id: 'nope' },
      { type: 'project', id: 'haboob' },
      { type: 'project', id: 'haboob' },
      { type: 'service', id: 'woocommerce' },
      { type: 'project', id: 'pets-vet' },
      { x: 1 },
    ],
    catalog,
  );
  assert.deepEqual(out.map((c) => c.id), ['haboob', 'woocommerce']);
});

test('resolveItems rejects a type mismatch and garbage', () => {
  assert.deepEqual(resolveItems([{ type: 'service', id: 'haboob' }], catalog), []);
  assert.deepEqual(resolveItems('garbage', catalog), []);
  assert.deepEqual(resolveItems(null, catalog), []);
});

test('every chip item exists in the catalogue', () => {
  for (const chip of CHIPS) {
    for (const item of chip.items) {
      assert.equal(resolveItems([item], catalog).length, 1, `${chip.key} → ${item.id}`);
    }
  }
});

test('anchorHref stays on the page at home and goes home elsewhere', () => {
  assert.equal(anchorHref('ar', '#work', true), '#work');
  assert.equal(anchorHref('ar', '#work', false), '/#work');
  assert.equal(anchorHref('en', '#services', false), '/en#services');
});
