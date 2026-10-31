import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { ReviewerPanel } from './components/ReviewerPanel';
import { Toast } from './components/Toast';
import { ActivityPicker } from './screens/ActivityPicker';
import { Bookmarks } from './screens/Bookmarks';
import { Complete } from './screens/Complete';
import { Generating } from './screens/Generating';
import { Home } from './screens/Home';
import { Player } from './screens/Player';
import { Ready } from './screens/Ready';
import { RoutineScreen } from './screens/RoutineScreen';
import { initialState, reducer, type Action, type AppState, type Screen } from './state/appState';
import { clearPersisted, savePersisted, setSimulateStorageFailure } from './state/storage';
import { onReminderOpened, syncReminder } from './lib/native';

const SCREENS = {
  home: Home,
  activity: ActivityPicker,
  generating: Generating,
  routine: RoutineScreen,
  player: Player,
  complete: Complete,
  ready: Ready,
  bookmarks: Bookmarks,
} satisfies Record<Screen, unknown>;

/** Screens that don't belong to a warm-up or cool-down stay neutral. */
const NEUTRAL: Screen[] = ['home', 'bookmarks'];

type ViewTransitionDoc = Document & {
  startViewTransition?: (update: () => void) => { finished: Promise<void> };
};

/**
 * Which transition an action needs, if any:
 * - 'slide' when the player moves to the next movement (pushes right to left)
 * - 'fade' when the screen changes
 */
function transitionFor(prev: AppState, next: AppState): 'slide' | 'fade' | null {
  if (prev.screen === 'player' && next.screen === 'player' && prev.run?.index !== next.run?.index) return 'slide';
  if (prev.screen !== next.screen) return 'fade';
  return null;
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const ScreenComponent = SCREENS[state.screen];
  const stateRef = useRef(state);
  stateRef.current = state;

  /**
   * Dispatch used by every screen. Actions that change the view run inside a
   * View Transition so screens crossfade (styles in base.css). Browsers
   * without the API, and people who prefer reduced motion, get an instant change.
   */
  const go = useCallback((action: Action) => {
    const doc = document as ViewTransitionDoc;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const kind = transitionFor(stateRef.current, reducer(stateRef.current, action));
    if (!doc.startViewTransition || reduce || !kind) {
      dispatch(action);
      return;
    }
    // base.css picks the animation from this attribute.
    const root = document.documentElement;
    root.dataset.vt = kind;
    const vt = doc.startViewTransition(() => flushSync(() => dispatch(action)));
    vt.finished.finally(() => {
      if (root.dataset.vt === kind) delete root.dataset.vt;
    });
  }, []);
  // The picker follows the mode just chosen; later screens follow the routine.
  // (After a warm-up, state.routine is still the old warm routine while picking a cool-down.)
  const mode = NEUTRAL.includes(state.screen)
    ? undefined
    : state.screen === 'activity'
      ? (state.mode ?? undefined)
      : (state.routine?.mode ?? state.mode ?? undefined);

  // Persist whenever bookmarks, the reminder or recent picks change (not on first load).
  // Only bookmark and reminder failures are reported: losing recent picks just
  // means the next routine might repeat a move.
  const persisted = useRef({ saved: state.saved, reminder: state.reminder, recent: state.recent });
  useEffect(() => {
    const prev = persisted.current;
    if (prev.saved === state.saved && prev.reminder === state.reminder && prev.recent === state.recent) return;
    const userData = prev.saved !== state.saved || prev.reminder !== state.reminder;
    persisted.current = { saved: state.saved, reminder: state.reminder, recent: state.recent };
    if (!savePersisted(persisted.current) && userData) dispatch({ type: 'STORAGE_FAILED' });
  }, [state.saved, state.reminder, state.recent]);

  useEffect(() => setSimulateStorageFailure(state.storageBlocked), [state.storageBlocked]);

  // In the iOS app, reminders are real notifications; tapping one opens that activity.
  useEffect(() => {
    syncReminder(state.reminder);
  }, [state.reminder]);
  useEffect(() => onReminderOpened((mode, activity) => dispatch({ type: 'OPEN_REMINDER', mode, activity })), []);

  const reset = useCallback(() => {
    clearPersisted();
    dispatch({ type: 'RESET_DATA' });
  }, []);

  const dismissToast = useCallback(() => dispatch({ type: 'DISMISS_TOAST' }), []);
  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);

  // Reviewer controls stay out of the way until someone presses X.
  const [reviewer, setReviewer] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      if (e.key === 'x' || e.key === 'X') setReviewer((open) => !open);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <main className="app" data-mode={mode} data-screen={state.screen}>
        <div className="app-glow" aria-hidden="true" />
        <div className="screen" key={state.screen}>
          <ScreenComponent state={state} dispatch={go} />
        </div>
        <Toast toast={state.toast} onUndo={undo} onDismiss={dismissToast} />
      </main>
      {reviewer && (
        <ReviewerPanel
          state={state}
          dispatch={(a) => (a.type === 'RESET_DATA' ? reset() : dispatch(a))}
          onClose={() => setReviewer(false)}
        />
      )}
    </>
  );
}

/** Keys typed into a field belong to the field, not to shortcuts. */
function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  return Boolean(el?.closest('input:not([type=checkbox]), textarea, select, [contenteditable=""], [contenteditable="true"]'));
}
