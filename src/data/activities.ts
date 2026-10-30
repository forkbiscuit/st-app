import type { Activity, ActivityId, Dose, Mode, PerUnit, Phase, RoutineStep } from './types';

// Warm-up and cool-down pools per activity. A routine is built from a pool
// (src/lib/generate.ts), so every routine can be different.
//
// Warm-ups follow RAMP: raise the pulse, mobilise, activate, then prime for the
// activity. Cool-downs stretch, then relax; Cycle eases off on the bike first.
// Within a phase, picked steps play in pool order, so list the finisher last.
// Doses and purposes come from the sources in the README; each pool notes its main ones.
//
// key    = covers the activity's main muscles; picked first so Quick keeps it.
// level  = 1 gentle, 2 moderate, 3 jumps and bounds (dropped after "Too difficult").
// group  = alternatives for the same job; a routine uses one per group.
// Step ids are `<activity>-<w|c>-<name>` and must never be renamed or reused:
// bookmarks store them.

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
const sets = (label: string, estSec: number): Dose => ({ kind: 'sets', label, estSec });

type StepInput = Omit<RoutineStep, 'id' | 'phase'> & { id?: string };
type PoolInput = Partial<Record<Phase, StepInput[]>>;

/** Flatten a phase-keyed pool into steps with stable ids. */
function pool(activity: ActivityId, mode: Mode, input: PoolInput): RoutineStep[] {
  const prefix = `${activity}-${mode === 'warm' ? 'w' : 'c'}`;
  return (Object.entries(input) as [Phase, StepInput[]][]).flatMap(([phase, steps]) =>
    steps.map((s) => ({ ...s, phase, id: `${prefix}-${s.id ?? s.exercise}` })),
  );
}

