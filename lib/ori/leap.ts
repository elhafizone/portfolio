/**
 * ORI's jumps between the hero window and the page. Pure maths: a leap is a ballistic arc
 * (parabola on top of an eased straight line) with its own height, length, spin and size change,
 * all drawn fresh for every jump so no two look alike.
 */

export type Pose = { x: number; y: number; h: number }; // top-left of ORI's box and its height, px
export type Leap = {
  dir: 'out' | 'in';
  t0: number; // seconds; the crouch runs before t0, the flight from t0 to t0 + dur
  crouch: number;
  dur: number;
  apex: number; // px above the straight line at mid-flight
  spin: number; // degrees at mid-flight
  from: Pose;
};

/** Draws a new leap. `energy` (0..1) is how hard the visitor scrolled: harder scroll, bigger jump. */
export function planLeap(dir: Leap['dir'], from: Pose, now: number, viewH: number, energy: number, rand: () => number): Leap {
  const e = Math.min(1, Math.max(0, energy));
  return {
    dir,
    t0: now + (dir === 'out' ? 0.14 + rand() * 0.1 : 0.05),
    crouch: dir === 'out' ? 0.14 : 0.05,
    dur: (dir === 'out' ? 0.85 : 1.0) + rand() * 0.35 - e * 0.15,
    apex: viewH * (0.12 + rand() * 0.14) * (1 + e * 0.6),
    spin: (rand() - 0.5) * (dir === 'out' ? 36 : 24),
    from,
  };
}

const easeInOut = (u: number) => (u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2);

/** Flight progress 0..1 (0 during the crouch). */
export function leapU(l: Leap, now: number): number {
  return Math.min(1, Math.max(0, (now - l.t0) / l.dur));
}

/** Where ORI is during the leap, towards a destination that may itself be moving (the window). */
export function leapPose(l: Leap, to: Pose, now: number): Pose & { rot: number; sx: number; sy: number } {
  const u = leapU(l, now);
  const crouching = now < l.t0;
  // the body: squash while crouching, stretch on take-off, squash again on landing
  let sx = 1;
  let sy = 1;
  if (crouching) {
    const c = 1 - Math.max(0, l.t0 - now) / l.crouch;
    sy = 1 - 0.1 * c;
    sx = 1 + 0.06 * c;
  } else if (u < 0.18) {
    const k = Math.sin((u / 0.18) * Math.PI);
    sy = 1 + 0.08 * k;
    sx = 1 - 0.05 * k;
  } else if (u > 0.9) {
    const k = Math.sin(((u - 0.9) / 0.1) * Math.PI);
    sy = 1 - 0.09 * k;
    sx = 1 + 0.06 * k;
  }
  const m = easeInOut(u);
  // out: shrink early (it is leaving the big window); in: grow late (it arrives at the window)
  const g = l.dir === 'out' ? 1 - (1 - Math.min(1, u * 1.35)) ** 3 : Math.max(0, (u - 0.35) / 0.65) ** 2;
  return {
    x: l.from.x + (to.x - l.from.x) * m,
    y: l.from.y + (to.y - l.from.y) * u - l.apex * 4 * u * (1 - u),
    h: l.from.h + (to.h - l.from.h) * g,
    rot: l.spin * Math.sin(Math.PI * u),
    sx,
    sy,
  };
}
