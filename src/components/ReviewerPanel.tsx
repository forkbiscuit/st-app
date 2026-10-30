import { useEffect, useRef } from 'react';
import type { Action, AppState } from '../state/appState';
import { Icon } from './Icon';

/**
 * Testing tools, hidden until someone presses X (see App.tsx). A floating,
 * non-modal panel: the app stays usable underneath so you can test with it open.
 * Escape or X closes it, and focus goes back to where it was.
 */
export function ReviewerPanel({
  state,
  dispatch,
  onClose,
}: {
  state: AppState;
  dispatch: (a: Action) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const close = useRef(onClose);
  close.current = onClose;

  // Runs once per opening, so re-renders of the app never pull focus back here.
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close.current();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      // Focus was inside the panel, which is gone now: hand it back. If the
      // person has since clicked into the app, leave their focus alone.
      if (!document.activeElement || document.activeElement === document.body) before?.focus?.();
    };
  }, []);

  return (
    <aside ref={ref} className="reviewer" role="dialog" aria-labelledby="reviewer-title" tabIndex={-1}>
      <header className="reviewer-head">
        <h2 id="reviewer-title">Testing tools</h2>
        <button type="button" className="icon-btn reviewer-close" aria-label="Close testing tools" onClick={onClose}>
          <Icon name="close" />
        </button>
      </header>
      <p className="reviewer-intro">
        Press <kbd>X</kbd> to show or hide this panel.
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
        Clear bookmarks, reminders and history
      </button>

      <h3>Keyboard</h3>
      <ul className="reviewer-keys">
        <li>
          <kbd>Tab</kbd> moves between controls; <kbd>Enter</kbd> or <kbd>Space</kbd> presses them.
        </li>
        <li>Arrow keys move through the activity tiles and session lengths.</li>
        <li>
          On a move’s handle, <kbd>Space</kbd> picks it up, arrows move it, <kbd>Space</kbd> drops it.
        </li>
        <li>
          In a movement, <kbd>Space</kbd> starts, pauses and resumes; <kbd>→</kbd> skips or moves on.
        </li>
      </ul>
    </aside>
  );
}
