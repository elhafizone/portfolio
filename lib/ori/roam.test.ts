import { test } from 'node:test';
import assert from 'node:assert/strict';

import { bounds, pickWaypoint, stepRoam, type RoamState } from './roam.ts';

const desk = { w: 1440, h: 900, mobile: false };
const phone = { w: 375, h: 812, mobile: true };
const box = { w: 208, h: 250 };

function seeded(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

test('bounds keep the box on screen and below the navbar (desktop)', () => {
  assert.deepEqual(bounds(desk, box, 80), { minX: 12, maxX: 1220, minY: 92, maxY: 638 });
});

test('bounds keep mobile ORI in the lower band', () => {
  const b = bounds(phone, { w: 116, h: 140 }, 64);
  assert.ok(b.minY >= 812 * 0.55);
  assert.ok(b.maxY + 140 <= 812);
});

test('pickWaypoint lands inside bounds and travels a real distance', () => {
  const b = bounds(desk, box, 80);
  const from = { x: 400, y: 300 };
  const minDist = Math.min(desk.w, desk.h) * 0.25;
  for (let seed = 1; seed <= 100; seed++) {
    const p = pickWaypoint(desk, box, 80, from, seeded(seed));
    assert.ok(p.x >= b.minX && p.x <= b.maxX && p.y >= b.minY && p.y <= b.maxY, `seed ${seed} out of bounds`);
    assert.ok(Math.hypot(p.x - from.x, p.y - from.y) >= minDist, `seed ${seed} too close`);
  }
});

const opts = { stiffness: 6, damping: 2 * Math.sqrt(6), scrollPush: 0.9 };

test('stepRoam converges on the target without overshooting', () => {
  let s: RoamState = { pos: { x: 0, y: 0 }, vel: { x: 0, y: 0 }, target: { x: 300, y: 0 }, nextAt: Infinity };
  let max = 0;
  for (let i = 0; i < 240; i++) {
    s = stepRoam(s, 1 / 60, 0, i / 60, opts);
    max = Math.max(max, s.pos.x);
  }
  assert.ok(Math.abs(s.pos.x - 300) < 0.5, `ended at ${s.pos.x}`);
  assert.ok(max <= 300 * 1.05, `overshot to ${max}`);
});

test('scrolling down drags ORI up for a moment', () => {
  const s: RoamState = { pos: { x: 100, y: 400 }, vel: { x: 0, y: 0 }, target: { x: 100, y: 400 }, nextAt: Infinity };
  const next = stepRoam(s, 1 / 60, 40, 0, opts);
  assert.ok(next.vel.y < 0);
});
