import { ACTIVITY_BY_ID } from '../data/activities';
import { Icon } from '../components/Icon';
import { TopBar } from '../components/TopBar';
import { LENGTHS, minutesLabel, resolveRoutine, routineTitle, totalSeconds } from '../lib/routine';
import type { Action, AppState } from '../state/appState';

/** Bookmarked routines. Opening one restores its order, removals and length. */
export function Bookmarks({ state, dispatch }: { state: AppState; dispatch: (a: Action) => void }) {
  const { saved } = state;

  return (
    <div className="screen-body bookmarks">
      <TopBar onBack={() => dispatch({ type: 'GO', screen: state.bookmarksFrom })} />
      <h1 className="display">Bookmarks</h1>

      {saved.length === 0 ? (
        <div className="empty-state">
          <Icon name="bookmarks" size={36} />
          <p className="empty-title">No bookmarks yet.</p>
          <p className="empty-body">
            Tap the bookmark on a routine, or after you finish one, and it’ll be here next time.
          </p>
        </div>
      ) : (
        <ul className="saved-list">
          {saved.map((r) => {
            const steps = resolveRoutine(r);
            const lengthLabel = LENGTHS.find((l) => l.id === r.length)?.label ?? '';
            return (
              <li key={r.id} className="saved-item" data-mode={r.mode}>
                <button type="button" className="saved-open" onClick={() => dispatch({ type: 'OPEN_SAVED', id: r.id })}>
                  <span className="saved-icon">
                    <Icon name={ACTIVITY_BY_ID[r.activity].icon} />
                  </span>
                  <span className="saved-text">
                    <span className="saved-name">{routineTitle(r)}</span>
                    <span className="saved-meta">
                      {lengthLabel}, {steps.length} {steps.length === 1 ? 'move' : 'moves'}, about{' '}
                      {minutesLabel(totalSeconds(steps))}
                    </span>
                  </span>
                  <Icon name="chevron_right" />
                </button>
                <button
                  type="button"
                  className="icon-btn saved-delete"
                  aria-label={`Remove ${routineTitle(r)} from bookmarks`}
                  title="Remove bookmark"
                  onClick={() => dispatch({ type: 'DELETE_SAVED', id: r.id })}
                >
                  <Icon name="delete" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
