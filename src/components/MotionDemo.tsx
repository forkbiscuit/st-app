import { useEffect, useMemo, useRef, useState } from 'react';
import type { MotionKind } from '../data/types';
import { DEMOS } from './motion/demos';
import { FRONT_BEND, GROUND, SIDE_BEND, paths, resolve, type Demo, type Full, type JointName, type Pt } from './motion/figure';

let instances = 0;
const f = (n: number) => (Math.round(n * 10) / 10).toString();
const EASE = '0.45 0 0.55 1';

/**
 * The move demo: an abstract figure (glowing head, hands and feet on soft
 * limbs) looping through the move's key poses (motion/demos.ts). Joints that
 * matter for the move glow and leave a short trail. Tweens are SVG <animate>,
 * paused on a representative pose when `paused` or for reduced motion.
 */
export function MotionDemo({ kind, paused = false, label }: { kind: MotionKind; paused?: boolean; label: string }) {
  const demo = DEMOS[kind] as Demo;
  const [id] = useState(() => `md${++instances}`);
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      svg.pauseAnimations();
      svg.setCurrentTime(demo.dur * 0.3);
    } else {
      svg.unpauseAnimations();
    }
  }, [paused, demo.dur, kind]);

  return (
    <figure className={`motion${paused ? ' is-paused' : ''}`}>
      {/* key: a new move starts its own timeline */}
      {/* The drawing is 200 × 140; the view crops the empty margins so the figure fills the stage. */}
      <svg key={kind} ref={ref} viewBox="16 0 168 130" role="img" aria-label={`Demo animation: ${label}`}>
        <defs>
          <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--accent-1)" />
            <stop offset="1" stopColor="var(--accent-2)" />
          </linearGradient>
          <radialGradient id={`${id}-floor`}>
            <stop offset="0" stopColor="var(--accent-1)" stopOpacity="0.45" />
            <stop offset="1" stopColor="var(--accent-1)" stopOpacity="0" />
          </radialGradient>
        </defs>
        {demo.custom === 'breathe' ? <Breathe demo={demo} fill={`url(#${id}-g)`} /> : <Figure demo={demo} id={id} />}
      </svg>
    </figure>
  );
}

/** One <animate> over the demo's loop. `begin` shifts the phase (used for trails). */
function Anim({ attr, values, demo, begin }: { attr: string; values: string[]; demo: Demo; begin?: number }) {
  const n = values.length;
  const times = demo.times ?? values.map((_, i) => i / (n - 1));
  return (
    <animate
      attributeName={attr}
      values={values.join(';')}
      keyTimes={times.map((t) => t.toFixed(4)).join(';')}
      calcMode={demo.linear ? 'linear' : 'spline'}
      keySplines={demo.linear ? undefined : Array(n - 1).fill(EASE).join(';')}
      dur={`${demo.dur}s`}
      begin={begin ? `${f(begin)}s` : undefined}
      repeatCount="indefinite"
    />
  );
}

