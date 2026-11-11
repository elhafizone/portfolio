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

/** A new place to drift to, far enough from `from` that the trip reads as intentional. */
export function pickWaypoint(view: Viewport, box: Box, navH: number, from: Vec, rand: () => number): Vec {
  const b = bounds(view, box, navH);
  const minDist = Math.min(view.w, view.h) * 0.25;
  let best: Vec = from;
  let bestD = -1;
  for (let i = 0; i < 8; i++) {
    const p = { x: b.minX + rand() * (b.maxX - b.minX), y: b.minY + rand() * (b.maxY - b.minY) };
    const d = Math.hypot(p.x - from.x, p.y - from.y);
    if (d >= minDist) return p;
    if (d > bestD) {
      best = p;
      bestD = d;
    }
  }
  // the box can be too small for minDist (tiny viewport): take the farthest try, or the far corner
  const far = { x: from.x - b.minX > b.maxX - from.x ? b.minX : b.maxX, y: from.y - b.minY > b.maxY - from.y ? b.minY : b.maxY };
  return Math.hypot(far.x - from.x, far.y - from.y) > bestD ? far : best;
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
