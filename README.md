# UpDown

Activity-specific warm-ups and cool-downs. Pick what you're doing, get a short routine built for the muscles it uses, arrange it, then follow it one movement at a time.

Prototype for the Specular Theory Senior Product Designer work sample (Option C: creative configuration tool).

- **User:** someone about to go surfing, skiing, running, hiking or lifting, standing at the car or the gym with a phone in one hand.
- **Task:** get properly warmed up (or cooled down) for *this* activity in 5–15 minutes, without planning it themselves.

## Run it

Requires Node 20.19+ or 22.12+ (Vite 8). No accounts, keys or services.

```bash
npm install
npm run dev        # http://localhost:5173
```

`npm run build` type-checks and writes a static site to `dist/`; `npm run preview` serves it. The build uses relative paths, so `dist/` works from any static host (including GitHub Pages; see `.github/workflows/deploy.yml`).

## Primary workflow (about 2 minutes)

1. **Warm up** → **Surf** → **Build my warm-up**.
2. On the routine: switch **Session length** between Quick, Standard and Long and watch the list and total time change. Drag a move by its handle (or open its **…** menu) to reorder or remove it. **Undo** is in the toast.
3. Tap the **bookmark** icon. The routine, with your order and length, is now under the bookmarks icon on the first screens.
4. **Start warm-up.** Timed moves count down while the screen edge and the Next button fill; two-sided moves cue the switch at half time. Rep moves show the count and a Done button.
5. Rate it. Thumbs down asks what was off. Then **Finish** sets a (simulated) reminder for the matching cool-down.

Turn on **Fast timers** in the reviewer controls (right of the phone, or below it on mobile) to run timers at 10×. **Block browser storage** shows the bookmark error state.

## How it's built

React 18 + TypeScript + Vite. No router or state library; one reducer holds the app.

| Area | Location | Notes |
| --- | --- | --- |
| App shell, screen switch, persistence | `src/App.tsx` | Maps `state.screen` to a screen component. Saves bookmarks and reminders when they change. |
| State + actions | `src/state/appState.ts` | `AppState`, every `Action`, and the `reducer`. Screen ids are commented with their wireframe numbers. |
| Storage | `src/state/storage.ts` | `localStorage` wrapped in try/catch; returns `false` when a write fails. |
| Routine data | `src/data/activities.ts` | Six activities × warm-up and cool-down, with dose, "why" and `core` flag per step. |
| Exercise library | `src/data/exercises.ts` | Name, how-to cue and demo animation type, shared across activities. |
| Types | `src/data/types.ts` | `Activity`, `RoutineStep`, `Dose`, `Routine`, `SavedRoutine`, etc. |
| Routine logic | `src/lib/routine.ts` | Length scaling, time estimates, dose labels. Pure functions. |
| Timer | `src/lib/useTimer.ts` | Pausable rAF timer with a speed multiplier. |
| Screens | `src/screens/*` | `Home` (1), `ActivityPicker` (2–3), `Generating` (5–6), `RoutineScreen` (7), `Player` (8–11), `Complete` (12–14), `Ready` (15), `Bookmarks`. |
| Components | `src/components/*` | `Button`, `RoutineList` (dnd-kit), `LengthControl`, `MotionDemo`, `PerimeterProgress`, `Toast`, etc. |
| Styling | `src/styles/` | `tokens.css` (colour, type, space, radius), `base.css` (reset, phone frame), `components.css`, `screens.css`. |

### Data model

- An **activity** has a standard `warm` and `cool` list of `RoutineStep`s. Each step points at an exercise and supplies its `dose` (time, reps or sets, optionally per side), its purpose (`why`) and whether it's `core`.
- A **routine** is the user's editable copy: `{ activity, mode, length, items }`, where each item is `{ uid, stepId, removed }`. Order lives in `items`; removing a move flags it rather than deleting it, so Undo and "Restore all moves" are trivial.
- **Session length is applied when the routine is read, not stored into it.** `resolveRoutine(routine, length)` filters and scales the steps, so switching Quick → Long → Quick never loses the user's order or removals.
  - *Quick:* core steps only; pulse raisers (walking, rowing) cut to 1 min.
  - *Standard:* every step at the low end of the reference range.
  - *Long:* top of each range; otherwise pulse raisers +1 min, holds +15 sec, reps +25%.
- **Bookmarks** are full routine snapshots (`SavedRoutine`). Opening one links it by id, so later edits update the bookmark.
- **Time estimates** assume 3 sec per rep unless a step sets its own, doubled for per-side moves, plus 8 sec between moves. They're shown as "about N min".

### Styling

Colour carries meaning: ember reds for warm-ups, tide blues for cool-downs. The phone and anything inside it gets `data-mode="warm" | "cool"`, which re-points `--accent-1`, `--accent-2`, `--accent-text` and `--accent-deep`. Components only ever use the `--accent-*` tokens. Tokens derived from the accent (like `--accent-gradient`) are declared on `:root, [data-mode]` so they recompute per mode.

