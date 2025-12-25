/**
 * Todo CRUD operations hook
 * Extracted from useTodos.ts to reduce function length (ADR-027 compliance)
 */

import { useCallback } from 'react';
import { Todo, TodoState } from '../types/todo';
import {
  generateId,
  SyncToBackendFn,
  SetTodoStateFn,
  createOptimisticUpdate,
} from './useTodoSync';

interface UseTodoOperationsProps {
  state: TodoState;
  setState: SetTodoStateFn;
  syncToBackend: SyncToBackendFn;
}

export function useTodoOperations({
  state,
  setState,
  syncToBackend,
}: UseTodoOperationsProps) {
  const optimisticUpdate = createOptimisticUpdate(setState, syncToBackend);

  const addTodo = useCallback(
    async (text: string) => {
      const trimmedText = text.trim();
      if (!trimmedText) return;
      const now = new Date();
      const newTodo: Todo = {
        id: generateId(),
        text: trimmedText,
        completedAt: undefined,
        createdAt: now,
        updatedAt: now,
      };
      setState((prev) => ({ ...prev, todos: [newTodo, ...prev.todos] }));
      try {
        await syncToBackend('create', newTodo);
      } catch {
        setState((prev) => ({
          ...prev,
          todos: prev.todos.filter((t) => t.id !== newTodo.id),
        }));
      }
    },
    [setState, syncToBackend]
  );

  const toggleTodo = useCallback(
    async (id: string) => {
      const todo = state.todos.find((t) => t.id === id);
      if (!todo) return;

      await optimisticUpdate({
        todoId: id,
        todos: state.todos,
        updateFn: (t) => ({
          ...t,
          completedAt: t.completedAt ? undefined : new Date(),
          updatedAt: new Date(),
        }),
        operation: 'update',
      });
    },
    [state.todos, optimisticUpdate]
  );

  const restoreTodo = useCallback(
    async (id: string) => {
      const todo = state.todos.find((t) => t.id === id);
      if (!todo || !todo.completedAt) return;

      await optimisticUpdate({
        todoId: id,
        todos: state.todos,
        updateFn: (t) => ({
          ...t,
          completedAt: undefined,
          updatedAt: new Date(),
        }),
        operation: 'update',
      });
    },
    [state.todos, optimisticUpdate]
  );

  const deleteTodo = useCallback(
    async (id: string) => {
      const todo = state.todos.find((t) => t.id === id);
      if (!todo) return;

      await optimisticUpdate({
        todoId: id,
        todos: state.todos,
        updateFn: (t) => ({ ...t, deletedAt: new Date() }),
        operation: 'update',
      });
    },
    [state.todos, optimisticUpdate]
  );

  const permanentlyDeleteTodo = useCallback(
    async (id: string) => {
      const todo = state.todos.find((t) => t.id === id);
      if (!todo) return;

      setState((prev) => ({
        ...prev,
        todos: prev.todos.filter((t) => t.id !== id),
      }));

      try {
        await syncToBackend('delete', id);
      } catch {
        setState((prev) => ({ ...prev, todos: [...prev.todos, todo] }));
      }
    },
    [state.todos, setState, syncToBackend]
  );

  const restoreDeletedTodo = useCallback(
    async (id: string) => {
      const todo = state.todos.find((t) => t.id === id);
      if (!todo || !todo.deletedAt) return;

      await optimisticUpdate({
        todoId: id,
        todos: state.todos,
        updateFn: (t) => ({
          ...t,
          deletedAt: undefined,
          updatedAt: new Date(),
        }),
        operation: 'update',
      });
    },
    [state.todos, optimisticUpdate]
  );

  const editTodo = useCallback(
    async (id: string, newText: string) => {
      const trimmedText = newText.trim();
      if (!trimmedText) return;

      const todo = state.todos.find((t) => t.id === id);
      if (!todo) return;

      await optimisticUpdate({
        todoId: id,
        todos: state.todos,
        updateFn: (t) => ({ ...t, text: trimmedText, updatedAt: new Date() }),
        operation: 'update',
      });
    },
    [state.todos, optimisticUpdate]
  );

  const reorderTodos = useCallback(
    async (sourceIndex: number, destinationIndex: number) => {
      const { todos } = state;
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
    [state, setState, syncToBackend]
  );

  const moveUp = useCallback(
    async (todoId: string) => {
      const idx = state.todos.findIndex((t) => t.id === todoId);
      if (idx > 0) await reorderTodos(idx, idx - 1);
    },
    [state.todos, reorderTodos]
  );

  const moveDown = useCallback(
    async (todoId: string) => {
      const idx = state.todos.findIndex((t) => t.id === todoId);
      if (idx >= 0 && idx < state.todos.length - 1)
        await reorderTodos(idx, idx + 1);
    },
    [state.todos, reorderTodos]
  );

  return {
    addTodo,
    toggleTodo,
    restoreTodo,
    deleteTodo,
    permanentlyDeleteTodo,
    restoreDeletedTodo,
    editTodo,
    reorderTodos,
    moveUp,
    moveDown,
  };
}
