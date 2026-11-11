/**
 * Where ORI flies. Pure maths, no DOM: positions are the top-left corner of ORI's box in viewport
 * pixels. The companion feeds it the viewport, the box size and the scroll delta each frame.
 */

export type Vec = { x: number; y: number };
export type Box = { w: number; h: number };
export type Viewport = { w: number; h: number; mobile: boolean };
export type Bounds = { minX: number; maxX: number; minY: number; maxY: number };
export type RoamState = { pos: Vec; vel: Vec; target: Vec; nextAt: number };
export type RoamOpts = { stiffness: number; damping: number; scrollPush: number };

const MARGIN = 12;

/** The range ORI's top-left corner may take: fully on screen, clear of the navbar. */
export function bounds(view: Viewport, box: Box, navH: number): Bounds {
  const minX = MARGIN;
  const maxX = Math.max(minX, view.w - box.w - MARGIN);
  const maxY = Math.max(MARGIN, view.h - box.h - MARGIN);
  const top = view.mobile ? Math.max(navH + MARGIN, view.h * 0.55) : navH + MARGIN;
  return { minX, maxX, minY: Math.min(top, maxY), maxY };
}

export function clampTo(b: Bounds, p: Vec): Vec {
  return { x: Math.min(b.maxX, Math.max(b.minX, p.x)), y: Math.min(b.maxY, Math.max(b.minY, p.y)) };
}

/**
 * A new place to drift to. Trips are a mix (short hops, medium moves, long glides) so the motion
 * never settles into a rhythm, and a trip never doubles straight back along the previous one
 * (`prevDir`), which is what made ORI read as a pendulum.
 */
export function pickWaypoint(
  view: Viewport,
  box: Box,
  navH: number,
  from: Vec,
  rand: () => number,
  prevDir?: Vec,
): Vec {
  const b = bounds(view, box, navH);
  const m = Math.min(view.w, view.h);
  const minDist = m * 0.12;
  const kind = rand();
  // hop 35% · move 45% · glide 20%: the wanted trip length
  const want = kind < 0.35 ? m * (0.12 + rand() * 0.16) : kind < 0.8 ? m * (0.28 + rand() * 0.25) : m * (0.6 + rand() * 0.4);
  const pLen = prevDir ? Math.hypot(prevDir.x, prevDir.y) : 0;
  let best: Vec = from;
  let bestScore = -Infinity;
  let bestD = -1;
  for (let i = 0; i < 14; i++) {
    // a random heading at about the wanted length, kept on screen
    const ang = rand() * Math.PI * 2;
    const len = want * (0.85 + rand() * 0.3);
    const p = clampTo(b, { x: from.x + Math.cos(ang) * len, y: from.y + Math.sin(ang) * len });
    const d = Math.hypot(p.x - from.x, p.y - from.y);
    if (d < minDist) {
      if (d > bestD && bestScore === -Infinity) {
        best = p;
        bestD = d;
      }
      continue;
    }
    const cos = pLen ? ((p.x - from.x) * prevDir!.x + (p.y - from.y) * prevDir!.y) / (d * pLen) : 0;
    if (cos <= -0.8) continue; // straight back the way it came
    const score = -Math.abs(d - want) / m - Math.max(0, -cos) * 0.15; // near the wanted length, gently prefer turning
    if (score > bestScore) {
      best = p;
      bestScore = score;
    }
  }
  if (bestScore > -Infinity) return best;
  // the box can be too small for minDist (tiny viewport): take the farthest try, or the far corner
  const far = { x: from.x - b.minX > b.maxX - from.x ? b.minX : b.maxX, y: from.y - b.minY > b.maxY - from.y ? b.minY : b.maxY };
  return Math.hypot(far.x - from.x, far.y - from.y) > bestD ? far : best;
}

/** One trip: a curved (quadratic) path from → to, with its own pace. */
export type Trip = { from: Vec; ctrl: Vec; to: Vec; start: number; dur: number };

/** Bends the path to one side by a random amount and picks a speed for this trip. */
export function planTrip(from: Vec, to: Vec, now: number, rand: () => number, mobile: boolean): Trip {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const d = Math.hypot(dx, dy) || 1;
  const bend = (0.12 + rand() * 0.33) * d * (rand() < 0.5 ? -1 : 1);
  const ctrl = { x: (from.x + to.x) / 2 + (-dy / d) * bend, y: (from.y + to.y) / 2 + (dx / d) * bend };
  const speed = mobile ? 60 + rand() * 80 : 90 + rand() * 150; // px/s
  const dur = Math.min(5.5, Math.max(1.2, d / speed));
  return { from, ctrl, to, start: now, dur };
}

/** Where the trip's moving target is at `now` (ease in-out along the curve). */
export function arcPoint(trip: Trip, now: number): Vec {
  const u = Math.min(1, Math.max(0, (now - trip.start) / trip.dur));
  const e = u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2;
  const a = (1 - e) * (1 - e);
  const b = 2 * (1 - e) * e;
  const c = e * e;
  return { x: a * trip.from.x + b * trip.ctrl.x + c * trip.to.x, y: a * trip.from.y + b * trip.ctrl.y + c * trip.to.y };
}

/** How long to rest after a trip: mostly short, sometimes a longer hover. */
export function dwell(rand: () => number, mobile: boolean): number {
  const r = rand();
  const base = r < 0.45 ? 0.6 + rand() * 1.6 : r < 0.85 ? 2.5 + rand() * 3 : 7 + rand() * 6;
  return mobile ? base * 1.5 : base;
}

/**
 * A slow, never-repeating float added on top of the path (three incommensurate sines per axis
 * with random phases), so ORI drifts like something in air even while resting.
 */
export function makeWander(rand: () => number): (t: number, amp: number) => Vec {
  const f = [0.13, 0.29, 0.47];
  const px = f.map(() => rand() * Math.PI * 2);
  const py = f.map(() => rand() * Math.PI * 2);
  const w = [0.5, 0.3, 0.2];
  return (t, amp) => ({
    x: amp * f.reduce((s, fr, i) => s + w[i] * Math.sin(t * fr * Math.PI * 2 + px[i]), 0),
    y: amp * f.reduce((s, fr, i) => s + w[i] * Math.sin(t * fr * 1.17 * Math.PI * 2 + py[i]), 0),
  });
}

/**
 * One spring step towards the target. `scrollDelta` is how far the page scrolled since the last
 * frame (px, down = positive): the content moves up, so ORI is dragged up with it, then springs back.
 */
export function stepRoam(s: RoamState, dt: number, scrollDelta: number, _now: number, o: RoamOpts): RoamState {
  const ax = o.stiffness * (s.target.x - s.pos.x) - o.damping * s.vel.x;
  const ay = o.stiffness * (s.target.y - s.pos.y) - o.damping * s.vel.y;
  const vx = s.vel.x + ax * dt;
  // the drag is an acceleration proportional to scroll speed: steady offset = speed * push / stiffness
  const vy = s.vel.y + ay * dt - scrollDelta * o.scrollPush;
  return { ...s, vel: { x: vx, y: vy }, pos: { x: s.pos.x + vx * dt, y: s.pos.y + vy * dt } };
}
