import { GROUND as G, mirror, orbit, shift, type Demo, type Pt, type Spec } from './figure';

// Every move demo, as key poses (see figure.ts). Side views face right.
// Holds breathe: two close poses on a slow loop.

// ---------- Base poses ----------

const SIDE: Spec = { N: [100, 42], P: [100, 76], FL: [98, G], FR: [102, G], WL: [98, 74], WR: [102, 74] };
const FRONT: Spec = { N: [100, 42], P: [100, 76], FL: [91, G], FR: [109, G], WL: [86, 74], WR: [114, 74] };
const s = (base: Spec, over: Partial<Spec>): Spec => ({ ...base, ...over });

/** Two poses, the second held: stand, go, hold, come back. */
const outAndBack = [0, 0.42, 0.58, 1];
/** Hold poses breathe slowly. */
const BREATH = 5;

// ---------- Travel and pulse raisers ----------

const marchPoses = (lift: number): Spec[] => [
  s(SIDE, { FR: [112, G - 22 - lift], WR: [90, 70], WL: [112, 64] }),
  SIDE,
  s(SIDE, { FL: [112, G - 22 - lift], WL: [90, 70], WR: [112, 64] }),
  SIDE,
];

const walkPoses: Spec[] = [
  s(SIDE, { P: [100, 77], FR: [117, G], FL: [85, G], WR: [92, 72], WL: [111, 70] }),
  s(SIDE, { P: [100, 75], N: [100, 41], FR: [100, G], FL: [103, 108] }),
  s(SIDE, { P: [100, 77], FL: [117, G], FR: [85, G], WL: [92, 72], WR: [111, 70] }),
  s(SIDE, { P: [100, 75], N: [100, 41], FL: [100, G], FR: [103, 108] }),
];

const RUN: Spec = { ...SIDE, N: [105, 43], P: [100, 77] };
const jogPoses: Spec[] = [
  s(RUN, { P: [100, 74], N: [105, 40], FR: [119, 110], FL: [81, 103], WR: [92, 64], WL: [116, 56] }),
  s(RUN, { FR: [101, G - 1], FL: [91, 93], WR: [100, 66], WL: [108, 62] }),
  s(RUN, { P: [100, 74], N: [105, 40], FL: [119, 110], FR: [81, 103], WL: [92, 64], WR: [116, 56] }),
  s(RUN, { FL: [101, G - 1], FR: [91, 93], WL: [100, 66], WR: [108, 62] }),
];

// ---------- Legs ----------

const STAND_L: Spec = s(SIDE, { FL: [100, G], FR: [100, G] });

const legSwing: Spec[] = [
  s(STAND_L, { N: [99, 42], FR: [127, 107], WR: [88, 70], WL: [78, 58] }),
  s(STAND_L, { N: [103, 43], FR: [74, 108], WR: [114, 64], WL: [78, 58] }),
];

const kick: Spec[] = [
  s(STAND_L, { N: [103, 44], FR: [128, 74], WR: [132, 70], WL: [86, 68] }),
  s(STAND_L, { N: [100, 42], FR: [92, 115], WR: [104, 72], WL: [94, 72] }),
];

const FRONT_L: Spec = s(FRONT, { FL: [94, G], WL: [92, 60], WR: [108, 60] });
const legSwingSide: Spec[] = [
  s(FRONT_L, { N: [97, 42], FR: [129, 107] }),
  s(FRONT_L, { N: [103, 42], FR: [80, 113] }),
];

const SQUAT: Spec = s(SIDE, { P: [86, 98], N: [103, 63], FL: [99, G], FR: [104, G], WR: [133, 66], WL: [131, 68] });

const lungeBottom: Spec = {
  N: [102, 61],
  P: [102, 96],
  FR: [126, G],
  FL: [78, G - 1],
  WR: [104, 92],
  WL: [100, 92],
};

const SIDE_WIDE: Spec = s(FRONT, { FL: [72, G], FR: [128, G], WL: [96, 70], WR: [104, 70] });
const sideLungeR: Spec = s(SIDE_WIDE, { P: [116, 94], N: [112, 60], WL: [112, 84], WR: [118, 84] });

const skateR: Spec = { N: [114, 55], P: [120, 89], FR: [126, G], FL: [104, 111], WL: [138, 80], WR: [146, 56] };
const skateMid: Spec = { N: [100, 34], P: [100, 68], FL: [92, 104], FR: [108, 104], WL: [84, 60], WR: [116, 60] };

const HINGE: Spec = s(SIDE, { P: [88, 78], N: [122, 57], FL: [98, G], FR: [101, G], WR: [124, 83], WL: [122, 85] });
const FOLD: Spec = s(SIDE, { P: [95, 76], N: [111, 99], H: [114, 112], WR: [108, G - 2], WL: [106, G - 2] });

