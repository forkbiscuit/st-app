import { ACTIVITY_BY_ID, isActivityId } from '../data/activities';
import type { Length, Mode, Reminder, RoutineItem, SavedRoutine } from '../data/types';

// Saved routines, the mocked reminder and recent picks live in localStorage.
// Every access is wrapped: private windows and blocked site data can throw,
// and the app must keep working (for this visit only) when they do.
// Loaded data is checked against the current activities, so a removed activity
// or renamed step can't crash the app: unknown entries are dropped.

// v1 held fixed routines (and Surf). Its step ids no longer exist, so it isn't read.
const KEY = 'updown:v2';

export interface Persisted {
  saved: SavedRoutine[];
  reminder: Reminder | null;
  /** Step ids from recent routines, keyed `${activity}-${mode}`. */
  recent: Record<string, string[]>;
}

const empty = (): Persisted => ({ saved: [], reminder: null, recent: {} });

/** Reviewer control: makes every write fail so the save error state can be seen. */
let simulateFailure = false;
export function setSimulateStorageFailure(on: boolean) {
  simulateFailure = on;
}

const MODES: Mode[] = ['warm', 'cool'];
const LENGTHS: Length[] = ['quick', 'standard', 'long'];
const isMode = (m: unknown): m is Mode => MODES.includes(m as Mode);
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;

function cleanSaved(raw: unknown): SavedRoutine | null {
  if (!isObject(raw) || !isActivityId(raw.activity) || !isMode(raw.mode)) return null;
  if (typeof raw.id !== 'string' || !Array.isArray(raw.items)) return null;
  const known = new Set(ACTIVITY_BY_ID[raw.activity][raw.mode].map((s) => s.id));
  const items: RoutineItem[] = raw.items
    .filter((i): i is RoutineItem => isObject(i) && typeof i.uid === 'string' && known.has(i.stepId as string))
    .map((i) => ({
      uid: i.uid,
      stepId: i.stepId,
      removed: Boolean(i.removed),
      tier: LENGTHS.includes(i.tier) ? i.tier : 'standard',
    }));
  if (items.length === 0) return null;
  return {
    id: raw.id,
    activity: raw.activity,
    mode: raw.mode,
    length: LENGTHS.includes(raw.length as Length) ? (raw.length as Length) : 'standard',
    items,
    savedAt: typeof raw.savedAt === 'number' ? raw.savedAt : Date.now(),
  };
}

function cleanReminder(raw: unknown): Reminder | null {
  if (!isObject(raw) || !isActivityId(raw.activity) || !isMode(raw.mode) || typeof raw.at !== 'number') return null;
  return { activity: raw.activity, mode: raw.mode, at: raw.at };
}

function cleanRecent(raw: unknown): Persisted['recent'] {
  if (!isObject(raw)) return {};
  const out: Persisted['recent'] = {};
  for (const [key, ids] of Object.entries(raw)) {
    if (Array.isArray(ids)) out[key] = ids.filter((id): id is string => typeof id === 'string');
  }
  return out;
}

export function loadPersisted(): Persisted {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as unknown;
    if (!isObject(parsed)) return empty();
    return {
      saved: Array.isArray(parsed.saved)
        ? parsed.saved.map(cleanSaved).filter((s): s is SavedRoutine => s !== null)
        : [],
      reminder: cleanReminder(parsed.reminder),
      recent: cleanRecent(parsed.recent),
    };
  } catch {
    return empty();
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
