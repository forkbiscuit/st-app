import type { ActivityId, GenParams, Kit, Length, Mode, Phase, Routine, RoutineItem, RoutineStep } from '../data/types';
import { available, kitOf } from './equipment';
import { stepsFor } from './routine';

// Builds a routine from an activity's pool (src/data/activities.ts).
// Deterministic for a given seed, so the reducer stays pure: the seed travels in
// the action, and previewing the reducer (App.tsx) gives the same routine.
//
// Ties are broken by a score per move (seed + move id) rather than a shuffle,
// so adding a move to the pool (equipment) doesn't reorder the others: the same
// seed with a band added gives the same routine with a few band moves swapped in.

/**
 * How many steps each phase gets, as cumulative counts for Quick / Standard / Long.
 * Warm-ups: 4 / 6 / 8 moves. Cool-downs: 4 / 6 / 8 (fewer if a pool runs short).
 */
const PLAN: Record<Mode, [Phase, [number, number, number]][]> = {
  warm: [
    ['raise', [1, 1, 1]],
    ['mobilise', [1, 2, 3]],
    ['activate', [1, 2, 2]],
    ['prime', [1, 1, 2]],
  ],
  cool: [
    // Only Cycle has an ease-off step (spinning on the bike). Elsewhere its
    // slot passes to the next phase, so every cool-down is the same length.
    ['ease', [1, 1, 1]],
    ['stretch', [3, 4, 6]],
    ['relax', [0, 1, 1]],
  ],
};

const TIERS: Length[] = ['quick', 'standard', 'long'];

export interface GenerateOptions {
  /** Step ids from recent routines; avoided where the pool allows. */
  recent?: string[];
  /** Avoid recent steps even for the first (key) pick of each phase. */
  allNew?: boolean;
  /** Leave out steps above this level; a phase with nothing that gentle keeps its gentlest. */
  maxLevel?: 1 | 2 | 3;
  /** Prefer harder steps when choosing between equals. */
  harder?: boolean;
  /** Equipment added for this activity. Moves needing anything else are left out. */
  kit?: Kit[];
  /** Kit just added: its moves go first, so adding it visibly changes the routine. */
  preferKit?: Kit[];
}

export const newSeed = () => Math.floor(Math.random() * 2 ** 31);

/** mulberry32: small, fast, good enough to shuffle a list. */
function random(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A stable random number for this seed and move. */
function scoreOf(seed: number, id: string): number {
  let h = (2166136261 ^ seed) >>> 0;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return random(h)();
}

function compare(a: number[], b: number[]): number {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i];
  return 0;
}

const level = (s: RoutineStep) => s.level ?? 1;

export function generateRoutine(
  activity: ActivityId,
  mode: Mode,
  length: Length,
  seed: number,
  opts: GenerateOptions = {},
): Routine {
  const have = new Set(available(activity, { [activity]: opts.kit ?? [] }));
  const prefer = new Set(opts.preferKit ?? []);
  const pool = stepsFor(activity, mode).filter((s) => {
    const kit = kitOf(s.exercise);
    return !kit || have.has(kit);
  });
  const recent = new Set(opts.recent ?? []);
  const groups = new Set<string>();
  const exercises = new Set<string>();
  const picked: { step: RoutineStep; tier: Length }[] = [];
  let carry = [0, 0, 0];
  // An alternative to a key step works the same muscles, so it counts as key too
  // (Quick always stretches the quads, but not always with the same stretch).
  const keyGroups = new Set(pool.filter((s) => s.key && s.group).map((s) => s.group));
  const isKey = (s: RoutineStep) => Boolean(s.key || (s.group && keyGroups.has(s.group)));

  for (const [phase, counts] of PLAN[mode]) {
    const want = counts.map((c, i) => c + carry[i]);
    let candidates = pool.filter((s) => s.phase === phase);
    if (opts.maxLevel && candidates.length > 0) {
      // If nothing is gentle enough (e.g. Run's strides), keep the gentlest available.
      const cap = Math.max(opts.maxLevel, Math.min(...candidates.map(level)));
      candidates = candidates.filter((s) => level(s) <= cap);
    }

    // Rank, then break ties by each move's score. Picks that fill Quick's slots
    // prefer key steps, so every length covers the main muscles. The extra picks
    // for Standard and Long are open to the whole pool, preferring moves not used
    // recently. "All new" puts freshness first. Kit someone has just added comes
    // before all of that: they asked for it, so it should show up.
    const rank = (s: RoutineStep, essential: boolean): number[] => {
      const used = recent.has(s.id) ? 1 : 0;
      const notKey = isKey(s) ? 0 : 1;
      const notPreferred = prefer.has(kitOf(s.exercise) as Kit) ? 0 : 1;
      const head = !essential ? [used] : opts.allNew ? [used, notKey] : [notKey, used];
      return [notPreferred, ...head, opts.harder ? -level(s) : 0, scoreOf(seed, s.id)];
    };

    const chosen: RoutineStep[] = [];
    let remaining = candidates;
    while (chosen.length < want[2]) {
      const essential = chosen.length < want[0];
      const next = [...remaining]
        .sort((a, b) => compare(rank(a, essential), rank(b, essential)))
        .find((s) => !exercises.has(s.exercise) && !(s.group && groups.has(s.group)));
      if (!next) break;
      chosen.push(next);
      remaining = remaining.filter((s) => s !== next);
      exercises.add(next.exercise);
      if (next.group) groups.add(next.group);
    }

    // Each step's tier is the shortest length it belongs to.
    chosen.forEach((step, i) => picked.push({ step, tier: TIERS[want.findIndex((c) => i < c)] }));
    // Whatever this phase couldn't fill passes on to the next one.
    carry = want.map((c) => Math.max(0, c - chosen.length));
  }

  // Within a phase, play in pool order (pools list the finisher last).
  const order = new Map(pool.map((s, i) => [s.id, i]));
  const phaseOrder = PLAN[mode].map(([p]) => p);
  picked.sort(
    (a, b) =>
      phaseOrder.indexOf(a.step.phase) - phaseOrder.indexOf(b.step.phase) ||
      order.get(a.step.id)! - order.get(b.step.id)!,
  );

  const id = `r${seed.toString(36)}`;
  // A uid per move (not per position), so a rebuilt routine keeps the uids of the
  // moves it still has and the list can animate only what changed.
  const items: RoutineItem[] = picked.map(({ step, tier }) => ({
    uid: `${id}-${step.id}`,
    stepId: step.id,
    removed: false,
    tier,
  }));
  const gen: GenParams = { seed, recent: opts.recent, allNew: opts.allNew, maxLevel: opts.maxLevel, harder: opts.harder };
  return { id, activity, mode, length, items, gen };
}