Type is one family, Archivo, used at three widths: expanded for headings, normal for body, condensed for the timer.

## Where to make a typical change

- **Add or edit a routine:** `src/data/activities.ts`. Add a step with an existing exercise id; new exercises go in `src/data/exercises.ts`.
- **Add an activity:** add an `ActivityId` in `types.ts` and an entry in `ACTIVITIES`; the picker grid, generator copy and ready screen pick it up.
- **Change how session length works:** `scaleDose` and `resolveRoutine` in `src/lib/routine.ts`.
- **Change a colour or the type scale:** `src/styles/tokens.css`.
- **Add a screen:** add it to `Screen` and the reducer in `appState.ts`, then to `SCREENS` in `App.tsx`.

## What works, what's mocked

**Works:** the full flow above; reorder by drag, keyboard or menu; remove with undo; restore all; session length; timers with pause, skip and side switch; ratings with reasons; bookmarks that persist across reloads; feedback that adjusts "Give me another" (Too long → shorter, Too easy → longer, Too repetitive → shuffled).

**Mocked:**
- **Generating** is a timed animation. Routines come from the fixed reference data, not a model. The free-text "Add a workout" field from the flowchart isn't built.
- **Reminders** are stored and shown on the home screen but never fire. There are no notifications.
- **Demo animations** are abstract loops per movement pattern (stride, swing, press…), standing in for real exercise video.
- **Equipment** questions from the flowchart are not built. Gym routines assume a band; one hiking cool-down move is marked optional because it needs a ball.

**Data assumptions:** the routine content is general fitness guidance, not medical advice. Ski, Run, Hike, Upper-body and Lower-body routines follow reference routines compiled from public sources (Harvard Health, REI, FIS, PubMed Central). Surf was written to match them (8–12 min warm-up, 5–10 min cool-down, shoulders, back and hips).

## Accessibility

- Every control is reachable and operable by keyboard. Activity tiles and session lengths are radio groups with arrow-key support. Moves reorder by keyboard (Space to pick up, arrows, Space to drop) with screen-reader announcements, or through Move up / Move down.
- Text contrast is 8:1 or better for body and accent text; button labels on the accent gradients are at least 4.6:1. Focus is a 2.5px outline that components can't hide.
- Movement changes move focus to the new movement name; side switches and "time's up" are announced. Reduced-motion settings stop the demo loops and transitions.
- Unavailable buttons stay focusable and explain why when pressed, rather than silently doing nothing.

**Known gaps:** the timer's countdown digits aren't announced every second (by design; it would be noisy), so screen-reader users hear the start, the switch and the end only. Drag-and-drop on touch relies on the handle; there's no long-press on the row. Colour is reinforced by labels and icons everywhere except the progress segments in the player, which also show "N of M" as text.

## Before production

1. **Subset the icon font.** Material Symbols is shipped whole (5.4 MB); switch to codepoints for the ~30 icons used, or to inline SVGs.
2. **Real exercise media** in place of `MotionDemo`, with captions.
3. **Notifications** for reminders (Web Push or native), with permission prompts and quiet hours.
4. **Server-side bookmarks** behind an account, keeping `localStorage` as an offline cache.
5. **Content review** of every routine by a qualified coach or physio; add contraindication notes.
6. **Tests:** unit tests for `routine.ts` and the reducer, plus a Playwright run of the primary workflow.

## Design and AI process

> **To do (Robert):** fill in time per section and the AI correction you want to show. The facts below are a starting point.

- **Key decisions:** temperature as the colour system, so you can tell a warm-up from a cool-down at a glance; one movement per screen with fat buttons, because you're using it mid-stretch; session length applied at read time so it never fights the user's edits.
- **Tradeoff:** routines come from fixed, reviewed reference data rather than a model generating them, which keeps the advice safe and predictable but less personal. The "generating" step is presented honestly as a short build-up, not as AI.
- **AI tools:** Claude, connected to the FigJam board through the Figma connector, read the numbered wireframes and flowchart and built the React prototype, handoff and verification screenshots.
- **AI output corrected:** _(e.g. the first read of the flow included wireframe 4, a leftover from an earlier design; or the reference routines that replaced generated content.)_

| Section | Time |
| --- | --- |
| Planning and wireframes | _to fill_ |
| Prototype build | _to fill_ |
| Graphic | _to fill_ |
| Documentation and verification | _to fill_ |

## Credits

Archivo (SIL Open Font License) via Fontsource. Material Symbols Rounded (Apache 2.0) via the `material-symbols` package. Drag and drop by dnd-kit (MIT). React and Vite (MIT). No templates or starter projects were used.
