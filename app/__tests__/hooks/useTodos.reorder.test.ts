import { renderHook, act } from '@testing-library/react';
import { useTodos } from '../../hooks/useTodos';

describe('useTodos hook - Reordering functionality', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    localStorage.clear();
    jest.useRealTimers();
  });

  describe('reorderTodos', () => {
    it('should have reorderTodos function available', () => {
      const { result } = renderHook(() => useTodos());

      expect(result.current.reorderTodos).toBeDefined();
      expect(typeof result.current.reorderTodos).toBe('function');
    });

    it('should reorder todos when moving item from index 0 to index 2', () => {
      const { result } = renderHook(() => useTodos());

      // Add three todos
      act(() => {
        result.current.addTodo('First todo');
        result.current.addTodo('Second todo');
        result.current.addTodo('Third todo');
      });

      // Should be in reverse order (newest first)
      expect(result.current.todos[0].text).toBe('Third todo');
      expect(result.current.todos[1].text).toBe('Second todo');
      expect(result.current.todos[2].text).toBe('First todo');

      // Move first item (Third todo) to position 2
      act(() => {
        result.current.reorderTodos(0, 2);
      });

      // Should reorder: Second, First, Third
      expect(result.current.todos[0].text).toBe('Second todo');
      expect(result.current.todos[1].text).toBe('First todo');
      expect(result.current.todos[2].text).toBe('Third todo');
    });

    it('should reorder todos when moving item from index 2 to index 0', () => {
      const { result } = renderHook(() => useTodos());

      // Add three todos
      act(() => {
        result.current.addTodo('First todo');
        result.current.addTodo('Second todo');
        result.current.addTodo('Third todo');
      });

      // Move last item (First todo) to position 0
      act(() => {
        result.current.reorderTodos(2, 0);
      });

      // Should reorder: First, Third, Second
      expect(result.current.todos[0].text).toBe('First todo');
      expect(result.current.todos[1].text).toBe('Third todo');
      expect(result.current.todos[2].text).toBe('Second todo');
    });

    it('should persist reordered todos to localStorage', () => {
      const { result } = renderHook(() => useTodos());

      // Add two todos
      act(() => {
        result.current.addTodo('First todo');
        result.current.addTodo('Second todo');
      });

      // Reorder
      act(() => {
        result.current.reorderTodos(0, 1);
      });

      // Check localStorage
      const storedTodos = JSON.parse(localStorage.getItem('todos') || '[]');
      expect(storedTodos).toHaveLength(2);
      expect(storedTodos[0].text).toBe('First todo');
      expect(storedTodos[1].text).toBe('Second todo');
    });

    it('should handle reordering with same source and destination index', () => {
      const { result } = renderHook(() => useTodos());

      // Add two todos
      act(() => {
        result.current.addTodo('First todo');
        result.current.addTodo('Second todo');
      });

      const originalTodos = [...result.current.todos];

      // Try to reorder to same position
      act(() => {
        result.current.reorderTodos(0, 0);
      });

      // Should remain unchanged
      expect(result.current.todos).toEqual(originalTodos);
    });

    it('should handle invalid indices gracefully', () => {
      const { result } = renderHook(() => useTodos());

      // Add two todos
      act(() => {
        result.current.addTodo('First todo');
        result.current.addTodo('Second todo');
      });

      const originalTodos = [...result.current.todos];

      // Try invalid source index
      act(() => {
        result.current.reorderTodos(5, 0);
      });

      expect(result.current.todos).toEqual(originalTodos);

      // Try invalid destination index
      act(() => {
        result.current.reorderTodos(0, 5);
      });

      expect(result.current.todos).toEqual(originalTodos);

      // Try negative indices
      act(() => {
        result.current.reorderTodos(-1, 0);
      });

      expect(result.current.todos).toEqual(originalTodos);
    });

    it('should handle reordering empty todo list', () => {
      const { result } = renderHook(() => useTodos());

      expect(result.current.todos).toHaveLength(0);

      // Try to reorder empty list
      act(() => {
        result.current.reorderTodos(0, 1);
      });

      expect(result.current.todos).toHaveLength(0);
    });

    it('should maintain todo properties when reordering', () => {
      const { result } = renderHook(() => useTodos());

      // Add and modify todos
      act(() => {
        result.current.addTodo('First todo');
        result.current.addTodo('Second todo');
      });

      const secondTodoId = result.current.todos[0].id;

      // Toggle second todo
      act(() => {
        result.current.toggleTodo(secondTodoId);
      });

      // Use allTodos to access completed todos since default filter is now "active"
      expect(!!result.current.allTodos[0].completedAt).toBe(true);

      // Reorder (works on allTodos internally)
      act(() => {
        result.current.reorderTodos(0, 1);
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
    it('should have moveUp function available', () => {
      const { result } = renderHook(() => useTodos());

      expect(result.current.moveUp).toBeDefined();
      expect(typeof result.current.moveUp).toBe('function');
    });

    it('should have moveDown function available', () => {
      const { result } = renderHook(() => useTodos());

      expect(result.current.moveDown).toBeDefined();
      expect(typeof result.current.moveDown).toBe('function');
    });

    it('should move todo up when moveUp is called', () => {
      const { result } = renderHook(() => useTodos());

      // Add three todos
      act(() => {
        result.current.addTodo('First todo');
        result.current.addTodo('Second todo');
        result.current.addTodo('Third todo');
      });

      const secondTodoId = result.current.todos[1].id; // "Second todo"

      // Move second todo up
      act(() => {
        result.current.moveUp(secondTodoId);
      });

      // Second todo should now be at index 0
      expect(result.current.todos[0].id).toBe(secondTodoId);
      expect(result.current.todos[0].text).toBe('Second todo');
    });

    it('should move todo down when moveDown is called', () => {
      const { result } = renderHook(() => useTodos());

      // Add three todos
      act(() => {
        result.current.addTodo('First todo');
        result.current.addTodo('Second todo');
        result.current.addTodo('Third todo');
      });

      const firstTodoId = result.current.todos[0].id; // "Third todo"

      // Move first todo down
      act(() => {
        result.current.moveDown(firstTodoId);
      });

      // Third todo should now be at index 1
      expect(result.current.todos[1].id).toBe(firstTodoId);
      expect(result.current.todos[1].text).toBe('Third todo');
    });

    it('should not move todo up if already at top', () => {
      const { result } = renderHook(() => useTodos());

      // Add two todos
      act(() => {
        result.current.addTodo('First todo');
        result.current.addTodo('Second todo');
      });

      const topTodoId = result.current.todos[0].id;
      const originalOrder = [...result.current.todos];

      // Try to move top todo up
      act(() => {
        result.current.moveUp(topTodoId);
      });

      // Order should remain unchanged
      expect(result.current.todos).toEqual(originalOrder);
    });

    it('should not move todo down if already at bottom', () => {
      const { result } = renderHook(() => useTodos());

      // Add two todos
      act(() => {
        result.current.addTodo('First todo');
        result.current.addTodo('Second todo');
      });

      const bottomTodoId = result.current.todos[1].id;
      const originalOrder = [...result.current.todos];

      // Try to move bottom todo down
      act(() => {
        result.current.moveDown(bottomTodoId);
      });

      // Order should remain unchanged
      expect(result.current.todos).toEqual(originalOrder);
    });

    it('should handle moveUp with invalid todo id', () => {
      const { result } = renderHook(() => useTodos());

      // Add one todo
      act(() => {
        result.current.addTodo('Single todo');
      });

      const originalOrder = [...result.current.todos];

      // Try to move non-existent todo
      act(() => {
        result.current.moveUp('invalid-id');
      });

      expect(result.current.todos).toEqual(originalOrder);
    });

    it('should handle moveDown with invalid todo id', () => {
      const { result } = renderHook(() => useTodos());

      // Add one todo
      act(() => {
        result.current.addTodo('Single todo');
      });

      const originalOrder = [...result.current.todos];

      // Try to move non-existent todo
      act(() => {
        result.current.moveDown('invalid-id');
      });

      expect(result.current.todos).toEqual(originalOrder);
    });
  });
});
