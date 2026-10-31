// The figure behind every move demo. A demo is a few key poses; each pose
// places the hips, neck, hands and feet, and knees and elbows are solved from
// those (two-bone IK) so limbs keep their length. MotionDemo turns the poses
// into SVG <animate> tweens, which run the same in Safari and Chrome and need
// no per-frame JavaScript.
//
// Coordinates are in the demo's 200 × 140 viewBox; the ground is at y = 118.
// Side views face right. "L" is the far (or screen-left) limb, "R" the near one.

export type Pt = [number, number];
export type JointName = 'H' | 'N' | 'M' | 'S' | 'P' | 'KL' | 'FL' | 'KR' | 'FR' | 'EL' | 'WL' | 'ER' | 'WR';

/** What a pose sets. Head, spine midpoint, knees and elbows are worked out unless given. */
export interface Spec {
  N: Pt;
  P: Pt;
  FL: Pt;
  FR: Pt;
  WL: Pt;
  WR: Pt;
  H?: Pt;
  M?: Pt;
  KL?: Pt;
  KR?: Pt;
  EL?: Pt;
  ER?: Pt;
}

export type Full = Record<JointName, Pt>;

/** Which way each knee and elbow bends: 1 or -1, relative to the limb's direction. */
export interface Bend {
  KL: number;
  KR: number;
  EL: number;
  ER: number;
}

export type Prop =
  | { kind: 'wall'; x: number; y1?: number }
  | { kind: 'bar'; y: number; x1: number; x2: number }
  | { kind: 'box'; x: number; y: number; w: number; h: number }
  /** A line from a joint to another joint or a fixed point: a band or a rowing chain. */
  | { kind: 'band'; a: JointName; b: JointName | Pt }
  /** A circle that spins: wheels, rollers, flywheels. `spin` is seconds per turn. */
  | { kind: 'wheel'; cx: number; cy: number; r: number; spin: number; accent?: boolean }
  /** A fixed outline, such as a bike frame. */
  | { kind: 'frame'; d: string };

export interface Demo {
  view: 'side' | 'front';
  /** Seconds per loop. */
  dur: number;
  poses: Spec[];
  /** keyTimes for each pose and the return to the first (length = poses + 1). */
  times?: number[];
  /** Constant speed between poses (for circles and pedalling). */
  linear?: boolean;
  /** Joints drawn as glowing dots, with a trail. */
  accent?: JointName[];
  trail?: boolean;
  /** A glow on the floor that follows the hips and fades as the feet leave the ground. */
  shadow?: boolean;
  /** 'scroll' slides the ground past for moves that travel; `scroll` is px per loop. */
  ground?: 'line' | 'scroll' | 'none';
  scroll?: number;
  props?: Prop[];
  bend?: Partial<Bend>;
  /** A demo drawn its own way instead of with the figure. */
  custom?: 'breathe';
}

export const GROUND = 118;
const THIGH = 21;
const SHIN = 21;
const UPPER_ARM = 17;
const FOREARM = 17;

const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
const add = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]];
const mul = (a: Pt, k: number): Pt => [a[0] * k, a[1] * k];
export const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const unit = (a: Pt): Pt => {
  const d = Math.hypot(a[0], a[1]) || 1;
  return [a[0] / d, a[1] / d];
};

/** Middle joint of a two-bone limb from its root to its end, bending to `side`. */
export function ik(root: Pt, end: Pt, l1: number, l2: number, side: number): Pt {
  const v = sub(end, root);
  const d = Math.hypot(v[0], v[1]) || 0.001;
  const u: Pt = [v[0] / d, v[1] / d];
  if (d >= l1 + l2) return add(root, mul(u, l1));
  const along = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, l1 * l1 - along * along));
  return add(add(root, mul(u, along)), mul([-u[1], u[0]], h * side));
}

export const SIDE_BEND: Bend = { KL: -1, KR: -1, EL: 1, ER: 1 };
export const FRONT_BEND: Bend = { KL: 1, KR: -1, EL: 1, ER: -1 };

/** Every joint of a pose. */
export function resolve(s: Spec, bend: Bend): Full {
  const S = lerp(s.N, s.P, 0.1);
  return {
    H: s.H ?? add(s.N, mul(unit(sub(s.N, s.P)), 13)),
    N: s.N,
    M: s.M ?? lerp(s.N, s.P, 0.5),
    S,
    P: s.P,
    FL: s.FL,
    FR: s.FR,
    WL: s.WL,
    WR: s.WR,
    KL: s.KL ?? ik(s.P, s.FL, THIGH, SHIN, bend.KL),
    KR: s.KR ?? ik(s.P, s.FR, THIGH, SHIN, bend.KR),
    EL: s.EL ?? ik(S, s.WL, UPPER_ARM, FOREARM, bend.EL),
    ER: s.ER ?? ik(S, s.WR, UPPER_ARM, FOREARM, bend.ER),
  };
}

const f = (n: number) => Math.round(n * 10) / 10;
export const pt = (p: Pt) => `${f(p[0])} ${f(p[1])}`;

/** Limb and spine outlines for a resolved pose. */
export const paths = {
  legL: (j: Full) => `M${pt(j.P)}L${pt(j.KL)}L${pt(j.FL)}`,
  legR: (j: Full) => `M${pt(j.P)}L${pt(j.KR)}L${pt(j.FR)}`,
  armL: (j: Full) => `M${pt(j.S)}L${pt(j.EL)}L${pt(j.WL)}`,
  armR: (j: Full) => `M${pt(j.S)}L${pt(j.ER)}L${pt(j.WR)}`,
  // A curve through the spine midpoint, so cat-cow can round and arch.
  spine: (j: Full) => `M${pt(j.N)}Q${pt(sub(mul(j.M, 2), lerp(j.N, j.P, 0.5)))} ${pt(j.P)}`,
};

// ---------- Pose helpers for writing demos ----------

/** Move every point of a pose. */
export function shift(s: Spec, dx: number, dy: number): Spec {
  const out = {} as Spec;
  for (const [k, v] of Object.entries(s) as [keyof Spec, Pt][]) out[k] = [v[0] + dx, v[1] + dy];
  return out;
}

/** Mirror a front-view pose left to right (swapping left and right limbs). */
export function mirror(s: Spec): Spec {
  const m = (p?: Pt): Pt | undefined => (p ? [200 - p[0], p[1]] : undefined);
  const out: Spec = {
    N: m(s.N)!,
    P: m(s.P)!,
    FL: m(s.FR)!,
    FR: m(s.FL)!,
    WL: m(s.WR)!,
    WR: m(s.WL)!,
  };
  if (s.H) out.H = m(s.H);
  if (s.M) out.M = m(s.M);
  if (s.KR) out.KL = m(s.KR);
  if (s.KL) out.KR = m(s.KL);
  if (s.ER) out.EL = m(s.ER);
  if (s.EL) out.ER = m(s.EL);
  return out;
}

/** Points on a circle, for orbits: n steps starting at angle a0 (radians). */
export function orbit(c: Pt, r: number, n: number, a0 = 0, dir = 1): Pt[] {
  return Array.from({ length: n }, (_, i) => {
    const a = a0 + dir * (i / n) * Math.PI * 2;
    return [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r] as Pt;
  });
}
