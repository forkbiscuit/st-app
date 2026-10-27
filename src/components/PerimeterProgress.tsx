import { useEffect, useRef, useState } from 'react';

/**
 * The glowing stroke that traces the edge of the screen and fills as a
 * movement timer runs (wireframe 9). Sized to its parent with ResizeObserver
 * so the corner radius matches the phone frame or a full-bleed mobile screen.
 *
 * Safari notes (these caused a frozen stroke and flicker on iPhone):
 * - The path length is computed exactly instead of relying on `pathLength`.
 * - Dash values are set as inline styles every frame, with no CSS transition.
 * - The glow is a second, wider stroke rather than a CSS `filter`.
 */
export function PerimeterProgress({ progress }: { progress: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0, r: 0 });

  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;
    const measure = () => {
      const r = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
      setBox({ w: el.clientWidth, h: el.clientHeight, r });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const inset = 3;
  const p = Math.min(1, Math.max(0, progress));
  const { d, length } = roundedRectPath(box.w, box.h, Math.max(0, box.r - inset), inset);
  const dash = { strokeDasharray: `${length} ${length}`, strokeDashoffset: length * (1 - p) };

  return (
    <svg ref={ref} className="perimeter" width={box.w} height={box.h} aria-hidden="true">
      <defs>
        <linearGradient id="perimeter-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--accent-1)" />
          <stop offset="1" stopColor="var(--accent-2)" />
        </linearGradient>
      </defs>
      {length > 0 && (
        <>
          <path className="perimeter-track" d={d} />
          {p > 0 && (
            <>
              <path className="perimeter-glow" d={d} style={dash} />
              <path className="perimeter-fill" d={d} style={dash} />
            </>
          )}
        </>
      )}
    </svg>
  );
}

/**
 * A rounded rectangle drawn clockwise from the top centre, so the stroke
 * grows from the top of the screen. Returns the exact path length.
 */
function roundedRectPath(w: number, h: number, r: number, inset: number) {
  if (w <= 0 || h <= 0) return { d: '', length: 0 };
  const x0 = inset;
  const y0 = inset;
  const x1 = w - inset;
  const y1 = h - inset;
  const rr = Math.min(r, (x1 - x0) / 2, (y1 - y0) / 2);
  const cx = (x0 + x1) / 2;
  // Full-screen mobile has square corners. Zero-radius arcs make Safari restart
  // the dash at every corner, so draw plain lines when there's no radius.
  if (rr < 0.5) {
    const d = `M ${cx} ${y0} H ${x1} V ${y1} H ${x0} V ${y0} Z`;
    return { d, length: 2 * (x1 - x0) + 2 * (y1 - y0) };
  }
  const d = [
    `M ${cx} ${y0}`,
    `H ${x1 - rr}`,
    `A ${rr} ${rr} 0 0 1 ${x1} ${y0 + rr}`,
    `V ${y1 - rr}`,
    `A ${rr} ${rr} 0 0 1 ${x1 - rr} ${y1}`,
    `H ${x0 + rr}`,
    `A ${rr} ${rr} 0 0 1 ${x0} ${y1 - rr}`,
    `V ${y0 + rr}`,
    `A ${rr} ${rr} 0 0 1 ${x0 + rr} ${y0}`,
    'Z',
  ].join(' ');
  const straight = 2 * (x1 - x0 - 2 * rr) + 2 * (y1 - y0 - 2 * rr);
  const length = straight + 2 * Math.PI * rr;
  return { d, length };
}
