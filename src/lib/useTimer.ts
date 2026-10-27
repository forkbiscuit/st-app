import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * A pausable count-up timer driven by requestAnimationFrame.
 * `speed` multiplies elapsed time (reviewer control for skimming the flow).
 */
export function useTimer(totalSec: number, speed = 1) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const base = useRef(0); // elapsed seconds banked before the current run
  const startedAt = useRef<number | null>(null);
  const raf = useRef<number | null>(null);

  const stopLoop = () => {
    if (raf.current !== null) cancelAnimationFrame(raf.current);
    raf.current = null;
  };

  const tick = useCallback(() => {
    if (startedAt.current === null) return;
    const now = performance.now();
    const e = Math.min(totalSec, base.current + ((now - startedAt.current) / 1000) * speed);
    setElapsed(e);
    if (e >= totalSec) {
      base.current = totalSec;
      startedAt.current = null;
      setRunning(false);
      stopLoop();
      return;
    }
    raf.current = requestAnimationFrame(tick);
  }, [totalSec, speed]);

  const start = useCallback(() => {
    if (startedAt.current !== null || base.current >= totalSec) return;
    startedAt.current = performance.now();
    setRunning(true);
    raf.current = requestAnimationFrame(tick);
  }, [tick, totalSec]);

  const pause = useCallback(() => {
    if (startedAt.current === null) return;
    base.current = Math.min(totalSec, base.current + ((performance.now() - startedAt.current) / 1000) * speed);
    startedAt.current = null;
    setElapsed(base.current);
    setRunning(false);
    stopLoop();
  }, [speed, totalSec]);

  const reset = useCallback(() => {
    stopLoop();
    base.current = 0;
    startedAt.current = null;
    setElapsed(0);
    setRunning(false);
  }, []);

  // If the speed changes mid-run, bank time and restart the loop at the new rate.
  useEffect(() => {
    if (startedAt.current === null) return;
    const now = performance.now();
    stopLoop();
    raf.current = requestAnimationFrame(tick);
    startedAt.current = now;
    base.current = elapsed;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speed]);

  useEffect(() => stopLoop, []);

  return { elapsed, running, done: elapsed >= totalSec && totalSec > 0, start, pause, reset };
}