// ---------- Run ----------
// Sources: Brooks Running, USA Triathlon, Keep It Simpelle, NHS, HSS, GoodRx.
const run: Activity = {
  id: 'run',
  label: 'Run',
  icon: 'directions_run',
  noun: 'running',
  session: 'run',
  verb: 'run',
  focus: 'Calves, hips and legs',
  loading: { warm: 'Lacing up…', cool: 'Catching your breath…' },
  warm: pool('run', 'warm', {
    raise: [
      { exercise: 'walk', dose: time(120, { max: 300 }), why: 'Gradually raise your heart rate', key: true },
      { exercise: 'jog-easy', dose: time(180, { max: 300 }), why: 'Ease into running at a chatty pace', key: true, level: 2 },
      { exercise: 'march', dose: time(60, { max: 120 }), why: 'Get blood moving before your first stride' },
    ],
    mobilise: [
      { exercise: 'leg-swings', name: 'Forward and back leg swings', dose: reps(10, { max: 15, per: 'leg', secPerRep: 2 }), why: 'Mobilise hips and hamstrings', key: true },
      { exercise: 'leg-swings-side', dose: reps(10, { max: 15, per: 'leg', secPerRep: 2 }), why: 'Open the hips side to side', key: true },
      { exercise: 'ankle-rocks', dose: reps(10, { per: 'ankle', secPerRep: 2 }), why: 'Prepare your ankles for impact', key: true },
      { exercise: 'open-gate', dose: reps(5, { max: 8, per: 'leg', secPerRep: 4 }), why: 'Loosen the hip in every direction' },
      { exercise: 'hamstring-reach', dose: reps(8, { max: 10, per: 'side' }), why: 'Warm your hamstrings and glutes' },
      { exercise: 'heel-toe-walk', dose: time(30), why: 'Wake up your feet and calves' },
      { exercise: 'hip-circles', name: 'Pelvis circles', dose: reps(10, { per: 'direction', secPerRep: 2 }), why: 'Loosen your lower back and hips' },
      { exercise: 'knee-hug-walk', dose: reps(8, { per: 'leg' }), why: 'Open your glutes and hips' },
      { exercise: 'quad-pull-walk', dose: reps(8, { per: 'leg' }), why: 'Ease into the front of your thighs' },
      { exercise: 'worlds-greatest', dose: reps(4, { per: 'side', secPerRep: 6 }), why: 'Open hips and upper back together' },
      { exercise: 'inchworm', dose: reps(5, { secPerRep: 8 }), why: 'Lengthen hamstrings and calves', level: 2 },
    ],
    activate: [
      { exercise: 'walking-lunges', dose: reps(8, { per: 'leg' }), why: 'Activate quads and glutes', key: true },
      { exercise: 'squat', dose: reps(10, { max: 12 }), why: 'Prime quads and glutes', key: true },
      { exercise: 'high-knees', dose: time(30), why: 'Switch on your hip flexors', key: true, level: 2 },
      { exercise: 'glute-bridge', dose: reps(10, { max: 12 }), why: 'Wake up your glutes for push-off' },
      { exercise: 'reverse-lunge-reach', dose: reps(8, { per: 'side', secPerRep: 4 }), why: 'Work your legs and open your hip flexors' },
      { exercise: 'dead-bug', dose: reps(8, { max: 12, per: 'side' }), why: 'Brace your core for good posture' },
      { exercise: 'lateral-lunge', name: 'Side squats', dose: reps(8, { per: 'side', secPerRep: 4 }), why: 'Work the side glutes that keep your hips level' },
      { exercise: 'good-mornings', dose: reps(10, { max: 12 }), why: 'Warm hamstrings and lower back' },
      { exercise: 'calf-raises', dose: reps(15, { secPerRep: 2 }), why: 'Activate your calves' },
      { exercise: 'butt-kicks', dose: time(30), why: 'Prepare your hamstrings', level: 2 },
      { exercise: 'straight-leg-kicks', dose: reps(10, { max: 12, per: 'side', secPerRep: 2 }), why: 'Open the hamstrings dynamically', level: 2 },
      { exercise: 'single-leg-balance', dose: time(30, { per: 'leg' }), why: 'Steady your ankles for uneven ground' },
    ],
    prime: [
      { exercise: 'a-skips', dose: time(20, { max: 30 }), why: 'Drive your knees with quick feet', level: 3 },
      { exercise: 'carioca', dose: time(20, { per: 'side' }), why: 'Loosen your hips sideways at speed', level: 3 },
      { exercise: 'pogo-hops', dose: time(15), why: 'Wake up springy calves', level: 3 },
      { exercise: 'strides', dose: reps(2, { max: 4, secPerRep: 45 }), why: 'Rehearse faster running', key: true, level: 2, note: '15–20 sec each. Walk back to recover.' },
    ],
  }),
  cool: pool('run', 'cool', {
    stretch: [
      { exercise: 'quad-stretch', dose: time(30, { per: 'leg' }), why: 'Stretch your quads', key: true, group: 'quad' },
      { exercise: 'low-lunge-quad', dose: time(30, { per: 'side' }), why: 'Stretch quads and hip flexors together', group: 'quad' },
      { exercise: 'lying-quad', dose: time(20, { per: 'side' }), why: 'Stretch your quads lying down', group: 'quad' },
      { exercise: 'calf-stretch', name: 'Standing calf stretch', dose: time(30, { per: 'leg' }), why: 'Stretch the upper calf', key: true, group: 'calf' },
      { exercise: 'calf-stretch-bent', dose: time(30, { per: 'leg' }), why: 'Reach the lower calf (soleus)', key: true, group: 'soleus' },
      { exercise: 'hamstring-stretch', dose: time(30, { per: 'leg' }), why: 'Stretch the backs of your thighs', key: true, group: 'ham' },
      { exercise: 'seated-hamstring', dose: time(30, { per: 'leg' }), why: 'Stretch your hamstrings sitting down', group: 'ham' },
      { exercise: 'lying-hamstring', dose: time(20, { per: 'leg' }), why: 'Stretch your hamstrings on your back', group: 'ham' },
      { exercise: 'low-lunge', dose: time(30, { per: 'side' }), why: 'Stretch your hip flexors', key: true, group: 'hipflexor' },
      { exercise: 'figure-four', dose: time(30, { per: 'side' }), why: 'Stretch your glutes', key: true, group: 'glute' },
      { exercise: 'standing-figure-four', dose: time(30, { per: 'side' }), why: 'Stretch your glutes standing up', group: 'glute' },
      { exercise: 'pigeon', dose: time(30, { per: 'side' }), why: 'Stretch glutes and hips deeply', group: 'glute', level: 2 },
      { exercise: 'it-band-stretch', dose: time(30, { per: 'side' }), why: 'Stretch the outside of your thigh', group: 'itb' },
      { exercise: 'butterfly', dose: time(30, { max: 45 }), why: 'Stretch your inner thighs', group: 'adductor' },
      { exercise: 'downward-dog', dose: time(30), why: 'Lengthen calves and hamstrings together', group: 'fold' },
    ],
    relax: [
      { exercise: 'knees-to-chest', dose: time(30), why: 'Release your lower back' },
      { exercise: 'supine-twist', dose: time(30, { per: 'side' }), why: 'Unwind your hips and lower back' },
      { exercise: 'legs-up-wall', dose: time(60, { max: 120 }), why: 'Rest your legs' },
      { exercise: 'roll-calves', dose: time(60, { per: 'leg' }), why: 'Ease tight calves' },
    ],
  }),
};

