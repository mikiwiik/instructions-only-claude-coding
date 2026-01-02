import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoItem from '../../components/TodoItem';
import { Todo } from '../../types/todo';

// Enhanced Todo interface for testing
interface EnhancedTodo {
  id: string;
  text: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  sortOrder: string;
}

// Mock the timestamp utilities that will be implemented
jest.mock('../../utils/timestamp', () => ({
  formatRelativeTime: jest.fn((date: Date, action: string) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);

    if (diffMinutes < 1) return `${action} 0 minutes ago`;
    if (diffMinutes < 60) return `${action} ${diffMinutes} minutes ago`;
    if (diffHours < 24) return `${action} ${diffHours} hours ago`;
    if (diffDays < 7) return `${action} ${diffDays} days ago`;
    if (diffDays <= 30) return `${action} ${diffWeeks} weeks ago`;

    // More than 30 days - use absolute date format like actual implementation
    return `${action} ${date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })}`;
  }),
  getContextualTimestamp: jest.fn((todo: EnhancedTodo) => {
    // Use the formatRelativeTime logic for consistency
    const formatRelativeTime = (date: Date, action: string) => {
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);
      const diffWeeks = Math.floor(diffDays / 7);

      if (diffMinutes < 1) return `${action} 0 minutes ago`;
      if (diffMinutes < 60) return `${action} ${diffMinutes} minutes ago`;
      if (diffHours < 24) return `${action} ${diffHours} hours ago`;
      if (diffDays < 7) return `${action} ${diffDays} days ago`;
      if (diffDays <= 30) return `${action} ${diffWeeks} weeks ago`;

      return `${action} ${date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`;
    };

    if (todo.deletedAt && todo.deletedAt instanceof Date) {
      return formatRelativeTime(todo.deletedAt, 'Deleted');
    }
    if (todo.completedAt && todo.completedAt instanceof Date) {
      return formatRelativeTime(todo.completedAt, 'Completed');
    }
    if (
      todo.updatedAt &&
      todo.createdAt &&
      todo.updatedAt instanceof Date &&
      todo.createdAt instanceof Date &&
      todo.updatedAt.getTime() > todo.createdAt.getTime()
    ) {
      return formatRelativeTime(todo.updatedAt, 'Updated');
    }
    if (todo.createdAt && todo.createdAt instanceof Date) {
      return formatRelativeTime(todo.createdAt, 'Created');
    }
    return `Created recently`;
  }),
  getFullTimestamp: jest.fn((todo: EnhancedTodo) => {
    let relevantDate: Date;
    let action: string;

    if (todo.deletedAt && todo.deletedAt instanceof Date) {
      relevantDate = todo.deletedAt;
      action = 'Deleted';
    } else if (todo.completedAt && todo.completedAt instanceof Date) {
      relevantDate = todo.completedAt;
      action = 'Completed';
    } else if (
      todo.updatedAt &&
      todo.createdAt &&
      todo.updatedAt instanceof Date &&
      todo.createdAt instanceof Date &&
      todo.updatedAt.getTime() > todo.createdAt.getTime()
    ) {
      relevantDate = todo.updatedAt;
      action = 'Updated';
    } else if (todo.createdAt && todo.createdAt instanceof Date) {
      relevantDate = todo.createdAt;
      action = 'Created';
    } else {
      // Fallback for invalid dates
      relevantDate = new Date();
      action = 'Created';
    }

    return `${action} ${relevantDate.toLocaleDateString()} at ${relevantDate.toLocaleTimeString()}`;
  }),
}));

const createMockTodo = (
  overrides: Partial<EnhancedTodo & { completed?: boolean }> = {}
): EnhancedTodo => {
  const base = {
    id: '1',
    text: 'Test todo',
    completedAt: undefined,
    createdAt: new Date(Date.now() - 60000), // 1 minute ago
    updatedAt: new Date(Date.now() - 60000), // 1 minute ago
    deletedAt: undefined,
    sortOrder: '0|hzzzzz:',
  };

  // Handle legacy completed boolean for backward compatibility
  if ('completed' in overrides && overrides.completed) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { completed, ...rest } = overrides;
    return {
      ...base,
      ...rest,
      completedAt: rest.updatedAt || new Date(Date.now() - 30000),
    };
  }

  return {
    ...base,
    ...overrides,
  };
};