const QUAD: Spec = {
  N: [124, 90],
  P: [90, 92],
  FL: [66, G],
  FR: [68, G],
  WL: [128, G],
  WR: [130, G],
};

const SUP: Spec = { N: [66, 114], P: [104, 113], FL: [146, 116], FR: [148, 116], WL: [96, G - 1], WR: [98, G - 1] };
const SUP_BEND = { EL: -1, ER: -1 };
const BRIDGE_DOWN: Spec = s(SUP, { FR: [134, G], FL: [131, G] });
const BRIDGE_UP: Spec = s(BRIDGE_DOWN, { P: [104, 87] });

const PLANK: Spec = { N: [130, 84], P: [94, 95], FL: [57, 116], FR: [59, 116], WL: [130, G], WR: [132, G] };
const PLANK_DOWN: Spec = s(PLANK, { N: [128, 104], P: [93, 108] });
const PIKE: Spec = { N: [126, 92], P: [100, 58], FL: [72, G], FR: [74, G], WL: [132, G], WR: [134, G] };

const SEAT: Spec = { N: [97, 80], P: [92, 114], FL: [136, 116], FR: [138, 116], WL: [80, 114], WR: [82, 114] };

// ---------- Arms ----------

const ARMS_WIDE: Spec = s(FRONT, { WL: [62, 52], WR: [138, 52] });
const ARMS_FWD: Spec = s(FRONT, { WL: [95, 58], WR: [105, 58] });
const Y: Spec = s(FRONT, { WL: [72, 12], WR: [128, 12] });
const T: Spec = s(FRONT, { WL: [62, 46], WR: [138, 46] });
const W: Spec = s(FRONT, { WL: [74, 34], WR: [126, 34], EL: [80, 62], ER: [120, 62] });

const armCirclePoses = (cl: Pt, cr: Pt, r: number, base: Spec): Spec[] => {
  const l = orbit(cl, r, 8, -Math.PI / 2, -1);
  const rr = orbit(cr, r, 8, -Math.PI / 2, 1);
  return l.map((p, i) => s(base, { WL: p, WR: rr[i] }));
};

// ---------- Cycling ----------

const CRANK: Pt = [100, 101];
const BIKE_FRAME =
  'M66 104L100 101L92 66L66 104M100 101L129 70L138 104M92 66L129 70M127 70L131 63M88 64L97 64';
const pedal = (n: number): Spec[] =>
  orbit(CRANK, 10, n, 0, 1).map((p, i) => {
    const opposite = orbit(CRANK, 10, n, Math.PI, 1)[i];
    return { N: [121, 47], P: [92, 61], FR: p, FL: opposite, WR: [130, 68], WL: [128, 69] };
  });

const ride = (dur: number): Demo => ({
  view: 'side',
  dur,
  linear: true,
  poses: pedal(12),
  accent: ['FR', 'FL'],
  shadow: false,
  props: [
    { kind: 'wheel', cx: 66, cy: 104, r: 14, spin: dur * 1.4 },
    { kind: 'wheel', cx: 138, cy: 104, r: 14, spin: dur * 1.4 },
    { kind: 'frame', d: BIKE_FRAME },
  ],
});

// ---------- The demos ----------