// ---------- Ski ----------
// Sources: Therapeutic Associates, Mt Hotham, PhysioExtra, Keep It Simpelle,
// The Steadman Clinic, Instep Physiotherapy, SKI Magazine.
const ski: Activity = {
  id: 'ski',
  label: 'Ski',
  icon: 'downhill_skiing',
  noun: 'skiing',
  session: 'ski day',
  verb: 'ski',
  focus: 'Quads, glutes and hips',
  loading: { warm: 'Clicking into bindings…', cool: 'Unbuckling boots…' },
  warm: pool('ski', 'warm', {
    raise: [
      { exercise: 'march', dose: time(60, { max: 120 }), why: 'Raise your body temperature', key: true },
      { exercise: 'jumping-jacks', dose: time(30, { max: 60 }), why: 'Get warm fast on a cold morning', level: 2 },
      { exercise: 'walk', name: 'Brisk walk to the lift', dose: time(120), why: 'Raise your heart rate on the way' },
    ],
    mobilise: [
      { exercise: 'leg-swings', name: 'Forward hip swings', dose: reps(10, { per: 'leg', secPerRep: 2 }), why: 'Mobilise hips and hamstrings', key: true },
      { exercise: 'hip-circles', dose: reps(10, { per: 'direction', secPerRep: 2 }), why: 'Loosen your hips', key: true },
      { exercise: 'ankle-rocks', name: 'Ankle dorsiflexion rocks', dose: reps(10, { per: 'ankle', secPerRep: 5 }), why: 'Free up your ankles to flex into the boot', key: true, note: 'Hold each forward rock for 5 sec.' },
      { exercise: 'worlds-greatest', name: 'Thoracic rotation in lunge', dose: reps(5, { max: 10, per: 'side', secPerRep: 5 }), why: 'Open your hips and mid-back for turning' },
      { exercise: 'leg-swings-side', dose: reps(10, { per: 'leg', secPerRep: 2 }), why: 'Open your hips side to side' },
      { exercise: 'knee-circles', dose: reps(10, { per: 'direction', secPerRep: 2 }), why: 'Ease your knees into the day' },
      { exercise: 'open-gate', name: 'Slow march with knee circle', dose: reps(5, { max: 10, per: 'leg', secPerRep: 4 }), why: 'Add side-to-side hip mobility' },
      { exercise: 'windmills', name: 'Trunk twists', dose: reps(6, { max: 10, per: 'side' }), why: 'Loosen your trunk for rotation' },
      { exercise: 'torso-rotations', dose: time(30), why: 'Warm up your spine for turning' },
      { exercise: 'arm-circles', dose: time(20, { per: 'direction' }), why: 'Loosen your shoulders for poling' },
    ],
    activate: [
      { exercise: 'squat', dose: reps(10, { max: 15 }), why: 'Activate quads and glutes for your stance', key: true },
      { exercise: 'lateral-lunge', name: 'Lateral squats', dose: reps(8, { max: 12, per: 'side', secPerRep: 4 }), why: 'Rehearse side-to-side weight shifts', key: true },
      { exercise: 'single-leg-balance', dose: time(30, { per: 'leg' }), why: 'Wake up balance and quick reactions', key: true },
      { exercise: 'glute-bridge', dose: reps(12), why: 'Activate glutes and stabilise your hips' },
      { exercise: 'calf-raises', dose: reps(10, { secPerRep: 2 }), why: 'Ready your calves and ankles for the ski stance' },
      { exercise: 'balance-march', dose: reps(10, { per: 'leg', secPerRep: 3 }), why: 'Prepare hips, knees and balance' },
      { exercise: 'cossack-squat', dose: reps(5, { max: 8, per: 'side', secPerRep: 4 }), why: 'Load deep side-to-side hip positions', level: 2 },
    ],
    prime: [
      { exercise: 'skater-steps', dose: time(30, { max: 45 }), why: 'Rehearse lateral weight shifts', key: true, level: 2 },
      { exercise: 'ski-hops', dose: reps(10, { max: 12, per: 'side', secPerRep: 1 }), why: 'Sharpen quick, light edge changes', level: 3 },
      { exercise: 'squat-jumps', dose: reps(6, { max: 8 }), why: 'Wake up power for bumps and landings', level: 3 },
      { exercise: 'boot-flexes', dose: reps(10, { max: 15, secPerRep: 2 }), why: 'Activate your ankles in the boots', note: 'Boots on, skis on.' },
      { exercise: 'easy-first-run', dose: sets('1 easy run', 240), why: 'Ease into the day before you push on', note: 'Short turns first, then widen them.' },
    ],
  }),
  cool: pool('ski', 'cool', {
    stretch: [
      { exercise: 'quad-stretch', dose: time(30, { per: 'leg' }), why: 'Stretch quads after a day of flexed knees', key: true, group: 'quad', note: 'Boots off first.' },
      { exercise: 'low-lunge-quad', name: 'Lunge stretch', dose: time(30, { per: 'side' }), why: 'Stretch quads and hip flexors together', group: 'quad' },
      { exercise: 'folding-hamstring', dose: time(30, { per: 'leg' }), why: 'Stretch your hamstrings', key: true, group: 'ham' },
      { exercise: 'seated-hamstring', dose: time(30, { per: 'leg' }), why: 'Stretch your hamstrings sitting down', group: 'ham' },
      { exercise: 'lying-hamstring', dose: time(30, { per: 'leg' }), why: 'Stretch your hamstrings on your back', group: 'ham' },
      { exercise: 'calf-stretch', name: 'Lunging calf stretch', dose: time(30, { per: 'leg' }), why: 'Stretch calves stiff from the boots', key: true, group: 'calf' },
      { exercise: 'calf-stretch-bent', dose: time(30, { per: 'leg' }), why: 'Reach the lower calf (soleus)', group: 'soleus' },
      { exercise: 'figure-four', dose: time(30, { per: 'side' }), why: 'Stretch your outer glutes and hips', key: true, group: 'glute' },
      { exercise: 'standing-figure-four', dose: time(30, { per: 'side' }), why: 'Stretch your glutes standing up', group: 'glute' },
      { exercise: 'pigeon', dose: time(30, { per: 'side' }), why: 'Stretch glutes and hips deeply', group: 'glute', level: 2 },
      { exercise: 'hip-flexor-stretch', dose: time(30, { per: 'side' }), why: 'Release your hip flexors', group: 'hipflexor' },
      { exercise: 'it-band-stretch', name: 'Standing hip stretch', dose: time(30, { per: 'side' }), why: 'Stretch the outside of your hips', group: 'itb' },
      { exercise: 'butterfly', dose: time(30, { max: 45 }), why: 'Stretch your inner thighs', group: 'adductor' },
      { exercise: 'seated-twist', dose: time(30, { per: 'side' }), why: 'Unwind your trunk', group: 'twist' },
    ],
    relax: [
      { exercise: 'knees-to-chest', name: 'Lower back release', dose: time(30), why: 'Release your lower back' },
      { exercise: 'childs-pose', dose: time(30, { max: 45 }), why: 'Relax your back and hips' },
      { exercise: 'legs-up-wall', dose: time(60, { max: 120 }), why: 'Rest heavy legs' },
    ],
  }),
};

