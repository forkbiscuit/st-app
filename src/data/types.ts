import type { DemoKind } from '../components/motion/demos';

// Shared domain types. Everything the UI renders is derived from these.

export type Mode = 'warm' | 'cool';

export type ActivityId = 'run' | 'ski' | 'cycle' | 'hike' | 'upper' | 'lower';

/**
 * Where a step sits in a routine.
 * Warm-ups follow RAMP (Jeffreys): raise the pulse, mobilise, activate, then prime
 * for the activity. Cool-downs ease off, stretch, then relax.
 */
export type Phase = 'raise' | 'mobilise' | 'activate' | 'prime' | 'ease' | 'stretch' | 'relax';

/** Kit an exercise needs. Shown as a note so nobody gets surprised mid-routine. */
export type Kit = 'band' | 'bike' | 'rower' | 'roller' | 'ball' | 'bar';

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

/** Which move demo plays for an exercise (src/components/motion/demos.ts). */
export type MotionKind = DemoKind;

export interface Exercise {
  id: string;
  name: string;
  /** "Direction" line on the movement screen: how to do it. */
  how: string;
  motion: MotionKind;
  kit?: Kit;
}

/** One option in an activity's pool of warm-up or cool-down steps. */
export interface RoutineStep {
  /** Stable id, unique within the activity + mode. Bookmarks store it: never rename or reuse. */
  id: string;
  exercise: string;
  /** Overrides the exercise's library name for this context. */
  name?: string;
  dose: Dose;
  /** "Why?" line on the movement screen. */
  why: string;
  phase: Phase;
  /** Key steps cover the activity's main muscles and are picked first, so Quick keeps them. */
  key?: boolean;
  /** 1 gentle, 2 moderate, 3 jumps and bounds. "Too difficult" feedback drops level 3. */
  level?: 1 | 2 | 3;
  /** Steps sharing a group are alternatives (e.g. three quad stretches): a routine uses one. */
  group?: string;
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
  /** Lower-case name used in sentences: "Your cycling warm-up". */
  noun: string;
  /** The outing itself, for reminders: "Cool down after your ride". */
  session: string;
  /** Verb for the ready screen: "You're ready to ride". */
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
  /** Shortest session length that includes this item: quick items show in every length. */
  tier: Length;
}

/** How a routine was generated, so it can be rebuilt the same way with different equipment. */
export interface GenParams {
  seed: number;
  recent?: string[];
  allNew?: boolean;
  maxLevel?: 1 | 2 | 3;
  harder?: boolean;
}

export interface Routine {
  id: string;
  mode: Mode;
  activity: ActivityId;
  length: Length;
  items: RoutineItem[];
  /** Missing on routines saved before equipment existed. */
  gen?: GenParams;
}

/** Equipment someone has said they have, per activity. Nothing is assumed. */
export type Equipment = Partial<Record<ActivityId, Kit[]>>;

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
