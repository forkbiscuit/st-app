import { useRef, type KeyboardEvent } from 'react';
import type { Length, Routine } from '../data/types';
import { LENGTHS, minutesLabel, resolveRoutine, totalSeconds } from '../lib/routine';

/**
 * Session length: the adjustable parameter. A segmented radio group whose
 * labels show the real time each option produces for *this* routine,
 * including the user's reorders and removals.
 */
export function LengthControl({ routine, onChange }: { routine: Routine; onChange: (l: Length) => void }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent, i: number) => {
    const delta = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (i + delta + LENGTHS.length) % LENGTHS.length;
    onChange(LENGTHS[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div className="length">
      <p className="length-label" id="length-label">
        Session length
      </p>
      <div className="segmented" role="radiogroup" aria-labelledby="length-label">
        {LENGTHS.map((l, i) => {
          const checked = routine.length === l.id;
          const secs = totalSeconds(resolveRoutine(routine, l.id));
          return (
            <button
              key={l.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={checked ? 0 : -1}
              className={`segment${checked ? ' is-selected' : ''}`}
              onClick={() => onChange(l.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              title={l.hint}
            >
              <span className="segment-name">{l.label}</span>
              <span className="segment-time">{minutesLabel(secs)}</span>
            </button>
          );
        })}
      </div>
      <p className="length-hint">{LENGTHS.find((l) => l.id === routine.length)?.hint}</p>
    </div>
  );
}