// ---------- Cycle ----------
// Sources: ROUVY (warm-up and post-ride stretches), Cycling UK, Wattbike,
// Cycling Weekly, CTS TrainRight, pt Health.
const cycle: Activity = {
  id: 'cycle',
  label: 'Cycle',
  icon: 'directions_bike',
  noun: 'cycling',
  session: 'ride',
  verb: 'ride',
  focus: 'Hips, quads and lower back',
  loading: { warm: 'Pumping up the tyres…', cool: 'Clipping out…' },
  warm: pool('cycle', 'warm', {
    raise: [
      { exercise: 'march', dose: time(120), why: 'Raise your heart rate before you clip in', key: true },
      { exercise: 'jumping-jacks', dose: time(60), why: 'Get warm quickly', level: 2 },
    ],
    mobilise: [
      { exercise: 'leg-swings', dose: reps(10, { max: 15, per: 'leg', secPerRep: 2 }), why: 'Loosen your hips and hamstrings', key: true },
      { exercise: 'hip-circles', dose: reps(8, { max: 10, per: 'direction', secPerRep: 2 }), why: 'Ease hip stiffness', key: true },
      { exercise: 'open-gate', name: 'Hip openers', dose: reps(8, { per: 'side', secPerRep: 3 }), why: 'Improve hip mobility' },
      { exercise: 'cat-cow', dose: reps(8, { max: 10, secPerRep: 4 }), why: 'Mobilise your spine for a long time bent over', key: true },
      { exercise: 'torso-rotations', dose: reps(10, { max: 12, secPerRep: 2 }), why: 'Loosen your core and obliques' },
      { exercise: 'arm-circles', dose: time(20, { per: 'direction' }), why: 'Relax your shoulders and upper back' },
      { exercise: 'plank-down-dog', dose: reps(8, { max: 10, secPerRep: 4 }), why: 'Warm calves and hamstrings, switch on your core' },
      { exercise: 'spinal-roll', dose: reps(5, { max: 8, secPerRep: 6 }), why: 'Warm up your spine' },
      { exercise: 'reverse-lunge-twist', dose: reps(6, { max: 10, per: 'side', secPerRep: 4 }), why: 'Open your hips and spine, easy on the knees' },
      { exercise: 'deep-squat-reach', dose: reps(6, { per: 'side', secPerRep: 4 }), why: 'Build flexibility for a lower riding position', level: 2 },
      { exercise: 'shin-box', dose: reps(6, { per: 'side', secPerRep: 4 }), why: 'Work hip rotation both ways', level: 2 },
    ],
    activate: [
      { exercise: 'glute-bridge', dose: reps(10, { max: 12 }), why: 'Wake up your glutes and core', key: true },
      { exercise: 'walking-lunges', dose: reps(8, { per: 'side' }), why: 'Activate quads, glutes and hips', key: true },
      { exercise: 'squat', dose: reps(10, { max: 15 }), why: 'Activate the muscles that drive the pedals' },
      { exercise: 'calf-raises', dose: reps(15, { secPerRep: 2 }), why: 'Prepare calves and ankles for pedalling' },
      { exercise: 'high-knees', dose: time(30, { max: 60 }), why: 'Raise blood flow to your legs', level: 2 },
      { exercise: 'bridge-reach', dose: reps(6, { per: 'side', secPerRep: 4 }), why: 'Link glutes and upper back' },
      { exercise: 'dead-bug', dose: reps(8, { per: 'side' }), why: 'Brace your core for a stable position on the bike' },
    ],
    prime: [
      { exercise: 'bike-build', dose: time(300, { max: 600 }), why: 'Build from very easy to a steady pace', key: true },
      { exercise: 'spin-ups', dose: reps(2, { max: 3, secPerRep: 60 }), why: 'Sharpen your legs before a hard session', level: 2, note: '15–20 sec quick, easy riding between.' },
    ],
  }),
  cool: pool('cycle', 'cool', {
    ease: [
      { exercise: 'spin-down', dose: time(300, { max: 600 }), why: 'Bring your heart rate down before you stop', key: true },
    ],
    stretch: [
      { exercise: 'hip-flexor-stretch', name: 'Half-kneeling hip flexor stretch', dose: time(30, { per: 'side' }), why: 'Open hips that were bent all ride', key: true, group: 'hipflexor' },
      { exercise: 'quad-stretch', dose: time(30, { per: 'leg' }), why: 'Stretch your quads', key: true, group: 'quad' },
      { exercise: 'lying-quad', dose: time(30, { per: 'side' }), why: 'Stretch your quads lying down', group: 'quad' },
      { exercise: 'hamstring-stretch', dose: time(30, { per: 'leg' }), why: 'Stretch your hamstrings', key: true, group: 'ham' },
      { exercise: 'seated-hamstring', dose: time(30, { per: 'leg' }), why: 'Stretch your hamstrings sitting down', group: 'ham' },
      { exercise: 'lying-hamstring', dose: time(30, { per: 'leg' }), why: 'Stretch your hamstrings on your back', group: 'ham' },
      { exercise: 'figure-four', dose: time(30, { per: 'side' }), why: 'Stretch glutes and piriformis', key: true, group: 'glute' },
      { exercise: 'standing-figure-four', dose: time(30, { per: 'side' }), why: 'Stretch your glutes standing up', group: 'glute' },
      { exercise: 'pigeon', dose: time(30, { per: 'side' }), why: 'Stretch glutes, piriformis and hip flexors deeply', group: 'glute', level: 2 },
      { exercise: 'calf-stretch', dose: time(30, { per: 'leg' }), why: 'Stretch calves and Achilles', group: 'calf' },
      { exercise: 'doorway-chest', dose: time(30, { per: 'side' }), why: 'Open your chest after the riding posture', group: 'chest' },
      { exercise: 'lat-stretch', name: 'Kitchen-sink stretch', dose: time(20, { max: 30 }), why: 'Lengthen your lats and back', group: 'lat' },
      { exercise: 'back-arch', dose: reps(5, { secPerRep: 4 }), why: 'Reverse the rounded riding position', group: 'back' },
      { exercise: 'chin-tucks', dose: reps(5, { secPerRep: 4 }), why: 'Ease the base of your neck', group: 'neck' },
      { exercise: 'wall-w', dose: reps(5, { secPerRep: 5 }), why: 'Open chest, shoulders and mid-back', group: 'upperback' },
      { exercise: 'cat-cow', dose: reps(8, { max: 10, secPerRep: 4 }), why: 'Mobilise your spine and lower back', group: 'spine' },
    ],
    relax: [
      { exercise: 'childs-pose', dose: time(30, { max: 45 }), why: 'Relax your lower back, lats and hips' },
      { exercise: 'knees-to-chest', dose: time(30), why: 'Release your lower back' },
      { exercise: 'legs-up-wall', dose: time(60, { max: 120 }), why: 'Rest your legs' },
    ],
  }),
};

