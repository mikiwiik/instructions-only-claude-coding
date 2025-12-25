/**
 * Main todos hook - uses Vercel KV backend for persistence
 * Refactored for ADR-027 compliance (max 150 lines per function)
 *
 * Architecture:
 * - useTodoSync.ts: Backend sync utilities and optimistic update helpers
 * - useTodoOperations.ts: CRUD operations with optimistic updates
 * - useTodos.ts: Main coordinator (this file)
 */

import { useState, useEffect, useCallback } from 'react';
import { TodoState, TodoFilter } from '../types/todo';
import {
  MAIN_LIST_ID,
  convertTodoDates,
  useSyncToBackend,
} from './useTodoSync';
import { useTodoOperations } from './useTodoOperations';

export function useTodos() {
  const [state, setState] = useState<TodoState>({
    todos: [],
    filter: 'active',
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const syncToBackend = useSyncToBackend(MAIN_LIST_ID);

  // Fetch todos from backend on mount
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await fetch(`/api/shared/${MAIN_LIST_ID}/sync`);

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
        // eslint-disable-next-line no-console
        console.error('Failed to load todos from backend:', error);
        setState({ todos: [], filter: 'active' });
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    fetchTodos();
  }, []);

  // Get all CRUD operations from extracted hook
  const operations = useTodoOperations({
    state,
    setState,
    syncToBackend,
  });

  // Filter todos based on current filter
  const getFilteredTodos = useCallback(() => {
    switch (state.filter) {
      case 'active':
        return state.todos.filter(
          (todo) => !todo.completedAt && !todo.deletedAt
        );
      case 'completed':
        return state.todos.filter(
          (todo) => todo.completedAt && !todo.deletedAt
        );
      case 'recently-deleted':
        return state.todos.filter((todo) => todo.deletedAt);
      case 'all':
      default:
        return state.todos.filter((todo) => !todo.deletedAt);
    }
  }, [state.filter, state.todos]);

  const setFilter = useCallback((filter: TodoFilter) => {
    setState((prev) => ({
      ...prev,
      filter,
    }));
  }, []);

  return {
    todos: getFilteredTodos(),
    allTodos: state.todos,
    filter: state.filter,
    isLoading,
    isInitialized,
    setFilter,
    ...operations,
  };
}
