/**
 * Abstract demo animation for a movement. A stand-in for real exercise video:
 * each pattern gets one geometric loop (dots, bars, rings and a ground line)
 * that suggests the rhythm of the move. Styles and keyframes live in
 * components.css (Move demos).
 *
 * A kind is a shape plus an optional variant class for speed or size, so
 * related moves share a shape: `stride` marches, `stride-fast` does high knees.
 *
 * Rods are thin rects, not lines: a gradient can't paint a perfectly straight
 * line, because its bounding box has no width.
 */
const KINDS = {
  // Travel and pulse raisers
  stride: ['stride'],
  'stride-fast': ['stride', 'is-fast'],
  'stride-slow': ['stride', 'is-slow'],
  run: ['run'],
  'run-fast': ['run', 'is-fast'],
  jack: ['jack'],
  row: ['row'],
  pedal: ['pedal'],
  'pedal-fast': ['pedal', 'is-fast'],
  'pedal-slow': ['pedal', 'is-slow'],
  // Legs
  swing: ['swing'],
  kick: ['swing', 'is-high'],
  press: ['press'],
  'press-small': ['press', 'is-small'],
  lunge: ['lunge'],
  step: ['step'],
  shift: ['shift'],
  hopside: ['hopside'],
  jump: ['jump'],
  pogo: ['jump', 'is-small'],
  hinge: ['hinge'],
  bridge: ['bridge'],
  clam: ['clam'],
  'clam-slow': ['clam', 'is-slow'],
  balance: ['balance'],
  sway: ['balance', 'is-wide'],
  // Floor
  arch: ['arch'],
  'arch-slow': ['arch', 'is-slow'],
  reach: ['reach'],
  walkout: ['walkout'],
  // Upper body
  open: ['open'],
  'open-slow': ['open', 'is-slow'],
  lift: ['lift'],
  ytw: ['ytw'],
  hang: ['hang'],
  // Rotation and circles
  circle: ['circle'],
  'circle-small': ['circle', 'is-small'],
  twist: ['twist'],
  'twist-slow': ['twist', 'is-slow'],
  // Stretches and recovery
  hold: ['hold'],
  stretch: ['stretch'],
  reachup: ['reachup'],
  fold: ['fold'],
  roll: ['roll'],
  breathe: ['breathe'],
} as const satisfies Record<string, readonly [string, string?]>;

export type MotionKind = keyof typeof KINDS;
type Shape = (typeof KINDS)[MotionKind][0];
export const MOTION_KINDS = Object.keys(KINDS) as MotionKind[];

