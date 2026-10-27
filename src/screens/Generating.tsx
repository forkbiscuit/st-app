import { useEffect, useState } from 'react';
import { ACTIVITY_BY_ID } from '../data/activities';
import { LogoMark } from '../components/Logo';
import { modeWord } from '../lib/routine';
import type { Action, AppState } from '../state/appState';

/** Time each line is shown. Three lines ≈ 2.7 s, then the routine fades in. */
const LINE_MS = 900;

/**
 * Wireframes 5–6: a short, mocked "building" beat. The copy walks from the
 * routine, to the muscles it focuses on, to an activity-themed line, with a
 * crossfade between lines and a progress bar underneath.
 * The routine itself comes from the standard routines in src/data.
 * Deliberately not affected by the reviewer's fast-timer setting.
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
  const total = lines.length * LINE_MS;

  useEffect(() => {
    const timers = lines.map((_, i) => window.setTimeout(() => setLine(i), i * LINE_MS));
    const done = window.setTimeout(() => dispatch({ type: 'GENERATED' }), total);
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
        <div className="generating-lines">
          {lines.map((text, i) => (
            <p
              key={i}
              className={`generating-line${i === line ? ' is-current' : i < line ? ' is-past' : ''}`}
              aria-hidden={i !== line}
            >
              {text}
            </p>
          ))}
        </div>
        <span className="generating-bar" aria-hidden="true">
          <span style={{ animationDuration: `${total}ms` }} />
        </span>
        <p className="sr-only" aria-live="polite">
          {lines[line]}
        </p>
      </div>
    </div>
  );
}
