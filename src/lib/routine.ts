import { ACTIVITY_BY_ID } from '../data/activities';
import { EXERCISES, kitNote } from '../data/exercises';
import type { ActivityId, Dose, Exercise, Length, Mode, Routine, RoutineItem, RoutineStep } from '../data/types';

/** Seconds allowed between movements when estimating total time. */
const TRANSITION_SEC = 8;
/** Default seconds per rep when a step doesn't specify one. */
const SEC_PER_REP = 3;
/** Timed doses at or above this are treated as pulse raisers (walking, rowing). */
const PULSE_RAISER_SEC = 120;

export const LENGTHS: { id: Length; label: string; hint: string }[] = [
  { id: 'quick', label: 'Quick', hint: 'The essentials' },
  { id: 'standard', label: 'Standard', hint: 'A balanced routine' },
  { id: 'long', label: 'Long', hint: 'Extra moves, longer holds' },
];

const RANK: Record<Length, number> = { quick: 0, standard: 1, long: 2 };

export interface ResolvedStep {
  uid: string;
  step: RoutineStep;
  exercise: Exercise;
  name: string;
  dose: Dose;
}

export function stepsFor(activity: ActivityId, mode: Mode): RoutineStep[] {
  return ACTIVITY_BY_ID[activity][mode];
}

/** Whether an item plays at this session length. */
const inLength = (item: RoutineItem, length: Length) => RANK[item.tier ?? 'quick'] <= RANK[length];

/**
 * Session length changes which steps are included and how long each one runs.
 * - Quick: the steps tiered quick; pulse raisers cut to 1 min.
 * - Standard: quick and standard steps, at the low end of each range.
 * - Long: every step, at the top of its range; pulse raisers +1 min, holds +15 sec.
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
    if (item.removed || !inLength(item, length)) continue;
    const step = byId.get(item.stepId);
    if (!step) continue;
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

/** Kit needed, then any step note: "You’ll need a resistance band. One of each letter per rep." */
export function stepNote(s: ResolvedStep): string | undefined {
  return [kitNote(s.exercise), s.step.note].filter(Boolean).join(' ') || undefined;
}

/** The next length up and how many more moves it would add, or null at Long. */
export function hiddenByLength(routine: Routine): { count: number; length: Length; label: string } | null {
  const next = LENGTHS[RANK[routine.length] + 1];
  if (!next) return null;
  const count = routine.items.filter(
    (i) => !i.removed && !inLength(i, routine.length) && inLength(i, next.id),
  ).length;
  return count > 0 ? { count, length: next.id, label: next.label } : null;
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
