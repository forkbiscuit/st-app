import { useState } from 'react';
import { ACTIVITY_BY_ID } from '../data/activities';
import { Button, IconButton } from '../components/Button';
import { Icon } from '../components/Icon';
import { LengthControl } from '../components/LengthControl';
import { RoutineList } from '../components/RoutineList';
import { TopBar } from '../components/TopBar';
import { hiddenByLength, minutesLabel, modeWord, resolveRoutine, totalSeconds } from '../lib/routine';
import type { Action, AppState } from '../state/appState';

/**
 * Wireframe 7: the generated routine. This is where the user arranges moves,
 * adjusts session length and previews the result before starting.
 */
export function RoutineScreen({ state, dispatch }: { state: AppState; dispatch: (a: Action) => void }) {
  const [startHint, setStartHint] = useState(false);
  const routine = state.routine;
  if (!routine) return null;

  const activity = ACTIVITY_BY_ID[routine.activity];
  const steps = resolveRoutine(routine);
  const total = totalSeconds(steps);
  const hidden = hiddenByLength(routine);
  const removedCount = routine.items.filter((i) => i.removed).length;
  const saved = Boolean(state.savedId);
  const word = modeWord(routine.mode);

  const start = () => {
    if (steps.length === 0) {
      setStartHint(true);
      return;
    }
    dispatch({ type: 'START_RUN' });
  };

  return (
    <div className="screen-body routine">
      <TopBar
        backLabel="Change activity"
        onBack={() => dispatch({ type: 'GO', screen: 'activity' })}
        right={
          <IconButton
            icon={saved ? 'bookmark_added' : 'bookmark'}
            filled={saved}
            pressed={saved}
            label={saved ? 'Bookmarked. Select to remove the bookmark' : `Bookmark this ${word}`}
            className={saved ? 'is-on' : ''}
            onClick={() => dispatch({ type: 'TOGGLE_SAVE' })}
          />
        }
      />

      <div className="routine-head">
        <h1 className="display">
          Your {activity.noun} {word}
        </h1>
        <p className="routine-focus">
          <Icon name={activity.icon} />
          Focus: {activity.focus.toLowerCase()}
        </p>
      </div>

      <LengthControl routine={routine} onChange={(length) => dispatch({ type: 'SET_LENGTH', length })} />

      <div className="list-head">
        <h2 className="section-title" aria-live="polite">
          {steps.length === 0
            ? 'No moves'
            : `${steps.length} ${steps.length === 1 ? 'move' : 'moves'}, about ${minutesLabel(total)}`}
        </h2>
        {hidden > 0 && (
          <button type="button" className="text-btn" onClick={() => dispatch({ type: 'SET_LENGTH', length: 'standard' })}>
            {hidden} more in Standard
          </button>
        )}
      </div>

      {steps.length > 0 ? (
        <RoutineList
          steps={steps}
          onReorder={(visibleUids) => dispatch({ type: 'REORDER', visibleUids })}
          onMove={(uid, by) => dispatch({ type: 'MOVE', uid, by })}
          onRemove={(uid) => dispatch({ type: 'REMOVE', uid })}
        />
      ) : (
        <div className="empty-state">
          <Icon name="playlist_remove" size={36} />
          <p className="empty-title">No moves left in this {word}.</p>
          <p className="empty-body">
            {hidden > 0
              ? `Quick only keeps the essentials, and you’ve removed them. Switch to Standard or bring them back.`
              : 'Bring back the moves you removed to start again.'}
          </p>
          <div className="empty-actions">
            {removedCount > 0 && (
              <Button variant="secondary" icon="restart_alt" onClick={() => dispatch({ type: 'RESTORE_ALL' })}>
                Restore all moves
              </Button>
            )}
            {hidden > 0 && (
              <Button variant="ghost" onClick={() => dispatch({ type: 'SET_LENGTH', length: 'standard' })}>
                Switch to Standard
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="screen-actions sticky">
        {startHint && steps.length === 0 && (
          <p className="field-hint is-error" role="alert">
            Add at least one move to start.
          </p>
        )}
        <Button onClick={start} inactive={steps.length === 0} icon="play_arrow">
          Start {word}
        </Button>
      </div>
    </div>
  );
}
