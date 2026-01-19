/**
 * Main todos hook - supports both local (in-memory) and shared (backend-synced) modes
 * Refactored for ADR-027 compliance (max 150 lines per function)
 *
 * Architecture:
 * - useTodoSync.ts: Backend sync utilities and optimistic update helpers
 * - useTodoOperations.ts: CRUD operations with optimistic updates
 * - useTodos.ts: Main coordinator (this file)
 *
 * Usage:
 * - useTodos() - Local mode: in-memory only, no API calls
 * - useTodos('list-123') - Shared mode: syncs with backend via API
 */

import { useState, useEffect, useCallback } from 'react';
import { Todo, TodoState, TodoFilter } from '../types/todo';
import {
  convertTodoDates,
  useSyncToBackend,
  SyncToBackendFn,
  RateLimitState,
} from './useTodoSync';
import { useTodoOperations } from './useTodoOperations';
import { buildListUrl } from '../lib/list-manager';
import { logger } from '../lib/logger';

/** Share info for shared lists */
export interface ShareInfo {
  url: string;
  listId: string;
}

/** No-op sync function for local mode - performs no API calls */
const noOpSync: SyncToBackendFn = async () => undefined;

/** Default rate limit state for local mode */
const defaultRateLimitState: RateLimitState = {
  isRateLimited: false,
  retryAfter: 0,
  message: '',
};

/**
 * Main todos hook with dynamic listId support
 * @param listId - Optional list ID. If provided, syncs with backend. If omitted, operates in local mode.
 */
export function useTodos(listId?: string) {
  const isSharedMode = listId !== undefined;

  const [state, setState] = useState<TodoState>({
    todos: [],
    filter: 'active',
  });
  const [isInitialized, setIsInitialized] = useState(!isSharedMode);
  const [isLoading, setIsLoading] = useState(isSharedMode);

  // Only use backend sync in shared mode
  const {
    sync: backendSync,
    rateLimitState: backendRateLimitState,
    clearRateLimitState: backendClearRateLimitState,
  } = useSyncToBackend(listId ?? 'unused');

  // Use no-op sync for local mode, backend sync for shared mode
  const syncToBackend = isSharedMode ? backendSync : noOpSync;
  const rateLimitState = isSharedMode
    ? backendRateLimitState
    : defaultRateLimitState;
  const clearRateLimitState = isSharedMode
    ? backendClearRateLimitState
    : () => {};

  // Fetch todos from backend on mount (only in shared mode)
  useEffect(() => {
    if (!isSharedMode) {
      // Local mode: already initialized, no fetch needed
      return;
    }

    const fetchTodos = async () => {
      try {
        const response = await fetch(`/api/shared/${listId}/sync`);

        if (response.ok) {
          const data = await response.json();
          const todosWithDates = (data.todos || []).map(convertTodoDates);

          setState({
            todos: todosWithDates,
            filter: 'active',
          });
        } else if (response.status === 404) {
          // List doesn't exist yet - start with empty list
          setState({ todos: [], filter: 'active' });
        }
      } catch (error) {
        logger.error({ error }, 'Failed to load todos from backend');
        setState({ todos: [], filter: 'active' });
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    fetchTodos();
  }, [listId, isSharedMode]);

  // Get all CRUD operations from extracted hook
  const operations = useTodoOperations({
    state,
    setState,
    syncToBackend,
  });

  // Filter and sort todos based on current filter
  const getFilteredTodos = useCallback(() => {
    // Sort by sortOrder ascending
    const sortBySortOrder = (todos: Todo[]) => {
      return [...todos].sort((a, b) => a.sortOrder.localeCompare(b.sortOrder));
    };

    // Sort by timestamp descending (most recent first)
    const sortByTimestampDesc = (
      todos: Todo[],
      getTime: (t: Todo) => number
    ) => {
      return [...todos].sort((a, b) => getTime(b) - getTime(a));
    };

    switch (state.filter) {
      case 'active': {
        const active = state.todos.filter(
          (todo) => !todo.completedAt && !todo.deletedAt
        );
        return sortBySortOrder(active);
      }
      case 'completed': {
        const completed = state.todos.filter(
          (todo) => todo.completedAt && !todo.deletedAt
        );
        return sortByTimestampDesc(
          completed,
          (t) => t.completedAt?.getTime() || 0
        );
      }
      case 'recently-deleted': {
        const deleted = state.todos.filter((todo) => todo.deletedAt);
        return sortByTimestampDesc(deleted, (t) => t.deletedAt?.getTime() || 0);
      }
      case 'all':
      default: {
        const nonDeleted = state.todos.filter((todo) => !todo.deletedAt);
        const active = nonDeleted.filter((todo) => !todo.completedAt);
        const completed = nonDeleted.filter((todo) => todo.completedAt);
        return [
          ...sortBySortOrder(active),
          ...sortByTimestampDesc(
            completed,
            (t) => t.completedAt?.getTime() || 0
          ),
        ];
      }
    }
  }, [state.filter, state.todos]);

  const setFilter = useCallback((filter: TodoFilter) => {
    setState((prev) => ({
      ...prev,
      filter,
    }));
  }, []);

  // Build share info for shared mode
  const shareInfo: ShareInfo | undefined =
    isSharedMode && listId ? { url: buildListUrl(listId), listId } : undefined;

  return {
    todos: getFilteredTodos(),
    allTodos: state.todos,
    filter: state.filter,
    isLoading,
    isInitialized,
    isShared: isSharedMode,
    shareInfo,
    setFilter,
    rateLimitState,
    clearRateLimitState,
    ...operations,
  };
}
