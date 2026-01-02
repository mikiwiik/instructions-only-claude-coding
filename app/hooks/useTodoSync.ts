/**
 * Todo sync utilities - handles backend communication
 * Extracted from useTodos.ts to reduce function length (ADR-027 compliance)
 */

import { useCallback, useRef, useEffect, useState } from 'react';
import { Todo, TodoState } from '../types/todo';
import { RATE_LIMIT_DEFAULTS, SYNC_CONFIG } from '../lib/config';
import { logger } from '../lib/logger';

/**
 * Error class for rate limit (429) responses.
 * Contains retry timing information from the server.
 */
export class RateLimitError extends Error {
  readonly retryAfter: number;
  readonly limit: number;
  readonly remaining: number;
  readonly reset: number;

  constructor(
    retryAfter: number,
    limit: number,
    remaining: number,
    reset: number
  ) {
    super('Rate limit exceeded. Please try again later.');
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
    this.limit = limit;
    this.remaining = remaining;
    this.reset = reset;
  }
}

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

export interface RateLimitState {
  isRateLimited: boolean;
  retryAfter: number;
  message: string;
}

export interface SyncToBackendResult {
  sync: SyncToBackendFn;
  rateLimitState: RateLimitState;
  clearRateLimitState: () => void;
}

/**
 * Hook that provides the sync function for backend communication.
 * Handles 429 rate limit responses gracefully with retry information.
 */
export function useSyncToBackend(
  listId: string = MAIN_LIST_ID
): SyncToBackendResult {
  const [rateLimitState, setRateLimitState] = useState<RateLimitState>({
    isRateLimited: false,
    retryAfter: 0,
    message: '',
  });

  const clearRateLimitState = useCallback(() => {
    setRateLimitState({
      isRateLimited: false,
      retryAfter: 0,
      message: '',
    });
  }, []);

  const sync = useCallback(
    async (operation: string, data: unknown) => {
      try {
        const response = await fetch(`/api/shared/${listId}/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operation, data }),
        });

        // Handle rate limit response
        if (response.status === 429) {
          const retryAfter = parseInt(
            response.headers.get('Retry-After') ||
              String(RATE_LIMIT_DEFAULTS.RETRY_AFTER_SECONDS),
            10
          );
          const limit = parseInt(
            response.headers.get('X-RateLimit-Limit') ||
              String(RATE_LIMIT_DEFAULTS.LIMIT),
            10
          );
          const remaining = parseInt(
            response.headers.get('X-RateLimit-Remaining') ||
              String(RATE_LIMIT_DEFAULTS.REMAINING),
            10
          );
          const reset = parseInt(
            response.headers.get('X-RateLimit-Reset') ||
              String(RATE_LIMIT_DEFAULTS.RESET),
            10
          );

          // Update state for UI display
          setRateLimitState({
            isRateLimited: true,
            retryAfter,
            message: `Too many requests. Please wait ${retryAfter} seconds.`,
          });

          // Auto-clear after retry period
          setTimeout(() => {
            clearRateLimitState();
          }, retryAfter * 1000);

          throw new RateLimitError(retryAfter, limit, remaining, reset);
        }

        if (!response.ok) {
          throw new Error(`Sync failed: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        logger.error({ error, listId, operation }, 'Failed to sync to backend');
        throw error;
      }
    },
    [listId, clearRateLimitState]
  );

  return { sync, rateLimitState, clearRateLimitState };
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
  rateLimitState: RateLimitState;
  clearRateLimitState: () => void;
}

const DEFAULT_DEBOUNCE_DELAY = SYNC_CONFIG.DEFAULT_DEBOUNCE_DELAY_MS;

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
  const {
    sync: syncToBackend,
    rateLimitState,
    clearRateLimitState,
  } = useSyncToBackend(listId);

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

  return { sync, flush, cancel, rateLimitState, clearRateLimitState };
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
