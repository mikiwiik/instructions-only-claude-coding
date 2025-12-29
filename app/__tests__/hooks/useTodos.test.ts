import { renderHook, act, waitFor } from '@testing-library/react';
import { useTodos } from '../../hooks/useTodos';

// Mock fetch globally for backend API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Type for fetch options
type FetchOptions = { method?: string; body?: string };

describe('useTodos hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Use fake timers for timestamp tests
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

  it('should initialize with empty todos array', async () => {
    const { result } = renderHook(() => useTodos());

    // Wait for initialization to complete
    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    expect(result.current.todos).toEqual([]);
    expect(result.current.filter).toBe('active');
  });

  it('should add a new todo', async () => {
    const { result } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    await act(async () => {
      await result.current.addTodo('Learn React Testing');
    });

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0]).toMatchObject({
      text: 'Learn React Testing',
      completedAt: undefined,
    });
    expect(result.current.todos[0]).toHaveProperty('id');
    expect(result.current.todos[0]).toHaveProperty('createdAt');
    expect(result.current.todos[0]).toHaveProperty('updatedAt');
  });

  it('should generate unique IDs for each todo', async () => {
    const { result } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    await act(async () => {
      await result.current.addTodo('First todo');
      await result.current.addTodo('Second todo');
    });

    expect(result.current.todos).toHaveLength(2);
    expect(result.current.todos[0].id).not.toBe(result.current.todos[1].id);
  });

  it('should set createdAt and updatedAt timestamps', async () => {
    const { result } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    const beforeTime = new Date();

    await act(async () => {
      await result.current.addTodo('Timestamped todo');
    });

    const afterTime = new Date();
    const todo = result.current.todos[0];

    expect(todo.createdAt).toBeInstanceOf(Date);
    expect(todo.updatedAt).toBeInstanceOf(Date);
    expect(todo.createdAt.getTime()).toBeGreaterThanOrEqual(
      beforeTime.getTime()
    );
    expect(todo.createdAt.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    expect(todo.updatedAt.getTime()).toBe(todo.createdAt.getTime());
  });

  it('should add todos to the beginning of the list', async () => {
    const { result } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    await act(async () => {
      await result.current.addTodo('First todo');
      await result.current.addTodo('Second todo');
    });

    expect(result.current.todos[0].text).toBe('Second todo');
    expect(result.current.todos[1].text).toBe('First todo');
  });

  it('should sync todos to backend when adding', async () => {
    const { result } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    await act(async () => {
      await result.current.addTodo('Persistent todo');
    });

    // Verify fetch was called with POST to sync the new todo
    const postCalls = mockFetch.mock.calls.filter(
      (call: [string, FetchOptions?]) => call[1]?.method === 'POST'
    );
    expect(postCalls.length).toBeGreaterThan(0);

    const lastPostCall = postCalls[postCalls.length - 1];
    const body = JSON.parse(lastPostCall[1]?.body as string);
    expect(body.operation).toBe('create');
    expect(body.data.text).toBe('Persistent todo');
  });

  it('should load todos from backend on initialization', async () => {
    const existingTodos = [
      {
        id: 'existing-1',
        text: 'Existing todo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Mock fetch to return existing todos
    mockFetch.mockImplementation((url: string, options?: FetchOptions) => {
      if (options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
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

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].text).toBe('Existing todo');
    expect(result.current.todos[0].createdAt).toBeInstanceOf(Date);
  });

  it('should handle backend errors gracefully', async () => {
    // Mock fetch to return an error
    mockFetch.mockImplementation(() => {
      return Promise.reject(new Error('Network error'));
    });

    const { result } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    expect(result.current.todos).toEqual([]);
  });

  it('should not add empty or whitespace-only todos', async () => {
    const { result } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    await act(async () => {
      await result.current.addTodo('');
      await result.current.addTodo('   ');
      await result.current.addTodo('\t\n');
    });

    expect(result.current.todos).toHaveLength(0);
  });

  it('should trim whitespace from todo text', async () => {
    const { result } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(result.current.isInitialized).toBe(true);
    });

    await act(async () => {
      await result.current.addTodo('  Trimmed todo  ');
    });

    expect(result.current.todos[0].text).toBe('Trimmed todo');
  });

  describe('toggleTodo', () => {
    it('should toggle a todo from incomplete to complete', async () => {
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.addTodo('Todo to toggle');
      });

      const todoId = result.current.todos[0].id;

      await act(async () => {
        await result.current.toggleTodo(todoId);
      });

      // After toggling to complete, the todo is filtered out from active view
      // But we can check it in allTodos
      expect(!!result.current.allTodos[0].completedAt).toBe(true);
      expect(result.current.allTodos[0].updatedAt).toBeInstanceOf(Date);
      // The filtered todos should now be empty since the only todo is completed
      expect(result.current.todos).toHaveLength(0);
    });

    it('should toggle a todo from complete to incomplete', async () => {
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.addTodo('Todo to toggle back');
      });

      const todoId = result.current.todos[0].id;

      // Toggle to complete
      await act(async () => {
        await result.current.toggleTodo(todoId);
      });

      // Toggle back to incomplete
      await act(async () => {
        await result.current.toggleTodo(todoId);
      });

      expect(!!result.current.todos[0].completedAt).toBe(false);
    });

    it('should not affect other todos when toggling', async () => {
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.addTodo('First todo');
        await result.current.addTodo('Second todo');
      });

      const secondTodoId = result.current.todos[0].id;

      await act(async () => {
        await result.current.toggleTodo(secondTodoId);
      });

      // After toggling, check allTodos to see both todos
      const toggledTodo = result.current.allTodos.find(
        (t) => t.id === secondTodoId
      );
      const otherTodo = result.current.allTodos.find(
        (t) => t.id !== secondTodoId
      );
      expect(!!toggledTodo?.completedAt).toBe(true);
      expect(!!otherTodo?.completedAt).toBe(false);
      // In the filtered view (active), only the incomplete todo should remain
      expect(result.current.todos).toHaveLength(1);
      expect(!!result.current.todos[0].completedAt).toBe(false);
    });

    it('should handle toggling non-existent todo gracefully', async () => {
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.addTodo('Existing todo');
      });

      const originalTodos = result.current.todos;

      await act(async () => {
        await result.current.toggleTodo('non-existent-id');
      });

      expect(result.current.todos).toEqual(originalTodos);
    });

    it('should sync todo state to backend when toggling', async () => {
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.addTodo('Todo to persist');
      });

      const todoId = result.current.todos[0].id;

      await act(async () => {
        await result.current.toggleTodo(todoId);
      });

      // Verify fetch was called with POST to sync the toggle
      const postCalls = mockFetch.mock.calls.filter(
        (call: [string, FetchOptions?]) => call[1]?.method === 'POST'
      );
      expect(postCalls.length).toBeGreaterThan(1); // At least create + update

      const lastPostCall = postCalls[postCalls.length - 1];
      const body = JSON.parse(lastPostCall[1]?.body as string);
      expect(body.operation).toBe('update');
      expect(body.data.completedAt).toBeDefined();
    });
  });

  describe('deleteTodo', () => {
    it('should soft delete todo (hide from filtered view but keep in allTodos)', async () => {
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.addTodo('Todo to delete');
        await result.current.addTodo('Todo to keep');
      });

      expect(result.current.todos).toHaveLength(2);
      expect(result.current.allTodos).toHaveLength(2);
      const todoToDeleteId = result.current.todos[1].id; // First todo added

      await act(async () => {
        await result.current.deleteTodo(todoToDeleteId);
      });

      // Soft delete: hidden from filtered todos but kept in allTodos
      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].text).toBe('Todo to keep');
      expect(result.current.allTodos).toHaveLength(2);
      expect(
        result.current.allTodos.find((t) => t.id === todoToDeleteId)?.deletedAt
      ).toBeInstanceOf(Date);
    });

    it('should handle deleting non-existent todo gracefully', async () => {
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.addTodo('Existing todo');
      });

      const originalTodos = result.current.todos;

      await act(async () => {
        await result.current.deleteTodo('non-existent-id');
      });

      expect(result.current.todos).toEqual(originalTodos);
    });

    it('should not affect other todos when one is soft deleted', async () => {
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.addTodo('First todo');
        await result.current.addTodo('Second todo');
        await result.current.addTodo('Third todo');
      });

      const middleTodoId = result.current.todos[1].id;
      const firstTodoText = result.current.todos[0].text;
      const lastTodoText = result.current.todos[2].text;

      await act(async () => {
        await result.current.deleteTodo(middleTodoId);
      });

      // After soft delete, visible todos should be 2 (first and last)
      expect(result.current.todos).toHaveLength(2);
      expect(result.current.todos[0].text).toBe(firstTodoText);
      expect(result.current.todos[1].text).toBe(lastTodoText);
      // All todos should still exist in allTodos (including soft deleted)
      expect(result.current.allTodos).toHaveLength(3);
    });

    it('should work with both completed and incomplete todos', async () => {
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.addTodo('Incomplete todo');
        await result.current.addTodo('Complete todo');
      });

      const completeTodoId = result.current.todos[0].id;

      // Mark one todo as complete
      await act(async () => {
        await result.current.toggleTodo(completeTodoId);
      });

      // Check completed todo in allTodos since it's filtered out from active view
      const completedTodo = result.current.allTodos.find(
        (t) => t.id === completeTodoId
      );
      expect(!!completedTodo?.completedAt).toBe(true);

      // Delete the completed todo
      await act(async () => {
        await result.current.deleteTodo(completeTodoId);
      });

      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].text).toBe('Incomplete todo');
      expect(!!result.current.todos[0].completedAt).toBe(false);
    });

    it('should sync updated todo to backend when deleting', async () => {
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.addTodo('Todo to delete');
        await result.current.addTodo('Todo to keep');
      });

      const todoToDeleteId = result.current.todos[1].id;

      await act(async () => {
        await result.current.deleteTodo(todoToDeleteId);
      });

      // Verify fetch was called with POST to sync the delete
      const postCalls = mockFetch.mock.calls.filter(
        (call: [string, FetchOptions?]) => call[1]?.method === 'POST'
      );
      expect(postCalls.length).toBeGreaterThan(2); // create x2 + update

      const lastPostCall = postCalls[postCalls.length - 1];
      const body = JSON.parse(lastPostCall[1]?.body as string);
      expect(body.operation).toBe('update');
      expect(body.data.deletedAt).toBeDefined();
    });

    it('should handle soft deleting all todos (kept in allTodos with deletedAt)', async () => {
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.addTodo('Only todo');
      });

      const todoId = result.current.todos[0].id;

      await act(async () => {
        await result.current.deleteTodo(todoId);
      });

      // Soft delete: todos are hidden from filtered view but kept in allTodos
      expect(result.current.todos).toHaveLength(0); // Hidden from default filter
      expect(result.current.allTodos).toHaveLength(1); // Still in allTodos
      expect(result.current.allTodos[0].deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('Edit Functionality', () => {
    it('should edit todo text when editTodo is called', async () => {
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Add a todo first
      await act(async () => {
        await result.current.addTodo('Original todo text');
      });

      const todoId = result.current.todos[0].id;

      // Edit the todo
      await act(async () => {
        await result.current.editTodo(todoId, 'Updated todo text');
      });

      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].text).toBe('Updated todo text');
      expect(result.current.todos[0].id).toBe(todoId);
    });

    it('should preserve completion status when editing', async () => {
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Add and complete a todo
      await act(async () => {
        await result.current.addTodo('Completed todo');
      });

      const todoId = result.current.todos[0].id;

      await act(async () => {
        await result.current.toggleTodo(todoId);
      });

      // Check completed status in allTodos since it's filtered out from active view
      expect(!!result.current.allTodos[0].completedAt).toBe(true);

      // Edit the completed todo
      await act(async () => {
        await result.current.editTodo(todoId, 'Updated completed todo');
      });

      // Check the edited todo in allTodos
      expect(result.current.allTodos[0].text).toBe('Updated completed todo');
      expect(!!result.current.allTodos[0].completedAt).toBe(true);
    });

    it('should update updatedAt timestamp when editing', async () => {
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.addTodo('Todo to edit');
      });

      const todoId = result.current.todos[0].id;
      const originalUpdatedAt = result.current.todos[0].updatedAt;

      // Wait a small amount to ensure timestamp difference
      jest.advanceTimersByTime(10);

      await act(async () => {
        await result.current.editTodo(todoId, 'Edited todo');
      });

      expect(result.current.todos[0].updatedAt).not.toEqual(originalUpdatedAt);
      expect(result.current.todos[0].updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );
    });

    it('should sync edited todos to backend', async () => {
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.addTodo('Todo to edit');
      });

      const todoId = result.current.todos[0].id;

      await act(async () => {
        await result.current.editTodo(todoId, 'Edited todo text');
      });

      // Verify fetch was called with POST to sync the edit
      const postCalls = mockFetch.mock.calls.filter(
        (call: [string, FetchOptions?]) => call[1]?.method === 'POST'
      );
      expect(postCalls.length).toBeGreaterThan(1); // create + update

      const lastPostCall = postCalls[postCalls.length - 1];
      const body = JSON.parse(lastPostCall[1]?.body as string);
      expect(body.operation).toBe('update');
      expect(body.data.text).toBe('Edited todo text');
      expect(body.data.id).toBe(todoId);
    });

    it('should handle editing non-existent todo gracefully', async () => {
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.addTodo('Existing todo');
      });

      const originalTodos = [...result.current.todos];

      // Try to edit a non-existent todo
      await act(async () => {
        await result.current.editTodo('non-existent-id', 'Should not work');
      });

      // Todos should remain unchanged
      expect(result.current.todos).toEqual(originalTodos);
    });

    it('should handle empty text edit gracefully', async () => {
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.addTodo('Original text');
      });

      const todoId = result.current.todos[0].id;
      const originalTodos = [...result.current.todos];

      // Try to edit with empty text
      await act(async () => {
        await result.current.editTodo(todoId, '');
      });

      // Todo should remain unchanged
      expect(result.current.todos).toEqual(originalTodos);
    });

    it('should trim whitespace from edited text', async () => {
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.addTodo('Original text');
      });

      const todoId = result.current.todos[0].id;

      await act(async () => {
        await result.current.editTodo(todoId, '  Trimmed text  ');
      });

      expect(result.current.todos[0].text).toBe('Trimmed text');
    });

    it('should handle editing multiple todos independently', async () => {
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.addTodo('First todo');
        await result.current.addTodo('Second todo');
        await result.current.addTodo('Third todo');
      });

      const firstId = result.current.todos[0].id;
      const thirdId = result.current.todos[2].id;

      await act(async () => {
        await result.current.editTodo(firstId, 'Edited first todo');
        await result.current.editTodo(thirdId, 'Edited third todo');
      });

      expect(result.current.todos[0].text).toBe('Edited first todo');
      expect(result.current.todos[1].text).toBe('Second todo'); // Unchanged
      expect(result.current.todos[2].text).toBe('Edited third todo');
    });
  });

  describe('Sorting by filter (LexoRank)', () => {
    it('should sort active todos by sortOrder ascending', async () => {
      const todosWithSortOrder = [
        {
          id: 'todo-1',
          text: 'Third by sortOrder',
          sortOrder: '0|0i0002:',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'todo-2',
          text: 'First by sortOrder',
          sortOrder: '0|0i0000:',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'todo-3',
          text: 'Second by sortOrder',
          sortOrder: '0|0i0001:',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
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
          json: () => Promise.resolve({ todos: todosWithSortOrder }),
        });
      });

      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Active filter should sort by sortOrder ascending
      expect(result.current.todos[0].text).toBe('First by sortOrder');
      expect(result.current.todos[1].text).toBe('Second by sortOrder');
      expect(result.current.todos[2].text).toBe('Third by sortOrder');
    });

    it('should sort completed todos by completedAt descending', async () => {
      const completedTodos = [
        {
          id: 'todo-1',
          text: 'Completed first',
          completedAt: new Date('2024-01-01').toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'todo-2',
          text: 'Completed last',
          completedAt: new Date('2024-01-03').toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'todo-3',
          text: 'Completed middle',
          completedAt: new Date('2024-01-02').toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
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
          json: () => Promise.resolve({ todos: completedTodos }),
        });
      });

      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Switch to completed filter
      await act(async () => {
        result.current.setFilter('completed');
      });

      // Completed filter should sort by completedAt descending (most recent first)
      expect(result.current.todos[0].text).toBe('Completed last');
      expect(result.current.todos[1].text).toBe('Completed middle');
      expect(result.current.todos[2].text).toBe('Completed first');
    });

    it('should sort deleted todos by deletedAt descending', async () => {
      const deletedTodos = [
        {
          id: 'todo-1',
          text: 'Deleted first',
          deletedAt: new Date('2024-01-01').toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'todo-2',
          text: 'Deleted last',
          deletedAt: new Date('2024-01-03').toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'todo-3',
          text: 'Deleted middle',
          deletedAt: new Date('2024-01-02').toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
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
          json: () => Promise.resolve({ todos: deletedTodos }),
        });
      });

      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Switch to recently-deleted filter
      await act(async () => {
        result.current.setFilter('recently-deleted');
      });

      // Deleted filter should sort by deletedAt descending (most recent first)
      expect(result.current.todos[0].text).toBe('Deleted last');
      expect(result.current.todos[1].text).toBe('Deleted middle');
      expect(result.current.todos[2].text).toBe('Deleted first');
    });

    it('should show active todos first in all filter, then completed', async () => {
      const mixedTodos = [
        {
          id: 'completed-1',
          text: 'Completed todo',
          completedAt: new Date('2024-01-02').toISOString(),
          sortOrder: '0|0i0000:',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'active-1',
          text: 'Active todo B',
          sortOrder: '0|0i0001:',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'active-2',
          text: 'Active todo A',
          sortOrder: '0|0i0000:',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
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
          json: () => Promise.resolve({ todos: mixedTodos }),
        });
      });

      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Switch to all filter
      await act(async () => {
        result.current.setFilter('all');
      });

      // All filter: active first (by sortOrder), then completed (by completedAt)
      expect(result.current.todos[0].text).toBe('Active todo A');
      expect(result.current.todos[1].text).toBe('Active todo B');
      expect(result.current.todos[2].text).toBe('Completed todo');
    });

    it('should put todos without sortOrder last among active', async () => {
      const todosWithMixedSortOrder = [
        {
          id: 'todo-1',
          text: 'Has sortOrder',
          sortOrder: '0|0i0000:',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'todo-2',
          text: 'No sortOrder',
          // No sortOrder field
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'todo-3',
          text: 'Also has sortOrder',
          sortOrder: '0|0i0001:',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
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
          json: () => Promise.resolve({ todos: todosWithMixedSortOrder }),
        });
      });

      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Active todos: those with sortOrder first (ascending), then without
      expect(result.current.todos[0].text).toBe('Has sortOrder');
      expect(result.current.todos[1].text).toBe('Also has sortOrder');
      expect(result.current.todos[2].text).toBe('No sortOrder');
    });
  });
});
