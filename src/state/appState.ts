import { ACTIVITY_BY_ID } from '../data/activities';
import type {
  ActivityId,
  Feedback,
  FeedbackReason,
  Length,
  Mode,
  Reminder,
  Routine,
  SavedRoutine,
} from '../data/types';
import { createRoutine, resolveRoutine, routineTitle, type ResolvedStep } from '../lib/routine';
import { loadPersisted } from './storage';

// All app state lives in one reducer so every screen change is a named action.
// Screens map to the numbered wireframes on the FigJam board (screen 4 was cut).

export type Screen =
  | 'home' // 1
  | 'activity' // 2–3
  | 'generating' // 5–6
  | 'routine' // 7
  | 'player' // 8–11
  | 'complete' // 12–14
  | 'ready' // 15
  | 'bookmarks'; // opened from the bookmark icon on 1–3

export interface Toast {
  id: number;
  message: string;
  tone: 'info' | 'error';
  /** Shows an Undo button that restores `undo`. */
  canUndo?: boolean;
}

type UndoSnapshot = { routine: Routine | null; saved: SavedRoutine[]; savedId: string | null };

export interface RunState {
  steps: ResolvedStep[];
  index: number;
  done: string[];
  skipped: string[];
  startedAt: number;
}

export interface AppState {
  screen: Screen;
  /** Where Back on the Bookmarks screen returns to. */
  bookmarksFrom: Screen;
  mode: Mode | null;
  activity: ActivityId | null;
  routine: Routine | null;
  /** Id of the saved copy the open routine is linked to; edits sync to it. */
  savedId: string | null;
  saved: SavedRoutine[];
  reminder: Reminder | null;
  run: RunState | null;
  rating: Feedback | null;
  reasons: FeedbackReason[];
  /** What the next "Give me another" should adjust, from submitted feedback. */
  lastReasons: FeedbackReason[];
  toast: Toast | null;
  undo: UndoSnapshot | null;
  /** Reviewer control: timers and loading run this many times faster. */
  speed: number;
  /** Reviewer control: make storage writes fail to show the error state. */
  storageBlocked: boolean;
}

export type Action =
  | { type: 'START_MODE'; mode: Mode }
  | { type: 'PICK_ACTIVITY'; activity: ActivityId }
  | { type: 'GENERATE' }
  | { type: 'GENERATED' }
  | { type: 'GO'; screen: Screen }
  | { type: 'OPEN_BOOKMARKS' }
  | { type: 'SET_LENGTH'; length: Length }
  | { type: 'REORDER'; visibleUids: string[] }
  | { type: 'MOVE'; uid: string; by: -1 | 1 }
  | { type: 'REMOVE'; uid: string }
  | { type: 'RESTORE_ALL' }
  | { type: 'UNDO' }
  | { type: 'TOGGLE_SAVE' }
  | { type: 'OPEN_SAVED'; id: string }
  | { type: 'DELETE_SAVED'; id: string }
  | { type: 'START_RUN' }
  | { type: 'STEP_DONE' }
  | { type: 'STEP_SKIP' }
  | { type: 'RATE'; rating: Feedback }
  | { type: 'TOGGLE_REASON'; reason: FeedbackReason }
  | { type: 'SUBMIT_FEEDBACK' }
  | { type: 'ANOTHER' }
  | { type: 'FINISH'; now: number }
  | { type: 'CANCEL_REMINDER' }
  | { type: 'TOAST'; message: string; tone?: Toast['tone'] }
  | { type: 'DISMISS_TOAST' }
  | { type: 'STORAGE_FAILED' }
  | { type: 'SET_SPEED'; speed: number }
  | { type: 'SET_STORAGE_BLOCKED'; on: boolean }
  | { type: 'RESET_DATA' };

let toastId = 0;
const toast = (message: string, tone: Toast['tone'] = 'info', canUndo = false): Toast => ({
  id: ++toastId,
  message,
  tone,
  canUndo,
});

export function initialState(): AppState {
  const persisted = loadPersisted();
  return {
    screen: 'home',
    bookmarksFrom: 'home',
    mode: null,
    activity: null,
    routine: null,
    savedId: null,
    saved: persisted.saved,
    reminder: persisted.reminder,
    run: null,
    rating: null,
    reasons: [],
    lastReasons: [],
    toast: null,
    undo: null,
    speed: 1,
    storageBlocked: false,
  };
}

const LENGTH_ORDER: Length[] = ['quick', 'standard', 'long'];

/** Feedback reasons that can't both be true. */
const OPPOSITES: Partial<Record<FeedbackReason, FeedbackReason>> = {
  'Too easy': 'Too difficult',
  'Too difficult': 'Too easy',
};

