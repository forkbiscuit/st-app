import type { Action } from '../state/appState';

/**
 * Test-only autopilot for the iOS build check (.github/workflows/ios.yml).
 * Only built when VITE_SIM_DEMO=1, so it never ships in the real app. It walks
 * from home to a running timer on a fixed schedule while the workflow takes
 * simulator screenshots: home 0–8 s, picker 9–13 s, routine 14–19 s,
 * player intro 20–24 s, timer from 25 s.
 */
export function runSimDemo(dispatch: (a: Action) => void) {
  const at = (sec: number, step: () => void) => window.setTimeout(step, sec * 1000);
  const press = (selector: string) => document.querySelector<HTMLButtonElement>(selector)?.click();
  at(8, () => {
    dispatch({ type: 'START_MODE', mode: 'warm' });
    dispatch({ type: 'PICK_ACTIVITY', activity: 'cycle' });
  });
  at(13, () => dispatch({ type: 'GENERATE', seed: 42 }));
  at(19.5, () => dispatch({ type: 'START_RUN' }));
  at(24.5, () => press('.player .screen-actions .btn-primary'));
}
