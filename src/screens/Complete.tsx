import { useEffect, useRef, useState } from 'react';
import type { FeedbackReason } from '../data/types';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { minutesLabel, modeWord } from '../lib/routine';
import type { Action, AppState } from '../state/appState';

const REASONS: FeedbackReason[] = [
  'Too easy',
  'Too difficult',
  'Too long',
  'Wrong focus',
  'Pain or discomfort',
  'Too repetitive',
];

/**
 * Wireframes 12–14: completion, then "How was it?".
 * 14a thumbs up: Great!  14b–c thumbs down: pick what was off.
 * The routine can be bookmarked from here too.
 */
export function Complete({ state, dispatch }: { state: AppState; dispatch: (a: Action) => void }) {
  const [hint, setHint] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const run = state.run;
  const routine = state.routine;

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  if (!run || !routine) return null;
  const word = modeWord(routine.mode);
  const title = routine.mode === 'warm' ? 'Warm-up complete' : 'Cool-down complete';
  const minutes = minutesLabel((Date.now() - run.startedAt) / 1000 * state.speed);
  const saved = Boolean(state.savedId);

  const submit = () => {
    if (!state.rating) {
      setHint(true);
      return;
    }
    dispatch({ type: 'SUBMIT_FEEDBACK' });
  };

  return (
    <div className="screen-body complete">
      <div className="complete-hero">
        <span className="complete-check" aria-hidden="true">
          <Icon name="check" />
        </span>
        <h1 ref={headingRef} tabIndex={-1} className="display">
          {title}
        </h1>
        <p className="complete-stats">
          {run.done.length} of {run.steps.length} moves done
          {run.skipped.length > 0 && `, ${run.skipped.length} skipped`}, in about {minutes}.
        </p>
        <button
          type="button"
          className={`bookmark-toggle${saved ? ' is-on' : ''}`}
          aria-pressed={saved}
          onClick={() => dispatch({ type: 'TOGGLE_SAVE' })}
        >
          <Icon name={saved ? 'bookmark_added' : 'bookmark'} filled={saved} />
          {saved ? `${word.charAt(0).toUpperCase() + word.slice(1)} bookmarked` : `Bookmark this ${word}`}
        </button>
      </div>

      <section className="rating" aria-labelledby="rating-title">
        <h2 id="rating-title" className="section-title">
          How was it?
        </h2>
        <div className="thumbs">
          <button
            type="button"
            className={`thumb${state.rating === 'down' ? ' is-selected' : ''}`}
            aria-pressed={state.rating === 'down'}
            onClick={() => {
              dispatch({ type: 'RATE', rating: 'down' });
              setHint(false);
            }}
          >
            <Icon name="thumb_down" filled={state.rating === 'down'} size={40} />
            <span>Not great</span>
          </button>
          <button
            type="button"
            className={`thumb${state.rating === 'up' ? ' is-selected' : ''}`}
            aria-pressed={state.rating === 'up'}
            onClick={() => {
              dispatch({ type: 'RATE', rating: 'up' });
              setHint(false);
            }}
          >
            <Icon name="thumb_up" filled={state.rating === 'up'} size={40} />
            <span>Great!</span>
          </button>
        </div>

        {state.rating === 'down' && (
          <fieldset className="reasons">
            <legend>What was off? Pick any that apply.</legend>
            <div className="chips">
              {REASONS.map((r) => {
                const on = state.reasons.includes(r);
                return (
                  <button
                    key={r}
                    type="button"
                    className={`chip${on ? ' is-selected' : ''}`}
                    aria-pressed={on}
                    onClick={() => dispatch({ type: 'TOGGLE_REASON', reason: r })}
                  >
                    {on && <Icon name="check" />}
                    {r}
                  </button>
                );
              })}
            </div>
            {state.reasons.includes('Pain or discomfort') && (
              <p className="care-note">
                <Icon name="info" />
                Stop any move that hurts. If the pain sticks around, check in with a physio or doctor.
              </p>
            )}
          </fieldset>
        )}

        <p className={`field-hint${hint ? ' is-error' : ''}`} aria-live="polite">
          {hint ? 'Choose thumbs up or thumbs down, or skip.' : ''}
        </p>
      </section>

      <div className="screen-actions sticky">
        <Button variant="ghost" onClick={() => dispatch({ type: 'GO', screen: 'ready' })}>
          Skip
        </Button>
        <Button onClick={submit} inactive={!state.rating}>
          Send feedback
        </Button>
      </div>
    </div>
  );
}
