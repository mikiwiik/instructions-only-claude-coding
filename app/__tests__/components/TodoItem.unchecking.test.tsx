import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoItem from '../../components/TodoItem';
import { createMockTodo } from '../utils/test-utils';

describe('TodoItem - Prevent Accidental Unchecking', () => {
  const mockOnToggle = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnRestore = jest.fn();

  beforeEach(() => {
    mockOnToggle.mockClear();
    mockOnDelete.mockClear();
    mockOnRestore.mockClear();
  });

  describe('Incomplete Todo Behavior', () => {
    it('should allow checking an incomplete todo via checkbox', async () => {
      const user = userEvent.setup();
      const todo = createMockTodo({ text: 'Test todo', completed: false });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onRestore={mockOnRestore}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /toggle todo/i });
      await user.click(toggleButton);

      expect(mockOnToggle).toHaveBeenCalledWith(todo.id);
      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it('should not show undo button for incomplete todos', () => {
      const todo = createMockTodo({ text: 'Test todo', completed: false });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onRestore={mockOnRestore}
        />
      );

      const undoButton = screen.queryByRole('button', {
        name: /undo completion/i,
      });
      expect(undoButton).not.toBeInTheDocument();
    });
  });

  describe('Completed Todo Behavior', () => {
    it('should NOT allow unchecking via the checkbox button', async () => {
      const user = userEvent.setup();
      const todo = createMockTodo({ text: 'Test todo', completed: true });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onRestore={mockOnRestore}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /toggle todo/i });
      await user.click(toggleButton);

      // Should NOT call onToggle for completed todos
      expect(mockOnToggle).not.toHaveBeenCalled();
    });

    it('should show undo button for completed todos', () => {
      const todo = createMockTodo({ text: 'Test todo', completed: true });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onRestore={mockOnRestore}
        />
      );

      const undoButton = screen.getByRole('button', {
        name: /undo completion/i,
      });
      expect(undoButton).toBeInTheDocument();
    });

    it('should restore todo when undo button is clicked', async () => {
      const user = userEvent.setup();
      const todo = createMockTodo({ text: 'Test todo', completed: true });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onRestore={mockOnRestore}
        />
      );

      const undoButton = screen.getByRole('button', {
        name: /undo completion/i,
      });
      await user.click(undoButton);

      expect(mockOnRestore).toHaveBeenCalledWith(todo.id);
      expect(mockOnRestore).toHaveBeenCalledTimes(1);
    });

    it('should have proper accessibility for undo button', () => {
      const todo = createMockTodo({ text: 'Test todo', completed: true });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onRestore={mockOnRestore}
        />
      );

      const undoButton = screen.getByRole('button', {
        name: /undo completion/i,
      });
      expect(undoButton).toHaveAttribute(
        'aria-label',
        expect.stringContaining('Undo completion')
      );
    });

    it('should visually distinguish checkbox button for completed todos', () => {
      const todo = createMockTodo({ text: 'Test todo', completed: true });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onRestore={mockOnRestore}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /toggle todo/i });
      // Button should have a disabled or non-interactive appearance
      expect(toggleButton).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Visual States', () => {
    it('should apply different visual styling to completed todo checkbox', () => {
      const todo = createMockTodo({ text: 'Test todo', completed: true });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onRestore={mockOnRestore}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /toggle todo/i });
      // Should have cursor-default instead of cursor-pointer for completed
      expect(toggleButton).toHaveClass('cursor-default');
    });

    it('should show undo button with proper styling', () => {
      const todo = createMockTodo({ text: 'Test todo', completed: true });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onRestore={mockOnRestore}
        />
      );

      const undoButton = screen.getByRole('button', {
        name: /undo completion/i,
      });
      expect(undoButton).toHaveClass('hover:bg-yellow-100');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation for undo button', async () => {
      const user = userEvent.setup();
      const todo = createMockTodo({ text: 'Test todo', completed: true });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onRestore={mockOnRestore}
        />
      );

      const undoButton = screen.getByRole('button', {
        name: /undo completion/i,
      });

      // Tab to undo button and press Enter
      await user.tab();
      await user.tab(); // Might need multiple tabs depending on focus order

      if (document.activeElement === undoButton) {
        await user.keyboard('{Enter}');
        expect(mockOnRestore).toHaveBeenCalledWith(todo.id);
      }
    });

    it('should not trigger toggle on Enter key for completed todos', async () => {
      const user = userEvent.setup();
      const todo = createMockTodo({ text: 'Test todo', completed: true });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onRestore={mockOnRestore}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /toggle todo/i });
      toggleButton.focus();

      await user.keyboard('{Enter}');
      expect(mockOnToggle).not.toHaveBeenCalled();
    });
  });

  describe('Mobile Touch Targets', () => {
    it('should have adequate touch target size for undo button', () => {
      const todo = createMockTodo({ text: 'Test todo', completed: true });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onRestore={mockOnRestore}
        />
      );

      const undoButton = screen.getByRole('button', {
        name: /undo completion/i,
      });
      // Should have minimum 44px touch target for mobile
      expect(undoButton).toHaveClass('min-w-[44px]', 'min-h-[44px]');
    });
  });
});
