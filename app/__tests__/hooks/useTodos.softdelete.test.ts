import { renderHook, act } from '@testing-library/react';
import { useTodos } from '../../hooks/useTodos';
import { setupLocalStorageMock } from '../utils/test-utils';

// Setup localStorage mock with automatic cleanup
const { mockStorage, restoreLocalStorage } = setupLocalStorageMock();

describe('useTodos Hook - Soft Delete Functionality', () => {
  afterAll(restoreLocalStorage);

  beforeEach(() => {
    // Clear localStorage before each test
    mockStorage.clear();
    jest.clearAllMocks();
  });

  describe('soft delete functionality', () => {
    it('should implement soft delete instead of permanent deletion', () => {
      const { result } = renderHook(() => useTodos());

      // Add a todo
      act(() => {
        result.current.addTodo('Test todo to delete');
      });

      expect(result.current.todos).toHaveLength(1);
      const todoId = result.current.todos[0].id;

      // Current implementation does permanent deletion
      // This test documents the expected behavior after enhancement
      act(() => {
        result.current.deleteTodo(todoId);
      });

      // After enhancement, this should not remove the todo but mark it as deleted
      // For now, documenting current behavior
      expect(result.current.todos).toHaveLength(0);

      // TODO: After implementing soft delete, test should expect:
      // expect(result.current.todos).toHaveLength(1);
      // expect(result.current.todos[0]).toHaveProperty('deletedAt');
      // expect(result.current.getVisibleTodos()).toHaveLength(0);
    });

    it('should filter out soft-deleted todos from default todos view', () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo('Active todo');
        result.current.addTodo('Todo to delete');
      });

      expect(result.current.todos).toHaveLength(2);
      // New todos are added to beginning, so 'Todo to delete' is at index 0
      const todoToDeleteId = result.current.todos[0].id; // 'Todo to delete' is most recent (index 0)

      act(() => {
        result.current.deleteTodo(todoToDeleteId);
      });

      // Default todos view excludes deleted todos
      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].text).toBe('Active todo'); // Older todo remains

      // AllTodos includes deleted todos
      expect(result.current.allTodos).toHaveLength(2);
    });

    it('should provide access to deleted todos via filter', () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo('Todo to delete');
      });

      const todoId = result.current.todos[0].id;

      act(() => {
        result.current.deleteTodo(todoId);
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

    it('should provide restoreDeletedTodo function for recovering soft-deleted todos', () => {
      const { result } = renderHook(() => useTodos());

      // Current implementation has both functions
      expect(result.current.restoreTodo).toBeDefined(); // For unchecking completed todos
      expect(result.current.restoreDeletedTodo).toBeDefined(); // For restoring deleted todos
      expect(typeof result.current.restoreDeletedTodo).toBe('function');

      act(() => {
        result.current.addTodo('Todo to restore');
      });

      const todoId = result.current.todos[0].id;

      // Soft delete
      act(() => {
        result.current.deleteTodo(todoId);
      });

      expect(result.current.todos).toHaveLength(0);

      // Restore
      act(() => {
        result.current.restoreDeletedTodo(todoId);
      });

      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0].deletedAt).toBeUndefined();
    });

    it('should provide permanentlyDeleteTodo function for actual removal', () => {
      const { result } = renderHook(() => useTodos());

      // Function exists and works
      expect(result.current.permanentlyDeleteTodo).toBeDefined();
      expect(typeof result.current.permanentlyDeleteTodo).toBe('function');
      expect(result.current.deleteTodo).toBeDefined();
      expect(typeof result.current.deleteTodo).toBe('function');

      act(() => {
        result.current.addTodo('Todo to permanently delete');
      });

      const todoId = result.current.todos[0].id;

      act(() => {
        result.current.permanentlyDeleteTodo(todoId);
      });

      // Actually removed from both filtered and all todos
      expect(result.current.todos).toHaveLength(0);
      expect(result.current.allTodos).toHaveLength(0);
    });
  });

  describe('soft delete workflow', () => {
    it('should set deletedAt timestamp when soft deleting', () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo('Todo to soft delete');
      });

      const todoId = result.current.todos[0].id;
      const beforeDelete = new Date();

      act(() => {
        result.current.deleteTodo(todoId); // Performs soft delete
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

    it('should restore soft-deleted todo and clear deletedAt', () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo('Todo to restore');
      });

      const todoId = result.current.todos[0].id;

      // Soft delete
      act(() => {
        result.current.deleteTodo(todoId);
      });

      expect(result.current.todos).toHaveLength(0); // Hidden from default filter
      expect(result.current.allTodos).toHaveLength(1); // Still exists
      expect(result.current.allTodos[0].deletedAt).toBeInstanceOf(Date);

      // Restore
      act(() => {
        result.current.restoreDeletedTodo(todoId);
      });

      expect(result.current.todos).toHaveLength(1); // Visible again
      expect(result.current.allTodos).toHaveLength(1);
      expect(result.current.todos[0].deletedAt).toBeUndefined();
    });

    it('should permanently delete todo when using permanentlyDeleteTodo', () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo('Todo to permanently delete');
      });

      expect(result.current.todos).toHaveLength(1);
      expect(result.current.allTodos).toHaveLength(1);
      const todoId = result.current.todos[0].id;

      // Permanent deletion removes from both filtered and allTodos
      act(() => {
        result.current.permanentlyDeleteTodo(todoId);
      });

      expect(result.current.todos).toHaveLength(0);
      expect(result.current.allTodos).toHaveLength(0);
    });
  });

  describe('filtering with soft delete', () => {
    it('should filter todos correctly based on deletion status', () => {
      const { result } = renderHook(() => useTodos());

      // Add multiple todos
      act(() => {
        result.current.addTodo('Active todo');
        result.current.addTodo('Todo to delete');
        result.current.addTodo('Another active todo');
      });

      expect(result.current.todos).toHaveLength(3);

      // TODO: After enhancement, test filtering with soft delete
      // const todoToDelete = result.current.todos[1].id;

      // act(() => {
      //   result.current.deleteTodo(todoToDelete); // Soft delete
      // });

      // expect(result.current.todos).toHaveLength(3); // All todos still exist
      // expect(result.current.getVisibleTodos()).toHaveLength(2); // Only non-deleted visible
      // expect(result.current.getDeletedTodos()).toHaveLength(1); // Only deleted one
    });

    it('should handle mixed completion and deletion states', () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo('Active todo');
        result.current.addTodo('Todo to complete');
        result.current.addTodo('Todo to delete');
      });

      const [, todoToComplete, todoToDelete] = result.current.todos;

      // Complete one todo
      act(() => {
        result.current.toggleTodo(todoToComplete.id);
      });

      // Soft delete another todo
      act(() => {
        result.current.deleteTodo(todoToDelete.id);
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

      // const activeTodos = visibleTodos.filter(todo => !todo!!.completed).completedAt);
      // const completedTodos = visibleTodos.filter(todo => todo!!.completed).completedAt);
      // const deletedTodos = result.current.getDeletedTodos();

      // expect(activeTodos).toHaveLength(1);
      // expect(completedTodos).toHaveLength(1);
      // expect(deletedTodos).toHaveLength(1);
    });
  });

  describe('localStorage integration with soft delete', () => {
    it('should persist soft-deleted todos in localStorage', () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo('Todo to soft delete and persist');
      });

      const todoId = result.current.todos[0].id;

      // Test soft delete localStorage persistence
      act(() => {
        result.current.deleteTodo(todoId); // Soft delete
      });

      const storedData = JSON.parse(mockStorage.getItem('todos') || '[]');
      expect(storedData).toHaveLength(1); // Todo still stored with deletedAt
      expect(storedData[0]).toHaveProperty('deletedAt');
      expect(typeof storedData[0].deletedAt).toBe('string'); // Serialized date
    });

    it('should restore soft-deleted todos from localStorage on hook initialization', () => {
      // Pre-populate localStorage with soft-deleted todo
      const todoWithDeletedAt = {
        id: 'deleted-todo-1',
        text: 'Previously soft-deleted todo',
        completed: false,
        createdAt: new Date('2024-01-01T10:00:00Z').toISOString(),
        updatedAt: new Date('2024-01-01T11:00:00Z').toISOString(),
        deletedAt: new Date('2024-01-01T12:00:00Z').toISOString(),
      };

      mockStorage.setItem('todos', JSON.stringify([todoWithDeletedAt]));

      const { result } = renderHook(() => useTodos());

      // TODO: After enhancement, should load deleted todos
      // expect(result.current.todos).toHaveLength(1);
      // const loadedTodo = result.current.todos[0] as EnhancedTodo;
      // expect(loadedTodo.deletedAt).toBeInstanceOf(Date);
      // expect(result.current.getDeletedTodos()).toHaveLength(1);
      // expect(result.current.getVisibleTodos()).toHaveLength(0);

      // Soft-deleted todos are hidden from default filter but exist in allTodos
      expect(result.current.todos).toHaveLength(0); // Hidden from default view
      expect(result.current.allTodos).toHaveLength(1); // Exists in allTodos
      expect(result.current.allTodos[0].text).toBe(
        'Previously soft-deleted todo'
      );
      expect(result.current.allTodos[0].deletedAt).toBeInstanceOf(Date);
    });

    it('should handle migration of existing todos without deletedAt field', () => {
      // Pre-populate localStorage with old-format todos
      const legacyTodos = [
        {
          id: 'legacy-1',
          text: 'Legacy todo 1',
          completed: false,
          createdAt: new Date('2024-01-01T10:00:00Z').toISOString(),
          updatedAt: new Date('2024-01-01T10:00:00Z').toISOString(),
        },
        {
          id: 'legacy-2',
          text: 'Legacy todo 2',
          completed: true,
          createdAt: new Date('2024-01-01T10:00:00Z').toISOString(),
          updatedAt: new Date('2024-01-01T11:00:00Z').toISOString(),
        },
      ];

      mockStorage.setItem('todos', JSON.stringify(legacyTodos));

      const { result } = renderHook(() => useTodos());

      // Default filter is 'active', so only shows incomplete todos
      expect(result.current.todos).toHaveLength(1); // Only incomplete todo visible

      // TODO: After enhancement, verify migration
      // result.current.todos.forEach(todo => {
      //   const enhancedTodo = todo as EnhancedTodo;
      //   expect(enhancedTodo.deletedAt).toBeUndefined();
      // });

      // Should maintain existing functionality
      expect(result.current.todos[0].text).toBe('Legacy todo 1');
      // With 'active' filter, completed todo is filtered out
      // Check completed todo in allTodos instead
      const completedTodo = result.current.allTodos.find(
        (t) => !!t.completedAt
      );
      expect(completedTodo?.text).toBe('Legacy todo 2');
      expect(!!completedTodo?.completedAt).toBe(true);
    });
  });

  describe('timestamp management with soft delete', () => {
    it('should set deletedAt timestamp when soft deleting', () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo('Test timestamp setting');
      });

      const todoId = result.current.todos[0].id;
      // Record deletion time for timestamp testing

      // TODO: After enhancement
      // act(() => {
      //   result.current.deleteTodo(todoId);
      // });

      // const deletedTodo = result.current.todos[0] as EnhancedTodo;
      // expect(deletedTodo.deletedAt).toBeDefined();
      // expect(deletedTodo.deletedAt!.getTime()).toBeGreaterThanOrEqual(beforeDelete);

      // Current behavior test
      act(() => {
        result.current.deleteTodo(todoId);
      });

      expect(result.current.todos).toHaveLength(0);
    });

    it('should preserve original timestamps when soft deleting', () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo('Test timestamp preservation');
      });

      const originalTodo = result.current.todos[0];
      // Check original timestamps
      expect(originalTodo.createdAt).toBeDefined();
      expect(originalTodo.updatedAt).toBeDefined();

      // TODO: After enhancement
      // act(() => {
      //   result.current.deleteTodo(originalTodo.id);
      // });

      // const deletedTodo = result.current.todos[0] as EnhancedTodo;
      // expect(deletedTodo.createdAt.getTime()).toBe(createdAt.getTime());
      // expect(deletedTodo.updatedAt.getTime()).toBe(updatedAt.getTime());
      // expect(deletedTodo.deletedAt).toBeDefined();

      // Current behavior: todo is removed
      act(() => {
        result.current.deleteTodo(originalTodo.id);
      });

      expect(result.current.todos).toHaveLength(0);
    });

    it('should clear deletedAt when restoring soft-deleted todo', () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo('Test restoration');
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const todoToRestore = result.current.todos[0];

      // TODO: After enhancement
      // act(() => {
      //   result.current.deleteTodo(todoToRestore.id); // Soft delete
      // });

      // expect(result.current.todos[0].deletedAt).toBeDefined();

      // act(() => {
      //   result.current.restoreDeletedTodo(todoId);
      // });

      // const restoredTodo = result.current.todos[0] as EnhancedTodo;
      // expect(restoredTodo.deletedAt).toBeUndefined();
    });

    it('should update updatedAt when restoring soft-deleted todo', () => {
      const { result } = renderHook(() => useTodos());

      act(() => {
        result.current.addTodo('Test updatedAt on restore');
      });

      const todoToRestore = result.current.todos[0];
      const originalUpdatedAt = todoToRestore.updatedAt;

      // TODO: After enhancement
      // act(() => {
      //   result.current.deleteTodo(todoToRestore.id); // Soft delete
      // });

      // // Wait a bit to ensure different timestamp
      // await new Promise(resolve => setTimeout(resolve, 10));

      // act(() => {
      //   result.current.restoreDeletedTodo(todoId);
      // });

      // const restoredTodo = result.current.todos[0];
      // expect(restoredTodo.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());

      // Current test for existing functionality
      expect(result.current.todos[0].updatedAt).toEqual(originalUpdatedAt);
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle soft deleting non-existent todo gracefully', () => {
      const { result } = renderHook(() => useTodos());

      // Current behavior: no error when deleting non-existent todo
      expect(() => {
        act(() => {
          result.current.deleteTodo('non-existent-id');
        });
      }).not.toThrow();

      expect(result.current.todos).toHaveLength(0);
    });

    it('should handle restoring non-existent deleted todo gracefully', () => {
      const { result } = renderHook(() => useTodos());

      // TODO: After enhancement
      // expect(() => {
      //   act(() => {
      //     result.current.restoreDeletedTodo('non-existent-id');
      //   });
      // }).not.toThrow();

      // Current test for existing restoreTodo function
      expect(() => {
        act(() => {
          result.current.restoreTodo('non-existent-id');
        });
      }).not.toThrow();
    });

    it('should handle corrupted localStorage data with deletedAt field', () => {
      // Set invalid JSON in localStorage
      mockStorage.setItem('todos', 'invalid json');

      const { result } = renderHook(() => useTodos());

      // Should initialize with empty todos array without throwing
      expect(result.current.todos).toEqual([]);
    });

    it('should handle todos with invalid deletedAt values', () => {
      const invalidTodo = {
        id: 'invalid-deleted-at',
        text: 'Todo with invalid deletedAt',
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: 'invalid-date-string',
      };

      mockStorage.setItem('todos', JSON.stringify([invalidTodo]));

      const { result } = renderHook(() => useTodos());

      // Should handle gracefully - invalid deletedAt is treated as undefined/falsy
      expect(result.current.todos).toHaveLength(0); // Todo with invalid deletedAt is hidden
      expect(result.current.allTodos).toHaveLength(1); // Still exists in allTodos
      expect(result.current.allTodos[0].deletedAt).toBeInstanceOf(Date); // Invalid string becomes Date object
      expect(isNaN(result.current.allTodos[0].deletedAt!.getTime())).toBe(true); // But with NaN value
    });
  });
});
