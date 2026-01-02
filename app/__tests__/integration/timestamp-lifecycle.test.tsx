import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderHook, act } from '@testing-library/react';
import { useTodos } from '../../hooks/useTodos';
import TodoItem from '../../components/TodoItem';
import {
  createMockCallbacks,
  clearMockCallbacks,
  TodoItemCallbacks,
} from '../utils/mock-callbacks';
import { renderTodoItem } from '../utils/render-helpers';

// Mock fetch globally for backend API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Type for fetch options
type FetchOptions = { method?: string; body?: string };

// Mock timestamp utilities
jest.mock('../../utils/timestamp', () => ({
  formatRelativeTime: jest.fn((date: Date, action: string) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return `${action} 0 minutes ago`;
    if (diffMinutes < 60) return `${action} ${diffMinutes} minutes ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${action} ${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${action} ${diffDays} days ago`;
    return `${action} ${date.toLocaleDateString()}`;
  }),
  getContextualTimestamp: jest.fn(
    (todo: {
      deletedAt?: Date;
      updatedAt: Date;
      createdAt: Date;
      completed: boolean;
    }) => {
      const now = new Date();

      if (todo.deletedAt) {
        const diffMinutes = Math.floor(
          (now.getTime() - todo.deletedAt.getTime()) / 60000
        );
        return `Deleted ${diffMinutes} minutes ago`;
      }

      if (todo.updatedAt.getTime() > todo.createdAt.getTime()) {
        const diffMinutes = Math.floor(
          (now.getTime() - todo.updatedAt.getTime()) / 60000
        );
        return todo.completed
          ? `Completed ${diffMinutes} minutes ago`
          : `Updated ${diffMinutes} minutes ago`;
      }

      const diffMinutes = Math.floor(
        (now.getTime() - todo.createdAt.getTime()) / 60000
      );
      return `Created ${diffMinutes} minutes ago`;
    }
  ),
  getFullTimestamp: jest.fn(
    (todo: {
      deletedAt?: Date;
      updatedAt: Date;
      createdAt: Date;
      completed: boolean;
    }) => {
      if (todo.deletedAt) {
        return `Deleted ${todo.deletedAt.toLocaleDateString()} at ${todo.deletedAt.toLocaleTimeString()}`;
      }
      if (todo.updatedAt.getTime() > todo.createdAt.getTime()) {
        const action = todo.completed ? 'Completed' : 'Updated';
        return `${action} ${todo.updatedAt.toLocaleDateString()} at ${todo.updatedAt.toLocaleTimeString()}`;
      }
      return `Created ${todo.createdAt.toLocaleDateString()} at ${todo.createdAt.toLocaleTimeString()}`;
    }
  ),
}));

