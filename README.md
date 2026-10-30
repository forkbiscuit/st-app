# UpDown

Activity-specific warm-ups and cool-downs. Pick what you're doing, get a fresh routine for the muscles it uses, arrange it, then follow it one movement at a time.

**Live prototype:** https://forkbiscuit.github.io/st-app/ (works on phone and desktop, no login)

Specular Theory Senior Product Designer work sample, Option C (creative configuration tool).

- **User:** someone about to run, ski, cycle, hike or lift, phone in one hand.
- **Task:** warm up (or cool down) properly for *this* activity in 5–15 minutes, without planning it.

## Run it locally

Node 20.19+ or 22.12+. No accounts, keys or services.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + static build to dist/ (deployed to Pages on push)
```

## Primary workflow

1. **Warm up** → **Cycle** → **Build my warm-up**. Build again (or **Do another warm-up**) and you get different moves.
2. Switch **Session length** (Quick / Standard / Long) and watch the list and time update. Tap a move to see how to do it and why; **Remove** is there too (with Undo). Drag a move's handle to reorder.
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
| Move pools per activity; exercise library; types | `src/data/activities.ts`, `exercises.ts`, `types.ts` |
| Routine generator (seeded, picks from the pools) | `src/lib/generate.ts` |
| Session length, time estimates, labels | `src/lib/routine.ts` |
| Screens 1–15 | `src/screens/` |
| Shared components | `src/components/` |
| Tokens and styles | `src/styles/tokens.css`, `base.css`, `components.css`, `screens.css` |

**Data model.** Six activities (Run, Ski, Cycle, Hike, Upper body, Lower body), each with a `warm` and `cool` **pool** of steps drawn from a library of about 130 exercises. A step has an exercise, dose, why, and a phase: warm-ups follow RAMP (raise, mobilise, activate, prime); cool-downs stretch then relax, and Cycle eases off on the bike first. Steps can be `key` (main muscles), have a `level` (1 gentle to 3 jumps) and a `group` (alternatives for the same muscle, e.g. three quad stretches, of which a routine uses one). Exercises that need kit (band, rower, bike, roller, ball, bar) say so on the move.

**Generator.** `generateRoutine(activity, mode, length, seed, options)` picks a set number of steps per phase: 4 moves at Quick, 6 at Standard, 8 at Long. Quick's slots go to key moves (or their alternatives), so every length covers the main muscles; the extra moves come from the whole pool. It avoids moves from your last routines for that activity (`recent`, saved with bookmarks), shuffles within each preference, and plays each phase in pool order, so finishers like strides or warm-up sets come last. The seed travels in the action, which keeps the reducer pure. Feedback steers **Do another**: *Too long* → shorter, *Too easy* → longer with harder moves, *Too difficult* or *Pain* → level 1 only, *Too repetitive* or *Wrong focus* → all new moves.

**Routines.** A routine is the user's copy: `{ activity, mode, length, items[] }`, each item `{ uid, stepId, removed, tier }`, where `tier` is the shortest length that includes it. Session length is applied when the routine is read (`resolveRoutine`), not saved into it, so switching lengths never loses the user's order or removals. Long uses the top of each dose range. Bookmarks are full routine snapshots. Storage (`updown:v2`) is checked on load, and unknown activities or steps are dropped.

**Styling.** Colour carries meaning: ember for warm-ups, tide blue for cool-downs. `data-mode` on the phone re-points the `--accent-*` tokens, and components only use those. Titles are Forum; everything else is Archivo; the timer uses condensed Archivo for fixed-width digits. Screens crossfade; in the player, the next movement pushes in from the right while the top bar stays put (View Transitions, set up in `go()` in `App.tsx`). Call-to-action buttons are text only, centred, with no icons; only Skip and small controls carry icons. Timer visuals avoid CSS transitions and filters on anything updated every frame, which froze and flickered in iPhone Safari.

**Typical changes.** Add or edit moves in a pool in `activities.ts` (step ids are `activity-w|c-exercise` and must never be renamed, since bookmarks store them). Add an exercise in `exercises.ts`. Add an activity by adding an `ActivityId` and an `ACTIVITIES` entry. Change how many moves each length gets in `PLAN` in `generate.ts`, and dose scaling in `scaleDose`. Change colour or type in `tokens.css`.

## What works, what's mocked

**Works:** the full flow, reorder (drag or keyboard), remove/undo, session length, timers with pause/skip/side switch, ratings, bookmarks that persist, and feedback that adjusts "Do another warm-up" or "Do another cool-down".

**Mocked:** the build step (a 3-second animation over the rule-based generator, not a model); reminders (shown, never sent); demo animations (abstract loops in place of exercise video). The flowchart's equipment question and free-text activity field aren't built.

**Data:** general fitness guidance, not medical advice. Moves, doses and purposes are compiled from public sources; the cues are written for UpDown.

- **Structure:** RAMP warm-up (Ian Jeffreys); original reference routines from Harvard Health, REI, FIS and PubMed Central.
- **Run:** Brooks Running, USA Triathlon, Keep It Simpelle, NHS, Hospital for Special Surgery, GoodRx.
- **Ski:** Therapeutic Associates, Mt Hotham, PhysioExtra, Keep It Simpelle, The Steadman Clinic, Instep Physiotherapy, SKI Magazine.
- **Cycle:** ROUVY, Cycling UK, Wattbike, Cycling Weekly, CTS TrainRight, pt Health.
- **Hike:** Decathlon, Washington Trails Association, Backpacker, REI.
- **Upper body:** Marathon Handbook, Active.com, BarBend, pt Health.
- **Lower body:** BarBend, Tom's Guide, Cellucor, Garage Gym Reviews, Hospital for Special Surgery.

**Accessibility:** full keyboard use (arrow keys in tile and length groups; Space and arrows to reorder, with announcements), 8:1+ text contrast, visible focus, announced side switches, reduced motion respected. **Gaps:** the countdown isn't read every second; touch reordering needs the handle.

**Before production:** subset the 5.4 MB icon font, real exercise media, real notifications, account-backed bookmarks, a coach or physio review of every pool, and tests for `generate.ts`, `routine.ts`, the reducer and the main flow.

## Design and AI process

**Decisions.** Temperature as the colour system, so warm-up and cool-down read at a glance. One movement per screen with big buttons, because you're mid-stretch. Session length that never undoes your edits.

**Tradeoff.** Routines are generated by rules from sourced pools rather than by a model. Every move has been vetted and the variety is real, but it isn't personal beyond the feedback rules.

**AI tools.** Claude, connected to the FigJam board through the Figma connector, read the numbered wireframes and flowchart, built the prototype, deployed it and verified it with automated screenshots.

**What I corrected:**
- **UI overhaul.** The first build worked but could be better. I moved titles to a serif (Forum), slowed the build screen and added smooth transitions, kept the routine header fixed so only the list scrolls, made mobile full screen, restyled toasts to match the app, and stripped icons from the main buttons so their labels sit centred. Checked on my phone.
- **iPhone Safari.** On my phone the timer's border didn't move and the Next button flickered. Reproduced in WebKit and fixed. Verified frame by frame in WebKit and Chrome.
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
