import type { MotionKind } from '../data/types';

/**
 * Abstract demo animation for a movement. A stand-in for real exercise video:
 * each pattern (stride, swing, press…) gets one geometric loop that suggests
 * the rhythm of the move. Styles and keyframes live in components.css.
 */
export function MotionDemo({ kind, paused = false, label }: { kind: MotionKind; paused?: boolean; label: string }) {
  return (
    <figure className={`motion motion-${kind}${paused ? ' is-paused' : ''}`}>
      <svg viewBox="0 0 200 140" role="img" aria-label={`Demo animation: ${label}`}>
        <defs>
          <linearGradient id={`mg-${kind}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--accent-1)" />
            <stop offset="1" stopColor="var(--accent-2)" />
          </linearGradient>
        </defs>
        <Shape kind={kind} fill={`url(#mg-${kind})`} />
      </svg>
    </figure>
  );
}

function Shape({ kind, fill }: { kind: MotionKind; fill: string }) {
  switch (kind) {
    case 'stride':
      return (
        <g>
          <line className="m-ground" x1="30" y1="112" x2="170" y2="112" />
          <circle className="m-a" cx="82" cy="100" r="12" fill={fill} />
          <circle className="m-b" cx="118" cy="100" r="12" fill={fill} />
        </g>
      );
    case 'swing':
      return (
        <g className="m-a" style={{ transformOrigin: '100px 24px' }}>
          <circle cx="100" cy="24" r="5" className="m-pivot" />
          <line x1="100" y1="24" x2="100" y2="104" stroke={fill} strokeWidth="6" strokeLinecap="round" />
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
    case 'shift':
      return (
        <g>
          <line className="m-ground" x1="30" y1="112" x2="170" y2="112" />
          <circle className="m-a" cx="100" cy="92" r="16" fill={fill} />
        </g>
      );
    case 'balance':
      return (
        <g className="m-a" style={{ transformOrigin: '100px 118px' }}>
          <line x1="100" y1="118" x2="100" y2="52" stroke={fill} strokeWidth="6" strokeLinecap="round" />
          <circle cx="100" cy="38" r="15" fill={fill} />
        </g>
      );
    case 'circle':
      return (
        <g>
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
    case 'open':
      return (
        <g>
          <line className="m-ground" x1="40" y1="70" x2="160" y2="70" />
          <circle className="m-a" cx="88" cy="70" r="14" fill={fill} />
          <circle className="m-b" cx="112" cy="70" r="14" fill={fill} />
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
  }
}