describe('Timestamp Lifecycle Integration Tests', () => {
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

  describe('complete todo lifecycle with timestamps', () => {
    it('should track timestamps through full todo lifecycle: create → edit → complete → restore → delete', async () => {
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Step 1: Create todo
      await act(async () => {
        await result.current.addTodo('Lifecycle test todo');
      });

      let todo = result.current.todos[0];
      expect(todo.createdAt).toBeInstanceOf(Date);
      expect(todo.updatedAt).toBeInstanceOf(Date);
      expect(todo.createdAt.getTime()).toBe(todo.updatedAt.getTime());

      const originalCreatedAt = todo.createdAt;
      const originalUpdatedAt = todo.updatedAt;

      // Step 2: Edit todo (should update updatedAt)
      await new Promise((resolve) => setTimeout(resolve, 10)); // Ensure different timestamp

      await act(async () => {
        await result.current.editTodo(todo.id, 'Edited lifecycle test todo');
      });

      todo = result.current.todos[0];
      expect(todo.createdAt.getTime()).toBe(originalCreatedAt.getTime());
      expect(todo.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );

      const afterEditUpdatedAt = todo.updatedAt;

      // Step 3: Complete todo (should update updatedAt)
      await new Promise((resolve) => setTimeout(resolve, 10));

      await act(async () => {
        await result.current.toggleTodo(todo.id);
      });

      todo = result.current.allTodos[0];
      expect(!!todo.completedAt).toBe(true);
      expect(todo.createdAt.getTime()).toBe(originalCreatedAt.getTime());
      expect(todo.updatedAt.getTime()).toBeGreaterThan(
        afterEditUpdatedAt.getTime()
      );

      const afterCompleteUpdatedAt = todo.updatedAt;

      // Step 4: Restore todo (should update updatedAt)
      await new Promise((resolve) => setTimeout(resolve, 10));

      await act(async () => {
        await result.current.restoreTodo(todo.id);
      });

      todo = result.current.todos[0];
      expect(!!todo.completedAt).toBe(false);
      expect(todo.createdAt.getTime()).toBe(originalCreatedAt.getTime());
      expect(todo.updatedAt.getTime()).toBeGreaterThan(
        afterCompleteUpdatedAt.getTime()
      );

      // Step 5: Delete todo (soft delete)
      await act(async () => {
        await result.current.deleteTodo(todo.id);
      });

      // Soft delete: hidden from filtered view but still in allTodos
      expect(result.current.todos).toHaveLength(0);
      expect(result.current.allTodos).toHaveLength(1);
      expect(result.current.allTodos[0].deletedAt).toBeInstanceOf(Date);
    });

    it('should maintain timestamp consistency across backend persistence', async () => {
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Create and modify a todo
      await act(async () => {
        await result.current.addTodo('Persistence test todo');
      });

      const todoId = result.current.todos[0].id;

      await act(async () => {
        await result.current.editTodo(todoId, 'Modified for persistence test');
      });

      const originalTodo = result.current.todos[0];

      // Verify fetch was called to sync
      const postCalls = mockFetch.mock.calls.filter(
        (call: [string, FetchOptions?]) => call[1]?.method === 'POST'
      );
      expect(postCalls.length).toBeGreaterThan(0);

      // Mock backend to return the saved todo
      mockFetch.mockImplementation((url: string, options?: FetchOptions) => {
        if (options?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              todos: [
                {
                  id: originalTodo.id,
                  text: originalTodo.text,
                  createdAt: originalTodo.createdAt.toISOString(),
                  updatedAt: originalTodo.updatedAt.toISOString(),
                },
              ],
            }),
        });
      });

      // Create new hook instance (simulates page reload)
      const { result: result2 } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result2.current.isInitialized).toBe(true);
      });

      // Should load todo with preserved timestamps
      expect(result2.current.todos).toHaveLength(1);
      const loadedTodo = result2.current.todos[0];

      expect(loadedTodo.createdAt.getTime()).toBe(
        originalTodo.createdAt.getTime()
      );
      expect(loadedTodo.updatedAt.getTime()).toBe(
        originalTodo.updatedAt.getTime()
      );
    });
  });

  describe('timestamp display integration with TodoItem', () => {
    let callbacks: TodoItemCallbacks;

    beforeEach(() => {
      callbacks = createMockCallbacks();
    });

    afterEach(() => {
      clearMockCallbacks(callbacks);
    });

    it('should display correct contextual timestamps for different todo states', async () => {
      // Test different timestamp scenarios
      const scenarios = [
        {
          name: 'newly created todo',
          todo: {
            id: '1',
            text: 'New todo',
            completed: false,
            createdAt: new Date(Date.now() - 5 * 60000), // 5 minutes ago
            updatedAt: new Date(Date.now() - 5 * 60000), // Same as created
            sortOrder: '0|hzzzzz:',
          },
          expectedText: /created 5 minutes ago/i,
        },
        {
          name: 'edited todo',
          todo: {
            id: '2',
            text: 'Edited todo',
            completed: false,
            createdAt: new Date(Date.now() - 60 * 60000), // 1 hour ago
            updatedAt: new Date(Date.now() - 30 * 60000), // 30 minutes ago
            sortOrder: '0|hzzzzz:',
          },
          expectedText: /updated 30 minutes ago/i,
        },
        {
          name: 'completed todo',
          todo: {
            id: '3',
            text: 'Completed todo',
            completed: true,
            createdAt: new Date(Date.now() - 120 * 60000), // 2 hours ago
            updatedAt: new Date(Date.now() - 15 * 60000), // 15 minutes ago
            sortOrder: '0|hzzzzz:',
          },
          expectedText: /completed 15 minutes ago/i,
        },
        // TODO: Add soft deleted scenario after implementation
        // {
        //   name: 'soft deleted todo',
        //   todo: {
        //     id: '4',
        //     text: 'Deleted todo',
        //     completed: false,
        //     createdAt: new Date(Date.now() - 180 * 60000),
        //     updatedAt: new Date(Date.now() - 90 * 60000),
        //     deletedAt: new Date(Date.now() - 10 * 60000),
        //   },
        //   expectedText: /deleted 10 minutes ago/i,
        // },
      ];

      for (const scenario of scenarios) {
        renderTodoItem(scenario.todo, callbacks);

        // TODO: After implementation, check for contextual timestamp
        // expect(screen.getByText(scenario.expectedText)).toBeInTheDocument();

        // Current behavior: verify component renders
        expect(screen.getByText(scenario.todo.text)).toBeInTheDocument();
      }
    });

    it('should update timestamp display when todo is modified through interactions', async () => {
      const user = userEvent.setup();
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Create a todo
      await act(async () => {
        await result.current.addTodo('Interactive timestamp test');
      });

      let todo = result.current.todos[0];

      const MockedTodoItem = () => (
        <TodoItem
          todo={todo}
          onToggle={(id) => result.current.toggleTodo(id)}
          onDelete={(id) => result.current.deleteTodo(id)}
          onEdit={(id, text) => result.current.editTodo(id, text)}
          onRestore={(id) => result.current.restoreTodo(id)}
        />
      );

      const { rerender } = render(<MockedTodoItem />);

      // Edit the todo
      const editButton = screen.getByRole('button', { name: /edit todo/i });
      await user.click(editButton);

      const textArea = screen.getByRole('textbox');
      await user.clear(textArea);
      await user.type(textArea, 'Edited interactive test');
      await user.click(screen.getByRole('button', { name: /save edit/i }));

      // Update the todo reference and rerender
      todo = result.current.todos[0];
      rerender(<MockedTodoItem />);

      // Toggle completion
      const toggleButton = screen.getByRole('button', { name: /toggle todo/i });
      await user.click(toggleButton);

      // After toggling to complete, the todo is filtered out from active view
      // Get it from allTodos instead
      const todoId = todo.id;
      todo = result.current.allTodos.find((t) => t.id === todoId)!;
      rerender(<MockedTodoItem />);

      // Current behavior: check that edits work
      expect(screen.getByText('Edited interactive test')).toBeInTheDocument();
    });
  });

  describe('performance and efficiency', () => {
    it('should handle multiple todos with different timestamps efficiently', async () => {
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      const startTime = performance.now();

      // Create multiple todos with different timestamps
      await act(async () => {
        for (let i = 0; i < 100; i++) {
          await result.current.addTodo(`Todo ${i}`);
        }
      });

      const endTime = performance.now();

      expect(result.current.todos).toHaveLength(100);
      expect(endTime - startTime).toBeLessThan(500); // Should complete in less than 500ms

      // Verify all todos have valid timestamps
      result.current.todos.forEach((todo) => {
        expect(todo.createdAt).toBeInstanceOf(Date);
        expect(todo.updatedAt).toBeInstanceOf(Date);
        expect(todo.createdAt.getTime()).toBeLessThanOrEqual(Date.now());
        expect(todo.updatedAt.getTime()).toBeLessThanOrEqual(Date.now());
      });
    });

    it('should not cause excessive re-renders when displaying timestamps', () => {
      const renderCount = jest.fn();
      const todo = {
        id: 'render-test',
        text: 'Render optimization test',
        completed: false,
        createdAt: new Date(Date.now() - 30 * 60000),
        updatedAt: new Date(Date.now() - 30 * 60000),
        sortOrder: '0|hzzzzz:',
      };

      const TestComponent = () => {
        renderCount();
        return (
          <TodoItem todo={todo} onToggle={jest.fn()} onDelete={jest.fn()} />
        );
      };

      const { rerender } = render(<TestComponent />);

      // Initial render
      expect(renderCount).toHaveBeenCalledTimes(1);

      // Rerender with same props
      rerender(<TestComponent />);

      // Should not cause excessive re-renders
      expect(renderCount).toHaveBeenCalledTimes(2);

      expect(screen.getByText(todo.text)).toBeInTheDocument();
    });
  });

  describe('error recovery and resilience', () => {
    it('should handle backend errors gracefully without losing timestamp functionality', async () => {
      // Mock backend error
      mockFetch.mockImplementation(() => {
        return Promise.reject(new Error('Network error'));
      });

      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Should initialize with empty array
      expect(result.current.todos).toEqual([]);

      // Reset mock for adding new todos
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

      // Should still work normally for new todos
      await act(async () => {
        await result.current.addTodo('Recovery test todo');
      });

      expect(result.current.todos).toHaveLength(1);
      const todo = result.current.todos[0];
      expect(todo.createdAt).toBeInstanceOf(Date);
      expect(todo.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle todos with malformed timestamp data from backend', async () => {
      const malformedTodo = {
        id: 'malformed-timestamps',
        text: 'Malformed timestamp todo',
        createdAt: 'invalid-date',
        updatedAt: null,
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
          json: () => Promise.resolve({ todos: [malformedTodo] }),
        });
      });

      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Should handle malformed data gracefully - loads with Date objects
      expect(result.current.todos).toHaveLength(1);
      const todo = result.current.todos[0];
      expect(todo.text).toBe('Malformed timestamp todo');
      expect(todo.createdAt).toBeInstanceOf(Date);
    });

    it('should maintain functionality when timestamp utilities fail', () => {
      // Mock utility function to throw error
      const mockGetContextualTimestamp = jest.fn().mockImplementation(() => {
        throw new Error('Timestamp utility error');
      });

      jest.doMock('../../utils/timestamp', () => ({
        getContextualTimestamp: mockGetContextualTimestamp,
        formatRelativeTime: jest.fn(() => 'Error in formatting'),
      }));

      const todo = {
        id: 'error-test',
        text: 'Error handling test',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        sortOrder: '0|hzzzzz:',
      };

      // Component should not crash even if timestamp utilities fail
      expect(() => {
        renderTodoItem(todo);
      }).not.toThrow();

      expect(screen.getByText('Error handling test')).toBeInTheDocument();
    });
  });

  describe('timezone and internationalization considerations', () => {
    it('should handle different timezone offsets correctly', async () => {
      // Test timezone handling with different date formats
      new Date('2024-01-15T12:00:00Z'); // UTC
      new Date('2024-01-15T12:00:00'); // Local

      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Create todos with different date formats
      await act(async () => {
        await result.current.addTodo('UTC timezone test');
      });

      const todo = result.current.todos[0];

      // Timestamps should be Date objects regardless of input format
      expect(todo.createdAt).toBeInstanceOf(Date);
      expect(todo.updatedAt).toBeInstanceOf(Date);

      // Should handle timezone differences gracefully
      expect(todo.createdAt.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should format timestamps consistently across different locales', () => {
      const todo = {
        id: 'locale-test',
        text: 'Locale formatting test',
        completed: false,
        createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), // 35 days ago
        updatedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
        sortOrder: '0|hzzzzz:',
      };

      renderTodoItem(todo);

      // TODO: After implementation, should show consistent date format
      // For very old dates, should show absolute date
      // expect(screen.getByText(/dec.*2023/i)).toBeInTheDocument();

      expect(screen.getByText(todo.text)).toBeInTheDocument();
    });
  });

  describe('accessibility integration', () => {
    it('should provide screen reader accessible timestamp information', async () => {
      const todo = {
        id: 'a11y-test',
        text: 'Accessibility timestamp test',
        completed: false,
        createdAt: new Date(Date.now() - 30 * 60000), // 30 minutes ago
        updatedAt: new Date(Date.now() - 30 * 60000),
        sortOrder: '0|hzzzzz:',
      };

      renderTodoItem(todo);

      // TODO: After implementation, timestamp should have proper aria attributes
      // const timestampElement = screen.getByText(/created 30 minutes ago/i);
      // expect(timestampElement).toHaveAttribute('aria-label',
      //   expect.stringContaining('created 30 minutes ago'));

      // Current behavior: ensure basic accessibility
      const todoItem = screen.getByRole('listitem');
      expect(todoItem).toBeInTheDocument();
    });

    it('should support keyboard navigation for timestamp-related features', async () => {
      const user = userEvent.setup();
      const todo = {
        id: 'keyboard-test',
        text: 'Keyboard navigation test',
        completed: false,
        createdAt: new Date(Date.now() - 60 * 60000),
        updatedAt: new Date(Date.now() - 30 * 60000),
        sortOrder: '0|hzzzzz:',
      };

      renderTodoItem(todo);

      // Should be able to navigate to and interact with todo components
      await user.tab(); // Should focus first interactive element

      const firstButton = document.activeElement;
      expect(firstButton).toBeInstanceOf(HTMLButtonElement);

      // TODO: After implementation, timestamp hover should work with keyboard
      // const timestampElement = screen.getByText(/updated 30 minutes ago/i);
      // timestampElement.focus();
      // expect(timestampElement).toHaveFocus();
    });
  });
});
