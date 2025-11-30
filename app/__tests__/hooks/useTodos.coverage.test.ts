/**
 * Additional coverage tests for useTodos hook
 * Tests for error handling, rollback scenarios, and edge cases
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useTodos } from '../../hooks/useTodos';

// Mock fetch globally for backend API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Type for fetch options
type FetchOptions = { method?: string; body?: string };

describe('useTodos hook - coverage tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('404 handling - creates empty list when list does not exist', () => {
    it('should create empty list when backend returns 404', async () => {
      let createCalled = false;

      mockFetch.mockImplementation((url: string, options?: FetchOptions) => {
        if (options?.method === 'POST') {
          createCalled = true;
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true }),
          });
        }
        // GET request returns 404
        return Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.resolve({ error: 'List not found' }),
        });
      });

      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Should have called POST to create the list
      expect(createCalled).toBe(true);
      // Should start with empty todos
      expect(result.current.todos).toEqual([]);
    });
  });

  describe('syncToBackend error handling', () => {
    it('should throw error when sync fails with non-ok response', async () => {
      // First request (GET) succeeds
      mockFetch.mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ todos: [] }),
        })
      );

      // POST request fails with non-ok response
      mockFetch.mockImplementation((url: string, options?: FetchOptions) => {
        if (options?.method === 'POST') {
          return Promise.resolve({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            json: () => Promise.resolve({ error: 'Server error' }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ todos: [] }),
        });
      });

      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // addTodo should handle the sync failure and rollback
      await act(async () => {
        await result.current.addTodo('Test todo');
      });

      // Todo should be rolled back (removed) since sync failed
      expect(result.current.todos).toHaveLength(0);
    });
  });

  describe('rollback scenarios', () => {
    const setupWithExistingTodo = async () => {
      const existingTodos = [
        {
          id: 'existing-1',
          text: 'Existing todo',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      mockFetch.mockImplementation((url: string, options?: FetchOptions) => {
        if (options?.method === 'POST') {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ todos: existingTodos }),
        });
      });

      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      return result;
    };

    it('should rollback addTodo when sync fails', async () => {
      const result = await setupWithExistingTodo();

      const initialLength = result.current.todos.length;

      await act(async () => {
        await result.current.addTodo('New todo that will fail');
      });

      // Should rollback to original state
      expect(result.current.todos).toHaveLength(initialLength);
    });

    it('should rollback toggleTodo when sync fails', async () => {
      const result = await setupWithExistingTodo();

      const todoId = result.current.todos[0].id;
      const originalCompletedAt = result.current.todos[0].completedAt;

      await act(async () => {
        await result.current.toggleTodo(todoId);
      });

      // Should rollback to original completed state
      expect(result.current.allTodos[0].completedAt).toEqual(
        originalCompletedAt
      );
    });

    it('should rollback restoreTodo when sync fails', async () => {
      // Setup with completed todo
      const completedTodos = [
        {
          id: 'completed-1',
          text: 'Completed todo',
          completedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      mockFetch.mockImplementation((url: string, options?: FetchOptions) => {
        if (options?.method === 'POST') {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ todos: completedTodos }),
        });
      });

      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      const todoId = result.current.allTodos[0].id;

      await act(async () => {
        await result.current.restoreTodo(todoId);
      });

      // Should rollback - todo should still be completed
      expect(result.current.allTodos[0].completedAt).toBeDefined();
    });

    it('should rollback deleteTodo when sync fails', async () => {
      const result = await setupWithExistingTodo();

      const todoId = result.current.todos[0].id;

      await act(async () => {
        await result.current.deleteTodo(todoId);
      });

      // Should rollback - todo should not have deletedAt
      expect(result.current.allTodos[0].deletedAt).toBeUndefined();
    });

    it('should rollback permanentlyDeleteTodo when sync fails', async () => {
      const result = await setupWithExistingTodo();

      const todoId = result.current.todos[0].id;
      const originalText = result.current.todos[0].text;

      await act(async () => {
        await result.current.permanentlyDeleteTodo(todoId);
      });

      // Should rollback - todo should be added back
      expect(result.current.allTodos.some((t) => t.text === originalText)).toBe(
        true
      );
    });

    it('should rollback restoreDeletedTodo when sync fails', async () => {
      // Setup with soft-deleted todo
      const deletedTodos = [
        {
          id: 'deleted-1',
          text: 'Deleted todo',
          deletedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      mockFetch.mockImplementation((url: string, options?: FetchOptions) => {
        if (options?.method === 'POST') {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ todos: deletedTodos }),
        });
      });

      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      const todoId = result.current.allTodos[0].id;

      await act(async () => {
        await result.current.restoreDeletedTodo(todoId);
      });

      // Should rollback - todo should still have deletedAt
      expect(result.current.allTodos[0].deletedAt).toBeDefined();
    });

    it('should rollback editTodo when sync fails', async () => {
      const result = await setupWithExistingTodo();

      const todoId = result.current.todos[0].id;
      const originalText = result.current.todos[0].text;

      await act(async () => {
        await result.current.editTodo(todoId, 'New text that will fail');
      });

      // Should rollback to original text
      expect(result.current.todos[0].text).toBe(originalText);
    });

    it('should rollback reorderTodos when sync fails', async () => {
      // Setup with multiple todos
      const multipleTodos = [
        {
          id: 'todo-1',
          text: 'First todo',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'todo-2',
          text: 'Second todo',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      mockFetch.mockImplementation((url: string, options?: FetchOptions) => {
        if (options?.method === 'POST') {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ todos: multipleTodos }),
        });
      });

      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.reorderTodos(0, 1);
      });

      // Should rollback to original order
      expect(result.current.todos[0].text).toBe('First todo');
      expect(result.current.todos[1].text).toBe('Second todo');
    });
  });

  describe('fallback ID generation', () => {
    it('should use fallback ID when crypto.randomUUID is unavailable', async () => {
      // Save original crypto
      const originalCrypto = global.crypto;

      // Mock crypto without randomUUID
      Object.defineProperty(global, 'crypto', {
        value: {},
        writable: true,
        configurable: true,
      });

      mockFetch.mockImplementation((url: string, options?: FetchOptions) => {
        if (options?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ todos: [] }),
        });
      });

      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.addTodo('Todo with fallback ID');
      });

      // Check that todo was created with fallback ID format
      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].id).toMatch(/^todo-[a-z0-9]+-[a-z0-9]+$/);

      // Restore crypto
      Object.defineProperty(global, 'crypto', {
        value: originalCrypto,
        writable: true,
        configurable: true,
      });
    });
  });

  describe('filter - all filter case', () => {
    it('should return all non-deleted todos when filter is all', async () => {
      const mixedTodos = [
        {
          id: 'active-1',
          text: 'Active todo',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'completed-1',
          text: 'Completed todo',
          completedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'deleted-1',
          text: 'Deleted todo',
          deletedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      mockFetch.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ todos: mixedTodos }),
        })
      );

      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Set filter to 'all'
      await act(async () => {
        result.current.setFilter('all');
      });

      // Should show active and completed, but not deleted
      expect(result.current.todos).toHaveLength(2);
      expect(result.current.todos.some((t) => t.id === 'deleted-1')).toBe(
        false
      );
    });
  });
});
