import { useCallback, useEffect, useReducer, useRef } from 'react';
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

type ViewTransitionDoc = Document & { startViewTransition?: (update: () => void) => unknown };

/** True when an action moves to a different screen or a different movement in the player. */
function changesView(prev: AppState, next: AppState) {
  return prev.screen !== next.screen || prev.run?.index !== next.run?.index;
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
    if (!doc.startViewTransition || reduce || !changesView(stateRef.current, reducer(stateRef.current, action))) {
      dispatch(action);
      return;
    }
    doc.startViewTransition(() => flushSync(() => dispatch(action)));
  }, []);
  // The picker follows the mode just chosen; later screens follow the routine.
  // (After a warm-up, state.routine is still the old warm routine while picking a cool-down.)
  const mode = NEUTRAL.includes(state.screen)
    ? undefined
    : state.screen === 'activity'
      ? (state.mode ?? undefined)
      : (state.routine?.mode ?? state.mode ?? undefined);

  // Persist bookmarks and reminders whenever they change (not on first load).
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (!savePersisted({ saved: state.saved, reminder: state.reminder })) dispatch({ type: 'STORAGE_FAILED' });
  }, [state.saved, state.reminder]);

  useEffect(() => setSimulateStorageFailure(state.storageBlocked), [state.storageBlocked]);

  const reset = useCallback(() => {
    clearPersisted();
    dispatch({ type: 'RESET_DATA' });
  }, []);

  const dismissToast = useCallback(() => dispatch({ type: 'DISMISS_TOAST' }), []);
  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);

  return (
    <div className="stage">
      <main className="phone" data-mode={mode} data-screen={state.screen}>
        <div className="phone-glow" aria-hidden="true" />
        <div className="screen" key={state.screen}>
          <ScreenComponent state={state} dispatch={go} />
        </div>
        <Toast toast={state.toast} onUndo={undo} onDismiss={dismissToast} />
      </main>
      <ReviewerPanel
        state={state}
        dispatch={(a) => (a.type === 'RESET_DATA' ? reset() : dispatch(a))}
      />
    </div>
  );
}
