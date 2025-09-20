import { renderHook, act } from '@testing-library/react';
import { useTodos } from '../../hooks/useTodos';

describe('useTodos hook', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Use fake timers for timestamp tests
    jest.useFakeTimers();
  });

  afterEach(() => {
    localStorage.clear();
    jest.useRealTimers();
  });

  it('should initialize with empty todos array', () => {
    const { result } = renderHook(() => useTodos());

    expect(result.current.todos).toEqual([]);
    expect(result.current.filter).toBe('all');
  });

  it('should add a new todo', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('Learn React Testing');
    });

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0]).toMatchObject({
      text: 'Learn React Testing',
      completed: false,
    });
    expect(result.current.todos[0]).toHaveProperty('id');
    expect(result.current.todos[0]).toHaveProperty('createdAt');
    expect(result.current.todos[0]).toHaveProperty('updatedAt');
  });

  it('should generate unique IDs for each todo', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('First todo');
      result.current.addTodo('Second todo');
    });

    expect(result.current.todos).toHaveLength(2);
    expect(result.current.todos[0].id).not.toBe(result.current.todos[1].id);
  });

  it('should set createdAt and updatedAt timestamps', () => {
    const { result } = renderHook(() => useTodos());
    const beforeTime = new Date();

    act(() => {
      result.current.addTodo('Timestamped todo');
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

  it('should add todos to the beginning of the list', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('First todo');
      result.current.addTodo('Second todo');
    });

    expect(result.current.todos[0].text).toBe('Second todo');
    expect(result.current.todos[1].text).toBe('First todo');
  });

  it('should persist todos to localStorage when adding', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('Persistent todo');
    });

    const storedTodos = JSON.parse(localStorage.getItem('todos') || '[]');
    expect(storedTodos).toHaveLength(1);
    expect(storedTodos[0].text).toBe('Persistent todo');
  });

  it('should load todos from localStorage on initialization', () => {
    const existingTodos = [
      {
        id: 'existing-1',
        text: 'Existing todo',
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem('todos', JSON.stringify(existingTodos));

    const { result } = renderHook(() => useTodos());

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].text).toBe('Existing todo');
    expect(result.current.todos[0].createdAt).toBeInstanceOf(Date);
  });

  it('should handle corrupted localStorage data gracefully', () => {
    localStorage.setItem('todos', 'invalid json');

    const { result } = renderHook(() => useTodos());

    expect(result.current.todos).toEqual([]);
  });

  it('should not add empty or whitespace-only todos', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('');
      result.current.addTodo('   ');
      result.current.addTodo('\t\n');
    });

    expect(result.current.todos).toHaveLength(0);
  });

  it('should trim whitespace from todo text', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('  Trimmed todo  ');
    });

    expect(result.current.todos[0].text).toBe('Trimmed todo');
  });

  describe('toggleTodo', () => {
    it('should toggle a todo from incomplete to complete', () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo('Todo to toggle');
      });

      const todoId = result.current.todos[0].id;

      act(() => {
        result.current.toggleTodo(todoId);
      });

      expect(result.current.todos[0].completed).toBe(true);
      expect(result.current.todos[0].updatedAt).toBeInstanceOf(Date);
    });

    it('should toggle a todo from complete to incomplete', () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo('Todo to toggle back');
      });

      const todoId = result.current.todos[0].id;

      // Toggle to complete
      act(() => {
        result.current.toggleTodo(todoId);
      });

      // Toggle back to incomplete
      act(() => {
        result.current.toggleTodo(todoId);
      });

      expect(result.current.todos[0].completed).toBe(false);
    });

    it('should not affect other todos when toggling', () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo('First todo');
        result.current.addTodo('Second todo');
      });

      const secondTodoId = result.current.todos[0].id;

      act(() => {
        result.current.toggleTodo(secondTodoId);
      });

      expect(result.current.todos[0].completed).toBe(true);
      expect(result.current.todos[1].completed).toBe(false);
    });

    it('should handle toggling non-existent todo gracefully', () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo('Existing todo');
      });

      const originalTodos = result.current.todos;

      act(() => {
        result.current.toggleTodo('non-existent-id');
      });

      expect(result.current.todos).toEqual(originalTodos);
    });

    it('should persist todo state to localStorage when toggling', () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo('Todo to persist');
      });

      const todoId = result.current.todos[0].id;

      act(() => {
        result.current.toggleTodo(todoId);
      });

      const storedTodos = JSON.parse(localStorage.getItem('todos') || '[]');
      expect(storedTodos[0].completed).toBe(true);
    });
  });

  describe('deleteTodo', () => {
    it('should remove todo from list when deleted', () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo('Todo to delete');
        result.current.addTodo('Todo to keep');
      });

      expect(result.current.todos).toHaveLength(2);
      const todoToDeleteId = result.current.todos[1].id; // First todo added

      act(() => {
        result.current.deleteTodo(todoToDeleteId);
      });

      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].text).toBe('Todo to keep');
    });

    it('should handle deleting non-existent todo gracefully', () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo('Existing todo');
      });

      const originalTodos = result.current.todos;

      act(() => {
        result.current.deleteTodo('non-existent-id');
      });

      expect(result.current.todos).toEqual(originalTodos);
    });

    it('should not affect other todos when one is deleted', () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo('First todo');
        result.current.addTodo('Second todo');
        result.current.addTodo('Third todo');
      });

      const middleTodoId = result.current.todos[1].id;
      const firstTodoText = result.current.todos[0].text;
      const lastTodoText = result.current.todos[2].text;

      act(() => {
        result.current.deleteTodo(middleTodoId);
      });

      expect(result.current.todos).toHaveLength(2);
      expect(result.current.todos[0].text).toBe(firstTodoText);
      expect(result.current.todos[1].text).toBe(lastTodoText);
    });

    it('should work with both completed and incomplete todos', () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo('Incomplete todo');
        result.current.addTodo('Complete todo');
      });

      const completeTodoId = result.current.todos[0].id;

      // Mark one todo as complete
      act(() => {
        result.current.toggleTodo(completeTodoId);
      });

      expect(result.current.todos[0].completed).toBe(true);

      // Delete the completed todo
      act(() => {
        result.current.deleteTodo(completeTodoId);
      });

      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].text).toBe('Incomplete todo');
      expect(result.current.todos[0].completed).toBe(false);
    });

    it('should persist updated todo list to localStorage when deleting', () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo('Todo to delete');
        result.current.addTodo('Todo to keep');
      });

      const todoToDeleteId = result.current.todos[1].id;

      act(() => {
        result.current.deleteTodo(todoToDeleteId);
      });

      const storedTodos = JSON.parse(localStorage.getItem('todos') || '[]');
      expect(storedTodos).toHaveLength(1);
      expect(storedTodos[0].text).toBe('Todo to keep');
    });

    it('should handle deleting all todos', () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo('Only todo');
      });

      const todoId = result.current.todos[0].id;

      act(() => {
        result.current.deleteTodo(todoId);
      });

      expect(result.current.todos).toHaveLength(0);

      const storedTodos = JSON.parse(localStorage.getItem('todos') || '[]');
      expect(storedTodos).toHaveLength(0);
    });
  });

  describe('Edit Functionality', () => {
    it('should edit todo text when editTodo is called', () => {
      const { result } = renderHook(() => useTodos());

      // Add a todo first
      act(() => {
        result.current.addTodo('Original todo text');
      });

      const todoId = result.current.todos[0].id;

      // Edit the todo
      act(() => {
        result.current.editTodo(todoId, 'Updated todo text');
      });

      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].text).toBe('Updated todo text');
      expect(result.current.todos[0].id).toBe(todoId);
    });

    it('should preserve completion status when editing', () => {
      const { result } = renderHook(() => useTodos());

      // Add and complete a todo
      act(() => {
        result.current.addTodo('Completed todo');
      });

      const todoId = result.current.todos[0].id;

      act(() => {
        result.current.toggleTodo(todoId);
      });

      expect(result.current.todos[0].completed).toBe(true);

      // Edit the completed todo
      act(() => {
        result.current.editTodo(todoId, 'Updated completed todo');
      });

      expect(result.current.todos[0].text).toBe('Updated completed todo');
      expect(result.current.todos[0].completed).toBe(true);
    });

    it('should update updatedAt timestamp when editing', () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo('Todo to edit');
      });

      const todoId = result.current.todos[0].id;
      const originalUpdatedAt = result.current.todos[0].updatedAt;

      // Wait a small amount to ensure timestamp difference
      jest.advanceTimersByTime(10);

      act(() => {
        result.current.editTodo(todoId, 'Edited todo');
      });

      expect(result.current.todos[0].updatedAt).not.toEqual(originalUpdatedAt);
      expect(result.current.todos[0].updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );
    });

    it('should persist edited todos to localStorage', () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo('Todo to edit');
      });

      const todoId = result.current.todos[0].id;

      act(() => {
        result.current.editTodo(todoId, 'Edited todo text');
      });

      const storedTodos = JSON.parse(localStorage.getItem('todos') || '[]').map(
        (todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          updatedAt: new Date(todo.updatedAt),
        })
      );

      expect(storedTodos).toHaveLength(1);
      expect(storedTodos[0].text).toBe('Edited todo text');
      expect(storedTodos[0].id).toBe(todoId);
    });

    it('should handle editing non-existent todo gracefully', () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo('Existing todo');
      });

      const originalTodos = [...result.current.todos];

      // Try to edit a non-existent todo
      act(() => {
        result.current.editTodo('non-existent-id', 'Should not work');
      });

      // Todos should remain unchanged
      expect(result.current.todos).toEqual(originalTodos);
    });

    it('should handle empty text edit gracefully', () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo('Original text');
      });

      const todoId = result.current.todos[0].id;
      const originalTodos = [...result.current.todos];

      // Try to edit with empty text
      act(() => {
        result.current.editTodo(todoId, '');
      });

      // Todo should remain unchanged
      expect(result.current.todos).toEqual(originalTodos);
    });

    it('should trim whitespace from edited text', () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo('Original text');
      });

      const todoId = result.current.todos[0].id;

      act(() => {
        result.current.editTodo(todoId, '  Trimmed text  ');
      });

      expect(result.current.todos[0].text).toBe('Trimmed text');
    });

    it('should handle editing multiple todos independently', () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo('First todo');
        result.current.addTodo('Second todo');
        result.current.addTodo('Third todo');
      });

      const firstId = result.current.todos[0].id;
      const thirdId = result.current.todos[2].id;

      act(() => {
        result.current.editTodo(firstId, 'Edited first todo');
        result.current.editTodo(thirdId, 'Edited third todo');
      });

      expect(result.current.todos[0].text).toBe('Edited first todo');
      expect(result.current.todos[1].text).toBe('Second todo'); // Unchanged
      expect(result.current.todos[2].text).toBe('Edited third todo');
    });
  });
});
