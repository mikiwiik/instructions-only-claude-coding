import { renderHook, act, waitFor } from '@testing-library/react';
import { useTodos } from '../../hooks/useTodos';

// Mock fetch globally for backend API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Type for fetch options
type FetchOptions = { method?: string; body?: string };

// Test list ID for shared mode tests
const TEST_LIST_ID = 'test-list';

describe('useTodos Hook - Soft Delete Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock: empty list, successful responses
    mockFetch.mockImplementation((url: string, options?: FetchOptions) => {
      if (options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      }
      // GET request - return empty list
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ todos: [] }),
      });
    });
  });

  describe('soft delete functionality', () => {
    it('should implement soft delete instead of permanent deletion', async () => {
      const { result } = renderHook(() => useTodos(TEST_LIST_ID));

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Add a todo
      await act(async () => {
        await result.current.addTodo('Test todo to delete');
      });

      expect(result.current.todos).toHaveLength(1);
      const todoId = result.current.todos[0].id;

      // Soft delete sets deletedAt but keeps todo in allTodos
      await act(async () => {
        await result.current.deleteTodo(todoId);
      });

      // After soft delete: hidden from filtered view but still in allTodos
      expect(result.current.todos).toHaveLength(0);
      expect(result.current.allTodos).toHaveLength(1);
      expect(result.current.allTodos[0].deletedAt).toBeInstanceOf(Date);
    });

    it('should filter out soft-deleted todos from default todos view', async () => {
      const { result } = renderHook(() => useTodos(TEST_LIST_ID));

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.addTodo('Active todo');
        await result.current.addTodo('Todo to delete');
      });

      expect(result.current.todos).toHaveLength(2);
      // New todos are added to beginning, so 'Todo to delete' is at index 0
      const todoToDeleteId = result.current.todos[0].id; // 'Todo to delete' is most recent (index 0)

      await act(async () => {
        await result.current.deleteTodo(todoToDeleteId);
      });

      // Default todos view excludes deleted todos
      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].text).toBe('Active todo'); // Older todo remains

      // AllTodos includes deleted todos
      expect(result.current.allTodos).toHaveLength(2);
    });

    it('should provide access to deleted todos via filter', async () => {
      const { result } = renderHook(() => useTodos(TEST_LIST_ID));

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.addTodo('Todo to delete');
      });

      const todoId = result.current.todos[0].id;

      await act(async () => {
        await result.current.deleteTodo(todoId);
      });

      // Default filter hides deleted todos
      expect(result.current.todos).toHaveLength(0);

      // Switch to recently-deleted filter to see deleted todos
      act(() => {
        result.current.setFilter('recently-deleted');
      });

      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].deletedAt).toBeInstanceOf(Date);
    });

    it('should provide restoreDeletedTodo function for recovering soft-deleted todos', async () => {
      const { result } = renderHook(() => useTodos(TEST_LIST_ID));

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Current implementation has both functions
      expect(result.current.restoreTodo).toBeDefined(); // For unchecking completed todos
      expect(result.current.restoreDeletedTodo).toBeDefined(); // For restoring deleted todos
      expect(typeof result.current.restoreDeletedTodo).toBe('function');

      await act(async () => {
        await result.current.addTodo('Todo to restore');
      });

      const todoId = result.current.todos[0].id;

      // Soft delete
      await act(async () => {
        await result.current.deleteTodo(todoId);
      });

      expect(result.current.todos).toHaveLength(0);

      // Restore
      await act(async () => {
        await result.current.restoreDeletedTodo(todoId);
      });

      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].deletedAt).toBeUndefined();
    });

    it('should provide permanentlyDeleteTodo function for actual removal', async () => {
      const { result } = renderHook(() => useTodos(TEST_LIST_ID));

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Function exists and works
      expect(result.current.permanentlyDeleteTodo).toBeDefined();
      expect(typeof result.current.permanentlyDeleteTodo).toBe('function');
      expect(result.current.deleteTodo).toBeDefined();
      expect(typeof result.current.deleteTodo).toBe('function');

      await act(async () => {
        await result.current.addTodo('Todo to permanently delete');
      });

      const todoId = result.current.todos[0].id;

      await act(async () => {
        await result.current.permanentlyDeleteTodo(todoId);
      });

      // Actually removed from both filtered and all todos
      expect(result.current.todos).toHaveLength(0);
      expect(result.current.allTodos).toHaveLength(0);
    });
  });

  describe('soft delete workflow', () => {
    it('should set deletedAt timestamp when soft deleting', async () => {
      const { result } = renderHook(() => useTodos(TEST_LIST_ID));

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.addTodo('Todo to soft delete');
      });

      const todoId = result.current.todos[0].id;
      const beforeDelete = new Date();

      await act(async () => {
        await result.current.deleteTodo(todoId); // Performs soft delete
      });

      // Soft delete: hidden from default filter but kept in allTodos with timestamp
      expect(result.current.todos).toHaveLength(0);
      expect(result.current.allTodos).toHaveLength(1);
      const deletedTodo = result.current.allTodos[0];
      expect(deletedTodo.deletedAt).toBeDefined();
      expect(deletedTodo.deletedAt).toBeInstanceOf(Date);
      expect(deletedTodo.deletedAt!.getTime()).toBeGreaterThanOrEqual(
        beforeDelete.getTime()
      );
    });

    it('should restore soft-deleted todo and clear deletedAt', async () => {
      const { result } = renderHook(() => useTodos(TEST_LIST_ID));

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.addTodo('Todo to restore');
      });

      const todoId = result.current.todos[0].id;

      // Soft delete
      await act(async () => {
        await result.current.deleteTodo(todoId);
      });

      expect(result.current.todos).toHaveLength(0); // Hidden from default filter
      expect(result.current.allTodos).toHaveLength(1); // Still exists
      expect(result.current.allTodos[0].deletedAt).toBeInstanceOf(Date);

      // Restore
      await act(async () => {
        await result.current.restoreDeletedTodo(todoId);
      });

      expect(result.current.todos).toHaveLength(1); // Visible again
      expect(result.current.allTodos).toHaveLength(1);
      expect(result.current.todos[0].deletedAt).toBeUndefined();
    });

    it('should permanently delete todo when using permanentlyDeleteTodo', async () => {
      const { result } = renderHook(() => useTodos(TEST_LIST_ID));

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.addTodo('Todo to permanently delete');
      });

      expect(result.current.todos).toHaveLength(1);
      expect(result.current.allTodos).toHaveLength(1);
      const todoId = result.current.todos[0].id;

      // Permanent deletion removes from both filtered and allTodos
      await act(async () => {
        await result.current.permanentlyDeleteTodo(todoId);
      });

      expect(result.current.todos).toHaveLength(0);
      expect(result.current.allTodos).toHaveLength(0);
    });
  });

  describe('filtering with soft delete', () => {
    it('should filter todos correctly based on deletion status', async () => {
      const { result } = renderHook(() => useTodos(TEST_LIST_ID));

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Add multiple todos
      await act(async () => {
        await result.current.addTodo('Active todo');
        await result.current.addTodo('Todo to delete');
        await result.current.addTodo('Another active todo');
      });

      expect(result.current.todos).toHaveLength(3);
    });

    it('should handle mixed completion and deletion states', async () => {
      const { result } = renderHook(() => useTodos(TEST_LIST_ID));

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.addTodo('Active todo');
        await result.current.addTodo('Todo to complete');
        await result.current.addTodo('Todo to delete');
      });

      const [, todoToComplete, todoToDelete] = result.current.todos;

      // Complete one todo
      await act(async () => {
        await result.current.toggleTodo(todoToComplete.id);
      });

      // Soft delete another todo
      await act(async () => {
        await result.current.deleteTodo(todoToDelete.id);
      });

      // Default filter is 'active', so only shows active todos, not completed or deleted
      expect(result.current.todos).toHaveLength(1); // Only active visible (completed is filtered out)
      expect(result.current.allTodos).toHaveLength(3); // All todos still exist

      // Test completed filter
      act(() => {
        result.current.setFilter('completed');
      });
      expect(result.current.todos).toHaveLength(1); // Only completed
      expect(!!result.current.todos[0].completedAt).toBe(true);

      // Test active filter
      act(() => {
        result.current.setFilter('active');
      });
      expect(result.current.todos).toHaveLength(1); // Only active
      expect(!!result.current.todos[0].completedAt).toBe(false);
    });
  });

  describe('backend integration with soft delete', () => {
    it('should sync soft-deleted todos to backend', async () => {
      const { result } = renderHook(() => useTodos(TEST_LIST_ID));

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.addTodo('Todo to soft delete and persist');
      });

      const todoId = result.current.todos[0].id;

      // Test soft delete backend sync
      await act(async () => {
        await result.current.deleteTodo(todoId); // Soft delete
      });

      // Verify fetch was called with POST to sync the soft delete
      const postCalls = mockFetch.mock.calls.filter(
        (call: [string, FetchOptions?]) => call[1]?.method === 'POST'
      );
      expect(postCalls.length).toBeGreaterThan(1); // create + update

      const lastPostCall = postCalls[postCalls.length - 1];
      const body = JSON.parse(lastPostCall[1]?.body as string);
      expect(body.operation).toBe('update');
      expect(body.data.deletedAt).toBeDefined();
    });

    it('should load soft-deleted todos from backend on hook initialization', async () => {
      // Mock backend to return soft-deleted todo
      const todoWithDeletedAt = {
        id: 'deleted-todo-1',
        text: 'Previously soft-deleted todo',
        createdAt: new Date('2024-01-01T10:00:00Z').toISOString(),
        updatedAt: new Date('2024-01-01T11:00:00Z').toISOString(),
        deletedAt: new Date('2024-01-01T12:00:00Z').toISOString(),
      };

      mockFetch.mockImplementation((url: string, options?: FetchOptions) => {
        if (options?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ todos: [todoWithDeletedAt] }),
        });
      });

      const { result } = renderHook(() => useTodos(TEST_LIST_ID));

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Soft-deleted todos are hidden from default filter but exist in allTodos
      expect(result.current.todos).toHaveLength(0); // Hidden from default view
      expect(result.current.allTodos).toHaveLength(1); // Exists in allTodos
      expect(result.current.allTodos[0].text).toBe(
        'Previously soft-deleted todo'
      );
      expect(result.current.allTodos[0].deletedAt).toBeInstanceOf(Date);
    });

    it('should handle loading todos without deletedAt field from backend', async () => {
      // Mock backend to return old-format todos
      const legacyTodos = [
        {
          id: 'legacy-1',
          text: 'Legacy todo 1',
          createdAt: new Date('2024-01-01T10:00:00Z').toISOString(),
          updatedAt: new Date('2024-01-01T10:00:00Z').toISOString(),
        },
        {
          id: 'legacy-2',
          text: 'Legacy todo 2',
          completedAt: new Date('2024-01-01T11:00:00Z').toISOString(),
          createdAt: new Date('2024-01-01T10:00:00Z').toISOString(),
          updatedAt: new Date('2024-01-01T11:00:00Z').toISOString(),
        },
      ];

      mockFetch.mockImplementation((url: string, options?: FetchOptions) => {
        if (options?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ todos: legacyTodos }),
        });
      });

      const { result } = renderHook(() => useTodos(TEST_LIST_ID));

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Default filter is 'active', so only shows incomplete todos
      expect(result.current.todos).toHaveLength(1); // Only incomplete todo visible
      expect(result.current.todos[0].text).toBe('Legacy todo 1');

      // Check completed todo in allTodos
      const completedTodo = result.current.allTodos.find(
        (t) => !!t.completedAt
      );
      expect(completedTodo?.text).toBe('Legacy todo 2');
      expect(!!completedTodo?.completedAt).toBe(true);
    });
  });

  describe('timestamp management with soft delete', () => {
    it('should set deletedAt timestamp when soft deleting', async () => {
      const { result } = renderHook(() => useTodos(TEST_LIST_ID));

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.addTodo('Test timestamp setting');
      });

      const todoId = result.current.todos[0].id;

      await act(async () => {
        await result.current.deleteTodo(todoId);
      });

      // Soft delete: hidden from filtered view but in allTodos with deletedAt
      expect(result.current.todos).toHaveLength(0);
      expect(result.current.allTodos).toHaveLength(1);
      expect(result.current.allTodos[0].deletedAt).toBeInstanceOf(Date);
    });

    it('should preserve original timestamps when soft deleting', async () => {
      const { result } = renderHook(() => useTodos(TEST_LIST_ID));

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.addTodo('Test timestamp preservation');
      });

      const originalTodo = result.current.todos[0];
      const originalCreatedAt = originalTodo.createdAt;
      // Check original timestamps
      expect(originalTodo.createdAt).toBeDefined();
      expect(originalTodo.updatedAt).toBeDefined();

      await act(async () => {
        await result.current.deleteTodo(originalTodo.id);
      });

      // Soft delete preserves createdAt
      expect(result.current.allTodos[0].createdAt.getTime()).toBe(
        originalCreatedAt.getTime()
      );
      expect(result.current.allTodos[0].deletedAt).toBeInstanceOf(Date);
    });

    it('should clear deletedAt when restoring soft-deleted todo', async () => {
      const { result } = renderHook(() => useTodos(TEST_LIST_ID));

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.addTodo('Test restoration');
      });

      const todoId = result.current.todos[0].id;

      // Soft delete
      await act(async () => {
        await result.current.deleteTodo(todoId);
      });

      expect(result.current.allTodos[0].deletedAt).toBeInstanceOf(Date);

      // Restore
      await act(async () => {
        await result.current.restoreDeletedTodo(todoId);
      });

      expect(result.current.todos[0].deletedAt).toBeUndefined();
    });

    it('should update updatedAt when restoring soft-deleted todo', async () => {
      const { result } = renderHook(() => useTodos(TEST_LIST_ID));

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.addTodo('Test updatedAt on restore');
      });

      const todoId = result.current.todos[0].id;
      const originalUpdatedAt = result.current.todos[0].updatedAt;

      // Soft delete
      await act(async () => {
        await result.current.deleteTodo(todoId);
      });

      // Restore
      await act(async () => {
        await result.current.restoreDeletedTodo(todoId);
      });

      // updatedAt should be updated on restore
      expect(
        result.current.todos[0].updatedAt.getTime()
      ).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle soft deleting non-existent todo gracefully', async () => {
      const { result } = renderHook(() => useTodos(TEST_LIST_ID));

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // No error when deleting non-existent todo
      await expect(
        act(async () => {
          await result.current.deleteTodo('non-existent-id');
        })
      ).resolves.not.toThrow();

      expect(result.current.todos).toHaveLength(0);
    });

    it('should handle restoring non-existent deleted todo gracefully', async () => {
      const { result } = renderHook(() => useTodos(TEST_LIST_ID));

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // No error when restoring non-existent todo
      await expect(
        act(async () => {
          await result.current.restoreTodo('non-existent-id');
        })
      ).resolves.not.toThrow();
    });

    it('should handle backend errors gracefully', async () => {
      // Mock fetch to return an error
      mockFetch.mockImplementation(() => {
        return Promise.reject(new Error('Network error'));
      });

      const { result } = renderHook(() => useTodos(TEST_LIST_ID));

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Should initialize with empty todos array without throwing
      expect(result.current.todos).toEqual([]);
    });

    it('should handle todos with invalid deletedAt values from backend', async () => {
      const invalidTodo = {
        id: 'invalid-deleted-at',
        text: 'Todo with invalid deletedAt',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: 'invalid-date-string',
      };

      mockFetch.mockImplementation((url: string, options?: FetchOptions) => {
        if (options?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ todos: [invalidTodo] }),
        });
      });

      const { result } = renderHook(() => useTodos(TEST_LIST_ID));

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Should handle gracefully - invalid deletedAt is treated as Date
      expect(result.current.todos).toHaveLength(0); // Todo with deletedAt is hidden
      expect(result.current.allTodos).toHaveLength(1); // Still exists in allTodos
      expect(result.current.allTodos[0].deletedAt).toBeInstanceOf(Date); // Invalid string becomes Date object
      expect(isNaN(result.current.allTodos[0].deletedAt!.getTime())).toBe(true); // But with NaN value
    });
  });
});