export const DEMOS = {
  march: { view: 'side', dur: 1.3, poses: marchPoses(0), accent: ['FL', 'FR'], shadow: true },
  highknees: { view: 'side', dur: 0.7, poses: marchPoses(8), accent: ['FL', 'FR'], shadow: true },
  balancemarch: { view: 'side', dur: 2.4, poses: marchPoses(4), accent: ['FL', 'FR'], shadow: true },
  walk: { view: 'side', dur: 1.5, poses: walkPoses, accent: ['FL', 'FR'], ground: 'scroll', scroll: 64, shadow: true },
  jog: { view: 'side', dur: 0.8, poses: jogPoses, accent: ['FL', 'FR'], ground: 'scroll', scroll: 76, shadow: true },
  sprint: { view: 'side', dur: 0.55, poses: jogPoses, accent: ['FL', 'FR'], ground: 'scroll', scroll: 96, shadow: true },

  legswing: { view: 'side', dur: 1.6, poses: legSwing, accent: ['FR'], shadow: true, props: [{ kind: 'wall', x: 74 }] },
  kick: { view: 'side', dur: 1.3, poses: kick, accent: ['FR', 'WR'], shadow: true },
  legswingside: { view: 'front', dur: 1.6, poses: legSwingSide, accent: ['FR'], shadow: true },

  squat: { view: 'side', dur: 2.4, poses: [SIDE, SQUAT, SQUAT], times: outAndBack, accent: ['P'], shadow: true },
  squatreach: {
    view: 'side',
    dur: 2.6,
    poses: [SIDE, SQUAT, s(SQUAT, { WR: [114, 18], N: [100, 62] })],
    times: [0, 0.35, 0.65, 1],
    accent: ['WR'],
    shadow: true,
  },
  jump: {
    view: 'side',
    dur: 1.5,
    poses: [
      s(SIDE, { WR: [94, 74], WL: [92, 74] }),
      s(SQUAT, { WR: [82, 84], WL: [80, 86] }),
      s(shift(SIDE, 0, -24), { WR: [108, 6], WL: [106, 8] }),
      s(SQUAT, { WR: [120, 74], WL: [118, 76] }),
    ],
    times: [0, 0.28, 0.5, 0.72, 1],
    accent: ['FL', 'FR'],
    shadow: true,
  },
  hop: {
    view: 'side',
    dur: 0.5,
    poses: [s(SIDE, { WR: [108, 66], WL: [106, 67] }), s(shift(SIDE, 0, -10), { WR: [108, 56], WL: [106, 57] })],
    accent: ['FL', 'FR'],
    shadow: true,
  },
  calfraise: {
    view: 'side',
    dur: 1.8,
    poses: [SIDE, s(shift(SIDE, 0, -8), { FL: [98, G], FR: [102, G] })],
    times: outAndBack,
    accent: ['FR'],
    shadow: true,
  },
  kneedrive: {
    view: 'side',
    dur: 1.8,
    poses: [
      s(SIDE, { FR: [116, G], FL: [86, G], P: [100, 78] }),
      s(SIDE, { FR: [116, G], FL: [86, G], P: [107, 85], N: [108, 50], WR: [112, 82], WL: [110, 83] }),
    ],
    accent: ['KR'],
    shadow: true,
  },

  lunge: { view: 'side', dur: 2.6, poses: [SIDE, lungeBottom, lungeBottom], times: outAndBack, accent: ['FR'], shadow: true },
  lungereach: {
    view: 'side',
    dur: 2.8,
    poses: [SIDE, s(lungeBottom, { WR: [106, 14], WL: [104, 16] }), s(lungeBottom, { WR: [106, 14], WL: [104, 16] })],
    times: outAndBack,
    accent: ['WR'],
    shadow: true,
  },
  lungehold: {
    view: 'side',
    dur: BREATH,
    poses: [
      s(lungeBottom, { KL: [96, 116], FL: [72, 116], P: [102, 94], WR: [122, 90], WL: [120, 91] }),
      s(lungeBottom, { KL: [96, 116], FL: [72, 116], P: [106, 98], N: [107, 63], WR: [124, 92], WL: [122, 93] }),
    ],
    accent: ['P'],
    shadow: true,
  },
  lungequad: {
    view: 'side',
    dur: BREATH,
    poses: [
      s(lungeBottom, { KL: [96, 116], FL: [82, 92], WL: [82, 92], P: [102, 94] }),
      s(lungeBottom, { KL: [96, 116], FL: [84, 88], WL: [84, 88], P: [106, 97], N: [107, 62] }),
    ],
    accent: ['FL'],
    shadow: true,
  },
  step: {
    view: 'side',
    dur: 2.8,
    poses: [
      shift(SIDE, -6, 0),
      s(shift(SIDE, -6, 0), { FR: [122, 96], WR: [106, 70] }),
      s(shift(SIDE, 24, -22), { FL: [122, 96], FR: [126, 96] }),
      s(shift(SIDE, -6, 0), { FR: [122, 96], WR: [106, 70] }),
    ],
    times: [0, 0.25, 0.5, 0.75, 1],
    accent: ['FR'],
    shadow: true,
    props: [{ kind: 'box', x: 112, y: 96, w: 40, h: 22 }],
  },

  sidelunge: {
    view: 'front',
    dur: 3,
    poses: [s(SIDE_WIDE, { P: [100, 78] }), sideLungeR, s(SIDE_WIDE, { P: [100, 78] }), mirror(sideLungeR)],
    accent: ['P'],
    shadow: true,
  },
  skate: {
    view: 'front',
    dur: 1.5,
    poses: [skateR, skateMid, mirror(skateR), mirror(skateMid)],
    accent: ['FL', 'FR'],
    shadow: true,
  },

  hinge: { view: 'side', dur: 2.6, poses: [SIDE, HINGE, HINGE], times: outAndBack, accent: ['P'], shadow: true },
  hingereach: {
    view: 'side',
    dur: 2.8,
    poses: [SIDE, FOLD, FOLD],
    times: outAndBack,
    accent: ['WR'],
    shadow: true,
  },
  // Heel up on a low step, leg straight, hinging forward over it.
  hingehold: {
    view: 'side',
    dur: BREATH,
    poses: [
      { N: [124, 52], P: [94, 74], FL: [94, G], FR: [134, 100], WL: [128, 80], WR: [130, 78] },
      { N: [127, 57], P: [93, 75], FL: [94, G], FR: [134, 100], WL: [132, 84], WR: [134, 82] },
    ],
    accent: ['WR'],
    shadow: true,
    props: [{ kind: 'box', x: 122, y: 102, w: 30, h: 16 }],
  },
  foldhold: {
    view: 'side',
    dur: BREATH,
    poses: [FOLD, s(FOLD, { N: [110, 103], H: [111, 116], WR: [112, G], WL: [110, G] })],
    accent: ['WR'],
    shadow: true,
  },
  rdl: {
    view: 'side',
    dur: 3,
    poses: [
      STAND_L,
      s(STAND_L, { N: [133, 63], FR: [62, 70], WR: [131, 93], WL: [129, 95] }),
      s(STAND_L, { N: [133, 63], FR: [62, 70], WR: [131, 93], WL: [129, 95] }),
    ],
    times: outAndBack,
    accent: ['FR'],
    shadow: true,
  },
  arch: {
    view: 'side',
    dur: BREATH,
    poses: [
      s(SIDE, { WR: [92, 78], WL: [90, 78] }),
      s(SIDE, { N: [92, 44], P: [102, 78], H: [85, 33], WR: [92, 80], WL: [90, 80] }),
    ],
    accent: ['H'],
    shadow: true,
  },
  wallcalf: {
    view: 'side',
    dur: BREATH,
    poses: [
      { N: [130, 50], P: [108, 78], FL: [82, G], FR: [124, G], WL: [146, 52], WR: [148, 50] },
      { N: [134, 53], P: [112, 81], FL: [82, G], FR: [124, G], WL: [146, 54], WR: [148, 52] },
    ],
    accent: ['FL'],
    shadow: true,
    props: [{ kind: 'wall', x: 152 }],
  },

  // As the calf stretch, with the back knee bent to reach the lower calf.
  wallcalfbent: {
    view: 'side',
    dur: BREATH,
    poses: [
      { N: [130, 56], P: [106, 86], FL: [88, G], FR: [124, G], WL: [146, 56], WR: [148, 54] },
      { N: [132, 60], P: [107, 90], FL: [88, G], FR: [124, G], WL: [146, 58], WR: [148, 56] },
    ],
    accent: ['KL'],
    shadow: true,
    props: [{ kind: 'wall', x: 152 }],
  },

  bridge: {
    view: 'side',
    dur: 2.6,
    poses: [BRIDGE_DOWN, BRIDGE_UP, BRIDGE_UP],
    times: outAndBack,
    accent: ['P'],
    bend: SUP_BEND,
  },
  bridge1: {
    view: 'side',
    dur: 2.6,
    poses: [s(BRIDGE_DOWN, { FR: [146, 96] }), s(BRIDGE_UP, { FR: [146, 72] }), s(BRIDGE_UP, { FR: [146, 72] })],
    times: outAndBack,
    accent: ['P', 'FR'],
    bend: SUP_BEND,
  },
  bridgereach: {
    view: 'side',
    dur: 3,
    poses: [BRIDGE_DOWN, BRIDGE_UP, s(BRIDGE_UP, { WR: [40, 100] })],
    times: [0, 0.3, 0.6, 1],
    accent: ['WR'],
    bend: SUP_BEND,
  },

  pushup: { view: 'side', dur: 2.2, poses: [PLANK, PLANK_DOWN, PLANK_DOWN], times: outAndBack, accent: ['H'] },
  scap: { view: 'side', dur: 1.6, poses: [PLANK, s(PLANK, { N: [130, 90] })], accent: ['H'] },
  incline: {
    view: 'side',
    dur: 2.2,
    poses: [
      { N: [128, 62], P: [96, 82], FL: [60, G], FR: [62, G], WL: [136, 92], WR: [138, 92] },
      { N: [124, 78], P: [94, 92], FL: [60, G], FR: [62, G], WL: [136, 92], WR: [138, 92] },
      { N: [124, 78], P: [94, 92], FL: [60, G], FR: [62, G], WL: [136, 92], WR: [138, 92] },
    ],
    times: outAndBack,
    accent: ['H'],
    props: [{ kind: 'box', x: 126, y: 92, w: 32, h: 26 }],
  },
  walkout: {
    view: 'side',
    dur: 4.6,
    poses: [
      shift(SIDE, -20, 0),
      s(shift(FOLD, -20, 0), { WR: [94, G], WL: [92, G] }),
      { N: [112, 92], P: [82, 64], FL: [78, G], FR: [80, G], WL: [120, G], WR: [122, G] },
      { N: [140, 86], P: [104, 96], FL: [72, G], FR: [74, G], WL: [140, G], WR: [142, G] },
      { N: [112, 92], P: [82, 64], FL: [78, G], FR: [80, G], WL: [120, G], WR: [122, G] },
      s(shift(FOLD, -20, 0), { WR: [94, G], WL: [92, G] }),
    ],
    accent: ['WR'],
  },
  plankdog: { view: 'side', dur: 2.8, poses: [PLANK, PIKE, PIKE], times: outAndBack, accent: ['P'] },
  dog: { view: 'side', dur: BREATH, poses: [PIKE, s(PIKE, { P: [98, 55], N: [124, 95] })], accent: ['P'] },

  catcow: {
    view: 'side',
    dur: 3.4,
    poses: [s(QUAD, { M: [107, 78], H: [133, 103] }), s(QUAD, { M: [107, 100], H: [137, 79] })],
    accent: ['M'],
  },
  birddog: {
    view: 'side',
    dur: 3,
    poses: [QUAD, s(QUAD, { WR: [162, 84], FL: [44, 88] }), QUAD, s(QUAD, { WL: [162, 86], FR: [44, 86] })],
    accent: ['WR', 'FL', 'WL', 'FR'],
    trail: false,
  },
  donkey: { view: 'side', dur: 1.8, poses: [QUAD, s(QUAD, { FR: [74, 64] })], accent: ['FR'] },
  childs: {
    view: 'side',
    dur: BREATH,
    poses: [
      { N: [118, 108], P: [80, 104], KL: [100, 116], KR: [102, 116], FL: [74, G], FR: [76, G], WL: [156, 116], WR: [158, 116], H: [131, 113] },
      { N: [116, 106], P: [78, 101], KL: [100, 116], KR: [102, 116], FL: [74, G], FR: [76, G], WL: [158, 116], WR: [160, 116], H: [129, 112] },
    ],
    accent: ['WR'],
  },
  thread: {
    view: 'side',
    dur: 3.4,
    poses: [QUAD, s(QUAD, { N: [122, 98], WR: [94, 112] }), QUAD, s(QUAD, { N: [124, 86], WR: [126, 40] })],
    accent: ['WR'],
  },

  armcircle: { view: 'front', dur: 1.2, linear: true, poses: armCirclePoses([64, 48], [136, 48], 9, FRONT), accent: ['WL', 'WR'] },
  shoulderroll: {
    view: 'front',
    dur: 1.8,
    linear: true,
    poses: orbit([100, 42], 4, 8, -Math.PI / 2, 1).map((n) => s(FRONT, { N: n, WL: [86, 74 + (n[1] - 42)], WR: [114, 74 + (n[1] - 42)] })),
    accent: ['WL', 'WR'],
  },
  wrist: {
    view: 'front',
    dur: 1.4,
    linear: true,
    poses: armCirclePoses([94, 60], [106, 60], 4, FRONT),
    accent: ['WL', 'WR'],
  },
  passthrough: {
    view: 'side',
    dur: 3,
    poses: [50, 0, -45, -90, -135, -180, -230, -180, -135, -90, -45, 0].map((deg) => {
      const a = (deg * Math.PI) / 180;
      const h: Pt = [100 + Math.cos(a) * 34, 45 + Math.sin(a) * 34];
      return s(SIDE, { WR: h, WL: [h[0] - 1, h[1] + 1] });
    }),
    accent: ['WR'],
  },
  open: { view: 'front', dur: 1.8, poses: [ARMS_FWD, ARMS_WIDE], accent: ['WL', 'WR'] },
  armswing: { view: 'front', dur: 1.2, poses: [s(FRONT, { WL: [110, 58], WR: [90, 60] }), ARMS_WIDE], accent: ['WL', 'WR'] },
  bandopen: {
    view: 'front',
    dur: 1.8,
    poses: [ARMS_FWD, ARMS_WIDE],
    accent: ['WL', 'WR'],
    props: [{ kind: 'band', a: 'WL', b: 'WR' }],
  },
  chest: {
    view: 'front',
    dur: BREATH,
    poses: [s(FRONT, { WL: [64, 58], WR: [136, 58] }), s(FRONT, { WL: [59, 54], WR: [141, 54], N: [100, 41] })],
    accent: ['WL', 'WR'],
  },
  raise: {
    view: 'front',
    dur: 2,
    poses: [s(FRONT, { WL: [88, 78], WR: [112, 78] }), T],
    accent: ['WL', 'WR'],
    props: [
      { kind: 'band', a: 'FL', b: 'WL' },
      { kind: 'band', a: 'FR', b: 'WR' },
    ],
  },
  ytw: { view: 'front', dur: 3.6, poses: [Y, T, W], accent: ['WL', 'WR'] },
  wallslide: { view: 'front', dur: 2.6, poses: [W, Y], accent: ['WL', 'WR'] },
  wallw: { view: 'front', dur: BREATH, poses: [W, s(W, { WL: [72, 32], WR: [128, 32] })], accent: ['WL', 'WR'] },
  jack: {
    view: 'front',
    dur: 0.9,
    poses: [
      s(FRONT, { FL: [96, G], FR: [104, G], WL: [92, 76], WR: [108, 76] }),
      s(FRONT, { P: [100, 72], N: [100, 38], FL: [74, G], FR: [126, G], WL: [86, 6], WR: [114, 6] }),
    ],
    accent: ['WL', 'WR', 'FL', 'FR'],
    shadow: true,
  },

  twist: {
    view: 'front',
    dur: 2.4,
    poses: [s(FRONT, { N: [102, 42], WL: [116, 56], WR: [150, 54] }), s(FRONT, { N: [98, 42], WR: [84, 56], WL: [50, 54] })],
    accent: ['WL', 'WR'],
    shadow: true,
  },
  windmill: {
    view: 'front',
    dur: 3.2,
    poses: [
      s(SIDE_WIDE, { N: [114, 72], P: [100, 78], WL: [118, 112], WR: [104, 24], H: [122, 82] }),
      s(SIDE_WIDE, { WL: [62, 50], WR: [138, 50] }),
      s(SIDE_WIDE, { N: [86, 72], P: [100, 78], WR: [82, 112], WL: [96, 24], H: [78, 82] }),
      s(SIDE_WIDE, { WL: [62, 50], WR: [138, 50] }),
    ],
    accent: ['WL', 'WR'],
    shadow: true,
  },
  sidebend: {
    view: 'front',
    dur: 3.2,
    poses: [
      s(FRONT, { N: [114, 47], WL: [126, 14], WR: [118, 92] }),
      FRONT,
      s(FRONT, { N: [86, 47], WR: [74, 14], WL: [82, 92] }),
      FRONT,
    ],
    accent: ['WL', 'WR'],
    shadow: true,
  },
  sidebendhold: {
    view: 'front',
    dur: BREATH,
    poses: [s(FRONT, { N: [112, 46], WL: [124, 14], WR: [117, 90] }), s(FRONT, { N: [116, 48], WL: [130, 18], WR: [119, 94] })],
    accent: ['WL'],
    shadow: true,
  },
  neck: { view: 'front', dur: 3.2, poses: [s(FRONT, { H: [108, 31] }), s(FRONT, { H: [100, 28] }), s(FRONT, { H: [92, 31] }), s(FRONT, { H: [100, 28] })], accent: ['H'] },
  chintuck: { view: 'side', dur: 2.4, poses: [s(SIDE, { H: [106, 29] }), s(SIDE, { H: [99, 29] })], accent: ['H'] },
  armcross: {
    view: 'front',
    dur: BREATH,
    poses: [s(FRONT, { WR: [76, 54], WL: [98, 58] }), s(FRONT, { WR: [72, 53], WL: [96, 57] })],
    accent: ['WR'],
    shadow: true,
  },

  hipcircle: {
    view: 'front',
    dur: 2.2,
    linear: true,
    poses: orbit([100, 75], 6, 8, 0, 1).map((p) => ({
      N: [100 - (p[0] - 100) * 0.3, 42],
      P: p,
      FL: [86, G],
      FR: [114, G],
      WL: [p[0] - 13, p[1]],
      WR: [p[0] + 13, p[1]],
    })),
    accent: ['P'],
    shadow: true,
  },
  kneecircle: {
    view: 'front',
    dur: 2.2,
    linear: true,
    poses: orbit([0, 0], 5, 8, 0, 1).map(([dx, dy]) => ({
      N: [100 + dx * 0.5, 56],
      P: [100 + dx * 0.6, 86],
      KL: [93 + dx, 100 + dy],
      KR: [107 + dx, 100 + dy],
      FL: [94, G],
      FR: [106, G],
      WL: [93 + dx, 98 + dy],
      WR: [107 + dx, 98 + dy],
    })),
    accent: ['KL', 'KR'],
    shadow: true,
  },
  gate: {
    view: 'front',
    dur: 2.6,
    poses: [
      s(FRONT_L, { WL: [86, 74], WR: [114, 74] }),
      s(FRONT_L, { KR: [106, 64], FR: [108, 90], WL: [86, 74], WR: [114, 74] }),
      s(FRONT_L, { KR: [130, 70], FR: [124, 94], WL: [86, 74], WR: [114, 74] }),
    ],
    accent: ['KR'],
    shadow: true,
  },
  ankle: {
    view: 'front',
    dur: 2,
    linear: true,
    poses: orbit([116, 106], 5, 8, 0, 1).map((p) => s(FRONT_L, { KR: [110, 92], FR: p, WL: [86, 74], WR: [114, 74] })),
    accent: ['FR'],
    shadow: true,
  },

  balance: {
    view: 'side',
    dur: 3.6,
    poses: [
      s(STAND_L, { FR: [112, 96], WR: [126, 62], WL: [76, 66] }),
      s(STAND_L, { N: [102, 42], P: [100.5, 76], FR: [113, 97], WR: [124, 66], WL: [78, 62] }),
    ],
    accent: ['FR'],
    shadow: true,
  },
  kneehug: {
    view: 'side',
    dur: 2.6,
    poses: [STAND_L, s(STAND_L, { FR: [108, 88], WR: [116, 82], WL: [114, 83] }), s(STAND_L, { FR: [108, 88], WR: [116, 82], WL: [114, 83] })],
    times: outAndBack,
    accent: ['FR'],
    shadow: true,
  },
  quadpull: {
    view: 'side',
    dur: 2.6,
    poses: [STAND_L, s(STAND_L, { FR: [88, 84], WR: [88, 84], WL: [112, 60] }), s(STAND_L, { FR: [88, 84], WR: [88, 84], WL: [112, 60] })],
    times: outAndBack,
    accent: ['FR'],
    shadow: true,
  },
  quadhold: {
    view: 'side',
    dur: BREATH,
    poses: [s(STAND_L, { FR: [88, 84], WR: [88, 84], WL: [112, 60] }), s(STAND_L, { FR: [86, 81], WR: [86, 81], WL: [113, 59] })],
    accent: ['FR'],
    shadow: true,
  },
  fig4: {
    view: 'side',
    dur: BREATH,
    poses: [
      { N: [104, 58], P: [90, 90], FL: [100, G], FR: [106, 93], KR: [114, 84], WL: [124, 70], WR: [126, 68] },
      { N: [106, 62], P: [88, 93], FL: [100, G], FR: [106, 95], KR: [114, 87], WL: [126, 74], WR: [128, 72] },
    ],
    accent: ['P'],
    shadow: true,
  },

  kneeschest: {
    view: 'side',
    dur: BREATH,
    poses: [s(SUP, { FR: [110, 86], FL: [112, 87], WR: [100, 92], WL: [102, 93] }), s(SUP, { FR: [106, 82], FL: [108, 83], WR: [97, 89], WL: [99, 90] })],
    accent: ['FR'],
    bend: SUP_BEND,
  },
  legup: {
    view: 'side',
    dur: BREATH,
    poses: [s(SUP, { FR: [106, 72], WR: [104, 86], WL: [102, 87] }), s(SUP, { FR: [98, 72], WR: [100, 86], WL: [98, 87] })],
    accent: ['FR'],
    bend: SUP_BEND,
  },
  legswall: {
    view: 'side',
    dur: BREATH,
    poses: [s(SUP, { FR: [108, 72], FL: [110, 73], WR: [80, 104], WL: [52, 104] }), s(SUP, { FR: [108, 71], FL: [110, 72], WR: [82, 102], WL: [50, 102] })],
    accent: ['FR'],
    bend: SUP_BEND,
    props: [{ kind: 'wall', x: 114, y1: 64 }],
  },
  deadbug: {
    view: 'side',
    dur: 3,
    poses: [
      s(SUP, { KR: [104, 92], FR: [124, 92], KL: [106, 93], FL: [126, 93], WR: [66, 80], WL: [68, 81] }),
      s(SUP, { KR: [104, 92], FR: [124, 92], KL: [124, 106], FL: [148, 106], WR: [66, 80], WL: [36, 108] }),
      s(SUP, { KR: [104, 92], FR: [124, 92], KL: [106, 93], FL: [126, 93], WR: [66, 80], WL: [68, 81] }),
      s(SUP, { KR: [124, 106], FR: [148, 106], KL: [106, 93], FL: [126, 93], WR: [36, 108], WL: [68, 81] }),
    ],
    accent: ['WR', 'WL', 'FR', 'FL'],
    trail: false,
    bend: SUP_BEND,
  },
  openbook: {
    view: 'side',
    dur: 3.4,
    poses: [
      s(SUP, { FR: [130, G], FL: [128, G], WL: [100, 114], WR: [100, 112] }),
      s(SUP, { FR: [130, G], FL: [128, G], WL: [100, 114], WR: [74, 76] }),
      s(SUP, { FR: [130, G], FL: [128, G], WL: [100, 114], WR: [38, 112] }),
      s(SUP, { FR: [130, G], FL: [128, G], WL: [100, 114], WR: [74, 76] }),
    ],
    accent: ['WR'],
    bend: SUP_BEND,
  },
  clam: {
    view: 'side',
    dur: 2,
    poses: [
      s(SUP, { KL: [118, 110], FL: [128, G], KR: [118, 104], FR: [128, 114], WR: [96, 110] }),
      s(SUP, { KL: [118, 110], FL: [128, G], KR: [114, 84], FR: [128, 114], WR: [96, 110] }),
    ],
    accent: ['KR'],
    bend: SUP_BEND,
  },

  seatedfold: {
    view: 'side',
    dur: BREATH,
    poses: [s(SEAT, { N: [120, 96], WR: [132, 112], WL: [130, 113] }), s(SEAT, { N: [124, 100], H: [137, 104], WR: [138, 113], WL: [136, 114] })],
    accent: ['WR'],
  },
  butterfly: {
    view: 'side',
    dur: 2.4,
    poses: [
      s(SEAT, { FR: [116, 116], FL: [115, 116], KR: [112, 96], KL: [111, 97], WR: [116, 110], WL: [115, 111] }),
      s(SEAT, { FR: [116, 116], FL: [115, 116], KR: [114, 106], KL: [113, 107], WR: [116, 110], WL: [115, 111] }),
    ],
    accent: ['KR'],
  },
  wipers: {
    view: 'front',
    dur: 3.2,
    poses: [
      { N: [100, 76], P: [100, 110], KL: [108, 96], FL: [116, 116], KR: [126, 98], FR: [134, 116], WL: [82, 112], WR: [118, 112] },
      { N: [100, 76], P: [100, 110], KL: [74, 98], FL: [66, 116], KR: [92, 96], FR: [84, 116], WL: [82, 112], WR: [118, 112] },
    ],
    accent: ['KL', 'KR'],
  },

  roll: {
    view: 'side',
    dur: 2.6,
    poses: [
      { N: [86, 80], P: [80, 112], FL: [140, 104], FR: [142, 104], WL: [66, G - 1], WR: [68, G - 1] },
      { N: [102, 80], P: [96, 112], FL: [156, 104], FR: [158, 104], WL: [82, G - 1], WR: [84, G - 1] },
    ],
    bend: { EL: 1, ER: 1 },
    props: [{ kind: 'wheel', cx: 128, cy: 109, r: 9, spin: 2.6, accent: true }],
  },
  ride: ride(0.9),
  spinfast: ride(0.5),
  spinslow: ride(1.4),
  row: {
    view: 'side',
    dur: 3,
    poses: [
      { N: [118, 80], P: [104, 110], FL: [128, 112], FR: [130, 112], WL: [134, 92], WR: [136, 92] },
      { N: [76, 82], P: [88, 110], FL: [128, 112], FR: [130, 112], WL: [96, 90], WR: [98, 90] },
      { N: [98, 78], P: [94, 110], FL: [128, 112], FR: [130, 112], WL: [120, 96], WR: [122, 96] },
    ],
    times: [0, 0.35, 0.68, 1],
    accent: ['WR'],
    props: [
      { kind: 'frame', d: 'M40 118L160 118M132 104L132 118' },
      { kind: 'wheel', cx: 152, cy: 92, r: 10, spin: 1.2 },
      { kind: 'band', a: 'WR', b: [152, 92] },
    ],
  },
  hang: {
    view: 'front',
    dur: 2,
    // Hanging from the bar, straight-armed; the shoulders pull the body up a touch.
    poses: [
      { N: [100, 40], P: [100, 74], FL: [99, 116], FR: [101, 116], WL: [89, 8], WR: [111, 8] },
      { N: [100, 34], P: [100, 68], FL: [99, 110], FR: [101, 110], WL: [89, 8], WR: [111, 8] },
    ],
    accent: ['H'],
    ground: 'none',
    props: [{ kind: 'bar', y: 6, x1: 66, x2: 134 }],
  },
  breathe: { view: 'front', dur: 16, poses: [FRONT], custom: 'breathe' },
} satisfies Record<string, Demo>;

export type DemoKind = keyof typeof DEMOS;
