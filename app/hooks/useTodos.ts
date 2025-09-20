import { useState, useEffect } from 'react';
import { Todo, TodoState } from '../types/todo';

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
    filter: 'all',
  });

  // Load todos from localStorage on initialization
  useEffect(() => {
    try {
      const storedTodos = localStorage.getItem(STORAGE_KEY);
      if (storedTodos) {
        const parsedTodos = JSON.parse(storedTodos);
        // Convert date strings back to Date objects
        const todosWithDates = parsedTodos.map((todo: Todo) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          updatedAt: new Date(todo.updatedAt),
        }));
        setState({
          todos: todosWithDates,
          filter: 'all',
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
      completed: false,
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

  return {
    todos: state.todos,
    filter: state.filter,
    addTodo,
  };
}
