import { useEffect, useRef, useState } from 'react';
import type { ActivityId, Kit, Mode } from '../data/types';
import { KIT_NAME, kitsFor, movesUsing } from '../lib/equipment';
import { modeWord } from '../lib/routine';
import { Button } from './Button';
import { Icon } from './Icon';

/** "Band pull-aparts, band face pulls and 3 more" */
function summary(moves: string[]): string {
  const names = moves.map((m, i) => (i === 0 ? m : m.charAt(0).toLowerCase() + m.slice(1)));
  if (names.length <= 2) return names.join(' and ');
  const rest = names.length - 2;
  return `${names.slice(0, 2).join(', ')} and ${rest} more`;
}

/**
 * Add equipment, opened from the routine screen. Lists only the kit this
 * routine can use, with the moves each one unlocks. Applying rebuilds the
 * routine with moves for what was added (SET_EQUIPMENT in appState.ts).
 * A bottom sheet on phones, a centred dialog on wide windows.
 */
export function EquipmentSheet({
  activity,
  mode,
  have,
  onApply,
  onClose,
}: {
  activity: ActivityId;
  mode: Mode;
  have: Kit[];
  onApply: (kits: Kit[]) => void;
  onClose: () => void;
}) {
  const offered = kitsFor(activity, mode);
  const [picked, setPicked] = useState<Kit[]>(() => offered.filter((k) => have.includes(k)));
  const changed = offered.some((k) => have.includes(k) !== picked.includes(k));
  const titleRef = useRef<HTMLHeadingElement>(null);
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    titleRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const toggle = (k: Kit) => setPicked((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));

  return (
    <div className="sheet-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="sheet equipment-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="equipment-title"
        aria-describedby="equipment-body"
      >
        <h2 id="equipment-title" ref={titleRef} tabIndex={-1} className="sheet-title">
          Add equipment
        </h2>
        <p id="equipment-body" className="sheet-body">
          Got any of these with you? We’ll swap in moves that use them. Everything works without.
        </p>

        <ul className="kit-list">
          {offered.map((k) => {
            const on = picked.includes(k);
            return (
              <li key={k}>
                <label className={`kit-option${on ? ' is-on' : ''}`}>
                  <input type="checkbox" checked={on} onChange={() => toggle(k)} />
                  <span className="kit-check" aria-hidden="true">
                    <Icon name="check" />
                  </span>
                  <span className="kit-text">
                    <span className="kit-name">{KIT_NAME[k]}</span>
                    <span className="kit-moves">{summary(movesUsing(activity, mode, k))}</span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>

        <div className="sheet-actions">
          <Button onClick={() => (changed ? onApply(picked) : onClose())}>
            {changed ? `Update ${modeWord(mode)}` : 'Done'}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
