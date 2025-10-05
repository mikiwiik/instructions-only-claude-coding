/**
 * Tests for useSharedTodos hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useSharedTodos } from '@/hooks/useSharedTodos';
import type { Todo } from '@/types/todo';

// Mock useSharedTodoSync
jest.mock('@/hooks/useSharedTodoSync', () => ({
  useSharedTodoSync: jest.fn(() => ({
    syncState: {
      status: 'synced',
      pendingCount: 0,
      lastSyncTime: Date.now(),
      errors: [],
    },
    isConnected: true,
    hasErrors: false,
  })),
}));

// Mock SyncQueue
jest.mock('@/lib/sync-queue', () => ({
  SyncQueue: jest.fn().mockImplementation(() => ({
    add: jest.fn().mockResolvedValue(undefined),
    getStatus: jest.fn(() => ({
      pendingCount: 0,
      isProcessing: false,
    })),
    processQueue: jest.fn().mockResolvedValue(undefined),
    clear: jest.fn(),
  })),
  getSyncQueue: jest.fn(() => ({
    add: jest.fn().mockResolvedValue(undefined),
    getStatus: jest.fn(() => ({
      pendingCount: 0,
      isProcessing: false,
    })),
  })),
}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ todos: [] }),
  })
) as jest.Mock;

describe('useSharedTodos', () => {
  const initialTodos: Todo[] = [
    {
      id: 'todo-1',
      text: 'Test todo 1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('should initialize with provided todos', () => {
    const { result } = renderHook(() =>
      useSharedTodos({
        listId: 'list-1',
        userId: 'user-1',
        initialTodos,
      })
    );

    expect(result.current.todos).toHaveLength(1);
  });

  it('should fetch todos on mount', async () => {
    renderHook(() =>
      useSharedTodos({
        listId: 'list-1',
        userId: 'user-1',
      })
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/shared/list-1/sync');
    });
  });

  describe('addTodo', () => {
    it.skip('should add todo optimistically', async () => {
      const { result } = renderHook(() =>
        useSharedTodos({
          listId: 'list-1',
          userId: 'user-1',
          initialTodos: [],
        })
      );

      await act(async () => {
        await result.current.addTodo('New todo');
      });

      await waitFor(() => {
        expect(result.current.todos).toHaveLength(1);
      });
      expect(result.current.todos[0].text).toBe('New todo');
    });
  });

  describe('updateTodo', () => {
    it.skip('should update todo optimistically', async () => {
      const { result } = renderHook(() =>
        useSharedTodos({
          listId: 'list-1',
          userId: 'user-1',
          initialTodos,
        })
      );

      await act(async () => {
        await result.current.updateTodo('todo-1', { text: 'Updated text' });
      });

      expect(result.current.todos[0].text).toBe('Updated text');
    });
  });

  describe('deleteTodo', () => {
    it('should delete todo optimistically', async () => {
      const { result } = renderHook(() =>
        useSharedTodos({
          listId: 'list-1',
          userId: 'user-1',
          initialTodos,
        })
      );

      await act(async () => {
        await result.current.deleteTodo('todo-1');
      });

      expect(result.current.todos).toHaveLength(0);
    });
  });

  describe('toggleTodo', () => {
    it.skip('should toggle todo completion status', async () => {
      const { result } = renderHook(() =>
        useSharedTodos({
          listId: 'list-1',
          userId: 'user-1',
          initialTodos,
        })
      );

      await act(async () => {
        await result.current.toggleTodo('todo-1');
      });

      expect(result.current.todos[0].completedAt).toBeDefined();
    });

    it('should not throw if todo not found', async () => {
      const { result } = renderHook(() =>
        useSharedTodos({
          listId: 'list-1',
          userId: 'user-1',
          initialTodos,
        })
      );

      await expect(
        act(async () => {
          await result.current.toggleTodo('non-existent');
        })
      ).resolves.not.toThrow();
    });
  });

  describe('reorderTodos', () => {
    it.skip('should reorder todos', async () => {
      const todos: Todo[] = [
        {
          id: 'todo-1',
          text: 'First',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'todo-2',
          text: 'Second',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const { result } = renderHook(() =>
        useSharedTodos({
          listId: 'list-1',
          userId: 'user-1',
          initialTodos: todos,
        })
      );

      const reordered = [todos[1], todos[0]];

      await act(async () => {
        await result.current.reorderTodos(reordered);
      });

      expect(result.current.todos[0].id).toBe('todo-2');
      expect(result.current.todos[1].id).toBe('todo-1');
    });
  });

  it('should expose sync state', () => {
    const { result } = renderHook(() =>
      useSharedTodos({
        listId: 'list-1',
        userId: 'user-1',
      })
    );

    expect(result.current.syncState).toBeDefined();
    expect(result.current.isConnected).toBe(true);
  });

  it('should expose queue status', () => {
    const { result } = renderHook(() =>
      useSharedTodos({
        listId: 'list-1',
        userId: 'user-1',
      })
    );

    expect(result.current.queueStatus).toBeDefined();
    expect(result.current.queueStatus.pendingCount).toBe(0);
  });
});