// ---------- Hike ----------
// Sources: Decathlon (US and Singapore), Washington Trails Association,
// Backpacker, REI.
const hike: Activity = {
  id: 'hike',
  label: 'Hike',
  icon: 'hiking',
  noun: 'hiking',
  session: 'hike',
  verb: 'hike',
  focus: 'Ankles, calves and quads',
  loading: { warm: 'Checking the trail map…', cool: 'Dropping the pack…' },
  warm: pool('hike', 'warm', {
    raise: [
      { exercise: 'walk', dose: time(120, { max: 180 }), why: 'Increase circulation', key: true },
      { exercise: 'march', dose: time(60, { max: 120 }), why: 'Warm up at the trailhead' },
      { exercise: 'jog-spot', dose: time(60, { max: 120 }), why: 'Get warm fast on a cold start', level: 2 },
    ],
    mobilise: [
      { exercise: 'ankle-circles', dose: reps(10, { per: 'direction', secPerRep: 2 }), why: 'Mobilise your ankles for uneven ground', key: true },
      { exercise: 'leg-swings', dose: reps(10, { per: 'leg', secPerRep: 2 }), why: 'Mobilise your hips', key: true },
      { exercise: 'shoulder-rolls', dose: reps(10, { per: 'direction', secPerRep: 2 }), why: 'Loosen your shoulders for the pack', key: true },
      { exercise: 'hip-circles', dose: reps(10, { per: 'direction', secPerRep: 2 }), why: 'Loosen your hips' },
      { exercise: 'knee-circles', dose: reps(10, { per: 'direction', secPerRep: 2 }), why: 'Warm up your knees for descents' },
      { exercise: 'torso-rotations', dose: time(30), why: 'Mobilise your spine and trunk' },
      { exercise: 'side-bend', dose: reps(10, { per: 'side', secPerRep: 2 }), why: 'Loosen your sides and back' },
      { exercise: 'arm-circles', dose: reps(10, { per: 'direction', secPerRep: 2 }), why: 'Free up your shoulders for poles' },
      { exercise: 'neck-turns', dose: reps(5, { per: 'side', secPerRep: 3 }), why: 'Ease your neck before watching the trail' },
      { exercise: 'open-gate', dose: reps(5, { per: 'leg', secPerRep: 4 }), why: 'Open your hips in every direction' },
    ],
    activate: [
      { exercise: 'calf-raises', dose: reps(15, { secPerRep: 2 }), why: 'Activate your calves for climbs', key: true },
      { exercise: 'squat', dose: reps(10), why: 'Prepare quads and glutes', key: true },
      { exercise: 'glute-bridge', dose: reps(10), why: 'Switch on your glutes for climbing' },
      { exercise: 'walking-lunges', dose: reps(8, { per: 'leg' }), why: 'Activate your legs for long strides' },
      { exercise: 'single-leg-balance', dose: time(30, { per: 'leg' }), why: 'Steady your ankles' },
    ],
    prime: [
      { exercise: 'step-ups', dose: reps(8, { per: 'leg' }), why: 'Rehearse climbing', key: true },
      { exercise: 'reverse-lunge-reach', name: 'Reverse lunges', dose: reps(6, { per: 'side', secPerRep: 4 }), why: 'Prepare your quads to control descents' },
    ],
  }),
  cool: pool('hike', 'cool', {
    stretch: [
      { exercise: 'calf-stretch', name: 'Calf stretch', dose: time(30, { per: 'leg' }), why: 'Stretch calves after climbing', key: true, group: 'calf' },
      { exercise: 'quad-stretch', dose: time(30, { per: 'leg' }), why: 'Stretch quads after descents', key: true, group: 'quad' },
      { exercise: 'low-lunge-quad', dose: time(30, { per: 'side' }), why: 'Stretch quads and hip flexors together', group: 'quad' },
      { exercise: 'hamstring-stretch', name: 'Hamstring stretch on a rock or log', dose: time(30, { per: 'leg' }), why: 'Stretch your hamstrings', key: true, group: 'ham' },
      { exercise: 'seated-hamstring', dose: time(30, { per: 'leg' }), why: 'Stretch your hamstrings sitting down', group: 'ham' },
      { exercise: 'standing-figure-four', dose: time(30, { per: 'side' }), why: 'Stretch your hips and glutes', key: true, group: 'glute' },
      { exercise: 'figure-four', dose: time(30, { per: 'side' }), why: 'Stretch your glutes lying down', group: 'glute' },
      { exercise: 'hip-flexor-stretch', dose: time(30, { per: 'side' }), why: 'Stretch your hip flexors', group: 'hipflexor' },
      { exercise: 'calf-stretch-bent', dose: time(30, { per: 'leg' }), why: 'Reach the lower calf (soleus)', group: 'soleus' },
      { exercise: 'it-band-stretch', dose: time(30, { per: 'side' }), why: 'Stretch your outer thigh and side', group: 'itb' },
      { exercise: 'straddle', name: 'Straddle stretch', dose: time(30, { per: 'side' }), why: 'Stretch hips, hamstrings and inner thighs', group: 'adductor' },
      { exercise: 'forward-fold', dose: time(30), why: 'Stretch hamstrings and lower back', group: 'fold' },
      { exercise: 'cross-body-shoulder', dose: time(30, { per: 'arm' }), why: 'Release shoulders after the pack', group: 'shoulder' },
      { exercise: 'chest-opener', dose: time(30), why: 'Open your chest after carrying a pack', group: 'chest' },
      { exercise: 'triceps-stretch', dose: time(20, { per: 'arm' }), why: 'Stretch arms that worked the poles', group: 'triceps' },
    ],
    relax: [
      { exercise: 'knees-to-chest', name: 'Knee to chest', dose: time(30), why: 'Stretch your glutes and lower back' },
      { exercise: 'legs-up-wall', dose: time(60, { max: 120 }), why: 'Let tired legs rest' },
      { exercise: 'foot-rolling', dose: time(60, { per: 'foot' }), why: 'Gentle massage for tired feet' },
    ],
  }),
};

