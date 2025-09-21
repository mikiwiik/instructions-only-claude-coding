import { render, screen, fireEvent } from '@testing-library/react';
import TodoItem from '../../components/TodoItem';
import { Todo } from '../../types/todo';

// Mock @dnd-kit components
jest.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: { 'aria-roledescription': 'sortable' },
    listeners: { onPointerDown: jest.fn() },
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

const createMockTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: 'test-id',
  text: 'Test todo',
  completed: false,
  createdAt: new Date('2025-01-01T00:00:00.000Z'),
  updatedAt: new Date('2025-01-01T00:00:00.000Z'),
  ...overrides,
});

const mockOnToggle = jest.fn();
const mockOnDelete = jest.fn();
const mockOnEdit = jest.fn();
const mockMoveUp = jest.fn();
const mockMoveDown = jest.fn();

describe('TodoItem - Reordering functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Drag handle', () => {
    it('should render drag handle for draggable todo', () => {
      const todo = createMockTodo();
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          moveUp={mockMoveUp}
          moveDown={mockMoveDown}
          isDraggable={true}
        />
      );

      const dragHandle = screen.getByTestId('drag-handle');
      expect(dragHandle).toBeInTheDocument();
      expect(dragHandle).toHaveAttribute('aria-label', 'Drag to reorder todo');
    });

    it('should not render drag handle when isDraggable is false', () => {
      const todo = createMockTodo();
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          moveUp={mockMoveUp}
          moveDown={mockMoveDown}
          isDraggable={false}
        />
      );

      const dragHandle = screen.queryByTestId('drag-handle');
      expect(dragHandle).not.toBeInTheDocument();
    });

    it('should not render drag handle when isDraggable is undefined', () => {
      const todo = createMockTodo();
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          moveUp={mockMoveUp}
          moveDown={mockMoveDown}
        />
      );

      const dragHandle = screen.queryByTestId('drag-handle');
      expect(dragHandle).not.toBeInTheDocument();
    });
  });

  describe('Arrow buttons', () => {
    it('should render move up button when moveUp prop is provided', () => {
      const todo = createMockTodo();
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          moveUp={mockMoveUp}
          moveDown={mockMoveDown}
        />
      );

      const moveUpButton = screen.getByRole('button', {
        name: /move todo up/i,
      });
      expect(moveUpButton).toBeInTheDocument();
    });

    it('should render move down button when moveDown prop is provided', () => {
      const todo = createMockTodo();
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          moveUp={mockMoveUp}
          moveDown={mockMoveDown}
        />
      );

      const moveDownButton = screen.getByRole('button', {
        name: /move todo down/i,
      });
      expect(moveDownButton).toBeInTheDocument();
    });

    it('should not render arrow buttons when move functions are not provided', () => {
      const todo = createMockTodo();
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      const moveUpButton = screen.queryByRole('button', {
        name: /move todo up/i,
      });
      const moveDownButton = screen.queryByRole('button', {
        name: /move todo down/i,
      });

      expect(moveUpButton).not.toBeInTheDocument();
      expect(moveDownButton).not.toBeInTheDocument();
    });

    it('should call moveUp when move up button is clicked', () => {
      const todo = createMockTodo({ id: 'test-todo-id' });
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          moveUp={mockMoveUp}
          moveDown={mockMoveDown}
        />
      );

      const moveUpButton = screen.getByRole('button', {
        name: /move todo up/i,
      });
      fireEvent.click(moveUpButton);

      expect(mockMoveUp).toHaveBeenCalledWith('test-todo-id');
      expect(mockMoveUp).toHaveBeenCalledTimes(1);
    });

    it('should call moveDown when move down button is clicked', () => {
      const todo = createMockTodo({ id: 'test-todo-id' });
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          moveUp={mockMoveUp}
          moveDown={mockMoveDown}
        />
      );

      const moveDownButton = screen.getByRole('button', {
        name: /move todo down/i,
      });
      fireEvent.click(moveDownButton);

      expect(mockMoveDown).toHaveBeenCalledWith('test-todo-id');
      expect(mockMoveDown).toHaveBeenCalledTimes(1);
    });

    it('should disable move up button when isFirst is true', () => {
      const todo = createMockTodo();
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          moveUp={mockMoveUp}
          moveDown={mockMoveDown}
          isFirst={true}
        />
      );

      const moveUpButton = screen.getByRole('button', {
        name: /move todo up/i,
      });
      expect(moveUpButton).toBeDisabled();
    });

    it('should disable move down button when isLast is true', () => {
      const todo = createMockTodo();
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          moveUp={mockMoveUp}
          moveDown={mockMoveDown}
          isLast={true}
        />
      );

      const moveDownButton = screen.getByRole('button', {
        name: /move todo down/i,
      });
      expect(moveDownButton).toBeDisabled();
    });

    it('should not call moveUp when move up button is disabled and clicked', () => {
      const todo = createMockTodo({ id: 'test-todo-id' });
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          moveUp={mockMoveUp}
          moveDown={mockMoveDown}
          isFirst={true}
        />
      );

      const moveUpButton = screen.getByRole('button', {
        name: /move todo up/i,
      });
      fireEvent.click(moveUpButton);

      expect(mockMoveUp).not.toHaveBeenCalled();
    });

    it('should not call moveDown when move down button is disabled and clicked', () => {
      const todo = createMockTodo({ id: 'test-todo-id' });
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          moveUp={mockMoveUp}
          moveDown={mockMoveDown}
          isLast={true}
        />
      );

      const moveDownButton = screen.getByRole('button', {
        name: /move todo down/i,
      });
      fireEvent.click(moveDownButton);

      expect(mockMoveDown).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for drag handle', () => {
      const todo = createMockTodo();
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          moveUp={mockMoveUp}
          moveDown={mockMoveDown}
          isDraggable={true}
        />
      );

      const dragHandle = screen.getByTestId('drag-handle');
      expect(dragHandle).toHaveAttribute('aria-roledescription', 'sortable');
      expect(dragHandle).toHaveAttribute('role', 'button');
    });

    it('should have proper ARIA labels for arrow buttons', () => {
      const todo = createMockTodo({ text: 'Important task' });
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          moveUp={mockMoveUp}
          moveDown={mockMoveDown}
        />
      );

      const moveUpButton = screen.getByRole('button', {
        name: /move todo up/i,
      });
      const moveDownButton = screen.getByRole('button', {
        name: /move todo down/i,
      });

      expect(moveUpButton).toHaveAttribute(
        'aria-label',
        'Move todo up: Important task'
      );
      expect(moveDownButton).toHaveAttribute(
        'aria-label',
        'Move todo down: Important task'
      );
    });

    it('should maintain proper tab order with reordering controls', () => {
      const todo = createMockTodo();
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          moveUp={mockMoveUp}
          moveDown={mockMoveDown}
          isDraggable={true}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /toggle todo/i });
      const editButton = screen.getByRole('button', { name: /edit todo/i });
      const moveUpButton = screen.getByRole('button', {
        name: /move todo up/i,
      });
      const moveDownButton = screen.getByRole('button', {
        name: /move todo down/i,
      });
      const deleteButton = screen.getByRole('button', { name: /delete todo/i });

      // All buttons should be focusable (no explicit tabIndex needed for buttons)
      expect(toggleButton).toBeVisible();
      expect(editButton).toBeVisible();
      expect(moveUpButton).toBeVisible();
      expect(moveDownButton).toBeVisible();
      expect(deleteButton).toBeVisible();
    });
  });

  describe('Visual layout', () => {
    it('should position drag handle on the left side', () => {
      const todo = createMockTodo();
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          moveUp={mockMoveUp}
          moveDown={mockMoveDown}
          isDraggable={true}
        />
      );

      const todoItem = screen.getByRole('listitem');
      const dragHandle = screen.getByTestId('drag-handle');

      // Drag handle should be within the first container div
      const firstContainer = todoItem.firstElementChild;
      expect(firstContainer).toContainElement(dragHandle);
    });

    it('should position arrow buttons on the right side', () => {
      const todo = createMockTodo();
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          moveUp={mockMoveUp}
          moveDown={mockMoveDown}
        />
      );

      const moveUpButton = screen.getByRole('button', {
        name: /move todo up/i,
      });
      const moveDownButton = screen.getByRole('button', {
        name: /move todo down/i,
      });
      const deleteButton = screen.getByRole('button', { name: /delete todo/i });

      // Arrow buttons should be in reorder group, actions in actions group
      const todoItem = screen.getByRole('listitem');
      const reorderGroup = todoItem.querySelector(
        '[aria-label="Reorder todo"]'
      );
      const actionsGroup = todoItem.querySelector(
        '[aria-label="Todo actions"]'
      );

      expect(reorderGroup).toContainElement(moveUpButton);
      expect(reorderGroup).toContainElement(moveDownButton);
      expect(actionsGroup).toContainElement(deleteButton);
    });
  });
});
