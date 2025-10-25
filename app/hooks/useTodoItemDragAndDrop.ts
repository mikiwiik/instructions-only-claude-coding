import { useEffect, useState, RefObject } from 'react';
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';

export interface UseTodoItemDragAndDropOptions {
  todoId: string;
  isDraggable: boolean;
  itemRef: RefObject<HTMLLIElement | null>;
  dragHandleRef: RefObject<HTMLDivElement | null>;
}

/**
 * Custom hook to handle drag and drop for todo items
 * Cognitive complexity: ≤5
 */
export function useTodoItemDragAndDrop({
  todoId,
  isDraggable,
  itemRef,
  dragHandleRef,
}: UseTodoItemDragAndDropOptions) {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const itemEl = itemRef.current;
    const dragHandleEl = dragHandleRef.current;

    if (!itemEl || !isDraggable) {
      return;
    }

    return combine(
      draggable({
        element: itemEl,
        dragHandle: dragHandleEl || undefined,
        getInitialData: () => ({ type: 'todo-item', todoId }),
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      }),
      dropTargetForElements({
        element: itemEl,
        getData: () => ({ todoId }),
      })
    );
  }, [todoId, isDraggable, itemRef, dragHandleRef]);

  return { isDragging };
}
