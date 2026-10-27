import { useEffect, useRef, useState } from 'react';

/**
 * The glowing stroke that traces the edge of the screen and fills as a
 * movement timer runs (wireframe 9). Sized to its parent with ResizeObserver
 * so the corner radius matches the phone frame or a full-bleed mobile screen.
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
  return (
    <svg ref={ref} className="perimeter" width={box.w} height={box.h} aria-hidden="true">
      <defs>
        <linearGradient id="perimeter-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--accent-1)" />
          <stop offset="1" stopColor="var(--accent-2)" />
        </linearGradient>
      </defs>
      {box.w > 0 && (
        <>
          <rect
            className="perimeter-track"
            x={inset}
            y={inset}
            width={box.w - inset * 2}
            height={box.h - inset * 2}
            rx={Math.max(0, box.r - inset)}
            pathLength={1000}
          />
          <rect
            className="perimeter-fill"
            x={inset}
            y={inset}
            width={box.w - inset * 2}
            height={box.h - inset * 2}
            rx={Math.max(0, box.r - inset)}
            pathLength={1000}
            strokeDasharray="1000"
            strokeDashoffset={1000 * (1 - p)}
          />
        </>
      )}
    </svg>
  );
}
