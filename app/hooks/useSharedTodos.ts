/**
 * Shared todos hook with optimistic updates and sync queue
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Todo } from '../types/todo';
import type { SyncOperation } from '../types/sync';
import { SyncQueue } from '../lib/sync-queue';
import { useSharedTodoSync } from './useSharedTodoSync';
import { generateInitialSortOrder } from '../lib/lexorank-utils';

interface UseSharedTodosOptions {
  listId: string;
  userId: string;
  initialTodos?: Todo[];
}

export function useSharedTodos({
  listId,
  userId,
  initialTodos = [],
}: UseSharedTodosOptions) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [syncQueue] = useState(() => new SyncQueue());

  // Handle incoming sync events
  const handleSync = useCallback((syncedTodos: Todo[]) => {
    setTodos(syncedTodos);
  }, []);

  // Set up real-time sync
  const { syncState, isConnected } = useSharedTodoSync({
    listId,
    userId,
    onSync: handleSync,
    enabled: true,
  });

  // Optimistic update helper
  const optimisticUpdate = useCallback(
    async (
      operation: SyncOperation,
      updater: (todos: Todo[]) => Todo[],
      data: unknown
    ) => {
      // Apply optimistic update immediately
      setTodos((prev) => updater(prev));

      // Queue sync operation
      await syncQueue.add(operation, listId, data);
    },
    [listId, syncQueue]
  );

  const addTodo = useCallback(
    async (text: string) => {
      const newTodo: Todo = {
        id: crypto.randomUUID(),
        text,
        createdAt: new Date(),
        updatedAt: new Date(),
        sortOrder: generateInitialSortOrder(todos),
      };

      await optimisticUpdate(
        'create',
        (currentTodos) => [newTodo, ...currentTodos],
        newTodo
      );
    },
    [optimisticUpdate, todos]
  );

  const updateTodo = useCallback(
    async (id: string, updates: Partial<Todo>) => {
      await optimisticUpdate(
        'update',
        (todos) =>
          todos.map((todo) =>
            todo.id === id ? { ...todo, ...updates } : todo
          ),
        { id, ...updates }
      );
    },
    [optimisticUpdate]
  );

  const deleteTodo = useCallback(
    async (id: string) => {
      await optimisticUpdate(
        'delete',
        (todos) => todos.filter((todo) => todo.id !== id),
        id
      );
    },
    [optimisticUpdate]
  );

  const toggleTodo = useCallback(
    async (id: string) => {
      const todo = todos.find((t) => t.id === id);
      if (todo) {
        await updateTodo(id, {
          completedAt: todo.completedAt ? undefined : new Date(),
        });
      }
    },
    [todos, updateTodo]
  );

  // Fetch initial todos
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await fetch(`/api/shared/${listId}/sync`);
        if (response.ok) {
          const data = await response.json();
          setTodos(data.todos);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch todos:', error);
      }
    };

    if (listId) {
      fetchTodos();
    }
  }, [listId]);

  return {
    todos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    syncState,
    isConnected,
    queueStatus: syncQueue.getStatus(),
  };
}
