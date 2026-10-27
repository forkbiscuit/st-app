import { useEffect, useRef, useState } from 'react';
import { Button, IconButton } from '../components/Button';
import { MotionDemo } from '../components/MotionDemo';
import { PerimeterProgress } from '../components/PerimeterProgress';
import { doseLabel, modeWord, sideNames, type ResolvedStep } from '../lib/routine';
import { useTimer } from '../lib/useTimer';
import type { Action, AppState } from '../state/appState';

/**
 * Wireframes 8–11: one movement at a time.
 * 8  intro: name, dose, demo, direction, why. Start or Skip.
 * 9  timed moves: big countdown, screen edge and Next button fill as it runs,
 *    two-sided moves cue a switch at half time.
 * 10 done: check mark, Next.
 * Rep and set moves skip the timer: Start shows the count, Done moves on.
 */
export function Player({ state, dispatch }: { state: AppState; dispatch: (a: Action) => void }) {
  const run = state.run;
  const [confirmExit, setConfirmExit] = useState(false);
  if (!run) return null;
  const step = run.steps[run.index];
  if (!step) return null;

  return (
    <div className="screen-body player">
      <header className="player-top">
        <IconButton icon="close" label={`End ${modeWord(state.routine?.mode ?? 'warm')}`} onClick={() => setConfirmExit(true)} />
        <div className="player-progress">
          <span className="player-count">
            {run.index + 1} of {run.steps.length}
          </span>
          <span className="segments" aria-hidden="true">
            {run.steps.map((s, i) => (
              <span
                key={s.uid}
                className={`seg${i < run.index ? (run.skipped.includes(s.uid) ? ' is-skipped' : ' is-done') : ''}${
                  i === run.index ? ' is-current' : ''
                }`}
              />
            ))}
          </span>
        </div>
        <span className="player-top-spacer" />
      </header>

      {/* key resets all per-movement state when the step changes */}
      <Movement
        key={step.uid}
        step={step}
        isLast={run.index === run.steps.length - 1}
        mode={state.routine?.mode ?? 'warm'}
        speed={state.speed}
        paused={confirmExit}
        onDone={() => dispatch({ type: 'STEP_DONE' })}
        onSkip={() => dispatch({ type: 'STEP_SKIP' })}
      />

      {confirmExit && (
        <div className="sheet-backdrop">
          <div className="sheet" role="alertdialog" aria-modal="true" aria-labelledby="exit-title" aria-describedby="exit-body">
            <h2 id="exit-title" className="sheet-title">
              End this {modeWord(state.routine?.mode ?? 'warm')}?
            </h2>
            <p id="exit-body" className="sheet-body">
              You’ve done {run.done.length} of {run.steps.length} moves. You’ll go back to your routine.
            </p>
            <div className="sheet-actions">
              <Button autoFocus onClick={() => setConfirmExit(false)}>
                Keep going
              </Button>
              <Button variant="secondary" onClick={() => dispatch({ type: 'GO', screen: 'routine' })}>
                End {modeWord(state.routine?.mode ?? 'warm')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type Phase = 'intro' | 'active' | 'done';

function Movement({
  step,
  isLast,
  mode,
  speed,
  paused,
  onDone,
  onSkip,
}: {
  step: ResolvedStep;
  isLast: boolean;
  mode: 'warm' | 'cool';
  speed: number;
  paused: boolean;
  onDone: () => void;
  onSkip: () => void;
}) {
  const { dose } = step;
  const timed = dose.kind === 'time';
  const sides = timed && dose.per ? 2 : 1;
  const sideSec = dose.kind === 'time' ? dose.sec : 0;
  const totalSec = sideSec * sides;
  const timer = useTimer(totalSec, speed);
  const [phase, setPhase] = useState<Phase>('intro');
  const [announce, setAnnounce] = useState('');
  const headingRef = useRef<HTMLHeadingElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const nextLabel = isLast ? `Finish ${modeWord(mode)}` : 'Next';

  // Move focus to the new movement so screen readers hear its name.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  // Timed moves finish on their own.
  useEffect(() => {
    if (phase === 'active' && timer.done) {
      setPhase('done');
      setAnnounce(`Time’s up. ${step.name} done.`);
      buzz([60, 60, 60]);
      primaryRef.current?.focus();
    }
  }, [phase, timer.done, step.name]);

  // Half-time switch for two-sided timed moves.
  const side = sides === 2 && timer.elapsed >= sideSec ? 1 : 0;
  const prevSide = useRef(0);
  useEffect(() => {
    if (sides === 2 && side === 1 && prevSide.current === 0) {
      setAnnounce(`Switch to ${sideNames(timed ? dose.per : undefined)[1].toLowerCase()}`);
      buzz([120]);
    }
    prevSide.current = side;
  }, [side, sides, timed, dose]);

  // The exit sheet pauses the timer.
  useEffect(() => {
    if (paused && timer.running) timer.pause();
  }, [paused, timer]);

  // Space toggles pause while a timer is active (unless a button has focus, where Space presses it).
  useEffect(() => {
    if (!timed || phase !== 'active') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== ' ' || (e.target as HTMLElement).closest('button')) return;
      e.preventDefault();
      timer.running ? timer.pause() : timer.start();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [timed, phase, timer]);

  const begin = () => {
    setPhase('active');
    if (timed) {
      timer.start();
      setAnnounce(sides === 2 ? `Started. ${sideNames(dose.per)[0]} first.` : 'Started');
    }
  };

  const remaining = Math.max(0, Math.ceil(totalSec - timer.elapsed));
  const progress = timed ? timer.elapsed / (totalSec || 1) : 0;
  const sideLabel = sides === 2 && dose.kind === 'time' ? sideNames(dose.per)[side] : null;
  const switchingNow = sides === 2 && timer.elapsed >= sideSec && timer.elapsed - sideSec < 1.6 * speed;

  return (
    <>
      {timed && phase !== 'intro' && <PerimeterProgress progress={phase === 'done' ? 1 : progress} />}

      <div className="movement">
        <h1 ref={headingRef} tabIndex={-1} className="movement-name">
          {step.name}
        </h1>
        <p className="movement-dose">{doseLabel(dose)}</p>
        {step.step.note && <p className="movement-note">{step.step.note}</p>}

        <div className="movement-stage">
          {phase === 'intro' && <MotionDemo kind={step.exercise.motion} label={step.name} />}

          {phase === 'active' && timed && (
            <div className="timer-block">
              <p className="timer" aria-hidden="true">
                {fmt(remaining)}
              </p>
              {sideLabel && (
                <p className={`side-label${switchingNow ? ' is-switching' : ''}`}>
                  {switchingNow ? `Switch: ${sideLabel.toLowerCase()}` : sideLabel}
                </p>
              )}
              <button type="button" className="text-btn pause-btn" onClick={timer.running ? timer.pause : timer.start}>
                <span className="icon" aria-hidden="true">
                  {timer.running ? 'pause' : 'play_arrow'}
                </span>
                {timer.running ? 'Pause' : 'Resume'}
              </button>
            </div>
          )}

          {phase === 'active' && !timed && (
            <div className="count-block">
              <MotionDemo kind={step.exercise.motion} label={step.name} />
              <p className="count">{dose.kind === 'reps' ? dose.reps : dose.label.split(' ')[0]}</p>
              <p className="count-unit">
                {dose.kind === 'reps' ? doseLabel(dose).replace(/^\S+\s/, '') : 'sets'}
              </p>
            </div>
          )}

          {phase === 'done' && (
            <div className="done-block">
              <span className="done-check" aria-hidden="true">
                <span className="icon">check</span>
              </span>
              <p className="done-text">Done</p>
            </div>
          )}
        </div>

        {phase !== 'done' && (
          <dl className="movement-info">
            <div>
              <dt>How</dt>
              <dd>{step.exercise.how}</dd>
            </div>
            <div>
              <dt>Why</dt>
              <dd>{step.step.why}</dd>
            </div>
          </dl>
        )}
      </div>

      <p className="sr-only" aria-live="assertive">
        {announce}
      </p>

      <div className="screen-actions">
        {phase === 'intro' && (
          <>
            <Button variant="ghost" iconAfter="skip_next" onClick={onSkip}>
              Skip
            </Button>
            <Button ref={primaryRef} icon="play_arrow" onClick={begin}>
              {timed ? 'Start movement' : 'Start'}
            </Button>
          </>
        )}
        {phase === 'active' && timed && (
          <>
            <Button variant="ghost" iconAfter="skip_next" onClick={onSkip}>
              Skip
            </Button>
            <Button ref={primaryRef} progress={progress} onClick={onDone} aria-label={`${nextLabel}. ${remaining} seconds left.`}>
              {nextLabel}
            </Button>
          </>
        )}
        {phase === 'active' && !timed && (
          <Button ref={primaryRef} icon="check" onClick={onDone}>
            {isLast ? `Done, finish ${modeWord(mode)}` : 'Done'}
          </Button>
        )}
        {phase === 'done' && (
          <Button ref={primaryRef} iconAfter="arrow_forward" onClick={onDone}>
            {nextLabel}
          </Button>
        )}
      </div>
    </>
  );
}

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function buzz(pattern: number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* not supported */
  }
}
