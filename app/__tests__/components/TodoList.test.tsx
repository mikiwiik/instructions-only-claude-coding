import { render, screen } from '@testing-library/react';
import TodoList from '../../components/TodoList';
import { createMockTodo } from '../utils/test-utils';

describe('TodoList', () => {
  const mockOnToggle = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    mockOnToggle.mockClear();
    mockOnDelete.mockClear();
  });

  it('should render empty state when no todos provided', () => {
    render(
      <TodoList todos={[]} onToggle={mockOnToggle} onDelete={mockOnDelete} />
    );

    expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
    expect(
      screen.getByText(/add your first todo above to get started/i)
    ).toBeInTheDocument();

    // Should show empty state icon
    const emptyIcon = screen.getByTestId('empty-state-icon');
    expect(emptyIcon).toBeInTheDocument();
  });

  it('should render all todos when provided', () => {
    const todos = [
      createMockTodo({ id: '1', text: 'First todo' }),
      createMockTodo({ id: '2', text: 'Second todo' }),
      createMockTodo({ id: '3', text: 'Third todo' }),
    ];

    render(
      <TodoList todos={todos} onToggle={mockOnToggle} onDelete={mockOnDelete} />
    );

    expect(screen.getByText('First todo')).toBeInTheDocument();
    expect(screen.getByText('Second todo')).toBeInTheDocument();
    expect(screen.getByText('Third todo')).toBeInTheDocument();

    // Should show todo count
    expect(screen.getByText(/your todos \(3\)/i)).toBeInTheDocument();
  });

  it('should render todos as a proper list with correct semantic markup', () => {
    const todos = [
      createMockTodo({ id: '1', text: 'List item 1' }),
      createMockTodo({ id: '2', text: 'List item 2' }),
    ];

    render(
      <TodoList todos={todos} onToggle={mockOnToggle} onDelete={mockOnDelete} />
    );

    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();

    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(2);
  });

  it('should pass correct props to TodoItem components', () => {
    const todos = [
      createMockTodo({
        id: 'test-id',
        text: 'Test todo',
        completed: true,
      }),
    ];

    render(
      <TodoList todos={todos} onToggle={mockOnToggle} onDelete={mockOnDelete} />
    );

    // Verify the todo is rendered with correct props
    expect(screen.getByText('Test todo')).toBeInTheDocument();

    // Verify toggle button exists (indicating TodoItem received onToggle prop)
    const toggleButton = screen.getByRole('button', { name: /toggle todo/i });
    expect(toggleButton).toBeInTheDocument();
  });

  it('should handle mixed completed and incomplete todos', () => {
    const todos = [
      createMockTodo({ id: '1', text: 'Completed todo', completed: true }),
      createMockTodo({ id: '2', text: 'Incomplete todo', completed: false }),
      createMockTodo({ id: '3', text: 'Another completed', completed: true }),
    ];

    render(
      <TodoList todos={todos} onToggle={mockOnToggle} onDelete={mockOnDelete} />
    );

    // All todos should be rendered
    expect(screen.getByText('Completed todo')).toBeInTheDocument();
    expect(screen.getByText('Incomplete todo')).toBeInTheDocument();
    expect(screen.getByText('Another completed')).toBeInTheDocument();

    // Should show correct visual states - line-through is on parent div, not text element
    const completedText1 = screen.getByText('Completed todo');
    const incompleteText = screen.getByText('Incomplete todo');
    const completedText2 = screen.getByText('Another completed');

    expect(completedText1.parentElement).toHaveClass('line-through');
    expect(incompleteText.parentElement).not.toHaveClass('line-through');
    expect(completedText2.parentElement).toHaveClass('line-through');
  });

  it('should show correct todo count in heading', () => {
    const oneTodo = [createMockTodo({ text: 'Single todo' })];
    const { rerender } = render(
      <TodoList
        todos={oneTodo}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(/your todos \(1\)/i)).toBeInTheDocument();

    const multipleTodos = [
      createMockTodo({ id: '1', text: 'Todo 1' }),
      createMockTodo({ id: '2', text: 'Todo 2' }),
      createMockTodo({ id: '3', text: 'Todo 3' }),
      createMockTodo({ id: '4', text: 'Todo 4' }),
      createMockTodo({ id: '5', text: 'Todo 5' }),
    ];

    rerender(
      <TodoList
        todos={multipleTodos}
        onToggle={mockOnToggle}
        onDelete={mockOnDelete}
      />
    );
    expect(screen.getByText(/your todos \(5\)/i)).toBeInTheDocument();
  });

  it('should maintain proper spacing and layout', () => {
    const todos = [
      createMockTodo({ id: '1', text: 'First todo' }),
      createMockTodo({ id: '2', text: 'Second todo' }),
    ];

    render(
      <TodoList todos={todos} onToggle={mockOnToggle} onDelete={mockOnDelete} />
    );

    const list = screen.getByRole('list');
    expect(list).toHaveClass('space-y-2', 'sm:space-y-3'); // Responsive spacing between items
  });

  it('should handle empty todos array gracefully', () => {
    render(
      <TodoList todos={[]} onToggle={mockOnToggle} onDelete={mockOnDelete} />
    );

    // Should not crash and should show empty state
    expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();

    // Should not show a todo count or list
    expect(screen.queryByText(/your todos/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('should have proper heading structure for accessibility', () => {
    const todos = [createMockTodo({ text: 'Test todo' })];
    render(
      <TodoList todos={todos} onToggle={mockOnToggle} onDelete={mockOnDelete} />
    );

    // Should have h3 heading for the todo list
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveTextContent(/your todos \(1\)/i);
  });

  it('should show todos in the order provided', () => {
    const todos = [
      createMockTodo({ id: '1', text: 'First todo' }),
      createMockTodo({ id: '2', text: 'Second todo' }),
      createMockTodo({ id: '3', text: 'Third todo' }),
    ];

    render(
      <TodoList todos={todos} onToggle={mockOnToggle} onDelete={mockOnDelete} />
    );

    const listItems = screen.getAllByRole('listitem');

    // Check that the order is maintained
    expect(listItems[0]).toHaveTextContent('First todo');
    expect(listItems[1]).toHaveTextContent('Second todo');
    expect(listItems[2]).toHaveTextContent('Third todo');
  });
});
