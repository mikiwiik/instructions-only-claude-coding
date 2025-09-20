import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoItem from '../../components/TodoItem';
import { createMockTodo } from '../utils/test-utils';

describe('TodoItem', () => {
  const mockOnToggle = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    mockOnToggle.mockClear();
    mockOnDelete.mockClear();
  });

  it('should render todo text', () => {
    const todo = createMockTodo({ text: 'Test todo item' });
    render(
      <TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
    );

    expect(screen.getByText('Test todo item')).toBeInTheDocument();
  });

  it('should render toggle button with proper accessibility', () => {
    const todo = createMockTodo({ text: 'Test todo' });
    render(
      <TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
    );

    const toggleButton = screen.getByRole('button', { name: /toggle todo/i });
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveAttribute(
      'aria-label',
      expect.stringContaining('Test todo')
    );
  });

  it('should show incomplete state visually for uncompleted todo', () => {
    const todo = createMockTodo({ text: 'Incomplete todo', completed: false });
    render(
      <TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
    );

    const todoText = screen.getByText('Incomplete todo');
    expect(todoText).not.toHaveClass('line-through');

    // Should show circle icon for incomplete
    const incompleteIcon = screen.getByTestId('incomplete-icon');
    expect(incompleteIcon).toBeInTheDocument();
  });

  it('should show completed state visually for completed todo', () => {
    const todo = createMockTodo({ text: 'Completed todo', completed: true });
    render(
      <TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
    );

    const todoText = screen.getByText('Completed todo');
    expect(todoText).toHaveClass('line-through');

    // Should show check circle icon for completed
    const completedIcon = screen.getByTestId('completed-icon');
    expect(completedIcon).toBeInTheDocument();
  });

  it('should call toggle function when toggle button is clicked', async () => {
    const user = userEvent.setup();
    const todo = createMockTodo({ id: 'test-id', text: 'Clickable todo' });
    render(
      <TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
    );

    const toggleButton = screen.getByRole('button', { name: /toggle todo/i });
    await user.click(toggleButton);

    expect(mockOnToggle).toHaveBeenCalledWith('test-id');
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it('should be keyboard accessible', async () => {
    const user = userEvent.setup();
    const todo = createMockTodo({ id: 'keyboard-test', text: 'Keyboard todo' });
    render(
      <TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
    );

    const toggleButton = screen.getByRole('button', { name: /toggle todo/i });

    // Focus the button and activate with Enter
    toggleButton.focus();
    expect(toggleButton).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(mockOnToggle).toHaveBeenCalledWith('keyboard-test');

    // Also should work with Space
    mockOnToggle.mockClear();
    await user.keyboard(' ');
    expect(mockOnToggle).toHaveBeenCalledWith('keyboard-test');
  });

  it('should display creation timestamp', () => {
    const createdAt = new Date('2023-01-01T10:30:00');
    const todo = createMockTodo({
      text: 'Timestamped todo',
      createdAt,
    });
    render(
      <TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
    );

    // Should show formatted date and time
    expect(screen.getByText(/added 1\/1\/2023 at/i)).toBeInTheDocument();
  });

  it('should have proper ARIA attributes for screen readers', () => {
    const todo = createMockTodo({
      text: 'Accessible todo',
      completed: false,
    });
    render(
      <TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
    );

    const todoItem = screen.getByRole('listitem');
    expect(todoItem).toBeInTheDocument();

    const toggleButton = screen.getByRole('button', { name: /toggle todo/i });
    expect(toggleButton).toHaveAttribute('aria-pressed', 'false');
  });

  it('should have correct aria-pressed for completed todo', () => {
    const todo = createMockTodo({
      text: 'Completed accessible todo',
      completed: true,
    });
    render(
      <TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
    );

    const toggleButton = screen.getByRole('button', { name: /toggle todo/i });
    expect(toggleButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('should handle long todo text properly', () => {
    const longText =
      'This is a very long todo item that should wrap properly and not break the layout or cause any visual issues';
    const todo = createMockTodo({ text: longText });
    render(
      <TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
    );

    expect(screen.getByText(longText)).toBeInTheDocument();

    // Should have proper text wrapping classes
    const textElement = screen.getByText(longText);
    expect(textElement.closest('div')).toHaveClass('min-w-0'); // Allows text wrapping
  });

  it('should show different visual states for completed vs incomplete', () => {
    const incompleteTodo = createMockTodo({
      text: 'Incomplete',
      completed: false,
    });
    const completedTodo = createMockTodo({
      text: 'Completed',
      completed: true,
    });

    const { rerender } = render(
      <TodoItem
        todo={incompleteTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );

    const incompleteText = screen.getByText('Incomplete');
    expect(incompleteText).toHaveClass('text-foreground');
    expect(incompleteText).not.toHaveClass('text-muted-foreground');

    rerender(
      <TodoItem
        todo={completedTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );

    const completedText = screen.getByText('Completed');
    expect(completedText).toHaveClass('text-muted-foreground');
  });

  describe('Delete functionality', () => {
    it('should render delete button for each todo', () => {
      const todo = createMockTodo({ text: 'Todo with delete' });
      render(
        <TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      const deleteButton = screen.getByRole('button', {
        name: /^delete todo/i,
      });
      expect(deleteButton).toBeInTheDocument();
    });

    it('should call delete function when delete button is clicked', async () => {
      const user = userEvent.setup();
      const todo = createMockTodo({
        id: 'delete-test-id',
        text: 'Todo to delete',
      });
      render(
        <TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      const deleteButton = screen.getByRole('button', {
        name: /^delete todo/i,
      });
      await user.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledWith('delete-test-id');
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    it('should have proper ARIA label for delete button', () => {
      const todo = createMockTodo({ text: 'Accessible delete todo' });
      render(
        <TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      const deleteButton = screen.getByRole('button', {
        name: /^delete todo/i,
      });
      expect(deleteButton).toHaveAttribute(
        'aria-label',
        expect.stringContaining('Accessible delete todo')
      );
    });

    it('should be keyboard accessible for delete action', async () => {
      const user = userEvent.setup();
      const todo = createMockTodo({
        id: 'keyboard-delete-test',
        text: 'Keyboard delete',
      });
      render(
        <TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      const deleteButton = screen.getByRole('button', {
        name: /^delete todo/i,
      });

      // Focus the delete button and activate with Enter
      deleteButton.focus();
      expect(deleteButton).toHaveFocus();

      await user.keyboard('{Enter}');
      expect(mockOnDelete).toHaveBeenCalledWith('keyboard-delete-test');

      // Also should work with Space
      mockOnDelete.mockClear();
      await user.keyboard(' ');
      expect(mockOnDelete).toHaveBeenCalledWith('keyboard-delete-test');
    });

    it('should have appropriate visual styling for delete button', () => {
      const todo = createMockTodo({ text: 'Styled delete todo' });
      render(
        <TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      const deleteButton = screen.getByRole('button', {
        name: /^delete todo/i,
      });

      // Should have proper button type
      expect(deleteButton).toHaveAttribute('type', 'button');

      // Should have focus styles and hover states (class-based check)
      expect(deleteButton).toHaveClass('focus:outline-none');
      expect(deleteButton).toHaveClass('focus:ring-2');
    });

    it('should work for both completed and incomplete todos', async () => {
      const user = userEvent.setup();
      const incompleteTodo = createMockTodo({
        id: 'incomplete-to-delete',
        text: 'Incomplete todo',
        completed: false,
      });
      const completedTodo = createMockTodo({
        id: 'completed-to-delete',
        text: 'Completed todo',
        completed: true,
      });

      // Test incomplete todo deletion
      const { rerender } = render(
        <TodoItem
          todo={incompleteTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
        />
      );

      let deleteButton = screen.getByRole('button', { name: /^delete todo/i });
      await user.click(deleteButton);
      expect(mockOnDelete).toHaveBeenCalledWith('incomplete-to-delete');

      // Test completed todo deletion
      mockOnDelete.mockClear();
      rerender(
        <TodoItem
          todo={completedTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
        />
      );

      deleteButton = screen.getByRole('button', { name: /^delete todo/i });
      await user.click(deleteButton);
      expect(mockOnDelete).toHaveBeenCalledWith('completed-to-delete');
    });

    it('should not interfere with toggle functionality', async () => {
      const user = userEvent.setup();
      const todo = createMockTodo({
        id: 'multi-action-todo',
        text: 'Multi-action todo',
      });
      render(
        <TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      const toggleButton = screen.getByRole('button', { name: /toggle todo/i });
      const deleteButton = screen.getByRole('button', {
        name: /^delete todo/i,
      });

      // Click toggle button
      await user.click(toggleButton);
      expect(mockOnToggle).toHaveBeenCalledWith('multi-action-todo');
      expect(mockOnDelete).not.toHaveBeenCalled();

      // Click delete button
      mockOnToggle.mockClear();
      await user.click(deleteButton);
      expect(mockOnDelete).toHaveBeenCalledWith('multi-action-todo');
      expect(mockOnToggle).not.toHaveBeenCalled();
    });

    it('should have distinct visual appearance from toggle button', () => {
      const todo = createMockTodo({ text: 'Visual distinction test' });
      render(
        <TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      const toggleButton = screen.getByRole('button', { name: /toggle todo/i });
      const deleteButton = screen.getByRole('button', {
        name: /^delete todo/i,
      });

      // Both buttons should exist and be different elements
      expect(toggleButton).toBeInTheDocument();
      expect(deleteButton).toBeInTheDocument();
      expect(toggleButton).not.toBe(deleteButton);
    });
  });
});
