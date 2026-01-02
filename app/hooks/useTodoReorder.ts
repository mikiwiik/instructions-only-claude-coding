/**
 * Todo reorder operations hook using LexoRank for efficient single-todo sync
 *
 * @see ADR-034 for LexoRank decision
 */

import { useCallback } from 'react';
import { Todo } from '../types/todo';
import { SyncToBackendFn, SetTodoStateFn } from './useTodoSync';
import { generateBetweenSortOrder } from '../lib/lexorank-utils';

interface UseTodoReorderProps {
  todos: Todo[];
  setState: SetTodoStateFn;
  syncToBackend: SyncToBackendFn;
}

function isActiveTodo(todo: Todo): boolean {
  return !todo.completedAt && !todo.deletedAt;
}

export function useTodoReorder({
  todos,
  setState,
  syncToBackend,
}: UseTodoReorderProps) {
  const reorderTodos = useCallback(
    async (sourceIndex: number, destinationIndex: number) => {
      // Filter to active todos only for reordering
      const activeTodos = todos.filter(isActiveTodo);

      const isInvalid =
        sourceIndex < 0 ||
        destinationIndex < 0 ||
        sourceIndex >= activeTodos.length ||
        destinationIndex >= activeTodos.length ||
        sourceIndex === destinationIndex;
      if (isInvalid) return;

      const movedTodo = activeTodos[sourceIndex];

      // Build the reordered array to get correct neighbors
      const reorderedActive = [...activeTodos];
      reorderedActive.splice(sourceIndex, 1);
      reorderedActive.splice(destinationIndex, 0, movedTodo);

      // Calculate new sortOrder based on destination neighbors
      const beforeTodo = reorderedActive[destinationIndex - 1];
      const afterTodo = reorderedActive[destinationIndex + 1];

      const newSortOrder = generateBetweenSortOrder(
        beforeTodo?.sortOrder,
        afterTodo?.sortOrder
      );

      const updatedTodo: Todo = {
        ...movedTodo,
        sortOrder: newSortOrder,
        updatedAt: new Date(),
      };

      // Update state: move the todo in array and update sortOrders
      const oldTodos = todos;

      // Build new todos array with reordered active todos
      const completedOrDeleted = todos.filter((t) => !isActiveTodo(t));
      const updatedActive = reorderedActive.map((t) =>
        t.id === updatedTodo.id ? updatedTodo : t
      );
      const finalTodos = [...updatedActive, ...completedOrDeleted];

      setState((prev) => ({ ...prev, todos: finalTodos }));

      try {
        await syncToBackend('reorder-single', updatedTodo);
      } catch {
        setState((prev) => ({ ...prev, todos: oldTodos }));
      }
    },
    [todos, setState, syncToBackend]
  );

  const moveUp = useCallback(
    async (todoId: string) => {
      const activeTodos = todos.filter(isActiveTodo);
      const idx = activeTodos.findIndex((t) => t.id === todoId);
      if (idx > 0) await reorderTodos(idx, idx - 1);
    },
    [todos, reorderTodos]
  );

  const moveDown = useCallback(
    async (todoId: string) => {
      const activeTodos = todos.filter(isActiveTodo);
      const idx = activeTodos.findIndex((t) => t.id === todoId);
      if (idx >= 0 && idx < activeTodos.length - 1)
        await reorderTodos(idx, idx + 1);
    },
    [todos, reorderTodos]
  );

  return { reorderTodos, moveUp, moveDown };
}
