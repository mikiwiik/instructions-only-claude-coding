/**
 * Todo sync utilities - handles backend communication
 * Extracted from useTodos.ts to reduce function length (ADR-027 compliance)
 */

import { useCallback } from 'react';
import { Todo, TodoState } from '../types/todo';

// Hardcoded list ID for main app (single list for now)
// Future: unique per-user list IDs (separate issue)
export const MAIN_LIST_ID = 'main-list';

// Generate a unique ID compatible with all browsers
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return (
    'todo-' +
    Math.random().toString(36).substring(2) +
    '-' +
    Date.now().toString(36)
  );
}

// Convert date strings from API response to Date objects
export function convertTodoDates(
  todo: Partial<Todo> & {
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    completedAt?: string;
  }
): Todo {
  return {
    ...todo,
    createdAt: new Date(todo.createdAt),
    updatedAt: new Date(todo.updatedAt),
    deletedAt: todo.deletedAt ? new Date(todo.deletedAt) : undefined,
    completedAt: todo.completedAt ? new Date(todo.completedAt) : undefined,
  } as Todo;
}

export type SyncToBackendFn = (
  operation: string,
  data: unknown
) => Promise<unknown>;

/**
 * Hook that provides the sync function for backend communication
 */
export function useSyncToBackend(
  listId: string = MAIN_LIST_ID
): SyncToBackendFn {
  return useCallback(
    async (operation: string, data: unknown) => {
      try {
        const response = await fetch(`/api/shared/${listId}/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operation, data }),
        });

        if (!response.ok) {
          throw new Error(`Sync failed: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to sync to backend:', error);
        throw error;
      }
    },
    [listId]
  );
}

export type SetTodoStateFn = React.Dispatch<React.SetStateAction<TodoState>>;

export interface OptimisticUpdateOptions {
  todoId: string;
  todos: Todo[];
  updateFn: (todo: Todo) => Todo;
  operation: string;
  getSyncData?: (updated: Todo) => unknown;
}

/**
 * Generic optimistic update helper for todo operations
 * Handles the common pattern: optimistic update → sync → rollback on error
 */
export function createOptimisticUpdate(
  setState: SetTodoStateFn,
  syncToBackend: SyncToBackendFn
) {
  return async (options: OptimisticUpdateOptions): Promise<void> => {
    const {
      todoId,
      todos,
      updateFn,
      operation,
      getSyncData = (t) => t,
    } = options;

    const todo = todos.find((t) => t.id === todoId);
    if (!todo) return;

    const updatedTodo = updateFn(todo);

    // Optimistic update
    setState((prev) => ({
      ...prev,
      todos: prev.todos.map((t) => (t.id === todoId ? updatedTodo : t)),
    }));

    // Sync to backend
    try {
      await syncToBackend(operation, getSyncData(updatedTodo));
    } catch {
      // Rollback on error
      setState((prev) => ({
        ...prev,
        todos: prev.todos.map((t) => (t.id === todoId ? todo : t)),
      }));
    }
  };
}
