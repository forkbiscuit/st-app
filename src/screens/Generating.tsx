import { useEffect, useState } from 'react';
import { ACTIVITY_BY_ID } from '../data/activities';
import { LogoMark } from '../components/Logo';
import { modeWord } from '../lib/routine';
import type { Action, AppState } from '../state/appState';

const STEP_MS = 950;

/**
 * Wireframes 5–6: a short, mocked "generating" beat. The copy walks from the
 * routine, to the muscles it focuses on, to an activity-themed line.
 * The routine itself comes from the standard routines in src/data.
 */
export function Generating({ state, dispatch }: { state: AppState; dispatch: (a: Action) => void }) {
  const [line, setLine] = useState(0);
  const routine = state.routine;
  const activity = routine ? ACTIVITY_BY_ID[routine.activity] : null;

  const lines = activity
    ? [
        `Building your ${activity.noun} ${modeWord(routine!.mode)}…`,
        `Focusing on ${activity.focus.toLowerCase()}…`,
        activity.loading[routine!.mode],
      ]
    : ['Building your routine…'];

  useEffect(() => {
    const step = STEP_MS / state.speed;
    const timers = lines.map((_, i) => window.setTimeout(() => setLine(i), i * step));
    const done = window.setTimeout(() => dispatch({ type: 'GENERATED' }), lines.length * step);
    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(done);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="screen-body generating">
      <div className="generating-center">
        <LogoMark size={88} animated />
        <p className="generating-line" aria-live="polite" key={line}>
          {lines[line]}
        </p>
      </div>
    </div>
  );
}
