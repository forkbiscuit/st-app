import type { Reminder, SavedRoutine } from '../data/types';

// Saved routines and the mocked reminder live in localStorage.
// Every access is wrapped: private windows and blocked site data can throw,
// and the app must keep working (for this visit only) when they do.

const KEY = 'updown:v1';

export interface Persisted {
  saved: SavedRoutine[];
  reminder: Reminder | null;
}

const EMPTY: Persisted = { saved: [], reminder: null };

/** Reviewer control: makes every write fail so the save error state can be seen. */
let simulateFailure = false;
export function setSimulateStorageFailure(on: boolean) {
  simulateFailure = on;
}

export function loadPersisted(): Persisted {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return {
      saved: Array.isArray(parsed.saved) ? parsed.saved : [],
      reminder: parsed.reminder ?? null,
    };
  } catch {
    return EMPTY;
  }
}

/** Returns false when the browser refused the write. */
export function savePersisted(data: Persisted): boolean {
  try {
    if (simulateFailure) throw new Error('Simulated storage failure');
    window.localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function clearPersisted(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
}
