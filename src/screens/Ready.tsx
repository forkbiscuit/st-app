import { useEffect, useRef } from 'react';
import { ACTIVITY_BY_ID } from '../data/activities';
import { Button } from '../components/Button';
import { LogoMark } from '../components/Logo';
import { modeWord } from '../lib/routine';
import type { Action, AppState } from '../state/appState';

/**
 * Wireframe 15: send-off. Finish sets a (mocked) reminder for the opposite
 * routine; "Do another" builds a fresh one, nudged by any feedback.
 */
export function Ready({ state, dispatch }: { state: AppState; dispatch: (a: Action) => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const routine = state.routine;
  if (!routine) return null;
  const activity = ACTIVITY_BY_ID[routine.activity];
  const warm = routine.mode === 'warm';
  const word = modeWord(routine.mode);

  return (
    <div className="screen-body ready">
      <div className="ready-center">
        <LogoMark size={56} />
        <h1 ref={headingRef} tabIndex={-1} className="display ready-title">
          {warm ? `You’re ready to ${activity.verb}.` : 'Nice work. Rest up.'}
        </h1>
        <p className="ready-sub">
          {warm ? 'See you afterwards for your cool‑down.' : 'Drink some water, eat something good and get some sleep.'}
        </p>
      </div>

      <div className="screen-actions stacked">
        <Button variant="secondary" onClick={() => dispatch({ type: 'ANOTHER' })}>
          Do another {word}
        </Button>
        <Button onClick={() => dispatch({ type: 'FINISH', now: Date.now() })}>
          Finish
        </Button>
        <p className="actions-caption">
          {warm
            ? 'Finish sets a reminder to cool down in 2 hours.'
            : 'Finish sets a reminder to warm up at this time tomorrow.'}
        </p>
      </div>
    </div>
  );
}
