/**
 * Todo item gesture handlers hook
 * Extracted from TodoItem.tsx to reduce component length (ADR-027 compliance)
 */

import { useSwipeGesture } from './useSwipeGesture';
import { useLongPress } from './useLongPress';
import { combineTouchHandlers, TouchHandlers } from '../utils/touchHandlers';

interface UseTodoItemGesturesProps {
  todoId: string;
  isCompleted: boolean;
  isDeleted: boolean;
  isEditing: boolean;
  hasEditHandler: boolean;
  onToggle: (id: string) => void;
  onDelete: () => void;
  onEdit: () => void;
}

export function useTodoItemGestures({
  todoId,
  isCompleted,
  isDeleted,
  isEditing,
  hasEditHandler,
  onToggle,
  onDelete,
  onEdit,
}: UseTodoItemGesturesProps) {
  const swipeGesture = useSwipeGesture({
    onSwipeRight: () => {
      if (isCompleted || isDeleted) return;
      onToggle(todoId);
    },
    onSwipeLeft: () => {
      if (isDeleted) return;
      onDelete();
    },
  });

  const longPressGesture = useLongPress({
    onLongPress: () => {
      if (isEditing || !hasEditHandler || isCompleted || isDeleted) return;
      onEdit();
    },
    delay: 500,
    shouldPreventDefault: false,
  });

  return combineTouchHandlers(
    swipeGesture as TouchHandlers,
    longPressGesture as TouchHandlers
  );
}
