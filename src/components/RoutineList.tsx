import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
} from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { doseLabel, stepNote, type ResolvedStep } from '../lib/routine';
import { Icon } from './Icon';

interface Props {
  steps: ResolvedStep[];
  onReorder: (uids: string[]) => void;
  onRemove: (uid: string) => void;
}

/** A row on its way out, drawn where it was while it slides away. */
interface Ghost {
  step: ResolvedStep;
  index: number;
  top: number;
  height: number;
}

const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Wireframe 7's movement list. Two ways to reorder:
 *  - drag the handle (mouse or touch)
 *  - focus the handle, Space to pick up, arrows to move, Space to drop
 * Tapping a row expands it to explain the move (how and why) and offer Remove.
 *
 * When moves join or leave (switching session length, or Remove), the list
 * animates: rows that stay glide to their new place, new rows slide in from
 * the right, and leaving rows slide out to the left. Reordering by drag has
 * its own motion, so a change of order alone doesn't animate here.
 */
export function RoutineList({ steps, onReorder, onRemove }: Props) {
  const [openUid, setOpenUid] = useState<string | null>(null);
  const rows = useRef(new Map<string, HTMLLIElement>());
  const [ghosts, setGhosts] = useState<Ghost[]>([]);

  // Spot a change in which moves are listed while the old rows are still on
  // screen, and note where every row sits before React updates the list.
  const prev = useRef(steps);
  const pending = useRef<{ before: Map<string, number>; entering: string[] } | null>(null);
  if (prev.current !== steps) {
    const was = new Set(prev.current.map((s) => s.uid));
    const now = new Set(steps.map((s) => s.uid));
    const entering = steps.filter((s) => !was.has(s.uid)).map((s) => s.uid);
    const leaving = prev.current.filter((s) => !now.has(s.uid));
    if ((entering.length || leaving.length) && !reducedMotion()) {
      const before = new Map<string, number>();
      rows.current.forEach((el, uid) => before.set(uid, el.offsetTop));
      pending.current = { before, entering };
      const left = leaving
        .map((s) => ({ s, el: rows.current.get(s.uid) }))
        .filter((x): x is { s: ResolvedStep; el: HTMLLIElement } => Boolean(x.el))
        .map(({ s, el }) => ({ step: s, index: prev.current.indexOf(s), top: el.offsetTop, height: el.offsetHeight }));
      if (left.length) queueMicrotask(() => setGhosts((g) => [...g, ...left]));
    }
    prev.current = steps;
  }

  useLayoutEffect(() => {
    const change = pending.current;
    if (!change) return;
    pending.current = null;
    let order = 0;
    steps.forEach((s) => {
      const el = rows.current.get(s.uid);
      if (!el) return;
      if (change.entering.includes(s.uid)) {
        el.animate(
          [
            { opacity: 0, transform: 'translateX(32px) scale(0.97)' },
            { opacity: 1, transform: 'none' },
          ],
          { duration: 460, delay: 60 + order++ * 50, easing: EASE, fill: 'backwards' },
        );
        return;
      }
      const from = change.before.get(s.uid);
      const dy = from === undefined ? 0 : from - el.offsetTop;
      if (Math.abs(dy) > 0.5) {
        el.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 460, easing: EASE });
      }
    });
  }, [steps]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const nameOf = (id: string | number) => steps.find((s) => s.uid === id)?.name ?? 'move';
  const posOf = (id: string | number) => steps.findIndex((s) => s.uid === id) + 1;
  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up ${nameOf(active.id)}. Position ${posOf(active.id)} of ${steps.length}.`,
    onDragOver: ({ active, over }) =>
      over ? `${nameOf(active.id)} is over position ${posOf(over.id)} of ${steps.length}.` : undefined,
    onDragEnd: ({ active, over }) =>
      over ? `${nameOf(active.id)} dropped at position ${posOf(over.id)} of ${steps.length}.` : `${nameOf(active.id)} dropped.`,
    onDragCancel: ({ active }) => `Moving ${nameOf(active.id)} cancelled.`,
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const uids = steps.map((s) => s.uid);
    onReorder(arrayMove(uids, uids.indexOf(String(active.id)), uids.indexOf(String(over.id))));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={handleDragEnd}
      accessibility={{
        announcements,
        screenReaderInstructions: {
          draggable: 'To reorder, press Space to pick up this move, use the arrow keys to move it, then press Space to drop it.',
        },
      }}
    >
      <SortableContext items={steps.map((s) => s.uid)} strategy={verticalListSortingStrategy}>
        <ol className="move-list">
          {ghosts.map((g) => (
            <GhostRow key={`ghost-${g.step.uid}`} ghost={g} onDone={() => setGhosts((all) => all.filter((x) => x !== g))} />
          ))}
          {steps.map((s, i) => (
            <Row
              key={s.uid}
              register={(el) => {
                if (el) rows.current.set(s.uid, el);
                else rows.current.delete(s.uid);
              }}
              step={s}
              index={i}
              count={steps.length}
              open={openUid === s.uid}
              onToggle={() => setOpenUid(openUid === s.uid ? null : s.uid)}
              onRemove={() => {
                setOpenUid(null);
                onRemove(s.uid);
              }}
            />
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  );
}

/** A copy of a leaving row, drawn in its old place, that slides out and fades. */
function GhostRow({ ghost, onDone }: { ghost: Ghost; onDone: () => void }) {
  const ref = useRef<HTMLLIElement>(null);
  const done = useRef(onDone);
  done.current = onDone;
  useLayoutEffect(() => {
    const anim = ref.current?.animate(
      // Gone before the rows closing the gap reach it, so the two never muddle.
      [
        { opacity: 1, transform: 'none' },
        { opacity: 0, transform: 'translateX(-24px) scale(0.97)', offset: 0.6 },
        { opacity: 0, transform: 'translateX(-32px) scale(0.97)' },
      ],
      { duration: 320, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' },
    );
    if (!anim) return done.current();
    anim.onfinish = () => done.current();
    return () => anim.cancel();
  }, []);
  return (
    <li
      ref={ref}
      className="move-row move-ghost"
      aria-hidden="true"
      style={{ top: ghost.top, height: ghost.height }}
    >
      <div className="move-main">
        <span className="drag-handle">
          <Icon name="drag_indicator" />
        </span>
        <span className="move-toggle">
          <span className="move-num">{ghost.index + 1}</span>
          <span className="move-text">
            <span className="move-name">{ghost.step.name}</span>
            <span className="move-dose">{doseLabel(ghost.step.dose)}</span>
          </span>
          <span className="move-chevron">
            <Icon name="expand_more" />
          </span>
        </span>
      </div>
    </li>
  );
}

function Row({
  register,
  step,
  index,
  count,
  open,
  onToggle,
  onRemove,
}: {
  register: (el: HTMLLIElement | null) => void;
  step: ResolvedStep;
  index: number;
  count: number;
  open: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: step.uid,
  });
  const rowRef = useRef<HTMLLIElement | null>(null);
  const detailId = `move-detail-${step.uid}`;
  const note = stepNote(step);

  // When a row opens near the bottom of the list, bring its detail into view.
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => rowRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 200);
    return () => window.clearTimeout(t);
  }, [open]);

  return (
    <li
      ref={(el) => {
        setNodeRef(el);
        rowRef.current = el;
        register(el);
      }}
      className={`move-row${isDragging ? ' is-dragging' : ''}${open ? ' is-open' : ''}`}
      style={{ transform: CSS.Translate.toString(transform), transition }}
    >
      <div className="move-main">
        <button
          ref={setActivatorNodeRef}
          type="button"
          className="drag-handle"
          aria-label={`Reorder ${step.name}, position ${index + 1} of ${count}`}
          {...attributes}
          {...listeners}
        >
          <Icon name="drag_indicator" />
        </button>
        {/* The whole row is the toggle: tap to see how and why, tap again (or the chevron) to collapse. */}
        <button
          type="button"
          className="move-toggle"
          aria-expanded={open}
          aria-controls={detailId}
          onClick={onToggle}
        >
          <span className="move-num" aria-hidden="true">
            {index + 1}
          </span>
          <span className="move-text">
            <span className="move-name">{step.name}</span>
            <span className="move-dose">{doseLabel(step.dose)}</span>
          </span>
          <span className="move-chevron" aria-hidden="true">
            <Icon name="expand_more" />
          </span>
        </button>
      </div>

      {/* Always rendered so it can animate open; inert while collapsed. */}
      <div className="move-detail" id={detailId} {...(open ? {} : { inert: '' })} aria-hidden={!open}>
        <div className="move-detail-inner">
          <dl className="move-info">
            <div>
              <dt>How</dt>
              <dd>{step.exercise.how}</dd>
            </div>
            <div>
              <dt>Why</dt>
              <dd>{step.step.why}</dd>
            </div>
            {note && (
              <div>
                <dt>Note</dt>
                <dd>{note}</dd>
              </div>
            )}
          </dl>
          <button type="button" className="chip-btn move-remove" onClick={onRemove}>
            <Icon name="delete" /> Remove
          </button>
        </div>
      </div>
    </li>
  );
}