/** Replace the open routine, keeping any linked saved copy in sync. */
function withRoutine(state: AppState, routine: Routine): AppState {
  if (!state.savedId) return { ...state, routine };
  return {
    ...state,
    routine,
    saved: state.saved.map((s) => (s.id === state.savedId ? { ...routine, savedAt: s.savedAt } : s)),
  };
}

const snapshot = (state: AppState): UndoSnapshot => ({
  routine: state.routine,
  saved: state.saved,
  savedId: state.savedId,
});

/** Apply a new order of the visible items back onto the full item list. */
function applyVisibleOrder(routine: Routine, visibleUids: string[]): Routine {
  const visible = new Set(visibleUids);
  const queue = [...visibleUids];
  const items = routine.items.map((item) => {
    if (!visible.has(item.uid)) return item;
    const nextUid = queue.shift()!;
    return routine.items.find((i) => i.uid === nextUid)!;
  });
  return { ...routine, items };
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'START_MODE':
      return {
        ...state,
        screen: 'activity',
        mode: action.mode,
        // Keep the activity pick if they're switching mode, so Back/forward feels stable.
        activity: state.activity,
      };

    case 'PICK_ACTIVITY':
      return { ...state, activity: action.activity };

    case 'GENERATE': {
      if (!state.mode || !state.activity) return state;
      return {
        ...state,
        screen: 'generating',
        routine: createRoutine(state.activity, state.mode),
        savedId: null,
        lastReasons: [],
        undo: null,
        toast: null,
      };
    }

    case 'GENERATED':
      return state.screen === 'generating' ? { ...state, screen: 'routine' } : state;

    case 'GO':
      return { ...state, screen: action.screen, toast: action.screen === 'home' ? null : state.toast };

    case 'OPEN_BOOKMARKS':
      return { ...state, screen: 'bookmarks', bookmarksFrom: state.screen, toast: null };

    case 'SET_LENGTH': {
      if (!state.routine || state.routine.length === action.length) return state;
      return withRoutine(state, { ...state.routine, length: action.length });
    }

    case 'REORDER': {
      if (!state.routine) return state;
      return withRoutine(state, applyVisibleOrder(state.routine, action.visibleUids));
    }

    case 'MOVE': {
      if (!state.routine) return state;
      const uids = resolveRoutine(state.routine).map((s) => s.uid);
      const from = uids.indexOf(action.uid);
      const to = from + action.by;
      if (from < 0 || to < 0 || to >= uids.length) return state;
      [uids[from], uids[to]] = [uids[to], uids[from]];
      return withRoutine(state, applyVisibleOrder(state.routine, uids));
    }

    case 'REMOVE': {
      if (!state.routine) return state;
      const step = resolveRoutine(state.routine).find((s) => s.uid === action.uid);
      const routine = {
        ...state.routine,
        items: state.routine.items.map((i) => (i.uid === action.uid ? { ...i, removed: true } : i)),
      };
      return {
        ...withRoutine(state, routine),
        undo: snapshot(state),
        toast: toast(`Removed ${step?.name ?? 'move'}`, 'info', true),
      };
    }

    case 'RESTORE_ALL': {
      if (!state.routine) return state;
      const routine = { ...state.routine, items: state.routine.items.map((i) => ({ ...i, removed: false })) };
      return { ...withRoutine(state, routine), toast: toast('All moves restored') };
    }

    case 'UNDO': {
      if (!state.undo) return state;
      return {
        ...state,
        routine: state.undo.routine,
        saved: state.undo.saved,
        savedId: state.undo.savedId,
        undo: null,
        toast: null,
      };
    }

    case 'TOGGLE_SAVE': {
      if (!state.routine) return state;
      if (state.savedId) {
        return {
          ...state,
          saved: state.saved.filter((s) => s.id !== state.savedId),
          savedId: null,
          undo: snapshot(state),
          toast: toast('Removed from bookmarks', 'info', true),
        };
      }
      const copy: SavedRoutine = { ...state.routine, savedAt: Date.now() };
      return {
        ...state,
        saved: [copy, ...state.saved.filter((s) => s.id !== copy.id)],
        savedId: copy.id,
        toast: toast('Bookmarked. Open it any time from the bookmark icon.'),
      };
    }

    case 'OPEN_SAVED': {
      const found = state.saved.find((s) => s.id === action.id);
      if (!found) return state;
      const { savedAt: _savedAt, ...routine } = found;
      return {
        ...state,
        screen: 'routine',
        mode: routine.mode,
        activity: routine.activity,
        routine,
        savedId: routine.id,
        undo: null,
        toast: null,
      };
    }

    case 'DELETE_SAVED': {
      const found = state.saved.find((s) => s.id === action.id);
      if (!found) return state;
      return {
        ...state,
        saved: state.saved.filter((s) => s.id !== action.id),
        savedId: state.savedId === action.id ? null : state.savedId,
        undo: snapshot(state),
        toast: toast(`Removed ${routineTitle(found).toLowerCase()} from bookmarks`, 'info', true),
      };
    }

    case 'START_RUN': {
      if (!state.routine) return state;
      const steps = resolveRoutine(state.routine);
      if (steps.length === 0) return state;
      return {
        ...state,
        screen: 'player',
        run: { steps, index: 0, done: [], skipped: [], startedAt: Date.now() },
        rating: null,
        reasons: [],
        toast: null,
      };
    }

    case 'STEP_DONE':
    case 'STEP_SKIP': {
      if (!state.run) return state;
      const current = state.run.steps[state.run.index];
      const run: RunState = {
        ...state.run,
        index: state.run.index + 1,
        done: action.type === 'STEP_DONE' ? [...state.run.done, current.uid] : state.run.done,
        skipped: action.type === 'STEP_SKIP' ? [...state.run.skipped, current.uid] : state.run.skipped,
      };
      const finished = run.index >= run.steps.length;
      return { ...state, run, screen: finished ? 'complete' : 'player' };
    }

    case 'RATE':
      return { ...state, rating: action.rating, reasons: action.rating === 'up' ? [] : state.reasons };

    case 'TOGGLE_REASON': {
      const has = state.reasons.includes(action.reason);
      if (has) return { ...state, reasons: state.reasons.filter((r) => r !== action.reason) };
      // A routine can't be both too easy and too difficult: picking one clears the other.
      const opposite = OPPOSITES[action.reason];
      return { ...state, reasons: [...state.reasons.filter((r) => r !== opposite), action.reason] };
    }

    case 'SUBMIT_FEEDBACK':
      return {
        ...state,
        screen: 'ready',
        lastReasons: state.rating === 'down' ? state.reasons : [],
        toast: null,
      };

    case 'ANOTHER': {
      if (!state.routine) return state;
      // Mocked "AI" adjustment: feedback nudges the next routine.
      let length = state.routine.length;
      const idx = LENGTH_ORDER.indexOf(length);
      if (state.lastReasons.includes('Too long') && idx > 0) length = LENGTH_ORDER[idx - 1];
      if (state.lastReasons.includes('Too easy') && idx < 2) length = LENGTH_ORDER[idx + 1];
      const next = createRoutine(state.routine.activity, state.routine.mode, length);
      if (state.lastReasons.includes('Too repetitive')) {
        // Keep the pulse raiser first, shuffle the rest.
        const [first, ...rest] = next.items;
        rest.sort(() => Math.random() - 0.5);
        next.items = [first, ...rest];
      }
      const changed = length !== state.routine.length ? `Switched to ${length} based on your feedback.` : null;
      return {
        ...state,
        screen: 'generating',
        routine: next,
        savedId: null,
        undo: null,
        toast: changed ? toast(changed) : null,
      };
    }

    case 'FINISH': {
      if (!state.routine) return state;
      const { mode, activity } = state.routine;
      // Warm-up: nudge to cool down later. Cool-down: nudge to warm up tomorrow.
      const at = mode === 'warm' ? action.now + 2 * 60 * 60 * 1000 : action.now + 24 * 60 * 60 * 1000;
      const reminder: Reminder = { mode: mode === 'warm' ? 'cool' : 'warm', activity, at };
      return {
        ...state,
        screen: 'home',
        reminder,
        run: null,
        toast: toast(
          mode === 'warm'
            ? `We’ll remind you to cool down after your ${ACTIVITY_BY_ID[activity].session}.`
            : 'We’ll remind you to warm up tomorrow.',
        ),
      };
    }

    case 'CANCEL_REMINDER':
      return { ...state, reminder: null, toast: toast('Reminder cancelled') };

    case 'TOAST':
      return { ...state, toast: toast(action.message, action.tone ?? 'info') };

    case 'DISMISS_TOAST':
      return { ...state, toast: null };

    case 'STORAGE_FAILED':
      return {
        ...state,
        toast: toast(
          'Couldn’t store bookmarks in this browser, so they’ll be lost when you close the tab. Turn off private browsing or allow site data, then bookmark again.',
          'error',
        ),
      };

    case 'SET_SPEED':
      return { ...state, speed: action.speed };

    case 'SET_STORAGE_BLOCKED':
      return { ...state, storageBlocked: action.on };

    case 'RESET_DATA':
      return { ...initialState(), saved: [], reminder: null, speed: state.speed, storageBlocked: state.storageBlocked };

    default:
      return state;
  }
}

