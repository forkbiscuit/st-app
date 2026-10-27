import { useRef, useState, type KeyboardEvent } from 'react';
import { ACTIVITIES } from '../data/activities';
import { BookmarksButton } from '../components/BookmarksButton';
import { Button } from '../components/Button';
import { Icon } from '../components/Icon';
import { TopBar } from '../components/TopBar';
import type { Action, AppState } from '../state/appState';

/**
 * Wireframes 2–3: pick the activity. A radio group in a 2×3 grid.
 * Arrow keys move between tiles; the Next button explains itself if nothing is picked.
 */
export function ActivityPicker({ state, dispatch }: { state: AppState; dispatch: (a: Action) => void }) {
  const tiles = useRef<(HTMLButtonElement | null)[]>([]);
  const [hint, setHint] = useState(false);
  const mode = state.mode ?? 'warm';
  const selectedIndex = ACTIVITIES.findIndex((a) => a.id === state.activity);

  const pick = (i: number) => {
    dispatch({ type: 'PICK_ACTIVITY', activity: ACTIVITIES[i].id });
    setHint(false);
  };

  const onKeyDown = (e: KeyboardEvent, i: number) => {
    const cols = 2;
    const moves: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols };
    if (!(e.key in moves)) return;
    e.preventDefault();
    const next = (i + moves[e.key] + ACTIVITIES.length) % ACTIVITIES.length;
    pick(next);
    tiles.current[next]?.focus();
  };

  const next = () => {
    if (!state.activity) {
      setHint(true);
      tiles.current[0]?.focus();
      return;
    }
    dispatch({ type: 'GENERATE' });
  };

  return (
    <div className="screen-body picker">
      <TopBar
        onBack={() => dispatch({ type: 'GO', screen: 'home' })}
        right={<BookmarksButton count={state.saved.length} onClick={() => dispatch({ type: 'OPEN_BOOKMARKS' })} />}
      />
      <h1 className="display" id="picker-title">
        {mode === 'warm' ? 'Warm up for…' : 'Cool down after…'}
      </h1>

      <div className="activity-grid" role="radiogroup" aria-labelledby="picker-title" aria-describedby="picker-hint">
        {ACTIVITIES.map((a, i) => {
          const checked = state.activity === a.id;
          // Roving tabindex: only the selected tile (or the first) is in the tab order.
          const tabbable = selectedIndex === -1 ? i === 0 : checked;
          return (
            <button
              key={a.id}
              ref={(el) => {
                tiles.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={tabbable ? 0 : -1}
              className={`activity-tile${checked ? ' is-selected' : ''}${hint ? ' is-flagged' : ''}`}
              onClick={() => pick(i)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              <Icon name={a.icon} size={34} />
              <span className="activity-label">{a.label}</span>
              {a.group && <span className="activity-group">{a.group}</span>}
              <span className="activity-check" aria-hidden="true">
                <Icon name="check" />
              </span>
            </button>
          );
        })}
      </div>

      <p id="picker-hint" className={`field-hint${hint ? ' is-error' : ''}`} aria-live="polite">
        {hint ? 'Choose an activity to continue.' : ''}
      </p>

      <div className="screen-actions">
        <Button onClick={next} inactive={!state.activity} iconAfter="arrow_forward">
          {mode === 'warm' ? 'Build my warm-up' : 'Build my cool-down'}
        </Button>
      </div>
    </div>
  );
}
