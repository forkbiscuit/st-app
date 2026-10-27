import { ACTIVITY_BY_ID } from '../data/activities';
import { EXERCISES } from '../data/exercises';
import type { ActivityId, Dose, Exercise, Length, Mode, Routine, RoutineStep } from '../data/types';

/** Seconds allowed between movements when estimating total time. */
const TRANSITION_SEC = 8;
/** Default seconds per rep when a step doesn't specify one. */
const SEC_PER_REP = 3;
/** Timed doses at or above this are treated as pulse raisers (walking, rowing). */
const PULSE_RAISER_SEC = 120;

export const LENGTHS: { id: Length; label: string; hint: string }[] = [
  { id: 'quick', label: 'Quick', hint: 'Essentials only' },
  { id: 'standard', label: 'Standard', hint: 'The full routine' },
  { id: 'long', label: 'Long', hint: 'Cold days and hard sessions' },
];

export interface ResolvedStep {
  uid: string;
  step: RoutineStep;
  exercise: Exercise;
  name: string;
  dose: Dose;
}

let uidCounter = 0;
export const makeUid = () => `i${Date.now().toString(36)}${(uidCounter++).toString(36)}`;

export function stepsFor(activity: ActivityId, mode: Mode): RoutineStep[] {
  return ACTIVITY_BY_ID[activity][mode];
}

/** A fresh routine with every standard step, in the standard order. */
export function createRoutine(activity: ActivityId, mode: Mode, length: Length = 'standard'): Routine {
  return {
    id: makeUid(),
    activity,
    mode,
    length,
    items: stepsFor(activity, mode).map((s) => ({ uid: makeUid(), stepId: s.id, removed: false })),
  };
}

/**
 * Session length changes which steps are included and how long each one runs.
 * - Quick: core steps only; pulse raisers cut to 1 min.
 * - Standard: every step at the low end of its range.
 * - Long: every step at the top of its range; pulse raisers +1 min, holds +15 sec.
 */
export function scaleDose(dose: Dose, length: Length): Dose {
  if (dose.kind === 'time') {
    if (length === 'quick' && dose.sec >= PULSE_RAISER_SEC) return { ...dose, sec: 60, maxSec: undefined };
    if (length === 'long') {
      const top = dose.maxSec ?? (dose.sec >= PULSE_RAISER_SEC ? dose.sec + 60 : dose.sec + 15);
      return { ...dose, sec: top, maxSec: undefined };
    }
    return { ...dose, maxSec: undefined };
  }
  if (dose.kind === 'reps') {
    if (length === 'long') {
      const top = dose.maxReps ?? Math.ceil(dose.reps * 1.25);
      return { ...dose, reps: top, maxReps: undefined };
    }
    return { ...dose, maxReps: undefined };
  }
  return dose;
}

/** The steps a routine will actually play, in order, with doses scaled for its length. */
export function resolveRoutine(routine: Routine, length: Length = routine.length): ResolvedStep[] {
  const byId = new Map(stepsFor(routine.activity, routine.mode).map((s) => [s.id, s]));
  const out: ResolvedStep[] = [];
  for (const item of routine.items) {
    if (item.removed) continue;
    const step = byId.get(item.stepId);
    if (!step) continue;
    if (length === 'quick' && !step.core) continue;
    const exercise = EXERCISES[step.exercise];
    out.push({
      uid: item.uid,
      step,
      exercise,
      name: step.name ?? exercise.name,
      dose: scaleDose(step.dose, length),
    });
  }
  return out;
}

/** Steps that exist in the routine but are hidden by the current length. */
export function hiddenByLength(routine: Routine): number {
  if (routine.length !== 'quick') return 0;
  const byId = new Map(stepsFor(routine.activity, routine.mode).map((s) => [s.id, s]));
  return routine.items.filter((i) => !i.removed && !byId.get(i.stepId)?.core).length;
}

export function doseSeconds(dose: Dose): number {
  if (dose.kind === 'time') return dose.sec * (dose.per ? 2 : 1);
  if (dose.kind === 'reps') return dose.reps * (dose.secPerRep ?? SEC_PER_REP) * (dose.per ? 2 : 1);
  return dose.estSec;
}

export function totalSeconds(steps: ResolvedStep[]): number {
  if (steps.length === 0) return 0;
  return steps.reduce((t, s) => t + doseSeconds(s.dose), 0) + TRANSITION_SEC * (steps.length - 1);
}

/** Rounded minutes for display. Never shows 0 for a non-empty routine. */
export function minutesLabel(seconds: number): string {
  if (seconds === 0) return '0 min';
  return `${Math.max(1, Math.round(seconds / 60))} min`;
}

const PER_LABEL: Record<string, string> = {
  leg: 'per leg',
  side: 'per side',
  arm: 'per arm',
  ankle: 'per ankle',
  foot: 'per foot',
  direction: 'each direction',
};

function durationLabel(sec: number): string {
  if (sec >= 60 && sec % 60 === 0) return `${sec / 60} min`;
  if (sec > 60) return `${Math.floor(sec / 60)} min ${sec % 60} sec`;
  return `${sec} sec`;
}

/** "30 sec per leg", "12 reps", "2–4 sets". */
export function doseLabel(dose: Dose): string {
  if (dose.kind === 'time') {
    const base = dose.maxSec ? `${dose.sec}–${durationLabel(dose.maxSec)}` : durationLabel(dose.sec);
    return dose.per ? `${base} ${PER_LABEL[dose.per]}` : base;
  }
  if (dose.kind === 'reps') {
    const n = dose.maxReps ? `${dose.reps}–${dose.maxReps}` : `${dose.reps}`;
    if (dose.per) return `${n} ${PER_LABEL[dose.per]}`;
    return `${n} ${dose.reps === 1 ? 'rep' : 'reps'}`;
  }
  return dose.label;
}

/** Label for the half-way switch in a two-sided timed move. */
export function sideNames(per: string | undefined): [string, string] {
  switch (per) {
    case 'leg':
      return ['Left leg', 'Right leg'];
    case 'arm':
      return ['Left arm', 'Right arm'];
    case 'ankle':
      return ['Left ankle', 'Right ankle'];
    case 'foot':
      return ['Left foot', 'Right foot'];
    case 'direction':
      return ['Forwards', 'Backwards'];
    default:
      return ['Left side', 'Right side'];
  }
}

export function routineTitle(routine: Pick<Routine, 'activity' | 'mode'>): string {
  const a = ACTIVITY_BY_ID[routine.activity];
  const noun = a.noun.charAt(0).toUpperCase() + a.noun.slice(1);
  return `${noun} ${routine.mode === 'warm' ? 'warm-up' : 'cool-down'}`;
}

export const modeWord = (mode: Mode) => (mode === 'warm' ? 'warm-up' : 'cool-down');
