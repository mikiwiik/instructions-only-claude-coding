import { render, screen, fireEvent } from '@testing-library/react';
import TodoItem from '../../components/TodoItem';
import { Todo } from '../../types/todo';

// Mock the gesture hooks
jest.mock('../../hooks/useSwipeGesture', () => ({
  useSwipeGesture: jest.fn(() => ({
    onTouchStart: jest.fn(),
    onTouchMove: jest.fn(),
    onTouchEnd: jest.fn(),
  })),
}));

jest.mock('../../hooks/useLongPress', () => ({
  useLongPress: jest.fn(() => ({
    onTouchStart: jest.fn(),
    onTouchEnd: jest.fn(),
    onTouchMove: jest.fn(),
    onMouseDown: jest.fn(),
    onMouseUp: jest.fn(),
    onMouseLeave: jest.fn(),
  })),
}));

describe('TodoItem Gesture Integration', () => {
  const mockTodo: Todo = {
    id: '1',
    text: 'Test Todo',
    completedAt: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    sortOrder: '0|hzzzzz:',
  };

  const mockProps = {
    todo: mockTodo,
    onToggle: jest.fn(),
    onDelete: jest.fn(),
    onEdit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with gesture support', () => {
    render(<TodoItem {...mockProps} />);
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
  });

  it('should have keyboard alternative for swipe-to-complete', () => {
    render(<TodoItem {...mockProps} />);
    const toggleButton = screen.getByLabelText('Toggle todo: Test Todo');
    expect(toggleButton).toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(mockProps.onToggle).toHaveBeenCalledWith('1');
  });

  it('should have keyboard alternative for swipe-to-delete', () => {
    render(<TodoItem {...mockProps} />);
    const deleteButton = screen.getByLabelText('Delete todo: Test Todo');
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(deleteButton);
    // Delete dialog should appear
    expect(screen.getByText('Delete Todo')).toBeInTheDocument();
  });

  it('should have keyboard alternative for long-press edit', () => {
    render(<TodoItem {...mockProps} />);
    const editButton = screen.getByLabelText('Edit todo: Test Todo');
    expect(editButton).toBeInTheDocument();

    fireEvent.click(editButton);
    // Edit mode should be activated
    expect(screen.getByLabelText('Edit todo text')).toBeInTheDocument();
  });

  it('should maintain 44px touch targets for all interactive elements', () => {
    render(<TodoItem {...mockProps} />);

    // Check toggle button
    const toggleButton = screen.getByLabelText('Toggle todo: Test Todo');
    expect(toggleButton).toHaveClass('min-w-[44px]', 'min-h-[44px]');

    // Check delete button
    const deleteButton = screen.getByLabelText('Delete todo: Test Todo');
    expect(deleteButton).toHaveClass('min-w-[44px]', 'min-h-[44px]');

    // Check edit button
    const editButton = screen.getByLabelText('Edit todo: Test Todo');
    expect(editButton).toHaveClass('min-w-[44px]', 'min-h-[44px]');
  });

  it('should have proper ARIA labels for screen readers', () => {
    render(<TodoItem {...mockProps} />);

    expect(screen.getByLabelText('Toggle todo: Test Todo')).toBeInTheDocument();
    expect(screen.getByLabelText('Delete todo: Test Todo')).toBeInTheDocument();
    expect(screen.getByLabelText('Edit todo: Test Todo')).toBeInTheDocument();
  });

  it('should not allow swipe gestures on completed todos', () => {
    const completedTodo: Todo = {
      ...mockTodo,
      completedAt: new Date(),
    };

    render(<TodoItem {...mockProps} todo={completedTodo} />);

    // Toggle button should be disabled for completed todos
    const toggleButton = screen.getByLabelText('Toggle todo: Test Todo');
    expect(toggleButton).toHaveAttribute('aria-disabled', 'true');
  });

  it('should provide visual feedback with transition classes', () => {
    const { container } = render(<TodoItem {...mockProps} />);
    const listItem = container.querySelector('li');
    expect(listItem).toHaveClass('transition-transform');
  });

  it('should support keyboard navigation', () => {
    render(<TodoItem {...mockProps} />);

    // All interactive elements should be focusable
    const toggleButton = screen.getByLabelText('Toggle todo: Test Todo');
    const deleteButton = screen.getByLabelText('Delete todo: Test Todo');
    const editButton = screen.getByLabelText('Edit todo: Test Todo');

    toggleButton.focus();
    expect(toggleButton).toHaveFocus();

    deleteButton.focus();
    expect(deleteButton).toHaveFocus();

    editButton.focus();
    expect(editButton).toHaveFocus();
  });
});