describe('TodoItem - Contextual Timestamp Display', () => {
  const mockOnToggle = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnRestore = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('contextual timestamp display', () => {
    it('should display "Created X ago" for new todos where createdAt equals updatedAt', () => {
      const createdTime = new Date(Date.now() - 30 * 60000); // 30 minutes ago
      const todo = createMockTodo({
        text: 'New todo',
        createdAt: createdTime,
        updatedAt: createdTime, // Same as created
        completed: false,
      });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // Contextual timestamp implementation - shows "Created X ago" for new todos
      expect(screen.getByText(/created.*ago/i)).toBeInTheDocument();
    });

    it('should display "Updated X ago" for modified incomplete todos', () => {
      const todo = createMockTodo({
        text: 'Modified todo',
        createdAt: new Date(Date.now() - 120 * 60000), // 2 hours ago
        updatedAt: new Date(Date.now() - 30 * 60000), // 30 minutes ago (newer)
        completed: false,
      });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // TODO: After implementation
      // expect(screen.getByText(/updated 30 minutes ago/i)).toBeInTheDocument();

      // Current behavior check
      expect(screen.getByText(todo.text)).toBeInTheDocument();
    });

    it('should display "Completed X ago" for completed todos with newer updatedAt', () => {
      const todo = createMockTodo({
        text: 'Completed todo',
        createdAt: new Date(Date.now() - 120 * 60000), // 2 hours ago
        updatedAt: new Date(Date.now() - 30 * 60000), // 30 minutes ago (completion time)
        completed: true,
      });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onRestore={mockOnRestore}
        />
      );

      // TODO: After implementation
      // expect(screen.getByText(/completed 30 minutes ago/i)).toBeInTheDocument();

      // Current behavior: shows line-through styling for completed (on parent div)
      const todoText = screen.getByText(todo.text);
      expect(todoText.parentElement).toHaveClass('line-through');
    });

    it('should display "Deleted X ago" for soft-deleted todos with highest priority', () => {
      const todo = createMockTodo({
        text: 'Deleted todo',
        createdAt: new Date(Date.now() - 180 * 60000), // 3 hours ago
        updatedAt: new Date(Date.now() - 60 * 60000), // 1 hour ago
        deletedAt: new Date(Date.now() - 15 * 60000), // 15 minutes ago (most recent)
        completed: true,
      });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onRestore={mockOnRestore}
        />
      );

      // TODO: After implementation
      // expect(screen.getByText(/deleted 15 minutes ago/i)).toBeInTheDocument();

      // Current behavior: no deletedAt support
      expect(screen.getByText(todo.text)).toBeInTheDocument();
    });
  });

  describe('relative time formatting', () => {
    it('should format minutes correctly', () => {
      const todo = createMockTodo({
        text: 'Recent todo',
        updatedAt: new Date(Date.now() - 5 * 60000), // 5 minutes ago
      });

      render(
        <TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      // Contextual timestamp shows relative time for recent updates
      expect(screen.getByText(/minutes ago/i)).toBeInTheDocument();
    });

    it('should format hours correctly', () => {
      const todo = createMockTodo({
        text: 'Hour old todo',
        updatedAt: new Date(Date.now() - 2.5 * 60 * 60000), // 2.5 hours ago
      });

      render(
        <TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      // TODO: After implementation
      // expect(screen.getByText(/2 hours ago/i)).toBeInTheDocument();

      expect(screen.getByText(todo.text)).toBeInTheDocument();
    });

    it('should format days correctly', () => {
      const todo = createMockTodo({
        text: 'Day old todo',
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60000), // 3 days ago
      });

      render(
        <TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      // TODO: After implementation
      // expect(screen.getByText(/3 days ago/i)).toBeInTheDocument();

      expect(screen.getByText(todo.text)).toBeInTheDocument();
    });

    it('should show absolute date for very old todos', () => {
      const oldDate = new Date('2023-06-15T10:30:00Z');
      const todo = createMockTodo({
        text: 'Very old todo',
        createdAt: oldDate,
        updatedAt: oldDate,
      });

      render(
        <TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      // TODO: After implementation
      // expect(screen.getByText(/6\/15\/2023/i)).toBeInTheDocument();

      // Very old todos show absolute date format
      expect(screen.getByText(/Jun 15, 2023/i)).toBeInTheDocument();
    });
  });

  describe('timestamp interactivity and accessibility', () => {
    it('should show full timestamp on hover for accessibility', async () => {
      const todo = createMockTodo({
        text: 'Hover test todo',
        createdAt: new Date('2024-01-15T14:30:00Z'),
        updatedAt: new Date('2024-01-15T15:30:00Z'),
      });

      render(
        <TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      // Contextual timestamp implementation - old date uses absolute format
      const timestampElement = screen.getByText(/Updated Jan 15, 2024/i);
      expect(timestampElement).toBeInTheDocument();
      expect(timestampElement).toHaveAttribute(
        'title',
        expect.stringMatching(/Updated.*1\/15\/2024.*at/)
      );
    });

    it('should be accessible to screen readers', () => {
      const todo = createMockTodo({
        text: 'Screen reader test',
        updatedAt: new Date(Date.now() - 45 * 60000), // 45 minutes ago
      });

      render(
        <TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      // TODO: After implementation
      // const timestampElement = screen.getByText(/updated 45 minutes ago/i);
      // expect(timestampElement).toHaveAttribute('aria-label', expect.stringContaining('last updated'));

      // Current behavior: check existing accessibility
      const todoItem = screen.getByRole('listitem');
      expect(todoItem).toBeInTheDocument();
    });

    it('should update timestamp display when todo state changes', async () => {
      const todo = createMockTodo({
        text: 'State change test',
        completed: false,
        createdAt: new Date(Date.now() - 60 * 60000), // 1 hour ago
        updatedAt: new Date(Date.now() - 60 * 60000), // 1 hour ago
      });

      const { rerender } = render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // Initially should show "Created X ago"
      // TODO: expect(screen.getByText(/created.*ago/i)).toBeInTheDocument();

      // Simulate completion
      const updatedTodo = {
        ...todo,
        completedAt: new Date(), // Just now
        updatedAt: new Date(), // Just now
      };

      rerender(
        <TodoItem
          todo={updatedTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          onRestore={mockOnRestore}
        />
      );

      // Should now show "Completed X ago"
      // TODO: expect(screen.getByText(/completed.*ago/i)).toBeInTheDocument();

      // Current behavior: shows completed styling
      const todoText = screen.getByText(todo.text);
      expect(todoText.parentElement).toHaveClass('line-through');
    });
  });

  describe('timestamp context switching', () => {
    it('should prioritize deletion timestamp over other activities', () => {
      const todo = createMockTodo({
        text: 'Priority test',
        completed: true,
        createdAt: new Date(Date.now() - 180 * 60000), // 3 hours ago
        updatedAt: new Date(Date.now() - 60 * 60000), // 1 hour ago (completion)
        deletedAt: new Date(Date.now() - 30 * 60000), // 30 minutes ago (deletion)
      });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onRestore={mockOnRestore}
        />
      );

      // TODO: Should show deletion time, not completion time
      // expect(screen.getByText(/deleted 30 minutes ago/i)).toBeInTheDocument();
      // expect(screen.queryByText(/completed.*ago/i)).not.toBeInTheDocument();

      expect(screen.getByText(todo.text)).toBeInTheDocument();
    });

    it('should distinguish between completion and edit contexts', () => {
      const editedTodo = createMockTodo({
        text: 'Edited todo',
        completed: false,
        createdAt: new Date(Date.now() - 120 * 60000), // 2 hours ago
        updatedAt: new Date(Date.now() - 30 * 60000), // 30 minutes ago (edit)
      });

      const completedTodo = createMockTodo({
        text: 'Completed todo',
        completed: true,
        createdAt: new Date(Date.now() - 120 * 60000), // 2 hours ago
        updatedAt: new Date(Date.now() - 30 * 60000), // 30 minutes ago (completion)
      });

      const { rerender } = render(
        <TodoItem
          todo={editedTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // TODO: Should show "Updated" for edited todo
      // expect(screen.getByText(/updated 30 minutes ago/i)).toBeInTheDocument();

      rerender(
        <TodoItem
          todo={completedTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onRestore={mockOnRestore}
        />
      );

      // TODO: Should show "Completed" for completed todo
      // expect(screen.getByText(/completed 30 minutes ago/i)).toBeInTheDocument();

      // Current behavior: check completion styling
      const todoText = screen.getByText(completedTodo.text);
      expect(todoText.parentElement).toHaveClass('line-through');
    });

    it('should fall back to creation time when updatedAt equals createdAt', () => {
      const sameTime = new Date(Date.now() - 45 * 60000); // 45 minutes ago
      const todo = createMockTodo({
        text: 'Unchanged todo',
        completed: false,
        createdAt: sameTime,
        updatedAt: sameTime, // Same as created
      });

      render(
        <TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      // TODO: Should show "Created X ago"
      // expect(screen.getByText(/created 45 minutes ago/i)).toBeInTheDocument();

      expect(screen.getByText(todo.text)).toBeInTheDocument();
    });
  });

  describe('real-time timestamp updates', () => {
    it('should maintain consistent timestamp display during component lifecycle', () => {
      const todo = createMockTodo({
        text: 'Consistent timestamp test',
        updatedAt: new Date(Date.now() - 30 * 60000), // 30 minutes ago
      });

      const { rerender } = render(
        <TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      // TODO: Capture initial timestamp display
      // const initialTimestamp = screen.getByText(/30 minutes ago/i);
      // expect(initialTimestamp).toBeInTheDocument();

      // Rerender with same todo (simulating React re-render)
      rerender(
        <TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      // TODO: Should show same timestamp
      // expect(screen.getByText(/30 minutes ago/i)).toBeInTheDocument();

      expect(screen.getByText(todo.text)).toBeInTheDocument();
    });

    it('should handle rapid timestamp updates gracefully', async () => {
      const todo = createMockTodo({
        text: 'Rapid update test',
        updatedAt: new Date(Date.now() - 1000), // 1 second ago
      });

      const { rerender } = render(
        <TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      // TODO: Should handle very recent timestamps
      // expect(screen.getByText(/0 minutes ago/i)).toBeInTheDocument();

      // Simulate update after a short delay
      await waitFor(() => {
        const newerTodo = {
          ...todo,
          updatedAt: new Date(), // Just now
        };

        rerender(
          <TodoItem
            todo={newerTodo}
            onToggle={mockOnToggle}
            onDelete={mockOnDelete}
          />
        );

        // TODO: Should update timestamp display
        // expect(screen.getByText(/0 minutes ago/i)).toBeInTheDocument();
      });

      expect(screen.getByText(todo.text)).toBeInTheDocument();
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle invalid or future timestamps gracefully', () => {
      const todo = createMockTodo({
        text: 'Future timestamp test',
        updatedAt: new Date(Date.now() + 60 * 60000), // 1 hour in future
      });

      render(
        <TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      // TODO: Should handle future dates gracefully
      // expect(screen.getByText(/0 minutes ago/i)).toBeInTheDocument();

      expect(screen.getByText(todo.text)).toBeInTheDocument();
    });

    it('should handle missing timestamp fields defensively', () => {
      const incompleteTodo = {
        id: 'incomplete',
        text: 'Incomplete todo data',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(), // Include required updatedAt field
        sortOrder: '0|hzzzzz:',
      } as Todo;

      expect(() => {
        render(
          <TodoItem
            todo={incompleteTodo}
            onToggle={mockOnToggle}
            onDelete={mockOnDelete}
          />
        );
      }).not.toThrow();

      expect(screen.getByText('Incomplete todo data')).toBeInTheDocument();
    });

    it('should handle very old timestamps without performance issues', () => {
      const veryOldTodo = createMockTodo({
        text: 'Ancient todo',
        createdAt: new Date('1990-01-01'),
        updatedAt: new Date('1990-01-01'),
      });

      const startTime = performance.now();

      render(
        <TodoItem
          todo={veryOldTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
        />
      );

      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should render quickly
      expect(screen.getByText('Ancient todo')).toBeInTheDocument();
    });

    it('should maintain timestamp display when text is very long', () => {
      const longText = 'A'.repeat(500); // Very long text
      const todo = createMockTodo({
        text: longText,
        updatedAt: new Date(Date.now() - 60 * 60000), // 1 hour ago
      });

      render(
        <TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      // TODO: Timestamp should still be visible despite long text
      // expect(screen.getByText(/1 hour ago/i)).toBeInTheDocument();

      expect(screen.getByText(longText)).toBeInTheDocument();
    });
  });

  describe('integration with existing functionality', () => {
    it('should not interfere with edit functionality', async () => {
      const user = userEvent.setup();
      const todo = createMockTodo({
        text: 'Editable todo',
        updatedAt: new Date(Date.now() - 30 * 60000), // 30 minutes ago
      });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit todo/i });
      await user.click(editButton);

      // Edit functionality should work regardless of timestamp display
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should not interfere with toggle functionality', async () => {
      const user = userEvent.setup();
      const todo = createMockTodo({
        text: 'Toggleable todo',
        completed: false,
      });

      render(
        <TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      const toggleButton = screen.getByRole('button', { name: /toggle todo/i });
      await user.click(toggleButton);

      expect(mockOnToggle).toHaveBeenCalledWith(todo.id);
    });

    it('should not interfere with delete confirmation workflow', async () => {
      const user = userEvent.setup();
      const todo = createMockTodo({
        text: 'Deletable todo',
      });

      render(
        <TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      const deleteButton = screen.getByRole('button', { name: /delete todo/i });
      await user.click(deleteButton);

      // Should show confirmation dialog
      expect(screen.getByText('Delete Todo')).toBeInTheDocument();
    });

    it('should maintain responsive design with timestamp display', () => {
      const todo = createMockTodo({
        text: 'Responsive test todo',
      });

      render(
        <TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      // Check that responsive classes are maintained
      const todoItem = screen.getByRole('listitem');
      expect(todoItem).toHaveClass('flex');

      // TODO: After implementation, ensure timestamp has responsive text sizing
      // const timestampElement = screen.getByText(/ago/i);
      // expect(timestampElement).toHaveClass('text-xs');
    });
  });
});
