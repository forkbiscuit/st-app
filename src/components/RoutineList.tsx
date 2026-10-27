import { useState } from 'react';
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
  onMove: (uid: string, by: -1 | 1) => void;
  onRemove: (uid: string) => void;
}

/**
 * Wireframe 7's movement list. Three ways to arrange:
 *  - drag the handle (mouse or touch)
 *  - focus the handle, Space to pick up, arrows to move, Space to drop
 *  - open a row's "…" menu and use Move up / Move down / Remove
 */
export function RoutineList({ steps, onReorder, onMove, onRemove }: Props) {
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
              onMove={(by) => onMove(s.uid, by)}
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
  onMove,
  onRemove,
}: {
  step: ResolvedStep;
  index: number;
  count: number;
  open: boolean;
  onToggle: () => void;
  onMove: (by: -1 | 1) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: step.uid,
  });
  const menuId = `row-menu-${step.uid}`;

  return (
    <li
      ref={setNodeRef}
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
        <span className="move-num" aria-hidden="true">
          {index + 1}
        </span>
        <span className="move-text">
          <span className="move-name">{step.name}</span>
          <span className="move-dose">{doseLabel(step.dose)}</span>
        </span>
        <button
          type="button"
          className="icon-btn move-more"
          aria-label={`Options for ${step.name}`}
          aria-expanded={open}
          aria-controls={menuId}
          onClick={onToggle}
        >
          <Icon name="more_horiz" />
        </button>
      </div>
      {open && (
        <div className="move-actions" id={menuId}>
          <button type="button" className="chip-btn" onClick={() => onMove(-1)} disabled={index === 0}>
            <Icon name="keyboard_arrow_up" /> Move up
          </button>
          <button type="button" className="chip-btn" onClick={() => onMove(1)} disabled={index === count - 1}>
            <Icon name="keyboard_arrow_down" /> Move down
          </button>
          <button type="button" className="chip-btn chip-danger" onClick={onRemove}>
            <Icon name="delete" /> Remove
          </button>
        </div>
      )}
    </li>
  );
}