function Figure({ demo, id }: { demo: Demo; id: string }) {
  const loop = useMemo(() => {
    const bend = { ...(demo.view === 'front' ? FRONT_BEND : SIDE_BEND), ...demo.bend };
    const full = demo.poses.map((p) => resolve(p, bend));
    return [...full, full[0]];
  }, [demo]);

  const fill = `url(#${id}-g)`;
  const series = (fn: (j: Full) => string) => loop.map(fn);
  const xs = (j: JointName) => loop.map((p) => f(p[j][0]));
  const ys = (j: JointName) => loop.map((p) => f(p[j][1]));
  const first = loop[0];
  const farClass = demo.view === 'side' ? 'm-limb is-far' : 'm-limb';

  const limb = (key: keyof typeof paths, className: string) => (
    <path className={className} d={paths[key](first)}>
      <Anim attr="d" values={series(paths[key])} demo={demo} />
    </path>
  );

  const dot = (j: JointName, r: number, className: string, begin?: number) => (
    <circle className={className} cx={first[j][0]} cy={first[j][1]} r={r} fill={fill}>
      <Anim attr="cx" values={xs(j)} demo={demo} begin={begin} />
      <Anim attr="cy" values={ys(j)} demo={demo} begin={begin} />
    </circle>
  );

  // Trails: copies of a dot running slightly behind it (a negative begin of
  // nearly a full loop is the same as starting a moment late).
  const lag = Math.min(0.07, demo.dur * 0.04);
  const trail = (j: JointName, r: number) =>
    demo.trail === false
      ? null
      : [3, 2, 1].map((k) => (
          <g key={`${j}-${k}`} className={`m-trail m-trail-${k}`}>
            {dot(j, r, 'm-ghost', -(demo.dur - k * lag))}
          </g>
        ));

  const lowestFoot = loop.map((p) => Math.max(p.FL[1], p.FR[1]));
  const accents = (demo.accent ?? []).filter((j) => j !== 'H');

  return (
    <g>
      {demo.ground !== 'none' && (
        <line className={`m-ground${demo.ground === 'scroll' ? ' is-dashed' : ''}`} x1="30" y1={GROUND} x2="170" y2={GROUND}>
          {demo.ground === 'scroll' && (
            <animate attributeName="stroke-dashoffset" values={`0;${demo.scroll ?? 64}`} dur={`${demo.dur}s`} repeatCount="indefinite" />
          )}
        </line>
      )}

      {demo.shadow && (
        <ellipse cx={first.P[0]} cy={GROUND + 1} rx="24" ry="5" fill={`url(#${id}-floor)`}>
          <Anim attr="cx" values={xs('P')} demo={demo} />
          <Anim attr="rx" values={lowestFoot.map((y) => f(Math.max(10, 24 - (GROUND - y) * 0.6)))} demo={demo} />
        </ellipse>
      )}

      {demo.props?.map((prop, i) => {
        switch (prop.kind) {
          case 'wall':
            return <line key={i} className="m-prop" x1={prop.x} y1={prop.y1 ?? 22} x2={prop.x} y2={GROUND} />;
          case 'bar':
            return <line key={i} className="m-prop is-bar" x1={prop.x1} y1={prop.y} x2={prop.x2} y2={prop.y} />;
          case 'box':
            return <rect key={i} className="m-box" x={prop.x} y={prop.y} width={prop.w} height={prop.h} rx="3" />;
          case 'frame':
            return <path key={i} className="m-prop" d={prop.d} />;
          case 'wheel':
            return (
              <g key={i} className={`m-wheel${prop.accent ? ' is-accent' : ''}`}>
                <circle cx={prop.cx} cy={prop.cy} r={prop.r} fill={prop.accent ? fill : 'none'} />
                <g>
                  <line x1={prop.cx - prop.r} y1={prop.cy} x2={prop.cx + prop.r} y2={prop.cy} />
                  <line x1={prop.cx} y1={prop.cy - prop.r} x2={prop.cx} y2={prop.cy + prop.r} />
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    values={`0 ${prop.cx} ${prop.cy};360 ${prop.cx} ${prop.cy}`}
                    dur={`${prop.spin}s`}
                    repeatCount="indefinite"
                  />
                </g>
              </g>
            );
          default:
            return null;
        }
      })}

      {limb('legL', farClass)}
      {limb('armL', farClass)}
      {limb('spine', 'm-limb m-torso')}
      {limb('legR', 'm-limb')}
      {limb('armR', 'm-limb')}

      {demo.props?.map((prop, i) => {
        if (prop.kind !== 'band') return null;
        const end = (p: Full, b: JointName | Pt) => (typeof b === 'string' ? p[b] : b);
        return (
          <line key={`band-${i}`} className="m-band" x1={first[prop.a][0]} y1={first[prop.a][1]} x2={end(first, prop.b)[0]} y2={end(first, prop.b)[1]}>
            <Anim attr="x1" values={xs(prop.a)} demo={demo} />
            <Anim attr="y1" values={ys(prop.a)} demo={demo} />
            <Anim attr="x2" values={loop.map((p) => f(end(p, prop.b)[0]))} demo={demo} />
            <Anim attr="y2" values={loop.map((p) => f(end(p, prop.b)[1]))} demo={demo} />
          </line>
        );
      })}

      {demo.accent?.includes('H') && trail('H', 8.5)}
      {dot('H', 8.5, 'm-head')}
      {accents.map((j) => (
        <g key={j}>
          {trail(j, 5)}
          {dot(j, 5, 'm-joint')}
        </g>
      ))}
    </g>
  );
}

/** Box breathing: a dot traces a square, four seconds a side. */
function Breathe({ demo, fill }: { demo: Demo; fill: string }) {
  const corners = ['70 40', '130 40', '130 100', '70 100', '70 40'];
  const square = { ...demo, linear: true, times: undefined };
  const cx = corners.map((c) => c.split(' ')[0]);
  const cy = corners.map((c) => c.split(' ')[1]);
  const lag = 0.35;
  return (
    <g>
      <rect className="m-prop" x="70" y="40" width="60" height="60" rx="6" />
      {[3, 2, 1, 0].map((k) => (
        <circle key={k} className={k ? `m-ghost m-trail-${k}` : 'm-joint'} cx="70" cy="40" r={k ? 6 : 7} fill={fill}>
          <Anim attr="cx" values={cx} demo={square} begin={k ? -(demo.dur - k * lag) : undefined} />
          <Anim attr="cy" values={cy} demo={square} begin={k ? -(demo.dur - k * lag) : undefined} />
        </circle>
      ))}
    </g>
  );
}
