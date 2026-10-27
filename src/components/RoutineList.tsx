import { useEffect, useRef, useState } from 'react';
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
import { doseLabel, type ResolvedStep } from '../lib/routine';
import { Icon } from './Icon';

interface Props {
  steps: ResolvedStep[];
  onReorder: (uids: string[]) => void;
  onRemove: (uid: string) => void;
}

/**
 * Wireframe 7's movement list. Two ways to reorder:
 *  - drag the handle (mouse or touch)
 *  - focus the handle, Space to pick up, arrows to move, Space to drop
 * Tapping a row expands it to explain the move (how and why) and offer Remove.
 */
export function RoutineList({ steps, onReorder, onRemove }: Props) {
  const [openUid, setOpenUid] = useState<string | null>(null);
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
          {steps.map((s, i) => (
            <Row
              key={s.uid}
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

function Row({
  step,
  index,
  count,
  open,
  onToggle,
  onRemove,
}: {
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
            {step.step.note && (
              <div>
                <dt>Note</dt>
                <dd>{step.step.note}</dd>
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
