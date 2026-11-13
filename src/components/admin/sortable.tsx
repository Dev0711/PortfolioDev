"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Drag-and-drop reordering (dnd-kit). Works with mouse, touch and keyboard:
 * focus a handle, press Space, move with the arrow keys, Space to drop.
 */
export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  children,
  className,
  layout = "list",
}: {
  items: T[];
  onReorder: (next: T[]) => void;
  children: (item: T, index: number) => ReactNode;
  className?: string;
  layout?: "list" | "grid";
}) {
  const id = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = items.findIndex((item) => item.id === active.id);
    const to = items.findIndex((item) => item.id === over.id);
    if (from < 0 || to < 0) return;
    onReorder(arrayMove(items, from, to));
  }

  return (
    <DndContext id={id} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={layout === "grid" ? rectSortingStrategy : verticalListSortingStrategy}
      >
        <ul className={className}>{items.map((item, index) => children(item, index))}</ul>
      </SortableContext>
    </DndContext>
  );
}

export function SortableRow({
  id,
  children,
  className,
  handleClassName,
  handleLabel = "Drag to reorder",
}: {
  id: string;
  children: ReactNode;
  className?: string;
  handleClassName?: string;
  handleLabel?: string;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn("relative", isDragging && "z-10 opacity-80 shadow-2xl", className)}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        aria-label={handleLabel}
        className={cn(
          "flex size-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-ink-faint hover:bg-surface-2 hover:text-ink active:cursor-grabbing",
          handleClassName,
        )}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      {children}
    </li>
  );
}
