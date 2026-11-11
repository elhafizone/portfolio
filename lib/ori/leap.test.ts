import { test } from 'node:test';
import assert from 'node:assert/strict';

import { leapPose, leapU, planLeap } from './leap.ts';

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

const from = { x: 900, y: 300, h: 700 };
const to = { x: 100, y: 560, h: 220 };

test('a leap starts where ORI is and ends where it is going', () => {
  const l = planLeap('out', from, 10, 800, 0.3, seeded(1));
  const start = leapPose(l, to, l.t0);
  assert.equal(start.x, from.x);
  assert.equal(start.y, from.y);
  assert.equal(start.h, from.h);
  const end = leapPose(l, to, l.t0 + l.dur);
  assert.ok(Math.abs(end.x - to.x) < 1e-6 && Math.abs(end.y - to.y) < 1e-6 && Math.abs(end.h - to.h) < 1e-6);
});

test('it rises above the straight line mid-flight', () => {
  const l = planLeap('out', from, 0, 800, 0, seeded(2));
  const mid = leapPose(l, to, l.t0 + l.dur / 2);
  const straightY = (from.y + to.y) / 2;
  assert.ok(mid.y < straightY - 50, `apex ${straightY - mid.y}px`);
});

test('it crouches before jumping out', () => {
  const l = planLeap('out', from, 0, 800, 0, seeded(3));
  const p = leapPose(l, to, l.t0 - 0.01);
  assert.ok(p.sy < 0.95 && p.sx > 1);
  assert.equal(leapU(l, l.t0 - 0.01), 0);
});

test('no two leaps are the same, and harder scrolls jump higher', () => {
  const r = seeded(4);
  const a = planLeap('out', from, 0, 800, 0, r);
  const b = planLeap('out', from, 0, 800, 0, r);
  assert.notEqual(a.apex, b.apex);
  assert.notEqual(a.spin, b.spin);
  const soft = planLeap('out', from, 0, 800, 0, seeded(9));
  const hard = planLeap('out', from, 0, 800, 1, seeded(9));
  assert.ok(hard.apex > soft.apex);
});

test('jumping out shrinks early, jumping in grows late', () => {
  const out = planLeap('out', from, 0, 800, 0, seeded(5));
  assert.ok(leapPose(out, to, out.t0 + out.dur * 0.4).h < from.h - (from.h - to.h) * 0.6);
  const back = planLeap('in', to, 0, 800, 0, seeded(6));
  assert.ok(leapPose(back, from, back.t0 + back.dur * 0.4).h < to.h + (from.h - to.h) * 0.1);
});
