# UpDown

Activity-specific warm-ups and cool-downs. Pick what you're doing, get a short routine for the muscles it uses, arrange it, then follow it one movement at a time.

**Live prototype:** https://forkbiscuit.github.io/st-app/ (works on phone and desktop, no login)

Specular Theory Senior Product Designer work sample, Option C (creative configuration tool).

- **User:** someone about to surf, ski, run, hike or lift, phone in one hand.
- **Task:** warm up (or cool down) properly for *this* activity in 5–15 minutes, without planning it.

## Run it locally

Node 20.19+ or 22.12+. No accounts, keys or services.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + static build to dist/ (deployed to Pages on push)
```

## Primary workflow

1. **Warm up** → **Surf** → **Build my warm-up**.
2. Switch **Session length** (Quick / Standard / Long) and watch the list and time update. Drag a move's handle to reorder; **…** → **Remove** (with Undo).
3. Tap the **bookmark** icon. Reopen it later from the bookmarks icon on the first screens.
4. **Start warm-up.** Timers fill the screen edge and the Next button; two-sided moves cue the switch.
5. Rate it, then **Finish** sets a simulated reminder for the matching cool-down.

On desktop, reviewer controls beside the phone add **Fast timers** (10×) and **Block browser storage** (shows the save error).

## Code map

React 18 + TypeScript + Vite. One reducer, no router or state library.

| What | Where |
| --- | --- |
| State, actions, reducer | `src/state/appState.ts` (screens commented with wireframe numbers) |
| App shell, view transitions, persistence | `src/App.tsx` |
| Bookmark storage (`localStorage`, fails safely) | `src/state/storage.ts` |
| Routines per activity; exercise library; types | `src/data/activities.ts`, `exercises.ts`, `types.ts` |
| Session length, time estimates, labels | `src/lib/routine.ts` |
| Screens 1–15 | `src/screens/` |
| Shared components | `src/components/` |
| Tokens and styles | `src/styles/tokens.css`, `base.css`, `components.css`, `screens.css` |

**Data model.** An activity has a standard `warm` and `cool` list of steps (exercise, dose, why, `core`). A routine is the user's copy: `{ activity, mode, length, items[] }`, each item `{ uid, stepId, removed }`. Session length is applied when the routine is read (`resolveRoutine`), not saved into it, so switching lengths never loses the user's order or removals. Quick keeps `core` steps; Long uses the top of each range. Bookmarks are full routine snapshots.

**Styling.** Colour carries meaning: ember for warm-ups, tide blue for cool-downs. `data-mode` on the phone re-points the `--accent-*` tokens, and components only use those. Titles are Forum; everything else is Archivo; the timer uses condensed Archivo for fixed-width digits.

**Typical changes.** Edit routines in `activities.ts`. Add an activity by adding an `ActivityId` and an `ACTIVITIES` entry. Change length rules in `scaleDose`. Change colour or type in `tokens.css`.

## What works, what's mocked

**Works:** the full flow, reorder (drag or keyboard), remove/undo, session length, timers with pause/skip/side switch, ratings, bookmarks that persist, and feedback that adjusts "Give me another".

**Mocked:** the build step (a 3-second animation over fixed reference routines, not a model); reminders (shown, never sent); demo animations (abstract loops in place of exercise video). The flowchart's equipment question and free-text activity field aren't built.

**Data:** general fitness guidance, not medical advice. Ski, Run, Hike and gym routines come from reference routines compiled from public sources (Harvard Health, REI, FIS, PubMed Central); Surf was written to match.

**Accessibility:** full keyboard use (arrow keys in tile and length groups; Space and arrows to reorder, with announcements), 8:1+ text contrast, visible focus, announced side switches, reduced motion respected. **Gaps:** the countdown isn't read every second; touch reordering needs the handle.

**Before production:** subset the 5.4 MB icon font, real exercise media, real notifications, account-backed bookmarks, a coach or physio review of every routine, and tests for `routine.ts`, the reducer and the main flow.

## Design and AI process

**Decisions.** Temperature as the colour system, so warm-up and cool-down read at a glance. One movement per screen with big buttons, because you're mid-stretch. Session length that never undoes your edits.

**Tradeoff.** Routines come from fixed, sourced data rather than being generated, which makes them safer and predictable but less personal.

**AI tools.** Claude, connected to the FigJam board through the Figma connector, read the numbered wireframes and flowchart, built the prototype, deployed it and verified it with automated screenshots.

**What I corrected:**
- **UI overhaul.** The first build worked but could be better. I moved titles to a serif (Forum), slowed the build screen and added smooth transitions, kept the routine header fixed so only the list scrolls, made mobile full screen, and restyled toasts to match the app. Checked on my phone.
- **Colour leak.** After a cool-down, the warm-up picker stayed blue. I caught it on device; the fix makes the picker follow the mode just chosen. Verified by a pixel scan of every screen in both directions.
- **Screen 4.** AI's first read of the flow included a leftover wireframe. I cut it.
- **Routine content.** I replaced AI-written routines with sourced reference routines.

**Time (approximate):**

| Section | Time |
| --- | --- |
| Wireframes and flowchart (FigJam) | 90 min |
| Planning with AI (brief, board, questions) | 25 min |
| Prototype build | 25 min |
| UI overhaul and fixes | 40 min |
| Documentation and verification | 15 min |
| Graphic | _to fill_ |

**Credits.** Forum and Archivo (SIL OFL) via Fontsource; Material Symbols Rounded (Apache 2.0); dnd-kit, React, Vite (MIT). No templates or starter projects.
