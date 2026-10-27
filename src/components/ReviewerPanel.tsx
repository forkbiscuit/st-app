import type { Action, AppState } from '../state/appState';

/**
 * Controls for reviewing the prototype, kept outside the phone so they never
 * read as part of the product.
 */
export function ReviewerPanel({ state, dispatch }: { state: AppState; dispatch: (a: Action) => void }) {
  return (
    <aside className="reviewer" aria-labelledby="reviewer-title">
      <h2 id="reviewer-title">Reviewer controls</h2>
      <p className="reviewer-intro">
        A working prototype of UpDown, built for the Specular Theory work sample. Routines, reminders and the
        “generating” step are mocked. Bookmarks are kept in this browser.
      </p>

      <label className="switch">
        <input
          type="checkbox"
          checked={state.speed > 1}
          onChange={(e) => dispatch({ type: 'SET_SPEED', speed: e.target.checked ? 10 : 1 })}
        />
        <span className="switch-track" aria-hidden="true" />
        <span>
          <strong>Fast timers</strong>
          <span className="switch-sub">Runs movement timers 10× faster</span>
        </span>
      </label>

      <label className="switch">
        <input
          type="checkbox"
          checked={state.storageBlocked}
          onChange={(e) => dispatch({ type: 'SET_STORAGE_BLOCKED', on: e.target.checked })}
        />
        <span className="switch-track" aria-hidden="true" />
        <span>
          <strong>Block browser storage</strong>
          <span className="switch-sub">Shows the error when a bookmark can’t be stored</span>
        </span>
      </label>

      <button type="button" className="reviewer-reset" onClick={() => dispatch({ type: 'RESET_DATA' })}>
        Clear bookmarks and reminders
      </button>

      <h3>Keyboard</h3>
      <ul className="reviewer-keys">
        <li>
          <kbd>Tab</kbd> moves between controls; <kbd>Enter</kbd> or <kbd>Space</kbd> presses them.
        </li>
        <li>
          Arrow keys move through the activity tiles and session lengths.
        </li>
        <li>
          On a move’s handle, <kbd>Space</kbd> picks it up, arrows move it, <kbd>Space</kbd> drops it.
        </li>
        <li>
          During a timer, <kbd>Space</kbd> pauses and resumes.
        </li>
      </ul>
    </aside>
  );
}