export function MotionDemo({ kind, paused = false, label }: { kind: MotionKind; paused?: boolean; label: string }) {
  const [shape, variant] = KINDS[kind] as readonly [Shape, string?];
  return (
    <figure className={`motion motion-${shape}${variant ? ` ${variant}` : ''}${paused ? ' is-paused' : ''}`}>
      <svg viewBox="0 0 200 140" role="img" aria-label={`Demo animation: ${label}`}>
        <defs>
          <linearGradient id={`mg-${kind}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--accent-1)" />
            <stop offset="1" stopColor="var(--accent-2)" />
          </linearGradient>
        </defs>
        <Shape shape={shape} fill={`url(#mg-${kind})`} />
      </svg>
    </figure>
  );
}

const Ground = ({ y = 112, scroll = false }: { y?: number; scroll?: boolean }) => (
  <line className={`m-ground${scroll ? ' m-scroll' : ''}`} x1="30" y1={y} x2="170" y2={y} />
);

function Shape({ shape, fill }: { shape: Shape; fill: string }) {
  switch (shape) {
    // Two feet lifting in turn.
    case 'stride':
      return (
        <g>
          <Ground />
          <circle className="m-a" cx="82" cy="100" r="12" fill={fill} />
          <circle className="m-b" cx="118" cy="100" r="12" fill={fill} />
        </g>
      );
    // Two feet cycling through a running loop while the ground slides past.
    case 'run':
      return (
        <g>
          <Ground scroll />
          <circle className="m-a" cx="100" cy="100" r="11" fill={fill} />
          <circle className="m-b" cx="100" cy="100" r="11" fill={fill} />
        </g>
      );
    // Hands and feet springing out and in.
    case 'jack':
      return (
        <g>
          <Ground />
          <circle className="m-pivot" cx="100" cy="80" r="5" />
          <circle className="m-tl" cx="92" cy="58" r="10" fill={fill} />
          <circle className="m-tr" cx="108" cy="58" r="10" fill={fill} />
          <circle className="m-bl" cx="94" cy="102" r="10" fill={fill} />
          <circle className="m-br" cx="106" cy="102" r="10" fill={fill} />
        </g>
      );
    // Seat slides on the rail, handle pulls the chain off the flywheel.
    case 'row':
      return (
        <g>
          <Ground y={108} />
          <circle className="m-ring" cx="156" cy="70" r="14" />
          <g className="m-spin" style={{ transformOrigin: '156px 70px' }}>
            <line className="m-spoke" x1="142" y1="70" x2="170" y2="70" />
          </g>
          <rect className="m-chain" x="92" y="69" width="64" height="2" rx="1" fill={fill} style={{ transformOrigin: '156px 70px' }} />
          <circle className="m-handle" cx="128" cy="70" r="9" fill={fill} />
          <circle className="m-seat" cx="112" cy="96" r="12" fill={fill} />
        </g>
      );
    // Pedals going round the crank.
    case 'pedal':
      return (
        <g>
          <circle className="m-ring" cx="100" cy="70" r="28" />
          <g className="m-a" style={{ transformOrigin: '100px 70px' }}>
            <rect className="m-ghost" x="72" y="68" width="56" height="4" rx="2" />
            <circle cx="72" cy="70" r="11" fill={fill} />
            <circle cx="128" cy="70" r="11" fill={fill} />
          </g>
          <circle className="m-pivot" cx="100" cy="70" r="5" />
        </g>
      );
    case 'swing':
      return (
        <g className="m-a" style={{ transformOrigin: '100px 24px' }}>
          <circle cx="100" cy="24" r="5" className="m-pivot" />
          <rect x="97" y="24" width="6" height="80" rx="3" fill={fill} />
          <circle cx="100" cy="108" r="14" fill={fill} />
        </g>
      );
    case 'press':
      return (
        <g>
          <rect className="m-ghost" x="50" y="104" width="100" height="10" rx="5" />
          <rect className="m-a" x="50" y="34" width="100" height="16" rx="8" fill={fill} />
        </g>
      );
    // Step forward and sink; the back foot stays put.
    case 'lunge':
      return (
        <g>
          <Ground />
          <circle className="m-ghost" cx="64" cy="102" r="10" />
          <circle className="m-a" cx="88" cy="94" r="16" fill={fill} />
        </g>
      );
    // Up onto the box and back down.
    case 'step':
      return (
        <g>
          <Ground />
          <rect className="m-box" x="108" y="86" width="50" height="26" rx="4" />
          <circle className="m-a" cx="82" cy="98" r="14" fill={fill} />
        </g>
      );
    case 'shift':
      return (
        <g>
          <Ground />
          <circle className="m-a" cx="100" cy="92" r="16" fill={fill} />
        </g>
      );
    // Bounding side to side, landing on each side.
    case 'hopside':
      return (
        <g>
          <Ground />
          <ellipse className="m-shadow" cx="100" cy="113" rx="16" ry="3" />
          <circle className="m-a" cx="100" cy="96" r="15" fill={fill} />
        </g>
      );
    // Dip, jump, land. The shadow shrinks as it leaves the ground.
    case 'jump':
      return (
        <g>
          <Ground />
          <ellipse className="m-shadow" cx="100" cy="113" rx="22" ry="3.5" />
          <circle className="m-a" cx="100" cy="94" r="16" fill={fill} />
        </g>
      );
    // A bar tipping forward from the hips and back up.
    case 'hinge':
      return (
        <g>
          <Ground />
          <line className="m-stand" x1="88" y1="92" x2="88" y2="112" />
          <rect className="m-a" x="82" y="30" width="12" height="62" rx="6" fill={fill} style={{ transformOrigin: '88px 92px' }} />
          <circle className="m-pivot" cx="88" cy="92" r="5" />
        </g>
      );
    // Hips rising off the floor between shoulders and feet.
    case 'bridge':
      return (
        <g>
          <Ground />
          <path className="m-a m-arc" d="M50 108 Q100 52 150 108" stroke={fill} style={{ transformOrigin: '100px 108px' }} />
          <circle className="m-b" cx="100" cy="80" r="12" fill={fill} />
          <circle className="m-pivot" cx="50" cy="108" r="5" />
          <circle className="m-pivot" cx="150" cy="108" r="5" />
        </g>
      );
    // One side stays down; the other opens from the hinge.
    case 'clam':
      return (
        <g>
          <rect className="m-ghost" x="64" y="92" width="86" height="8" rx="4" />
          <g className="m-a" style={{ transformOrigin: '68px 96px' }}>
            <rect x="64" y="92" width="80" height="8" rx="4" fill={fill} />
            <circle cx="144" cy="96" r="12" fill={fill} />
          </g>
          <circle className="m-pivot" cx="68" cy="96" r="5" />
        </g>
      );
    case 'balance':
      return (
        <g className="m-a" style={{ transformOrigin: '100px 118px' }}>
          <rect x="97" y="52" width="6" height="66" rx="3" fill={fill} />
          <circle cx="100" cy="38" r="15" fill={fill} />
        </g>
      );
    // A spine rounding up and dipping down.
    case 'arch':
      return (
        <g>
          <path className="m-a m-arc" d="M40 84 Q100 40 160 84" stroke={fill} style={{ transformOrigin: '100px 84px' }} />
          <circle className="m-pivot" cx="40" cy="84" r="5" />
          <circle className="m-pivot" cx="160" cy="84" r="5" />
        </g>
      );
    // Opposite corners reach out in turn.
    case 'reach':
      return (
        <g>
          <rect className="m-ghost" x="70" y="66" width="60" height="8" rx="4" />
          <circle className="m-a1" cx="80" cy="62" r="11" fill={fill} />
          <circle className="m-a2" cx="120" cy="78" r="11" fill={fill} />
          <circle className="m-b1" cx="120" cy="62" r="11" fill={fill} />
          <circle className="m-b2" cx="80" cy="78" r="11" fill={fill} />
        </g>
      );
    // Hands walk out from the feet and back.
    case 'walkout':
      return (
        <g>
          <Ground />
          <rect className="m-body" x="60" y="99" width="14" height="3" rx="1.5" fill={fill} style={{ transformOrigin: '60px 100px' }} />
          <circle cx="60" cy="100" r="12" fill={fill} />
          <circle className="m-a" cx="74" cy="100" r="10" fill={fill} />
        </g>
      );
    case 'open':
      return (
        <g>
          <line className="m-ground" x1="40" y1="70" x2="160" y2="70" />
          <circle className="m-a" cx="88" cy="70" r="14" fill={fill} />
          <circle className="m-b" cx="112" cy="70" r="14" fill={fill} />
        </g>
      );
    // Two arms on a shared pivot raising out to the sides (lift) or through Y, T and W (ytw).
    case 'lift':
    case 'ytw':
      return (
        <g>
          <g className="m-l" style={{ transformOrigin: '100px 46px' }}>
            <rect x="97.5" y="46" width="5" height="48" rx="2.5" fill={fill} />
            <circle cx="100" cy="98" r="11" fill={fill} />
          </g>
          <g className="m-r" style={{ transformOrigin: '100px 46px' }}>
            <rect x="97.5" y="46" width="5" height="48" rx="2.5" fill={fill} />
            <circle cx="100" cy="98" r="11" fill={fill} />
          </g>
          <circle className="m-pivot" cx="100" cy="46" r="5" />
        </g>
      );
    // Hanging from a bar; the shoulders draw it up a little.
    case 'hang':
      return (
        <g>
          <rect className="m-bar" x="58" y="14" width="84" height="6" rx="3" />
          <rect className="m-rod" x="98" y="20" width="4" height="58" rx="2" fill={fill} style={{ transformOrigin: '100px 20px' }} />
          <circle className="m-a" cx="100" cy="92" r="16" fill={fill} />
        </g>
      );
    case 'circle':
      return (
        <g className="m-scale" style={{ transformOrigin: '100px 70px' }}>
          <circle className="m-ring" cx="100" cy="70" r="40" />
          <g className="m-a" style={{ transformOrigin: '100px 70px' }}>
            <circle cx="140" cy="70" r="13" fill={fill} />
          </g>
        </g>
      );
    case 'twist':
      return (
        <g>
          <line className="m-ground" x1="100" y1="18" x2="100" y2="122" />
          <rect className="m-a" x="40" y="62" width="120" height="16" rx="8" fill={fill} style={{ transformOrigin: '100px 70px' }} />
        </g>
      );
    case 'hold':
      return (
        <g style={{ transformOrigin: '100px 70px' }}>
          <circle className="m-ring m-c" cx="100" cy="70" r="52" />
          <circle className="m-ring m-b" cx="100" cy="70" r="38" />
          <circle className="m-a" cx="100" cy="70" r="22" fill={fill} />
        </g>
      );
    // A held line slowly lengthening on each breath.
    case 'stretch':
      return (
        <g>
          <line className="m-ground" x1="40" y1="70" x2="160" y2="70" />
          <rect className="m-bar-a" x="62" y="66" width="56" height="8" rx="4" fill={fill} style={{ transformOrigin: '62px 70px' }} />
          <circle className="m-pivot" cx="62" cy="70" r="7" />
          <circle className="m-a" cx="118" cy="70" r="14" fill={fill} />
        </g>
      );
    // The same, reaching upward: overhead and side stretches.
    case 'reachup':
      return (
        <g>
          <line className="m-ground" x1="100" y1="16" x2="100" y2="124" />
          <rect className="m-bar-a" x="96" y="50" width="8" height="58" rx="4" fill={fill} style={{ transformOrigin: '100px 108px' }} />
          <circle className="m-pivot" cx="100" cy="108" r="7" />
          <circle className="m-a" cx="100" cy="48" r="14" fill={fill} />
        </g>
      );
    // Folding down over the legs and settling deeper.
    case 'fold':
      return (
        <g>
          <rect className="m-ghost" x="78" y="96" width="76" height="8" rx="4" />
          <rect className="m-a" x="78" y="96" width="70" height="8" rx="4" fill={fill} style={{ transformOrigin: '82px 100px' }} />
          <circle className="m-pivot" cx="82" cy="100" r="5" />
        </g>
      );
    // A roller travelling under the body, turning as it goes.
    case 'roll':
      return (
        <g>
          <Ground />
          <g className="m-a">
            <g className="m-b" style={{ transformOrigin: '100px 98px' }}>
              <circle cx="100" cy="98" r="14" fill={fill} />
              <line className="m-spoke" x1="88" y1="98" x2="112" y2="98" />
              <line className="m-spoke" x1="100" y1="86" x2="100" y2="110" />
            </g>
          </g>
        </g>
      );
    // Box breathing: four seconds a side round a square.
    case 'breathe':
      return (
        <g>
          <rect className="m-square" x="66" y="36" width="68" height="68" rx="8" />
          <circle className="m-a m-trail-2" cx="66" cy="36" r="8" fill={fill} />
          <circle className="m-a m-trail-1" cx="66" cy="36" r="8" fill={fill} />
          <circle className="m-a" cx="66" cy="36" r="9" fill={fill} />
        </g>
      );
  }
}
