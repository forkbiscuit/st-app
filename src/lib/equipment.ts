import { EXERCISES } from '../data/exercises';
import type { ActivityId, Equipment, Kit, Mode } from '../data/types';
import { stepsFor } from './routine';

// UpDown assumes no equipment. Moves that need kit only appear once someone
// adds it (Add equipment on the routine screen), and that's remembered per
// activity. Some kit comes with the activity itself.

/** Kit you have by definition: you can't go for a ride without a bike. */
const IMPLIED: Partial<Record<ActivityId, Kit[]>> = { cycle: ['bike'] };

export const KIT_NAME: Record<Kit, string> = {
  band: 'Resistance band',
  roller: 'Foam roller',
  ball: 'Massage ball',
  bar: 'Pull-up bar',
  rower: 'Rowing machine',
  bike: 'Bike',
};

/** For sentences: "Added moves for your band." */
const KIT_WORD: Record<Kit, string> = {
  band: 'band',
  roller: 'foam roller',
  ball: 'massage ball',
  bar: 'pull-up bar',
  rower: 'rowing machine',
  bike: 'bike',
};

/** Display order in the equipment sheet. */
const ORDER: Kit[] = ['band', 'roller', 'ball', 'bar', 'rower', 'bike'];

export const kitOf = (exerciseId: string): Kit | undefined => EXERCISES[exerciseId]?.kit;

/** Everything this person can use for an activity: what they've added, plus what's implied. */
export function available(activity: ActivityId, equipment: Equipment): Kit[] {
  return [...new Set([...(equipment[activity] ?? []), ...(IMPLIED[activity] ?? [])])];
}

/** Kit worth asking about for this routine: used by its pool and not implied. */
export function kitsFor(activity: ActivityId, mode: Mode): Kit[] {
  const implied = IMPLIED[activity] ?? [];
  const used = new Set(stepsFor(activity, mode).map((s) => kitOf(s.exercise)));
  return ORDER.filter((k) => used.has(k) && !implied.includes(k));
}

/** Names of the moves a piece of kit unlocks in this routine's pool. */
export function movesUsing(activity: ActivityId, mode: Mode, kit: Kit): string[] {
  return stepsFor(activity, mode)
    .filter((s) => kitOf(s.exercise) === kit)
    .map((s) => s.name ?? EXERCISES[s.exercise].name);
}

/** "band", "band and foam roller", "band, foam roller and pull-up bar". */
export function kitWords(kits: Kit[]): string {
  const words = kits.map((k) => KIT_WORD[k]);
  return words.length < 2 ? (words[0] ?? '') : `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`;
}
