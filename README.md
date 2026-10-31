# UpDown

Warm-ups and cool-downs built for what you're about to do. Pick the activity, get a fresh routine for the muscles it uses, arrange it, then follow it one move at a time.

- **Web:** https://forkbiscuit.github.io/st-app/ (phone, tablet and desktop, no login)
- **iPhone app:** build it yourself with Xcode, free. See [Run it on your iPhone](#run-it-on-your-iphone).

## What it does

1. **Warm up** or **Cool down**, then pick Run, Ski, Cycle, Hike, Upper body or Lower body.
2. **Build my warm-up** picks a routine from about 130 exercises. Build again, or **Do another**, and you get different moves.
3. Switch **Session length** (Quick, Standard, Long). Tap a move to see how to do it and why, drag to reorder, or remove it.
   Routines assume no equipment. Got a band, foam roller or rower with you? **Add equipment** swaps in moves that use it, and remembers it for that activity.
4. **Start.** One move per screen. Timers fill the screen edge and the Next button; two-sided moves cue the switch.
5. Rate it. Feedback steers the next routine. **Finish** sets a reminder for the matching cool-down (or tomorrow's warm-up).

Bookmark any routine to reuse it. On a laptop, the player runs from the keyboard: **Space** starts, pauses and moves on; **→** skips. Press **X** for testing tools (fast timers, a storage failure, a reset).

## Run it on your iPhone

Free, with your own Apple ID. No paid developer account. You need a Mac, your iPhone and a cable.

**One-time setup**

1. Install **Xcode** from the Mac App Store. Open it once and let it install the iOS components.
2. Install **Node.js** (the LTS version) from nodejs.org.
3. In Terminal:

   ```bash
   git clone https://github.com/forkbiscuit/st-app.git
   cd st-app
   npm install
   npm run ios
   ```

   That builds the app and opens it in Xcode.
4. In Xcode, open **Settings → Accounts**, press **+** and sign in with your Apple ID.
5. In the left sidebar, click **App** (the blue icon at the top). Under **Signing & Capabilities**, set **Team** to *Your Name (Personal Team)*. If Xcode says the bundle identifier isn't available, change `com.forkbiscuit.updown` to something of your own, like `com.yourname.updown`, here and in `capacitor.config.ts`.
6. Plug in your iPhone, unlock it and tap **Trust**. Pick it from the device menu at the top of Xcode.
7. On the iPhone, turn on **Settings → Privacy & Security → Developer Mode** and let it restart. (The switch appears once the phone has been connected to Xcode.)
8. Press **Run** (▶) in Xcode. The first time, the iPhone may say *Untrusted Developer*: go to **Settings → General → VPN & Device Management**, tap your Apple ID and **Trust**. Then open UpDown.

**Every 7 days.** Free signing expires after a week and the app stops opening. Plug in, open the project in Xcode and press **Run** again. Your bookmarks stay.

**Getting updates.** In the `st-app` folder: `git pull`, `npm install`, `npm run ios`, then **Run**.

**What's different in the app:** reminders arrive as real notifications (tap one to jump straight to that activity), moves buzz at the half-way switch and when they finish, and the screen stays on during a routine.

## Run it on your computer

Node 20.19+ or 22.12+. No accounts, keys or services.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + static build to dist/ (deployed to GitHub Pages on push to main)
```

## How it's built

React 18 + TypeScript + Vite, one reducer, no router or state library. The iPhone app wraps the same build with [Capacitor](https://capacitorjs.com) 8 (Swift Package Manager, no CocoaPods).

| What | Where |
| --- | --- |
| State, actions, reducer | `src/state/appState.ts` |
| App shell, view transitions, persistence, X for testing tools | `src/App.tsx` |
| Storage (`localStorage`, checked on load, fails safely) | `src/state/storage.ts` |
| Move pools per activity; exercise library; types | `src/data/activities.ts`, `exercises.ts`, `types.ts` |
| Routine generator (seeded, picks from the pools) | `src/lib/generate.ts` |
| Session length, time estimates, labels | `src/lib/routine.ts` |
| Equipment: what each routine can use, names, rules | `src/lib/equipment.ts`, `src/components/EquipmentSheet.tsx` |
| iPhone-only behaviour: notifications, haptics, keep awake | `src/lib/native.ts` |
| Screens and shared components | `src/screens/`, `src/components/` |
| Tokens and styles (phone first; wider windows in `layout.css`) | `src/styles/` |
| iOS project (Xcode) and its config | `ios/`, `capacitor.config.ts` |
| iOS build check on a GitHub Mac (simulator screenshot) | `.github/workflows/ios.yml` |

**Data model.** Six activities, each with a `warm` and `cool` **pool** of steps from a library of about 130 exercises. A step has an exercise, dose, why, and a phase: warm-ups follow RAMP (raise, mobilise, activate, prime); cool-downs stretch then relax, and Cycle eases off on the bike first. Steps can be `key` (main muscles), have a `level` (1 gentle to 3 jumps) and a `group` (alternatives for the same muscle, e.g. three quad stretches, of which a routine uses one).

**Equipment.** No equipment is assumed. Moves that need kit (resistance band, foam roller, massage ball, pull-up bar, rowing machine) only appear once it's added with **Add equipment** on the routine screen, which is remembered per activity (`equipment` in storage). A bike is assumed for Cycle. The button only shows where the routine has moves that use kit, and the sheet lists only that kit, with the moves it unlocks (`src/lib/equipment.ts`, `EquipmentSheet.tsx`). Applying rebuilds the routine with the same seed and moves for the new kit first, so only those moves change.

**Generator.** `generateRoutine(activity, mode, length, seed, options)` picks a set number of steps per phase: 4 moves at Quick, 6 at Standard, 8 at Long. Quick's slots go to key moves (or their alternatives), so every length covers the main muscles; the extra moves come from the whole pool. It leaves out moves for kit you haven't added, avoids moves from your last routines for that activity (`recent`, saved with bookmarks), breaks ties with a score per move and seed (so adding a move to the pool doesn't reshuffle the rest), and plays each phase in pool order, so finishers like strides or warm-up sets come last. The seed travels in the action, which keeps the reducer pure. Feedback steers **Do another**: *Too long* → shorter, *Too easy* → longer with harder moves, *Too difficult* or *Pain* → level 1 only, *Too repetitive* or *Wrong focus* → all new moves.

**Routines.** A routine is your copy: `{ activity, mode, length, items[], gen }`, each item `{ uid, stepId, removed, tier }`, where `tier` is the shortest length that includes it and `gen` is how it was generated (seed and settings), so it can be rebuilt for new equipment. Session length is applied when the routine is read (`resolveRoutine`), not saved into it, so switching lengths never loses your order or removals. Long uses the top of each dose range. Bookmarks are full routine snapshots. Storage (`updown:v2`) is checked on load, and unknown activities or steps are dropped.

**Layout.** The app fills the window at every size. Phones get the base layout. From 640px wide, content sits in a centred column. From 960px (`WIDE` in `src/lib/useMediaQuery.ts`, kept in step with `layout.css`), each screen has a desktop layout: warm and cool side by side on home, three activities across, routine controls on the left with the moves on the right, and a player built to follow from a few steps back, with large type, a large timer and the whole window edge filling as it runs. Safe areas keep clear of the notch and home indicator in the iPhone app.

**Styling.** Colour carries meaning: ember for warm-ups, tide blue for cool-downs. `data-mode` on the app re-points the `--accent-*` tokens, and components only use those. Titles are Forum; everything else is Archivo; the timer uses condensed Archivo for fixed-width digits. Screens crossfade; in the player, the next movement pushes in from the right while the top bar stays put (View Transitions, set up in `go()` in `App.tsx`). Buttons are text only and centred; only Skip and small controls carry icons. Timer visuals avoid CSS transitions and filters on anything updated every frame, which froze and flickered in iPhone Safari.

**Typical changes.** Add or edit moves in a pool in `activities.ts` (step ids are `activity-w|c-exercise` and must never be renamed, since bookmarks store them). Add an exercise in `exercises.ts`. Add an activity with a new `ActivityId` and an `ACTIVITIES` entry. Change how many moves each length gets in `PLAN` in `generate.ts`, and dose scaling in `scaleDose`. Change colour or type in `tokens.css`. After changing the web app, `npm run ios` puts it in the iPhone app.

## Limits

- **Building a routine** is a short animation over the rule-based generator, not a model.
- **Reminders** are notifications in the iPhone app; on the web they show on the home screen only.
- **Demos** are abstract loops, not exercise video.
- **Storage** is on the device (browser or app); there are no accounts or sync.
- **Accessibility:** full keyboard use, 8:1+ text contrast, visible focus, announced side switches, reduced motion respected. The countdown isn't read every second, and touch reordering needs the handle.

## Sources

General fitness guidance, not medical advice. Moves, doses and purposes are compiled from public sources; the cues are written for UpDown.

- **Structure:** RAMP warm-up (Ian Jeffreys); Harvard Health, REI, FIS and PubMed Central.
- **Run:** Brooks Running, USA Triathlon, Keep It Simpelle, NHS, Hospital for Special Surgery, GoodRx.
- **Ski:** Therapeutic Associates, Mt Hotham, PhysioExtra, Keep It Simpelle, The Steadman Clinic, Instep Physiotherapy, SKI Magazine.
- **Cycle:** ROUVY, Cycling UK, Wattbike, Cycling Weekly, CTS TrainRight, pt Health.
- **Hike:** Decathlon, Washington Trails Association, Backpacker, REI.
- **Upper body:** Marathon Handbook, Active.com, BarBend, pt Health.
- **Lower body:** BarBend, Tom's Guide, Cellucor, Garage Gym Reviews, Hospital for Special Surgery.

## Credits

Forum and Archivo (SIL OFL) via Fontsource; Material Symbols Rounded (Apache 2.0); dnd-kit, React, Vite (MIT); Capacitor (MIT).