// ---------- Upper body (gym) ----------
// Sources: Marathon Handbook, Active.com, BarBend, pt Health.
const upper: Activity = {
  id: 'upper',
  label: 'Upper body',
  group: 'Gym',
  icon: 'fitness_center',
  noun: 'upper-body',
  session: 'upper-body session',
  verb: 'lift',
  focus: 'Shoulders, chest and back',
  loading: { warm: 'Chalking up…', cool: 'Racking the weights…' },
  warm: pool('upper', 'warm', {
    raise: [
      { exercise: 'row', dose: time(180), why: 'Increase circulation', key: true },
      { exercise: 'jumping-jacks', dose: time(60), why: 'Raise your heart rate', level: 2 },
      { exercise: 'arm-swings', dose: time(30, { max: 45 }), why: 'Warm your chest and upper back' },
    ],
    mobilise: [
      { exercise: 'arm-circles', dose: reps(15, { per: 'direction', secPerRep: 1 }), why: 'Mobilise your shoulders', key: true },
      { exercise: 'band-dislocates', dose: reps(10, { secPerRep: 4 }), why: 'Take your shoulders through full range', key: true },
      { exercise: 'thoracic-rotations', dose: reps(8, { per: 'side', secPerRep: 4 }), why: 'Improve upper-back rotation', key: true },
      { exercise: 'wall-slides', dose: reps(8, { max: 10, secPerRep: 4 }), why: 'Practise reaching overhead with control' },
      { exercise: 'open-book', dose: reps(6, { per: 'side', secPerRep: 5 }), why: 'Open your chest and mid-back' },
      { exercise: 'cat-cow', dose: reps(8, { secPerRep: 4 }), why: 'Mobilise your spine' },
      { exercise: 'windmills', dose: reps(6, { max: 10, per: 'side' }), why: 'Link shoulders, spine and hips' },
      { exercise: 'shoulder-rolls', dose: reps(10, { per: 'direction', secPerRep: 2 }), why: 'Loosen your neck and traps' },
      { exercise: 'wrist-circles', dose: reps(10, { per: 'direction', secPerRep: 1 }), why: 'Prepare your wrists for pressing' },
    ],
    activate: [
      { exercise: 'band-pull-aparts', dose: reps(15, { secPerRep: 2 }), why: 'Activate rear shoulders and upper back', key: true },
      { exercise: 'scap-pushups', dose: reps(12, { secPerRep: 2 }), why: 'Activate your shoulder-blade stabilisers', key: true },
      { exercise: 'face-pulls', dose: reps(12, { secPerRep: 3 }), why: 'Warm your rear delts' },
      { exercise: 'band-external-rotations', dose: reps(10, { per: 'arm', secPerRep: 2 }), why: 'Prepare your rotator cuff' },
      { exercise: 'ytw-raises', dose: reps(6, { max: 10, secPerRep: 6 }), why: 'Wake up the rotator cuff and upper back', note: 'One of each letter per rep.' },
      { exercise: 'shoulder-squeeze', dose: reps(10, { secPerRep: 3 }), why: 'Set your shoulders before you lift' },
      { exercise: 'band-lateral-raises', dose: reps(12, { secPerRep: 3 }), why: 'Prime your side delts for pressing' },
      { exercise: 'incline-pushups', dose: reps(8, { max: 10 }), why: 'Rehearse pressing at a light load', level: 2 },
      { exercise: 'plank-walks', dose: time(30, { max: 60 }), why: 'Build shoulder stability', level: 2 },
      { exercise: 'scap-pullups', dose: reps(8), why: 'Prepare for pulling overhead', level: 2 },
    ],
    prime: [
      { exercise: 'hand-walkouts', dose: reps(5, { secPerRep: 8 }), why: 'Warm wrists and shoulders under load', level: 2 },
      { exercise: 'warmup-sets', dose: sets('2–4 sets', 180), why: 'Rehearse your first compound lift', key: true },
    ],
  }),
  cool: pool('upper', 'cool', {
    stretch: [
      { exercise: 'doorway-chest', dose: time(30, { per: 'side' }), why: 'Stretch your pecs', key: true, group: 'chest' },
      { exercise: 'chest-opener', dose: time(30), why: 'Open your chest', group: 'chest' },
      { exercise: 'childs-pose-side', dose: time(30, { per: 'side' }), why: 'Stretch your lats', key: true, group: 'lat' },
      { exercise: 'lat-stretch', dose: time(20, { max: 30 }), why: 'Lengthen your lats', group: 'lat' },
      { exercise: 'cross-body-shoulder', dose: time(30, { per: 'arm' }), why: 'Stretch your rear shoulders', key: true, group: 'rear' },
      { exercise: 'triceps-stretch', dose: time(30, { per: 'arm' }), why: 'Stretch your triceps', group: 'triceps' },
      { exercise: 'biceps-wall', dose: time(30, { per: 'arm' }), why: 'Stretch your biceps and front shoulder', group: 'biceps' },
      { exercise: 'thread-needle', dose: time(30, { per: 'side' }), why: 'Mobilise your upper back', group: 'upperback' },
      { exercise: 'neck-stretch', dose: time(20, { per: 'side' }), why: 'Ease neck tension', group: 'neck' },
      { exercise: 'wrist-flexor', dose: time(20, { per: 'arm' }), why: 'Ease forearm tightness', group: 'wrist' },
      { exercise: 'wrist-extensor', dose: time(20, { per: 'arm' }), why: 'Ease the top of your forearms', group: 'wrist2' },
      { exercise: 'supine-twist', dose: time(30, { per: 'side' }), why: 'Open your chest and upper back', group: 'twist' },
    ],
    relax: [
      { exercise: 'childs-pose', dose: time(30, { max: 45 }), why: 'Relax your back and shoulders' },
      { exercise: 'box-breathing', dose: time(60, { max: 120 }), why: 'Settle your breathing and heart rate' },
      { exercise: 'roll-upper-back', dose: time(60), why: 'Ease your upper back' },
    ],
  }),
};

