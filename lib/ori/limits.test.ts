import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createLimiter } from './limits.ts';

const HOUR = 3_600_000;

test('ten messages an hour per visitor, then a pause', () => {
  const l = createLimiter({ perHour: 10, perDay: 300 });
  for (let i = 0; i < 10; i++) assert.equal(l.take('1.1.1.1', 1000 + i), 'ok');
  assert.equal(l.take('1.1.1.1', 2000), 'ip');
  assert.equal(l.take('2.2.2.2', 2000), 'ok', 'another visitor is unaffected');
  assert.equal(l.take('1.1.1.1', 1000 + HOUR + 1), 'ok', 'the hour slides');
});

test('a refused message does not use up the visitor allowance', () => {
  const l = createLimiter({ perHour: 2, perDay: 300 });
  l.take('a', 0);
  l.take('a', 1);
  assert.equal(l.take('a', 2), 'ip');
  assert.equal(l.take('a', HOUR + 1), 'ok');
  assert.equal(l.take('a', HOUR + 2), 'ok');
  assert.equal(l.take('a', HOUR + 3), 'ip');
});

test('the whole site stops at the daily cap and resets next day', () => {
  const l = createLimiter({ perHour: 10, perDay: 300 });
  for (let i = 0; i < 300; i++) assert.equal(l.take(`ip${i}`, 5000), 'ok');
  assert.equal(l.take('fresh', 6000), 'day');
  assert.equal(l.take('fresh', 5000 + 24 * HOUR + 1), 'ok');
});
