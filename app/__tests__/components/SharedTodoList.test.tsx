/**
 * Tests for SharedTodoList component
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SharedTodoList } from '@/components/SharedTodoList';
import type { Todo } from '@/types/todo';

// Mock useSharedTodos
const mockAddTodo = jest.fn();
const mockToggleTodo = jest.fn();
const mockDeleteTodo = jest.fn();

const mockReturnValue = {
  todos: [] as Todo[],
  addTodo: mockAddTodo,
  toggleTodo: mockToggleTodo,
  deleteTodo: mockDeleteTodo,
  updateTodo: jest.fn(),
  reorderTodos: jest.fn(),
  refreshTodos: jest.fn(),
  syncState: {
    status: 'synced' as const,
    pendingCount: 0,
    lastSyncTime: Date.now(),
    errors: [] as Array<{
      todoId: string;
      operation: string;
      error: string;
      timestamp: number;
    }>,
  },
  isConnected: true,
  queueStatus: {
    pendingCount: 0,
    isProcessing: false,
  },
};

const mockUseSharedTodos = jest.fn(() => mockReturnValue);

jest.mock('@/hooks/useSharedTodos', () => ({
  useSharedTodos: () => mockUseSharedTodos(),
}));

describe('SharedTodoList', () => {
  const mockTodos: Todo[] = [
    {
      id: 'todo-1',
      text: 'Test todo 1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'todo-2',
      text: 'Test todo 2',
      completedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render sync status indicator', () => {
    render(<SharedTodoList listId='list-1' userId='user-1' />);

    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('should show disconnected status when not connected', () => {
    mockUseSharedTodos.mockReturnValueOnce({
      ...mockReturnValue,
      isConnected: false,
    });

    render(<SharedTodoList listId='list-1' userId='user-1' />);

    expect(screen.getByText('Disconnected')).toBeInTheDocument();
  });

  it('should render todo list', () => {
    mockUseSharedTodos.mockReturnValueOnce({
      ...mockReturnValue,
      todos: mockTodos,
    });

    render(<SharedTodoList listId='list-1' userId='user-1' />);

    expect(screen.getByText('Test todo 1')).toBeInTheDocument();
    expect(screen.getByText('Test todo 2')).toBeInTheDocument();
  });

  it('should show pending operations count', () => {
    mockUseSharedTodos.mockReturnValueOnce({
      ...mockReturnValue,
      queueStatus: {
        pendingCount: 2,
        isProcessing: true,
      },
    });

    render(<SharedTodoList listId='list-1' userId='user-1' />);

    expect(screen.getByText(/Syncing 2 changes/)).toBeInTheDocument();
  });

  it('should show last sync time when available', () => {
    const lastSyncTime = Date.now();
    mockUseSharedTodos.mockReturnValueOnce({
      ...mockReturnValue,
      syncState: {
        ...mockReturnValue.syncState,
        lastSyncTime,
      },
    });

    render(<SharedTodoList listId='list-1' userId='user-1' />);

    expect(screen.getByText(/Last sync:/)).toBeInTheDocument();
  });

  describe('add todo', () => {
    it('should call addTodo when form is submitted', async () => {
      render(<SharedTodoList listId='list-1' userId='user-1' />);

      const input = screen.getByLabelText('New todo text');
      const addButton = screen.getByLabelText('Add todo');

      fireEvent.change(input, { target: { value: 'New todo' } });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockAddTodo).toHaveBeenCalledWith('New todo');
      });
    });

    it('should clear input after adding todo', async () => {
      render(<SharedTodoList listId='list-1' userId='user-1' />);

      const input = screen.getByLabelText('New todo text') as HTMLInputElement;
      const addButton = screen.getByLabelText('Add todo');

      fireEvent.change(input, { target: { value: 'New todo' } });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });

    it('should not add empty todos', () => {
      render(<SharedTodoList listId='list-1' userId='user-1' />);

      const addButton = screen.getByLabelText('Add todo');
      fireEvent.click(addButton);

      expect(mockAddTodo).not.toHaveBeenCalled();
    });

    it('should disable add button when disconnected', () => {
      mockUseSharedTodos.mockReturnValueOnce({
        ...mockReturnValue,
        isConnected: false,
      });

      render(<SharedTodoList listId='list-1' userId='user-1' />);

      const input = screen.getByLabelText('New todo text');
      expect(input).toBeDisabled();
    });
  });

  describe('todo interactions', () => {
    beforeEach(() => {
      mockUseSharedTodos.mockReturnValueOnce({
        ...mockReturnValue,
        todos: mockTodos,
      });
    });

    it('should toggle todo when checkbox is clicked', () => {
      render(<SharedTodoList listId='list-1' userId='user-1' />);

      const checkbox = screen.getAllByRole('checkbox')[0];
      fireEvent.click(checkbox);

      expect(mockToggleTodo).toHaveBeenCalledWith('todo-1');
    });

    it('should delete todo when delete button is clicked', () => {
      render(<SharedTodoList listId='list-1' userId='user-1' />);

      const deleteButtons = screen.getAllByText('Delete');
      fireEvent.click(deleteButtons[0]);

      expect(mockDeleteTodo).toHaveBeenCalledWith('todo-1');
    });

    it('should show completed todos with strikethrough', () => {
      render(<SharedTodoList listId='list-1' userId='user-1' />);

      const completedTodo = screen.getByText('Test todo 2');
      expect(completedTodo).toHaveClass('line-through');
    });

    it('should disable interactions when disconnected', () => {
      mockUseSharedTodos.mockReturnValueOnce({
        ...mockReturnValue,
        todos: mockTodos,
        isConnected: false,
      });

      render(<SharedTodoList listId='list-1' userId='user-1' />);

      const checkbox = screen.getAllByRole('checkbox')[0];
      expect(checkbox).toBeDisabled();

      const deleteButtons = screen.getAllByText('Delete');
      expect(deleteButtons[0]).toBeDisabled();
    });
  });

  describe('error display', () => {
    it('should show sync errors', () => {
      mockUseSharedTodos.mockReturnValueOnce({
        ...mockReturnValue,
        syncState: {
          ...mockReturnValue.syncState,
          errors: [
            {
              todoId: 'todo-1',
              operation: 'update',
              error: 'Network error',
              timestamp: Date.now(),
            },
          ],
        },
      });

      render(<SharedTodoList listId='list-1' userId='user-1' />);

      expect(screen.getByText(/Sync Errors/)).toBeInTheDocument();
      expect(screen.getByText(/Network error/)).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('should show empty state message when no todos', () => {
      render(<SharedTodoList listId='list-1' userId='user-1' />);

      expect(screen.getByText(/No todos yet/)).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    beforeEach(() => {
      mockUseSharedTodos.mockReturnValueOnce({
        ...mockReturnValue,
        todos: mockTodos,
      });
    });

    it('should have proper ARIA labels for checkboxes', () => {
      render(<SharedTodoList listId='list-1' userId='user-1' />);

      expect(
        screen.getByLabelText('Mark "Test todo 1" as complete')
      ).toBeInTheDocument();
    });

    it('should have proper ARIA labels for delete buttons', () => {
      render(<SharedTodoList listId='list-1' userId='user-1' />);

      expect(screen.getByLabelText('Delete "Test todo 1"')).toBeInTheDocument();
    });

    it('should have minimum touch targets (44px)', () => {
      render(<SharedTodoList listId='list-1' userId='user-1' />);

      const addButton = screen.getByLabelText('Add todo');
      expect(addButton).toHaveClass('min-h-[44px]');
    });
  });
});
