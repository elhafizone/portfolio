import { test } from 'node:test';
import assert from 'node:assert/strict';

import { arcPoint, bounds, makeWander, pickWaypoint, planTrip, stepRoam, type RoamState } from './roam.ts';

const desk = { w: 1440, h: 900, mobile: false };
const phone = { w: 375, h: 812, mobile: true };
const box = { w: 208, h: 250 };

// mulberry32: neighbouring seeds give unrelated sequences (a bare LCG's first draw barely moves)
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
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
  const minDist = Math.min(desk.w, desk.h) * 0.12;
  for (let seed = 1; seed <= 100; seed++) {
    const p = pickWaypoint(desk, box, 80, from, seeded(seed));
    assert.ok(p.x >= b.minX && p.x <= b.maxX && p.y >= b.minY && p.y <= b.maxY, `seed ${seed} out of bounds`);
    assert.ok(Math.hypot(p.x - from.x, p.y - from.y) >= minDist, `seed ${seed} too close`);
  }
});

test('pickWaypoint mixes short hops and long glides', () => {
  const from = { x: 616, y: 360 };
  const d = [];
  for (let seed = 1; seed <= 200; seed++) {
    const p = pickWaypoint(desk, box, 80, from, seeded(seed));
    d.push(Math.hypot(p.x - from.x, p.y - from.y));
  }
  const m = Math.min(desk.w, desk.h);
  assert.ok(d.some((x) => x < m * 0.3), 'no short hops');
  assert.ok(d.some((x) => x > m * 0.55), 'no long glides');
});

test('pickWaypoint does not ping-pong straight back', () => {
  const from = { x: 616, y: 360 };
  const prevDir = { x: 1, y: 0 }; // just travelled to the right
  for (let seed = 1; seed <= 200; seed++) {
    const p = pickWaypoint(desk, box, 80, from, seeded(seed), prevDir);
    const dx = p.x - from.x;
    const dy = p.y - from.y;
    const cos = (dx * prevDir.x + dy * prevDir.y) / Math.hypot(dx, dy);
    assert.ok(cos > -0.8, `seed ${seed} reversed (cos ${cos.toFixed(2)})`);
  }
});

test('planTrip curves the path and paces it', () => {
  const trip = planTrip({ x: 0, y: 0 }, { x: 400, y: 0 }, 10, seeded(3), false);
  assert.ok(Math.abs(trip.ctrl.y) >= 400 * 0.12, 'path is not curved');
  assert.ok(trip.dur >= 1.2 && trip.dur <= 5.5);
  assert.deepEqual(arcPoint(trip, 10), { x: 0, y: 0 });
  const end = arcPoint(trip, 10 + trip.dur + 1);
  assert.ok(Math.abs(end.x - 400) < 1e-9 && Math.abs(end.y) < 1e-9);
});

test('wander drifts smoothly inside its amplitude', () => {
  const w = makeWander(seeded(7));
  let prev = w(0, 20);
  for (let t = 0.016; t < 30; t += 0.016) {
    const p = w(t, 20);
    assert.ok(Math.abs(p.x) <= 20 && Math.abs(p.y) <= 20);
    assert.ok(Math.hypot(p.x - prev.x, p.y - prev.y) < 2, 'jumped');
    prev = p;
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
