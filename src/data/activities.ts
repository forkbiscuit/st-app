import type { Activity, ActivityId, Dose, PerUnit, RoutineStep } from './types';

// Standard warm-up and cool-down routines per activity.
// Ski, Run, Hike, Upper body and Lower body follow the reference routines
// supplied for the project. Surf was written to the same pattern
// (8–12 min warm-up, 5–10 min cool-down, shoulders/back/hips focus).
// `core: true` marks the steps kept in the Quick (≈5 min) session length.

const time = (sec: number, opts: { max?: number; per?: PerUnit } = {}): Dose => ({
  kind: 'time',
  sec,
  maxSec: opts.max,
  per: opts.per,
});
const reps = (n: number, opts: { max?: number; per?: PerUnit; secPerRep?: number } = {}): Dose => ({
  kind: 'reps',
  reps: n,
  maxReps: opts.max,
  per: opts.per,
  secPerRep: opts.secPerRep,
});

type StepInput = Omit<RoutineStep, 'id'>;
const steps = (prefix: string, input: StepInput[]): RoutineStep[] =>
  input.map((s, i) => ({ ...s, id: `${prefix}-${i + 1}` }));

export const ACTIVITIES: Activity[] = [
  {
    id: 'run',
    label: 'Run',
    icon: 'directions_run',
    noun: 'running',
    session: 'run',
    verb: 'run',
    focus: 'Calves, hips and legs',
    loading: { warm: 'Lacing up…', cool: 'Catching your breath…' },
    warm: steps('run-w', [
      { exercise: 'walk', dose: time(120), why: 'Gradually raise your heart rate', core: true },
      { exercise: 'leg-swings', name: 'Forward/backward leg swings', dose: reps(10, { per: 'leg', secPerRep: 2 }), why: 'Mobilise hips and hamstrings', core: true },
      { exercise: 'leg-swings-side', dose: reps(10, { per: 'leg', secPerRep: 2 }), why: 'Activate lateral hip movement', core: false },
      { exercise: 'ankle-rocks', dose: reps(10, { per: 'ankle', secPerRep: 2 }), why: 'Prepare ankles for impact', core: true },
      { exercise: 'walking-lunges', dose: reps(8, { per: 'leg' }), why: 'Activate quads and glutes', core: true },
      { exercise: 'high-knees', dose: time(30), why: 'Activate hip flexors', core: false },
      { exercise: 'butt-kicks', dose: time(30), why: 'Prepare hamstrings', core: false },
      { exercise: 'strides', dose: reps(2, { secPerRep: 45 }), why: 'Prepare for faster running', core: false, note: '15–20 sec each. Only if you’re planning faster running.' },
    ]),
    cool: steps('run-c', [
      { exercise: 'walk-easy', name: 'Slow walking', dose: time(180, { max: 300 }), why: 'Gradually lower your heart rate', core: true },
      { exercise: 'calf-stretch-standing', dose: time(30, { per: 'leg' }), why: 'Stretch the gastrocnemius', core: true },
      { exercise: 'calf-stretch-bent', dose: time(30, { per: 'leg' }), why: 'Target the soleus muscles', core: false },
      { exercise: 'quad-stretch', dose: time(30, { per: 'leg' }), why: 'Stretch your quadriceps', core: true },
      { exercise: 'hamstring-stretch', dose: time(30, { per: 'leg' }), why: 'Stretch the backs of your thighs', core: true },
      { exercise: 'low-lunge', dose: time(30, { per: 'side' }), why: 'Stretch your hip flexors', core: false },
      { exercise: 'figure-four', dose: time(30, { per: 'side' }), why: 'Stretch your glutes', core: false },
    ]),
  },
  {
    id: 'ski',
    label: 'Ski',
    icon: 'downhill_skiing',
    noun: 'skiing',
    session: 'ski day',
    verb: 'ski',
    focus: 'Quads, glutes and hips',
    loading: { warm: 'Clicking into bindings…', cool: 'Unbuckling boots…' },
    warm: steps('ski-w', [
      { exercise: 'walk', name: 'Brisk walking or marching', dose: time(120), why: 'Raise your body temperature', core: true },
      { exercise: 'leg-swings', dose: reps(10, { per: 'leg', secPerRep: 2 }), why: 'Mobilise hips and hamstrings', core: true },
      { exercise: 'squat', dose: reps(12), why: 'Activate quads and glutes', core: true },
      { exercise: 'lateral-lunge', dose: reps(6, { per: 'side', secPerRep: 4 }), why: 'Prepare for side-to-side movement', core: true },
      { exercise: 'glute-bridge', dose: reps(12), why: 'Activate glutes and stabilise hips', core: false },
      { exercise: 'single-leg-balance', dose: time(30, { per: 'leg' }), why: 'Prepare ankles and balance', core: false },
      { exercise: 'skater-steps', dose: time(30, { max: 45 }), why: 'Rehearse lateral weight shifts', core: true },
    ]),
    cool: steps('ski-c', [
      { exercise: 'walk-easy', dose: time(120, { max: 180 }), why: 'Gradually reduce exertion', core: true },
      { exercise: 'quad-stretch', dose: time(30, { per: 'leg' }), why: 'Stretch your quadriceps', core: true },
      { exercise: 'hip-flexor-stretch', dose: time(30, { per: 'side' }), why: 'Release hip tightness', core: true },
      { exercise: 'figure-four', dose: time(30, { per: 'side' }), why: 'Stretch your glutes', core: false },
      { exercise: 'calf-stretch', dose: time(30, { per: 'leg' }), why: 'Stretch your calves', core: false },
      { exercise: 'butterfly', dose: time(30, { max: 45 }), why: 'Stretch your inner thighs', core: true },
    ]),
  },
  {
    id: 'surf',
    label: 'Surf',
    icon: 'surfing',
    noun: 'surfing',
    session: 'surf',
    verb: 'surf',
    focus: 'Shoulders, back and hips',
    loading: { warm: 'Waxing the board…', cool: 'Rinsing the wetsuit…' },
    warm: steps('surf-w', [
      { exercise: 'walk', name: 'Brisk walk or jog on the sand', dose: time(120), why: 'Raise your body temperature', core: true },
      { exercise: 'arm-circles', dose: time(30, { per: 'direction' }), why: 'Warm up shoulders for paddling', core: true },
      { exercise: 'torso-rotations', dose: time(45), why: 'Loosen your spine for turning', core: true },
      { exercise: 'prone-y', dose: reps(10), why: 'Switch on your upper back for paddling posture', core: false },
      { exercise: 'worlds-greatest', dose: reps(5, { per: 'side', secPerRep: 6 }), why: 'Open your hips for a smooth pop-up', core: true },
      { exercise: 'squat', dose: reps(10), why: 'Activate legs for your riding stance', core: false },
      { exercise: 'pop-ups', dose: reps(6, { secPerRep: 5 }), why: 'Rehearse getting to your feet', core: true },
    ]),
    cool: steps('surf-c', [
      { exercise: 'walk-easy', dose: time(120), why: 'Gradually reduce exertion', core: true },
      { exercise: 'chest-opener', dose: time(30, { max: 45 }), why: 'Release your chest after paddling', core: true },
      { exercise: 'cross-body-shoulder', dose: time(30, { per: 'arm' }), why: 'Stretch your rear shoulders', core: true },
      { exercise: 'childs-pose-side', dose: time(30, { per: 'side' }), why: 'Stretch your lats', core: false },
      { exercise: 'low-lunge', dose: time(30, { per: 'side' }), why: 'Release your hip flexors', core: true },
      { exercise: 'neck-stretch', dose: time(20, { per: 'side' }), why: 'Ease your neck after looking up to paddle', core: false },
    ]),
  },
  {
    id: 'hike',
    label: 'Hike',
    icon: 'hiking',
    noun: 'hiking',
    session: 'hike',
    verb: 'hike',
    focus: 'Ankles, calves and quads',
    loading: { warm: 'Checking the trail map…', cool: 'Dropping the pack…' },
    warm: steps('hike-w', [
      { exercise: 'walk', dose: time(120, { max: 180 }), why: 'Increase circulation', core: true },
      { exercise: 'ankle-circles', dose: reps(10, { per: 'direction', secPerRep: 2 }), why: 'Mobilise your ankles', core: true },
      { exercise: 'calf-raises', dose: reps(15, { secPerRep: 2 }), why: 'Activate your calves', core: true },
      { exercise: 'leg-swings', dose: reps(10, { per: 'leg', secPerRep: 2 }), why: 'Mobilise your hips', core: false },
      { exercise: 'squat', dose: reps(10), why: 'Prepare quads and glutes', core: true },
      { exercise: 'step-ups', dose: reps(8, { per: 'leg' }), why: 'Rehearse climbing', core: false },
      { exercise: 'torso-rotations', dose: time(30), why: 'Mobilise your spine and trunk', core: false },
    ]),
    cool: steps('hike-c', [
      { exercise: 'walk-easy', dose: time(120, { max: 180 }), why: 'Gradually reduce exertion', core: true },
      { exercise: 'calf-stretch', name: 'Calf stretch', dose: time(30, { per: 'leg' }), why: 'Stretch calves after climbing', core: true },
      { exercise: 'quad-stretch', dose: time(30, { per: 'leg' }), why: 'Stretch quads after descents', core: true },
      { exercise: 'seated-hamstring', dose: time(30, { per: 'leg' }), why: 'Stretch your hamstrings', core: false },
      { exercise: 'hip-flexor-stretch', dose: time(30, { per: 'side' }), why: 'Stretch your hip flexors', core: false },
      { exercise: 'figure-four', dose: time(30, { per: 'side' }), why: 'Stretch your glutes', core: true },
      { exercise: 'foot-rolling', dose: time(60, { per: 'foot' }), why: 'Gentle massage for tired feet', core: false, note: 'Optional. You’ll need a small ball.' },
    ]),
  },
  {
    id: 'upper',
    label: 'Upper body',
    group: 'Gym',
    icon: 'fitness_center',
    noun: 'upper-body',
    session: 'upper-body session',
    verb: 'lift',
    focus: 'Shoulders, chest and back',
    loading: { warm: 'Chalking up…', cool: 'Racking the weights…' },
    warm: steps('upper-w', [
      { exercise: 'row', dose: time(180), why: 'Increase circulation', core: true },
      { exercise: 'arm-circles', name: 'Arm circles', dose: time(30, { per: 'direction' }), why: 'Mobilise your shoulders', core: true },
      { exercise: 'thoracic-rotations', dose: reps(8, { per: 'side', secPerRep: 4 }), why: 'Improve upper-back rotation', core: false },
      { exercise: 'band-pull-aparts', dose: reps(15, { secPerRep: 2 }), why: 'Activate rear shoulders and upper back', core: true },
      { exercise: 'scap-pushups', dose: reps(12, { secPerRep: 2 }), why: 'Activate your scapular stabilisers', core: false },
      { exercise: 'band-external-rotations', dose: reps(10, { per: 'arm', secPerRep: 2 }), why: 'Prepare your rotator cuff', core: false },
      { exercise: 'warmup-sets', dose: { kind: 'sets', label: '2–4 sets', estSec: 180 }, why: 'Rehearse your first compound lift', core: true },
    ]),
    cool: steps('upper-c', [
      { exercise: 'walk-easy', dose: time(120), why: 'Gradually reduce exertion', core: true },
      { exercise: 'doorway-chest', dose: time(30, { per: 'side' }), why: 'Stretch your pecs', core: true },
      { exercise: 'childs-pose-side', dose: time(30, { per: 'side' }), why: 'Stretch your lats', core: true },
      { exercise: 'cross-body-shoulder', dose: time(30, { per: 'arm' }), why: 'Stretch your rear shoulders', core: true },
      { exercise: 'thread-needle', dose: time(30, { per: 'side' }), why: 'Mobilise your upper back', core: false },
      { exercise: 'triceps-stretch', dose: time(30, { per: 'arm' }), why: 'Stretch your triceps', core: false },
      { exercise: 'wrist-flexor', dose: time(20, { per: 'arm' }), why: 'Ease forearm tightness', core: false },
    ]),
  },
  {
    id: 'lower',
    label: 'Lower body',
    group: 'Gym',
    icon: 'sprint',
    noun: 'lower-body',
    session: 'lower-body session',
    verb: 'lift',
    focus: 'Hips, glutes and legs',
    loading: { warm: 'Loading the bar…', cool: 'Re-racking the bar…' },
    warm: steps('lower-w', [
      { exercise: 'walk-cycle', dose: time(180), why: 'Warm your lower-body muscles', core: true },
      { exercise: 'leg-swings', name: 'Forward/backward leg swings', dose: reps(10, { per: 'leg', secPerRep: 2 }), why: 'Mobilise your hips', core: true },
      { exercise: 'ankle-rocks', name: 'Ankle dorsiflexion rocks', dose: reps(10, { per: 'ankle', secPerRep: 2 }), why: 'Prepare your ankles to move', core: false },
      { exercise: 'squat', dose: reps(12), why: 'Prepare the squat pattern', core: true },
      { exercise: 'glute-bridge', dose: reps(12), why: 'Activate your glutes', core: false },
      { exercise: 'hip-hinge', dose: reps(10), why: 'Practise hip hinging', core: true },
      { exercise: 'lateral-lunge', dose: reps(6, { per: 'side', secPerRep: 4 }), why: 'Mobilise hips and inner thighs', core: false },
      { exercise: 'warmup-sets', dose: { kind: 'sets', label: '2–4 sets', estSec: 180 }, why: 'Progress towards your working weight', core: true },
    ]),
    cool: steps('lower-c', [
      { exercise: 'walk-easy', dose: time(120, { max: 180 }), why: 'Gradually reduce exertion', core: true },
      { exercise: 'quad-stretch', dose: time(30, { per: 'leg' }), why: 'Stretch your quads', core: true },
      { exercise: 'seated-hamstring', dose: time(30, { per: 'leg' }), why: 'Stretch your hamstrings', core: true },
      { exercise: 'hip-flexor-stretch', dose: time(30, { per: 'side' }), why: 'Stretch your hip flexors', core: true },
      { exercise: 'figure-four', dose: time(30, { per: 'side' }), why: 'Stretch your glutes', core: false },
      { exercise: 'calf-stretch', dose: time(30, { per: 'leg' }), why: 'Stretch your calves', core: false },
      { exercise: 'butterfly', dose: time(30, { max: 45 }), why: 'Stretch your hip adductors', core: false },
    ]),
  },
];

export const ACTIVITY_BY_ID = Object.fromEntries(ACTIVITIES.map((a) => [a.id, a])) as Record<
  ActivityId,
  Activity
>;
