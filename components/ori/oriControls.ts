/**
 * ORI face controls: the character sheet's expression parameters -> morph target weights in
 * /ori/ORI.glb. Port of 3d/ori/export/ori-controls.js (source of truth: 3d/ori/scripts/ori_face.py
 * in the haf-zone-site workspace); keep them in step.
 */

export type Weights = Record<string, number>;

type PerEye = number | [number, number];
type Mouth = { w?: number; c?: number; d?: number; o?: number; type?: 'o' };
type Expression = {
  eh?: number; lt?: PerEye; lb?: PerEye; tl?: PerEye; bw?: PerEye; bt?: PerEye; sc?: PerEye;
  look?: [number, number]; pup?: number; m?: Mouth; tilt?: number; spark?: number;
};

const LID_TOP_STEPS = [0, 0.25, 0.5, 0.75, 1];
const LID_BOTTOM_STEPS = [0, 0.25, 0.5];
const LID_TOP_CLOSED = 1.3;
const TILT_MAX = 0.4;
const BROW_RAISE_MAX = 56;
const BROW_TILT_MAX = 0.3;
const EYE_SCALE_MAX = 1.12;
const EYE_HEIGHT_MAX = 1.1;
const PUPIL_SMALL = 0.7;
// the sheet's per-eye arrays are [viewer left = ORI's right, viewer right = ORI's left]
const EYE_INDEX = { R: 0, L: 1 } as const;

export const EXPRESSIONS = {
  neutral: { lt: 0.08, m: { w: 34, c: 8 } },
  half: { lt: 0.5, m: { w: 34, c: 8 } },
  blink: { lt: 1, m: { w: 34, c: 8 } },
  curious: { sc: [1, 1.12], lt: [0.16, 0], tl: [0.08, 0], bw: [4, 46], bt: [0, -0.12], m: { w: 22, c: 3, d: 8 }, look: [0.5, -0.5], tilt: 0.16 },
  happy: { lb: 0.45, bw: [20, 20], m: { w: 64, c: 36 } },
  surprised: { sc: [1.08, 1.08], eh: 1.06, bw: [56, 56], m: { type: 'o', w: 24, o: 34 }, pup: 0.7 },
  thoughtful: { lt: 0.36, tl: [-0.05, -0.05], bw: [0, 30], bt: [0, -0.12], m: { w: 26, c: -4, d: 10 }, look: [-0.7, -0.8], tilt: -0.1 },
  focused: { lt: 0.3, lb: 0.14, tl: [0.12, -0.12], bw: [-6, -6], bt: [0.14, -0.14], m: { w: 24, c: 0 }, pup: 0.9 },
  mischievous: { lt: 0.32, lb: 0.22, tl: [0.4, 0.4], bw: [-6, -6], bt: [0.3, 0.3], m: { w: 52, c: 20, d: -22 }, look: [0.8, 0.1], tilt: -0.12 },
  excited: { eh: 1.05, lb: 0.3, bw: [46, 46], m: { w: 58, c: 50 }, look: [0, -0.2], spark: 1 },
} satisfies Record<string, Expression>;

export type ExpressionName = keyof typeof EXPRESSIONS;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const pick = (x: PerEye, i: number) => (Array.isArray(x) ? x[i] : x);
const lidTopEdge = (lt: number) => (lt <= 0.75 ? -1 + 2 * lt : 0.5 + ((lt - 0.75) / 0.25) * (LID_TOP_CLOSED - 0.5));

/** Top lid 0 (open) .. 1 (shut) -> the four piecewise Lid_Top_<side>_n keys. */
export function lidTopWeights(side: 'L' | 'R', lt: number): Weights {
  const target = lt >= 0.999 ? LID_TOP_CLOSED : -1 + 2 * lt;
  const out: Weights = {};
  for (let k = 1; k < LID_TOP_STEPS.length; k++) {
    const a = lidTopEdge(LID_TOP_STEPS[k - 1]);
    const b = lidTopEdge(LID_TOP_STEPS[k]);
    out[`Lid_Top_${side}_${k}`] = clamp((target - a) / (b - a), 0, 1);
  }
  return out;
}

