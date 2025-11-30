import { renderHook, act, waitFor } from '@testing-library/react';
import { useTodos } from '../../hooks/useTodos';

// Mock fetch globally for backend API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Type for fetch options
type FetchOptions = { method?: string; body?: string };

describe('useTodos hook - Reordering functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

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

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('reorderTodos', () => {
    it('should have reorderTodos function available', async () => {
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      expect(result.current.reorderTodos).toBeDefined();
      expect(typeof result.current.reorderTodos).toBe('function');
    });

    it('should reorder todos when moving item from index 0 to index 2', async () => {
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Add three todos
      await act(async () => {
        await result.current.addTodo('First todo');
        await result.current.addTodo('Second todo');
        await result.current.addTodo('Third todo');
      });

      // Should be in reverse order (newest first)
      expect(result.current.todos[0].text).toBe('Third todo');
      expect(result.current.todos[1].text).toBe('Second todo');
      expect(result.current.todos[2].text).toBe('First todo');

      // Move first item (Third todo) to position 2
      await act(async () => {
        await result.current.reorderTodos(0, 2);
      });

      // Should reorder: Second, First, Third
      expect(result.current.todos[0].text).toBe('Second todo');
      expect(result.current.todos[1].text).toBe('First todo');
      expect(result.current.todos[2].text).toBe('Third todo');
    });

    it('should reorder todos when moving item from index 2 to index 0', async () => {
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Add three todos
      await act(async () => {
        await result.current.addTodo('First todo');
        await result.current.addTodo('Second todo');
        await result.current.addTodo('Third todo');
      });

      // Move last item (First todo) to position 0
      await act(async () => {
        await result.current.reorderTodos(2, 0);
      });

      // Should reorder: First, Third, Second
      expect(result.current.todos[0].text).toBe('First todo');
      expect(result.current.todos[1].text).toBe('Third todo');
      expect(result.current.todos[2].text).toBe('Second todo');
    });

    it('should sync reordered todos to backend', async () => {
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Add two todos
      await act(async () => {
        await result.current.addTodo('First todo');
        await result.current.addTodo('Second todo');
      });

      // Reorder
      await act(async () => {
        await result.current.reorderTodos(0, 1);
      });

      // Verify fetch was called with POST for reorder
      const postCalls = mockFetch.mock.calls.filter(
        (call: [string, FetchOptions?]) => call[1]?.method === 'POST'
      );
      expect(postCalls.length).toBeGreaterThan(2); // create x2 + reorder

      const lastPostCall = postCalls[postCalls.length - 1];
      const body = JSON.parse(lastPostCall[1]?.body as string);
      expect(body.operation).toBe('reorder');
    });

    it('should handle reordering with same source and destination index', async () => {
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Add two todos
      await act(async () => {
        await result.current.addTodo('First todo');
        await result.current.addTodo('Second todo');
      });

      const originalTodos = [...result.current.todos];

      // Try to reorder to same position
      await act(async () => {
        await result.current.reorderTodos(0, 0);
      });

      // Should remain unchanged
      expect(result.current.todos).toEqual(originalTodos);
    });

    it('should handle invalid indices gracefully', async () => {
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Add two todos
      await act(async () => {
        await result.current.addTodo('First todo');
        await result.current.addTodo('Second todo');
      });

      const originalTodos = [...result.current.todos];

      // Try invalid source index
      await act(async () => {
        await result.current.reorderTodos(5, 0);
      });

      expect(result.current.todos).toEqual(originalTodos);

      // Try invalid destination index
      await act(async () => {
        await result.current.reorderTodos(0, 5);
      });

      expect(result.current.todos).toEqual(originalTodos);

      // Try negative indices
      await act(async () => {
        await result.current.reorderTodos(-1, 0);
      });

      expect(result.current.todos).toEqual(originalTodos);
    });

    it('should handle reordering empty todo list', async () => {
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      expect(result.current.todos).toHaveLength(0);

      // Try to reorder empty list
      await act(async () => {
        await result.current.reorderTodos(0, 1);
      });

      expect(result.current.todos).toHaveLength(0);
    });

    it('should maintain todo properties when reordering', async () => {
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Add and modify todos
      await act(async () => {
        await result.current.addTodo('First todo');
        await result.current.addTodo('Second todo');
      });

      const secondTodoId = result.current.todos[0].id;

      // Toggle second todo
      await act(async () => {
        await result.current.toggleTodo(secondTodoId);
      });

      // Use allTodos to access completed todos since default filter is now "active"
      expect(!!result.current.allTodos[0].completedAt).toBe(true);

      // Reorder (works on allTodos internally)
      await act(async () => {
        await result.current.reorderTodos(0, 1);
      });

      // Find the moved todo and verify its properties are preserved
      const movedTodo = result.current.allTodos.find(
        (todo) => todo.id === secondTodoId
      );
      expect(movedTodo).toBeDefined();
      expect(!!movedTodo!.completedAt).toBe(true);
      expect(movedTodo!.text).toBe('Second todo');
    });
  });

  describe('moveUp and moveDown helper functions', () => {
    it('should have moveUp function available', async () => {
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      expect(result.current.moveUp).toBeDefined();
      expect(typeof result.current.moveUp).toBe('function');
    });

    it('should have moveDown function available', async () => {
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      expect(result.current.moveDown).toBeDefined();
      expect(typeof result.current.moveDown).toBe('function');
    });

    it('should move todo up when moveUp is called', async () => {
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Add three todos
      await act(async () => {
        await result.current.addTodo('First todo');
        await result.current.addTodo('Second todo');
        await result.current.addTodo('Third todo');
      });

      const secondTodoId = result.current.todos[1].id; // "Second todo"

      // Move second todo up
      await act(async () => {
        await result.current.moveUp(secondTodoId);
      });

      // Second todo should now be at index 0
      expect(result.current.todos[0].id).toBe(secondTodoId);
      expect(result.current.todos[0].text).toBe('Second todo');
    });

    it('should move todo down when moveDown is called', async () => {
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Add three todos
      await act(async () => {
        await result.current.addTodo('First todo');
        await result.current.addTodo('Second todo');
        await result.current.addTodo('Third todo');
      });

      const firstTodoId = result.current.todos[0].id; // "Third todo"

      // Move first todo down
      await act(async () => {
        await result.current.moveDown(firstTodoId);
      });

      // Third todo should now be at index 1
      expect(result.current.todos[1].id).toBe(firstTodoId);
      expect(result.current.todos[1].text).toBe('Third todo');
    });

    it('should not move todo up if already at top', async () => {
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Add two todos
      await act(async () => {
        await result.current.addTodo('First todo');
        await result.current.addTodo('Second todo');
      });

      const topTodoId = result.current.todos[0].id;
      const originalOrder = [...result.current.todos];

      // Try to move top todo up
      await act(async () => {
        await result.current.moveUp(topTodoId);
      });

      // Order should remain unchanged
      expect(result.current.todos).toEqual(originalOrder);
    });

    it('should not move todo down if already at bottom', async () => {
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Add two todos
      await act(async () => {
        await result.current.addTodo('First todo');
        await result.current.addTodo('Second todo');
      });

      const bottomTodoId = result.current.todos[1].id;
      const originalOrder = [...result.current.todos];

      // Try to move bottom todo down
      await act(async () => {
        await result.current.moveDown(bottomTodoId);
      });

      // Order should remain unchanged
      expect(result.current.todos).toEqual(originalOrder);
    });

    it('should handle moveUp with invalid todo id', async () => {
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Add one todo
      await act(async () => {
        await result.current.addTodo('Single todo');
      });

      const originalOrder = [...result.current.todos];

      // Try to move non-existent todo
      await act(async () => {
        await result.current.moveUp('invalid-id');
      });

      expect(result.current.todos).toEqual(originalOrder);
    });

    it('should handle moveDown with invalid todo id', async () => {
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Add one todo
      await act(async () => {
        await result.current.addTodo('Single todo');
      });

      const originalOrder = [...result.current.todos];

      // Try to move non-existent todo
      await act(async () => {
        await result.current.moveDown('invalid-id');
      });

      expect(result.current.todos).toEqual(originalOrder);
    });
  });
});
