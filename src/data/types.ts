// Shared domain types. Everything the UI renders is derived from these.

export type Mode = 'warm' | 'cool';

export type ActivityId = 'run' | 'ski' | 'surf' | 'hike' | 'upper' | 'lower';

/** Session length is the adjustable parameter on the routine screen. */
export type Length = 'quick' | 'standard' | 'long';

/** What the side-by-side unit is called, e.g. "30 sec per leg". */
export type PerUnit = 'leg' | 'side' | 'arm' | 'ankle' | 'foot' | 'direction';

export type Dose =
  /** Timed hold or movement. maxSec is the top of a range from the source data. */
  | { kind: 'time'; sec: number; maxSec?: number; per?: PerUnit }
  /** Counted reps. Completed by the user tapping Done. */
  | { kind: 'reps'; reps: number; maxReps?: number; per?: PerUnit; secPerRep?: number }
  /** Free-form sets (e.g. lifting warm-up sets). Completed by tapping Done. */
  | { kind: 'sets'; label: string; estSec: number };

/** Abstract demo animation used in place of real exercise video. */
export type MotionKind =
  | 'stride'
  | 'swing'
  | 'press'
  | 'shift'
  | 'balance'
  | 'circle'
  | 'twist'
  | 'open'
  | 'hold';

export interface Exercise {
  id: string;
  name: string;
  /** "Direction" line on the movement screen: how to do it. */
  how: string;
  motion: MotionKind;
}

/** One step in an activity's standard routine. */
export interface RoutineStep {
  /** Stable id, unique within the activity + mode. */
  id: string;
  exercise: string;
  /** Overrides the exercise's library name for this context. */
  name?: string;
  dose: Dose;
  /** "Why?" line on the movement screen. */
  why: string;
  /** Core steps are kept in the Quick session length. */
  core: boolean;
  /** Shown under the dose when the step is optional or conditional. */
  note?: string;
}

export interface Activity {
  id: ActivityId;
  label: string;
  /** Material Symbols Rounded icon name. */
  icon: string;
  /** Short group label shown on the tile, e.g. "Gym". */
  group?: string;
  /** Lower-case name used in sentences: "Your surfing warm-up". */
  noun: string;
  /** The outing itself, for reminders: "Cool down after your surf". */
  session: string;
  /** Verb for the ready screen: "You're ready to surf". */
  verb: string;
  /** Key muscles, sentence case: "Shoulders, back and hips". */
  focus: string;
  loading: Record<Mode, string>;
  warm: RoutineStep[];
  cool: RoutineStep[];
}

/** A user's editable copy of a routine. Order and removals survive length changes. */
export interface RoutineItem {
  uid: string;
  stepId: string;
  removed: boolean;
}

export interface Routine {
  id: string;
  mode: Mode;
  activity: ActivityId;
  length: Length;
  items: RoutineItem[];
}

export interface SavedRoutine extends Routine {
  savedAt: number;
}

export interface Reminder {
  /** What the reminder will prompt the user to do. */
  mode: Mode;
  activity: ActivityId;
  at: number;
}

export type Feedback = 'up' | 'down';

export type FeedbackReason =
  | 'Too easy'
  | 'Too difficult'
  | 'Too long'
  | 'Wrong focus'
  | 'Pain or discomfort'
  | 'Too repetitive';