function lidBottomWeights(side: 'L' | 'R', lb: number): Weights {
  const out: Weights = {};
  for (let k = 1; k < LID_BOTTOM_STEPS.length; k++) {
    const a = LID_BOTTOM_STEPS[k - 1];
    const b = LID_BOTTOM_STEPS[k];
    out[`Lid_Bottom_${side}_${k}`] = clamp((lb - a) / (b - a), 0, 1);
  }
  return out;
}

/** Pupil travel for both eyes; x > 0 = ORI's left (viewer's right), y > 0 = down, both in [-1, 1]. */
export function lookWeights(x: number, y: number): Weights {
  const out: Weights = {};
  for (const s of ['L', 'R']) {
    out[`Look_Left_${s}`] = Math.max(0, x);
    out[`Look_Right_${s}`] = Math.max(0, -x);
    out[`Look_Down_${s}`] = Math.max(0, y);
    out[`Look_Up_${s}`] = Math.max(0, -y);
  }
  return out;
}

/** Sheet expression -> weights for every face morph target; `look` overrides the expression's gaze. */
export function faceWeights(name: ExpressionName = 'neutral', look?: [number, number]): Weights {
  const e: Required<Omit<Expression, 'tilt'>> = {
    eh: 1, lt: 0, lb: 0, tl: [0, 0], bw: [0, 0], bt: [0, 0], sc: [1, 1], look: [0, 0], pup: 1, m: {}, spark: 0,
    ...(EXPRESSIONS[name] as Expression),
  };
  const lk = look ?? e.look;
  const out = lookWeights(lk[0], lk[1]);
  for (const s of ['R', 'L'] as const) {
    const i = EYE_INDEX[s];
    out[`Eye_Scale_${s}`] = (pick(e.sc, i) - 1) / (EYE_SCALE_MAX - 1);
    out[`Eye_Height_${s}`] = (e.eh - 1) / (EYE_HEIGHT_MAX - 1);
    out[`Pupil_Small_${s}`] = (1 - e.pup) / (1 - PUPIL_SMALL);
    out[`Eye_Spark_${s}`] = e.spark ? 1 : 0;
    const tl = pick(e.tl, i);
    const lt = pick(e.lt, i);
    out[`Lid_Tilt_${s}`] = Math.tan(tl) / Math.tan(TILT_MAX);
    // the sheet rotates its lid rectangle about the eye centre
    const edge = (-1 + 2 * lt) / Math.cos(tl);
    Object.assign(out, lidTopWeights(s, lt >= 0.999 ? 1 : clamp((edge + 1) / 2, 0, 1)));
    Object.assign(out, lidBottomWeights(s, pick(e.lb, i)));
    out[`Brow_Raise_${s}`] = pick(e.bw, i) / BROW_RAISE_MAX;
    out[`Brow_Tilt_${s}`] = pick(e.bt, i) / BROW_TILT_MAX;
  }
  const m = { w: 34, c: 8, d: 0, ...e.m };
  if (m.type === 'o') {
    Object.assign(out, { Mouth_O: 1, Mouth_Wide: 0, Mouth_Narrow: 0, Mouth_Smile: 0, Mouth_Frown: 0, Mouth_Skew: 0 });
  } else {
    Object.assign(out, {
      Mouth_O: 0,
      Mouth_Wide: Math.max(0, (m.w - 34) / 30),
      Mouth_Narrow: Math.max(0, (34 - m.w) / 12),
      Mouth_Smile: Math.max(0, (m.c - 8) / 42),
      Mouth_Frown: Math.max(0, (8 - m.c) / 12),
      Mouth_Skew: m.d / 22,
    });
  }
  return out;
}