// ---------- Lower body (gym) ----------
// Sources: BarBend, Tom's Guide, Cellucor, Garage Gym Reviews, HSS.
const lower: Activity = {
  id: 'lower',
  label: 'Lower body',
  group: 'Gym',
  icon: 'sprint',
  noun: 'lower-body',
  session: 'lower-body session',
  verb: 'lift',
  focus: 'Hips, glutes and legs',
  loading: { warm: 'Loading the bar…', cool: 'Re-racking the bar…' },
  warm: pool('lower', 'warm', {
    raise: [
      { exercise: 'walk-cycle', dose: time(180), why: 'Warm your lower-body muscles', key: true },
      { exercise: 'row', dose: time(180), why: 'Warm up legs, hips and back' },
      { exercise: 'jumping-jacks', dose: time(60), why: 'Raise your heart rate', level: 2 },
    ],
    mobilise: [
      { exercise: 'leg-swings', name: 'Forward and back leg swings', dose: reps(10, { per: 'leg', secPerRep: 2 }), why: 'Mobilise your hips', key: true },
      { exercise: 'hip-90-90', dose: reps(5, { max: 8, per: 'side', secPerRep: 5 }), why: 'Work hip rotation both ways', key: true },
      { exercise: 'ankle-rocks', name: 'Ankle dorsiflexion rocks', dose: reps(10, { per: 'ankle', secPerRep: 2 }), why: 'Free your ankles for a deeper squat', key: true },
      { exercise: 'worlds-greatest', dose: reps(4, { per: 'side', secPerRep: 6 }), why: 'Open hips, hamstrings and upper back' },
      { exercise: 'leg-swings-side', dose: reps(10, { per: 'leg', secPerRep: 2 }), why: 'Open your hips side to side' },
      { exercise: 'hip-circles', dose: reps(10, { per: 'direction', secPerRep: 2 }), why: 'Loosen your hips' },
      { exercise: 'open-gate', dose: reps(6, { per: 'leg', secPerRep: 4 }), why: 'Take your hips through every direction' },
      { exercise: 'deep-squat-reach', dose: reps(6, { per: 'side', secPerRep: 4 }), why: 'Groove a deep squat position' },
      { exercise: 'inchworm', dose: reps(5, { secPerRep: 8 }), why: 'Lengthen hamstrings and calves', level: 2 },
      { exercise: 'cossack-squat', dose: reps(6, { per: 'side', secPerRep: 4 }), why: 'Mobilise hips and inner thighs', level: 2 },
    ],
    activate: [
      { exercise: 'glute-bridge', dose: reps(12), why: 'Activate your glutes', key: true },
      { exercise: 'squat', dose: reps(12), why: 'Groove the squat pattern', key: true },
      { exercise: 'hip-hinge', dose: reps(10), why: 'Practise hip hinging', key: true },
      { exercise: 'band-side-steps', dose: reps(10, { per: 'side', secPerRep: 2 }), why: 'Activate the glutes that steady your knees' },
      { exercise: 'clamshells', dose: reps(12, { max: 20, per: 'side', secPerRep: 2 }), why: 'Target the side glutes for hip stability' },
      { exercise: 'fire-hydrants', dose: reps(10, { per: 'side', secPerRep: 2 }), why: 'Strengthen the outer glutes' },
      { exercise: 'donkey-kicks', dose: reps(10, { per: 'side', secPerRep: 2 }), why: 'Isolate glute drive' },
      { exercise: 'bird-dog', dose: reps(8, { per: 'side', secPerRep: 4 }), why: 'Link glutes and core' },
      { exercise: 'lateral-lunge', dose: reps(6, { per: 'side', secPerRep: 4 }), why: 'Mobilise hips and inner thighs' },
      { exercise: 'single-leg-bridge', dose: reps(8, { per: 'side' }), why: 'Wake up each glute on its own', level: 2 },
      { exercise: 'single-leg-rdl', dose: reps(6, { per: 'side', secPerRep: 4 }), why: 'Load hamstrings with balance', level: 2 },
    ],
    prime: [
      { exercise: 'squat-jumps', dose: reps(5, { max: 6 }), why: 'Wake up power before heavy lifts', level: 3 },
      { exercise: 'warmup-sets', dose: sets('2–4 sets', 180), why: 'Progress towards your working weight', key: true },
    ],
  }),
  cool: pool('lower', 'cool', {
    stretch: [
      { exercise: 'quad-stretch', dose: time(30, { per: 'leg' }), why: 'Stretch your quads', key: true, group: 'quad' },
      { exercise: 'lying-quad', dose: time(30, { per: 'side' }), why: 'Stretch your quads lying down', group: 'quad' },
      { exercise: 'seated-hamstring', dose: time(30, { per: 'leg' }), why: 'Stretch your hamstrings', key: true, group: 'ham' },
      { exercise: 'lying-hamstring', dose: time(30, { per: 'leg' }), why: 'Stretch your hamstrings on your back', group: 'ham' },
      { exercise: 'hip-flexor-stretch', dose: time(30, { per: 'side' }), why: 'Stretch your hip flexors', key: true, group: 'hipflexor' },
      { exercise: 'figure-four', dose: time(30, { per: 'side' }), why: 'Stretch your glutes', key: true, group: 'glute' },
      { exercise: 'pigeon', dose: time(30, { per: 'side' }), why: 'Stretch glutes and hip flexors deeply', group: 'glute', level: 2 },
      { exercise: 'hip-90-90-hold', dose: time(30, { per: 'side' }), why: 'Stretch hip rotators', group: 'rotators' },
      { exercise: 'butterfly', dose: time(30, { max: 45 }), why: 'Stretch your hip adductors', group: 'adductor' },
      { exercise: 'calf-stretch', dose: time(30, { per: 'leg' }), why: 'Stretch your calves', group: 'calf' },
      { exercise: 'seated-it-band', dose: time(30, { per: 'side' }), why: 'Stretch your outer hips', group: 'itb' },
      { exercise: 'downward-dog', dose: time(30), why: 'Lengthen the whole back of your legs', group: 'fold' },
    ],
    relax: [
      { exercise: 'happy-baby', dose: time(30), why: 'Release hips and lower back' },
      { exercise: 'knees-to-chest', dose: time(30), why: 'Release your lower back' },
      { exercise: 'legs-up-wall', dose: time(60, { max: 120 }), why: 'Rest your legs' },
      { exercise: 'roll-quads', dose: time(60), why: 'Ease tight quads' },
    ],
  }),
};

export const ACTIVITIES: Activity[] = [run, ski, cycle, hike, upper, lower];

export const ACTIVITY_BY_ID = Object.fromEntries(ACTIVITIES.map((a) => [a.id, a])) as Record<
  ActivityId,
  Activity
>;

export const isActivityId = (id: unknown): id is ActivityId =>
  typeof id === 'string' && Object.prototype.hasOwnProperty.call(ACTIVITY_BY_ID, id);
