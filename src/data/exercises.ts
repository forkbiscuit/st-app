import type { Exercise } from './types';

// Exercise library. Activity routines reference these by id and supply the
// dose and "why" for their context. Directions are short, plain-language cues
// written for this prototype, not medical guidance.

const list: Exercise[] = [
  // Pulse raisers
  { id: 'walk', name: 'Brisk walking', how: 'Walk at a pace that warms you up but still lets you talk.', motion: 'stride' },
  { id: 'walk-easy', name: 'Gentle walking', how: 'Walk slowly and let your breathing settle.', motion: 'stride' },
  { id: 'row', name: 'Easy rowing machine', how: 'Row at a light, steady effort. Push with the legs, then pull.', motion: 'stride' },
  { id: 'walk-cycle', name: 'Walking or cycling', how: 'Walk briskly or spin an easy gear on a bike.', motion: 'stride' },

  // Dynamic mobility
  { id: 'leg-swings', name: 'Leg swings', how: 'Hold something steady and swing one leg forward and back, letting the range grow.', motion: 'swing' },
  { id: 'leg-swings-side', name: 'Side-to-side leg swings', how: 'Face a wall for balance and swing one leg across your body and out to the side.', motion: 'swing' },
  { id: 'ankle-rocks', name: 'Ankle rocks', how: 'In a split stance, drive your front knee over your toes, keeping the heel down.', motion: 'circle' },
  { id: 'ankle-circles', name: 'Ankle circles', how: 'Lift one foot and draw slow, full circles with your toes.', motion: 'circle' },
  { id: 'arm-circles', name: 'Arm circles and swings', how: 'Make big, relaxed circles with straight arms, then switch direction.', motion: 'circle' },
  { id: 'torso-rotations', name: 'Standing torso rotations', how: 'Feet hip-width, arms loose. Turn side to side and let your arms swing round.', motion: 'twist' },
  { id: 'thoracic-rotations', name: 'Thoracic spine rotations', how: 'On all fours, hand behind your head. Rotate your elbow up to the ceiling, then down.', motion: 'twist' },
  { id: 'worlds-greatest', name: "World's greatest stretch", how: 'Step into a long lunge, drop a hand inside your foot and reach the other arm to the sky.', motion: 'twist' },

  // Activation
  { id: 'squat', name: 'Bodyweight squats', how: 'Sit your hips back and down, chest up, then stand tall.', motion: 'press' },
  { id: 'lateral-lunge', name: 'Lateral lunges', how: 'Step wide to one side, bend that knee and sit back. Push back to the middle.', motion: 'shift' },
  { id: 'glute-bridge', name: 'Glute bridges', how: 'Lie on your back, knees bent. Drive through your heels and lift your hips.', motion: 'press' },
  { id: 'single-leg-balance', name: 'Single-leg balance', how: 'Stand on one leg with a soft knee. Keep your hips level.', motion: 'balance' },
  { id: 'skater-steps', name: 'Skater steps', how: 'Step or hop side to side, landing softly on the outside leg.', motion: 'shift' },
  { id: 'walking-lunges', name: 'Walking lunges', how: 'Step forward into a lunge, back knee towards the ground, then step through.', motion: 'stride' },
  { id: 'high-knees', name: 'High-knee marching', how: 'March on the spot, lifting each knee to hip height.', motion: 'stride' },
  { id: 'butt-kicks', name: 'Butt kicks', how: 'Jog lightly on the spot, flicking your heels up towards your glutes.', motion: 'stride' },
  { id: 'strides', name: 'Easy running strides', how: 'Build up to a fast, relaxed run, then ease off. Walk back to recover.', motion: 'stride' },
  { id: 'calf-raises', name: 'Standing calf raises', how: 'Rise onto the balls of your feet, pause, then lower slowly.', motion: 'press' },
  { id: 'step-ups', name: 'Step-ups', how: 'Step onto a sturdy step or rock, stand fully, then step down with control.', motion: 'press' },
  { id: 'band-pull-aparts', name: 'Band pull-aparts', how: 'Hold a band at shoulder height and pull it apart by squeezing your shoulder blades.', motion: 'open' },
  { id: 'scap-pushups', name: 'Scapular push-ups', how: 'In a plank, keep your arms straight and let your chest sink, then push the floor away.', motion: 'press' },
  { id: 'band-external-rotations', name: 'Band external rotations', how: 'Elbow tucked at your side, rotate your forearm outward against the band.', motion: 'open' },
  { id: 'warmup-sets', name: 'Light warm-up sets', how: 'Do your first lift with an empty bar, then add weight each set. Stay well short of failure.', motion: 'press' },
  { id: 'hip-hinge', name: 'Hip hinge drill', how: 'Soft knees, push your hips back until you feel your hamstrings, then stand tall.', motion: 'press' },
  { id: 'prone-y', name: 'Prone Y raises', how: 'Lie face down, arms in a Y. Lift your arms and chest a little, then lower.', motion: 'open' },
  { id: 'pop-ups', name: 'Pop-up practice', how: 'Lie face down as if on your board, then press up and land in your surf stance.', motion: 'press' },

  // Stretches
  { id: 'quad-stretch', name: 'Standing quad stretch', how: 'Hold your ankle behind you, knees together, and tuck your hips under.', motion: 'hold' },
  { id: 'hip-flexor-stretch', name: 'Kneeling hip flexor stretch', how: 'Kneel in a lunge, squeeze the glute of the back leg and shift your hips forward.', motion: 'hold' },
  { id: 'low-lunge', name: 'Low lunge hip stretch', how: 'Drop into a low lunge with your back knee down. Sink your hips forward.', motion: 'hold' },
  { id: 'figure-four', name: 'Figure-four stretch', how: 'Cross one ankle over the opposite knee and sit back, or pull the leg in lying down.', motion: 'hold' },
  { id: 'calf-stretch', name: 'Wall calf stretch', how: 'Hands on a wall, one foot back with a straight leg and the heel pressed down.', motion: 'hold' },
  { id: 'calf-stretch-standing', name: 'Standing calf stretch', how: 'Step one foot back, keep that leg straight and press the heel down.', motion: 'hold' },
  { id: 'calf-stretch-bent', name: 'Bent-knee calf stretch', how: 'Same position as the calf stretch, but bend the back knee to reach lower down.', motion: 'hold' },
  { id: 'butterfly', name: 'Butterfly stretch', how: 'Sit with the soles of your feet together and let your knees fall open.', motion: 'hold' },
  { id: 'hamstring-stretch', name: 'Hamstring stretch', how: 'Heel on a low step, leg straight. Hinge forward from the hips with a long back.', motion: 'hold' },
  { id: 'seated-hamstring', name: 'Seated hamstring stretch', how: 'Sit with one leg straight and reach towards your toes, keeping your back long.', motion: 'hold' },
  { id: 'foot-rolling', name: 'Foot rolling with a ball', how: 'Roll a ball slowly under the arch of your foot with gentle pressure.', motion: 'circle' },
  { id: 'doorway-chest', name: 'Doorway chest stretch', how: 'Forearm on a door frame at shoulder height. Step through until you feel your chest open.', motion: 'hold' },
  { id: 'chest-opener', name: 'Chest opener', how: 'Clasp your hands behind your back, straighten your arms and lift your chest.', motion: 'hold' },
  { id: 'childs-pose-side', name: "Child's pose with side reach", how: 'Sit back on your heels, arms long. Walk both hands to one side.', motion: 'hold' },
  { id: 'cross-body-shoulder', name: 'Cross-body shoulder stretch', how: 'Bring one arm across your chest and hug it in with the other.', motion: 'hold' },
  { id: 'thread-needle', name: 'Thread the needle', how: 'On all fours, slide one arm under your body and rest that shoulder down.', motion: 'twist' },
  { id: 'triceps-stretch', name: 'Overhead triceps stretch', how: 'Reach one hand down your back and gently press the elbow with the other hand.', motion: 'hold' },
  { id: 'wrist-flexor', name: 'Wrist flexor stretch', how: 'Arm straight, palm up. Gently pull your fingers back towards you.', motion: 'hold' },
  { id: 'neck-stretch', name: 'Neck side stretch', how: 'Drop one ear towards your shoulder and let the opposite shoulder relax down.', motion: 'hold' },
];

export const EXERCISES: Record<string, Exercise> = Object.fromEntries(list.map((e) => [e.id, e]));
