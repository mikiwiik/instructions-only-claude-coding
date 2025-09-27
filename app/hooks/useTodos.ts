import { useState, useEffect } from 'react';
import { Todo, TodoState, TodoFilter } from '../types/todo';

const STORAGE_KEY = 'todos';

// Generate a unique ID compatible with all browsers
function generateId(): string {
  // Use crypto.randomUUID if available (modern browsers), otherwise fallback
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers or test environments
  return (
    'todo-' +
    Math.random().toString(36).substring(2) +
    '-' +
    Date.now().toString(36)
  );
}

export function useTodos() {
  const [state, setState] = useState<TodoState>({
    todos: [],
    filter: 'active',
  });

  // Load todos from localStorage on initialization
  useEffect(() => {
    try {
      const storedTodos = localStorage.getItem(STORAGE_KEY);
      if (storedTodos) {
        const parsedTodos = JSON.parse(storedTodos);
        // Convert date strings back to Date objects and ensure backward compatibility
        const todosWithDates = parsedTodos.map(
          (
            todo: Partial<Todo> & {
              createdAt: string;
              updatedAt: string;
              deletedAt?: string;
              completedAt?: string;
              completed?: boolean;
            }
          ) => ({
            ...todo,
            createdAt: new Date(todo.createdAt),
            updatedAt: new Date(todo.updatedAt),
            // Backward compatibility: existing todos don't have deletedAt
            deletedAt: todo.deletedAt ? new Date(todo.deletedAt) : undefined,
            // Migration: convert old completed boolean to completedAt date
            completedAt: todo.completedAt
              ? new Date(todo.completedAt)
              : todo.completed
                ? new Date(todo.updatedAt)
                : undefined,
          })
        );
        setState({
          todos: todosWithDates,
          filter: 'active',
        });
      }
    } catch (error) {
      // Handle corrupted localStorage data gracefully
      // eslint-disable-next-line no-console
      console.warn('Failed to load todos from localStorage:', error);
    }
  }, []);

  // Save todos to localStorage whenever todos change
  const saveTodos = (todos: Todo[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to save todos to localStorage:', error);
    }
  };

  const addTodo = (text: string) => {
    const trimmedText = text.trim();

    // Don't add empty or whitespace-only todos
    if (!trimmedText) {
      return;
    }

    const now = new Date();
    const newTodo: Todo = {
      id: generateId(),
      text: trimmedText,
      completedAt: undefined,
      createdAt: now,
      updatedAt: now,
    };

    setState((prev) => {
      const updatedTodos = [newTodo, ...prev.todos];
      saveTodos(updatedTodos);
      return {
        ...prev,
        todos: updatedTodos,
      };
    });
  };

  const toggleTodo = (id: string) => {
    setState((prev) => {
      const updatedTodos = prev.todos.map((todo) => {
        if (todo.id === id) {
          const now = new Date();
          return {
            ...todo,
            completedAt: todo.completedAt ? undefined : now,
            updatedAt: now,
          };
        }
        return todo;
      });

      saveTodos(updatedTodos);
      return {
        ...prev,
        todos: updatedTodos,
      };
    });
  };

  const restoreTodo = (id: string) => {
    setState((prev) => {
      const updatedTodos = prev.todos.map((todo) => {
        if (todo.id === id && todo.completedAt) {
          return {
            ...todo,
            completedAt: undefined,
            updatedAt: new Date(),
          };
        }
        return todo;
      });

      saveTodos(updatedTodos);
      return {
        ...prev,
        todos: updatedTodos,
      };
    });
  };

  const deleteTodo = (id: string) => {
    setState((prev) => {
      const updatedTodos = prev.todos.map((todo) => {
        if (todo.id === id) {
          return {
            ...todo,
            deletedAt: new Date(),
          };
        }
        return todo;
      });
      saveTodos(updatedTodos);
      return {
        ...prev,
        todos: updatedTodos,
      };
    });
  };

  const permanentlyDeleteTodo = (id: string) => {
    setState((prev) => {
      const updatedTodos = prev.todos.filter((todo) => todo.id !== id);
      saveTodos(updatedTodos);
      return {
        ...prev,
        todos: updatedTodos,
      };
    });
  };

  const restoreDeletedTodo = (id: string) => {
    setState((prev) => {
      const updatedTodos = prev.todos.map((todo) => {
        if (todo.id === id && todo.deletedAt) {
          return {
            ...todo,
            deletedAt: undefined,
            updatedAt: new Date(),
          };
        }
        return todo;
      });
      saveTodos(updatedTodos);
      return {
        ...prev,
        todos: updatedTodos,
      };
    });
  };

  const editTodo = (id: string, newText: string) => {
    const trimmedText = newText.trim();

    // Don't edit with empty or whitespace-only text
    if (!trimmedText) {
      return;
    }

    setState((prev) => {
      const updatedTodos = prev.todos.map((todo) => {
        if (todo.id === id) {
          return {
            ...todo,
            text: trimmedText,
            updatedAt: new Date(),
          };
        }
        return todo;
      });

      saveTodos(updatedTodos);
      return {
        ...prev,
        todos: updatedTodos,
      };
    });
  };

  const reorderTodos = (sourceIndex: number, destinationIndex: number) => {
    setState((prev) => {
      // Validate indices
      if (
        sourceIndex < 0 ||
        destinationIndex < 0 ||
        sourceIndex >= prev.todos.length ||
        destinationIndex >= prev.todos.length ||
        sourceIndex === destinationIndex
      ) {
        return prev;
      }

      const newTodos = [...prev.todos];
      const [movedTodo] = newTodos.splice(sourceIndex, 1);
      newTodos.splice(destinationIndex, 0, movedTodo);

      saveTodos(newTodos);
      return {
        ...prev,
        todos: newTodos,
      };
    });
  };

  const moveUp = (todoId: string) => {
    setState((prev) => {
      const currentIndex = prev.todos.findIndex((todo) => todo.id === todoId);

      if (currentIndex <= 0) {
        return prev; // Already at top or not found
      }

      const newTodos = [...prev.todos];
      const [movedTodo] = newTodos.splice(currentIndex, 1);
      newTodos.splice(currentIndex - 1, 0, movedTodo);

      saveTodos(newTodos);
      return {
        ...prev,
        todos: newTodos,
      };
    });
  };

  const moveDown = (todoId: string) => {
    setState((prev) => {
      const currentIndex = prev.todos.findIndex((todo) => todo.id === todoId);

      if (currentIndex < 0 || currentIndex >= prev.todos.length - 1) {
        return prev; // Already at bottom or not found
      }

      const newTodos = [...prev.todos];
      const [movedTodo] = newTodos.splice(currentIndex, 1);
      newTodos.splice(currentIndex + 1, 0, movedTodo);

      saveTodos(newTodos);
      return {
        ...prev,
        todos: newTodos,
      };
    });
  };

  // Filter todos based on current filter
  const getFilteredTodos = () => {
    switch (state.filter) {
      case 'active':
        return state.todos.filter(
          (todo) => !todo.completedAt && !todo.deletedAt
        );
      case 'completed':
        return state.todos.filter(
          (todo) => todo.completedAt && !todo.deletedAt
        );
      case 'recently-deleted':
        return state.todos.filter((todo) => todo.deletedAt);
      case 'all':
      default:
        return state.todos.filter((todo) => !todo.deletedAt);
    }
  };

  const setFilter = (filter: TodoFilter) => {
    setState((prev) => ({
      ...prev,
      filter,
    }));
  };

  return {
    todos: getFilteredTodos(),
    allTodos: state.todos,
    filter: state.filter,
    addTodo,
    toggleTodo,
    restoreTodo,
    deleteTodo,
    permanentlyDeleteTodo,
    restoreDeletedTodo,
    editTodo,
    reorderTodos,
    moveUp,
    moveDown,
    setFilter,
  };
}
