/**
 * Todo reorder operations hook
 * Extracted from useTodoOperations.ts to reduce function length (ADR-027 compliance)
 */

import { useCallback } from 'react';
import { Todo } from '../types/todo';
import { SyncToBackendFn, SetTodoStateFn } from './useTodoSync';

interface UseTodoReorderProps {
  todos: Todo[];
  setState: SetTodoStateFn;
  syncToBackend: SyncToBackendFn;
}

export function useTodoReorder({
  todos,
  setState,
  syncToBackend,
}: UseTodoReorderProps) {
  const reorderTodos = useCallback(
    async (sourceIndex: number, destinationIndex: number) => {
      const isInvalid =
        sourceIndex < 0 ||
        destinationIndex < 0 ||
        sourceIndex >= todos.length ||
        destinationIndex >= todos.length ||
        sourceIndex === destinationIndex;
      if (isInvalid) return;

      const newTodos = [...todos];
      const [movedTodo] = newTodos.splice(sourceIndex, 1);
      newTodos.splice(destinationIndex, 0, movedTodo);
      const oldTodos = todos;

      setState((prev) => ({ ...prev, todos: newTodos }));
      try {
        await syncToBackend('reorder', newTodos);
      } catch {
        setState((prev) => ({ ...prev, todos: oldTodos }));
      }
    },
    [todos, setState, syncToBackend]
  );

  const moveUp = useCallback(
    async (todoId: string) => {
      const idx = todos.findIndex((t) => t.id === todoId);
      if (idx > 0) await reorderTodos(idx, idx - 1);
    },
    [todos, reorderTodos]
  );

  const moveDown = useCallback(
    async (todoId: string) => {
      const idx = todos.findIndex((t) => t.id === todoId);
      if (idx >= 0 && idx < todos.length - 1) await reorderTodos(idx, idx + 1);
    },
    [todos, reorderTodos]
  );

  return { reorderTodos, moveUp, moveDown };
}
