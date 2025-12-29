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
import { useTodoReorder } from './useTodoReorder';
import { generateInitialSortOrder } from '../lib/lexorank-utils';

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
  const reorderOps = useTodoReorder({
    todos: state.todos,
    setState,
    syncToBackend,
  });

  const addTodo = useCallback(
    async (text: string) => {
      const trimmedText = text.trim();
      if (!trimmedText) return;
      const now = new Date();
      const sortOrder = generateInitialSortOrder(state.todos);
      const newTodo: Todo = {
        id: generateId(),
        text: trimmedText,
        completedAt: undefined,
        createdAt: now,
        updatedAt: now,
        sortOrder,
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
    [state.todos, setState, syncToBackend]
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

  return {
    addTodo,
    toggleTodo,
    restoreTodo,
    deleteTodo,
    permanentlyDeleteTodo,
    restoreDeletedTodo,
    editTodo,
    ...reorderOps,
  };
}
