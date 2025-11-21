/**
 * Main todos hook - now uses Vercel KV backend for persistence
 * Migrated from localStorage-only to server-backed storage
 * See ADR-029 for architectural decision
 */

import { useState, useEffect, useCallback } from 'react';
import { Todo, TodoState, TodoFilter } from '../types/todo';

// Hardcoded list ID for main app (single list for now)
// Future: unique per-user list IDs (separate issue)
const MAIN_LIST_ID = 'main-list';

// Generate a unique ID compatible with all browsers
function generateId(): string {
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

export function useTodos() {
  const [state, setState] = useState<TodoState>({
    todos: [],
    filter: 'active',
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch todos from backend on mount
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await fetch(`/api/shared/${MAIN_LIST_ID}/sync`);

        if (response.ok) {
          const data = await response.json();
          // Convert date strings back to Date objects
          const todosWithDates = (data.todos || []).map((todo: Partial<Todo> & {
            createdAt: string;
            updatedAt: string;
            deletedAt?: string;
            completedAt?: string;
          }) => ({
            ...todo,
            createdAt: new Date(todo.createdAt),
            updatedAt: new Date(todo.updatedAt),
            deletedAt: todo.deletedAt ? new Date(todo.deletedAt) : undefined,
            completedAt: todo.completedAt ? new Date(todo.completedAt) : undefined,
          }));

          setState({
            todos: todosWithDates,
            filter: 'active',
          });
        } else if (response.status === 404) {
          // List doesn't exist yet - create it empty
          await fetch(`/api/shared/${MAIN_LIST_ID}/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              operation: 'create',
              data: { id: generateId(), text: '', createdAt: new Date(), updatedAt: new Date() },
            }),
          });
          // Start with empty list
          setState({ todos: [], filter: 'active' });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load todos from backend:', error);
        // Start with empty list on error
        setState({ todos: [], filter: 'active' });
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    fetchTodos();
  }, []);

  // Helper to sync operation to backend
  const syncToBackend = useCallback(async (operation: string, data: unknown) => {
    try {
      const response = await fetch(`/api/shared/${MAIN_LIST_ID}/sync`, {
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
  }, []);

  const addTodo = useCallback(async (text: string) => {
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

    // Optimistic update
    setState((prev) => ({
      ...prev,
      todos: [newTodo, ...prev.todos],
    }));

    // Sync to backend
    try {
      await syncToBackend('create', newTodo);
    } catch (error) {
      // Rollback on error
      setState((prev) => ({
        ...prev,
        todos: prev.todos.filter((t) => t.id !== newTodo.id),
      }));
    }
  }, [syncToBackend]);

  const toggleTodo = useCallback(async (id: string) => {
    const todo = state.todos.find((t) => t.id === id);
    if (!todo) return;

    const now = new Date();
    const updatedTodo = {
      ...todo,
      completedAt: todo.completedAt ? undefined : now,
      updatedAt: now,
    };

    // Optimistic update
    setState((prev) => ({
      ...prev,
      todos: prev.todos.map((t) => (t.id === id ? updatedTodo : t)),
    }));

    // Sync to backend
    try {
      await syncToBackend('update', updatedTodo);
    } catch (error) {
      // Rollback on error
      setState((prev) => ({
        ...prev,
        todos: prev.todos.map((t) => (t.id === id ? todo : t)),
      }));
    }
  }, [state.todos, syncToBackend]);

  const restoreTodo = useCallback(async (id: string) => {
    const todo = state.todos.find((t) => t.id === id);
    if (!todo || !todo.completedAt) return;

    const updatedTodo = {
      ...todo,
      completedAt: undefined,
      updatedAt: new Date(),
    };

    setState((prev) => ({
      ...prev,
      todos: prev.todos.map((t) => (t.id === id ? updatedTodo : t)),
    }));

    try {
      await syncToBackend('update', updatedTodo);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        todos: prev.todos.map((t) => (t.id === id ? todo : t)),
      }));
    }
  }, [state.todos, syncToBackend]);

  const deleteTodo = useCallback(async (id: string) => {
    const todo = state.todos.find((t) => t.id === id);
    if (!todo) return;

    const updatedTodo = {
      ...todo,
      deletedAt: new Date(),
    };

    setState((prev) => ({
      ...prev,
      todos: prev.todos.map((t) => (t.id === id ? updatedTodo : t)),
    }));

    try {
      await syncToBackend('update', updatedTodo);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        todos: prev.todos.map((t) => (t.id === id ? todo : t)),
      }));
    }
  }, [state.todos, syncToBackend]);

  const permanentlyDeleteTodo = useCallback(async (id: string) => {
    const todo = state.todos.find((t) => t.id === id);
    if (!todo) return;

    // Optimistic removal
    setState((prev) => ({
      ...prev,
      todos: prev.todos.filter((t) => t.id !== id),
    }));

    try {
      await syncToBackend('delete', id);
    } catch (error) {
      // Rollback - add it back
      setState((prev) => ({
        ...prev,
        todos: [...prev.todos, todo],
      }));
    }
  }, [state.todos, syncToBackend]);

  const restoreDeletedTodo = useCallback(async (id: string) => {
    const todo = state.todos.find((t) => t.id === id);
    if (!todo || !todo.deletedAt) return;

    const updatedTodo = {
      ...todo,
      deletedAt: undefined,
      updatedAt: new Date(),
    };

    setState((prev) => ({
      ...prev,
      todos: prev.todos.map((t) => (t.id === id ? updatedTodo : t)),
    }));

    try {
      await syncToBackend('update', updatedTodo);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        todos: prev.todos.map((t) => (t.id === id ? todo : t)),
      }));
    }
  }, [state.todos, syncToBackend]);

  const editTodo = useCallback(async (id: string, newText: string) => {
    const trimmedText = newText.trim();
    if (!trimmedText) return;

    const todo = state.todos.find((t) => t.id === id);
    if (!todo) return;

    const updatedTodo = {
      ...todo,
      text: trimmedText,
      updatedAt: new Date(),
    };

    setState((prev) => ({
      ...prev,
      todos: prev.todos.map((t) => (t.id === id ? updatedTodo : t)),
    }));

    try {
      await syncToBackend('update', updatedTodo);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        todos: prev.todos.map((t) => (t.id === id ? todo : t)),
      }));
    }
  }, [state.todos, syncToBackend]);

  const reorderTodos = useCallback(async (sourceIndex: number, destinationIndex: number) => {
    if (
      sourceIndex < 0 ||
      destinationIndex < 0 ||
      sourceIndex >= state.todos.length ||
      destinationIndex >= state.todos.length ||
      sourceIndex === destinationIndex
    ) {
      return;
    }

    const newTodos = [...state.todos];
    const [movedTodo] = newTodos.splice(sourceIndex, 1);
    newTodos.splice(destinationIndex, 0, movedTodo);

    const oldTodos = state.todos;

    setState((prev) => ({
      ...prev,
      todos: newTodos,
    }));

    try {
      await syncToBackend('reorder', newTodos);
    } catch (error) {
      // Rollback
      setState((prev) => ({
        ...prev,
        todos: oldTodos,
      }));
    }
  }, [state.todos, syncToBackend]);

  const moveUp = useCallback(async (todoId: string) => {
    const currentIndex = state.todos.findIndex((todo) => todo.id === todoId);
    if (currentIndex <= 0) return;

    await reorderTodos(currentIndex, currentIndex - 1);
  }, [state.todos, reorderTodos]);

  const moveDown = useCallback(async (todoId: string) => {
    const currentIndex = state.todos.findIndex((todo) => todo.id === todoId);
    if (currentIndex < 0 || currentIndex >= state.todos.length - 1) return;

    await reorderTodos(currentIndex, currentIndex + 1);
  }, [state.todos, reorderTodos]);

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
    setFilter,
  };
}
