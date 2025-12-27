/**
 * Todo sync utilities - handles backend communication
 * Extracted from useTodos.ts to reduce function length (ADR-027 compliance)
 */

import { useCallback, useRef, useEffect } from 'react';
import { Todo, TodoState } from '../types/todo';

// Hardcoded list ID for main app (single list for now)
// Future: unique per-user list IDs (separate issue)
export const MAIN_LIST_ID = 'main-list';

// Generate a unique ID using cryptographically secure randomness
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback using crypto.getRandomValues (wider browser support than randomUUID)
  // Safe for non-security-sensitive todo IDs (S2245)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join(
      ''
    );
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  // Last resort fallback for environments without crypto (e.g., some test runners)
  return `todo-${Date.now().toString(36)}-${performance.now().toString(36).replace('.', '')}`;
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

export interface DebouncedSyncOptions {
  listId?: string;
  delay?: number;
  leading?: boolean;
}

export interface DebouncedSyncResult {
  sync: (operation: string, data: unknown) => void;
  flush: () => void;
  cancel: () => void;
}

const DEFAULT_DEBOUNCE_DELAY = 300;

/**
 * Hook that provides a debounced sync function to prevent rapid-fire API calls.
 * This is the first line of defense for backend protection (Epic #340).
 *
 * Useful for operations like drag-and-drop reordering where many updates happen quickly.
 *
 * @param options.listId - The list ID to sync to (defaults to MAIN_LIST_ID)
 * @param options.delay - Debounce delay in ms (defaults to 300ms)
 * @param options.leading - If true, execute first call immediately (defaults to false)
 *
 * @returns Object with sync, flush, and cancel methods
 *
 * @example
 * ```typescript
 * const { sync, flush, cancel } = useDebouncedSync({
 *   delay: 300,    // Debounce delay in ms (default: 300)
 *   leading: true, // Execute first call immediately (optional)
 * });
 *
 * sync('update', todoData);  // Debounced - batches rapid calls
 * flush();                   // Execute pending call immediately
 * cancel();                  // Discard pending call
 * ```
 *
 * ## Behavior
 *
 * - **Trailing debounce** (default): Waits for `delay` ms of inactivity before executing
 * - **Leading edge** (`leading: true`): First call executes immediately, subsequent rapid calls debounced
 * - **Cleanup**: Pending calls cancelled on component unmount (no memory leaks)
 *
 * ## When to use
 *
 * | Scenario                          | Recommended Setting                           |
 * | --------------------------------- | --------------------------------------------- |
 * | Drag-and-drop reordering          | `leading: false` (batch all moves)            |
 * | Single user actions (add, toggle) | `leading: true` (immediate feedback)          |
 * | Rapid text editing                | `leading: false, delay: 500` (wait for pause) |
 */
export function useDebouncedSync(
  options: DebouncedSyncOptions = {}
): DebouncedSyncResult {
  const {
    listId = MAIN_LIST_ID,
    delay = DEFAULT_DEBOUNCE_DELAY,
    leading = false,
  } = options;

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingCallRef = useRef<{ operation: string; data: unknown } | null>(
    null
  );
  const hasLeadingCallRef = useRef(false);
  const syncToBackend = useSyncToBackend(listId);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const executePendingCall = useCallback(async () => {
    if (pendingCallRef.current) {
      const { operation, data } = pendingCallRef.current;
      pendingCallRef.current = null;
      hasLeadingCallRef.current = false;
      await syncToBackend(operation, data);
    }
  }, [syncToBackend]);

  const sync = useCallback(
    (operation: string, data: unknown) => {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Store the latest call
      pendingCallRef.current = { operation, data };

      // Leading edge: execute first call immediately
      if (leading && !hasLeadingCallRef.current) {
        hasLeadingCallRef.current = true;
        const { operation: op, data: d } = pendingCallRef.current;
        pendingCallRef.current = null;
        syncToBackend(op, d);
        return;
      }

      // Schedule the debounced execution
      timeoutRef.current = setTimeout(() => {
        executePendingCall();
      }, delay);
    },
    [delay, leading, syncToBackend, executePendingCall]
  );

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    executePendingCall();
  }, [executePendingCall]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    pendingCallRef.current = null;
  }, []);

  return { sync, flush, cancel };
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
