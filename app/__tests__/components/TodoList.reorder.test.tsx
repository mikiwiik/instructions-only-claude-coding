import { render, screen } from '@testing-library/react';
import TodoList from '../../components/TodoList';
import { Todo } from '../../types/todo';

// Mock @dnd-kit components
jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='dnd-context'>{children}</div>
  ),
  closestCenter: jest.fn(),
  KeyboardSensor: jest.fn(),
  PointerSensor: jest.fn(),
  useSensors: () => [],
  useSensor: () => ({}),
}));

jest.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='sortable-context'>{children}</div>
  ),
  verticalListSortingStrategy: 'vertical-list-sorting',
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
const mockReorderTodos = jest.fn();
const mockMoveUp = jest.fn();
const mockMoveDown = jest.fn();

describe('TodoList - Reordering functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('DnD Context', () => {
    it('should render DndContext when reordering is enabled', () => {
      const todos = [
        createMockTodo({ id: '1', text: 'First todo' }),
        createMockTodo({ id: '2', text: 'Second todo' }),
      ];

      render(
        <TodoList
          todos={todos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          reorderTodos={mockReorderTodos}
          moveUp={mockMoveUp}
          moveDown={mockMoveDown}
        />
      );

      expect(screen.getByTestId('dnd-context')).toBeInTheDocument();
      expect(screen.getByTestId('sortable-context')).toBeInTheDocument();
    });

    it('should not render DndContext when reordering is disabled', () => {
      const todos = [
        createMockTodo({ id: '1', text: 'First todo' }),
        createMockTodo({ id: '2', text: 'Second todo' }),
      ];

      render(
        <TodoList
          todos={todos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      expect(screen.queryByTestId('dnd-context')).not.toBeInTheDocument();
      expect(screen.queryByTestId('sortable-context')).not.toBeInTheDocument();
    });
  });

  describe('TodoItem props', () => {
    it('should pass reordering props to TodoItems when reordering is enabled', () => {
      const todos = [
        createMockTodo({ id: '1', text: 'First todo' }),
        createMockTodo({ id: '2', text: 'Second todo' }),
        createMockTodo({ id: '3', text: 'Third todo' }),
      ];

      render(
        <TodoList
          todos={todos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          reorderTodos={mockReorderTodos}
          moveUp={mockMoveUp}
          moveDown={mockMoveDown}
        />
      );

      // Check that move up buttons are rendered (indicates props are passed)
      const moveUpButtons = screen.getAllByRole('button', {
        name: /move todo up/i,
      });
      expect(moveUpButtons).toHaveLength(3);

      // Check that move down buttons are rendered
      const moveDownButtons = screen.getAllByRole('button', {
        name: /move todo down/i,
      });
      expect(moveDownButtons).toHaveLength(3);
    });

    it('should not pass reordering props to TodoItems when reordering is disabled', () => {
      const todos = [
        createMockTodo({ id: '1', text: 'First todo' }),
        createMockTodo({ id: '2', text: 'Second todo' }),
      ];

      render(
        <TodoList
          todos={todos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // Move buttons should not be rendered
      const moveUpButtons = screen.queryAllByRole('button', {
        name: /move todo up/i,
      });
      expect(moveUpButtons).toHaveLength(0);

      const moveDownButtons = screen.queryAllByRole('button', {
        name: /move todo down/i,
      });
      expect(moveDownButtons).toHaveLength(0);
    });

    it('should set isFirst prop correctly for first todo', () => {
      const todos = [
        createMockTodo({ id: '1', text: 'First todo' }),
        createMockTodo({ id: '2', text: 'Second todo' }),
      ];

      render(
        <TodoList
          todos={todos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          reorderTodos={mockReorderTodos}
          moveUp={mockMoveUp}
          moveDown={mockMoveDown}
        />
      );

      const moveUpButtons = screen.getAllByRole('button', {
        name: /move todo up/i,
      });

      // First todo's move up button should be disabled
      expect(moveUpButtons[0]).toBeDisabled();
      // Second todo's move up button should be enabled
      expect(moveUpButtons[1]).not.toBeDisabled();
    });

    it('should set isLast prop correctly for last todo', () => {
      const todos = [
        createMockTodo({ id: '1', text: 'First todo' }),
        createMockTodo({ id: '2', text: 'Second todo' }),
      ];

      render(
        <TodoList
          todos={todos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          reorderTodos={mockReorderTodos}
          moveUp={mockMoveUp}
          moveDown={mockMoveDown}
        />
      );

      const moveDownButtons = screen.getAllByRole('button', {
        name: /move todo down/i,
      });

      // First todo's move down button should be enabled
      expect(moveDownButtons[0]).not.toBeDisabled();
      // Last todo's move down button should be disabled
      expect(moveDownButtons[1]).toBeDisabled();
    });

    it('should set isDraggable prop correctly when reordering is enabled', () => {
      const todos = [createMockTodo({ id: '1', text: 'First todo' })];

      render(
        <TodoList
          todos={todos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          reorderTodos={mockReorderTodos}
          moveUp={mockMoveUp}
          moveDown={mockMoveDown}
        />
      );

      // Drag handle should be rendered when isDraggable is true
      expect(screen.getByTestId('drag-handle')).toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('should show empty state when no todos', () => {
      render(
        <TodoList
          todos={[]}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          reorderTodos={mockReorderTodos}
          moveUp={mockMoveUp}
          moveDown={mockMoveDown}
        />
      );

      expect(screen.getByText('No todos yet')).toBeInTheDocument();
      expect(screen.getByTestId('empty-state-icon')).toBeInTheDocument();
    });

    it('should not render DndContext when todos list is empty', () => {
      render(
        <TodoList
          todos={[]}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          reorderTodos={mockReorderTodos}
          moveUp={mockMoveUp}
          moveDown={mockMoveDown}
        />
      );

      expect(screen.queryByTestId('dnd-context')).not.toBeInTheDocument();
    });
  });

  describe('Todo count', () => {
    it('should display correct todo count with reordering enabled', () => {
      const todos = [
        createMockTodo({ id: '1', text: 'First todo' }),
        createMockTodo({ id: '2', text: 'Second todo' }),
        createMockTodo({ id: '3', text: 'Third todo' }),
      ];

      render(
        <TodoList
          todos={todos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          reorderTodos={mockReorderTodos}
          moveUp={mockMoveUp}
          moveDown={mockMoveDown}
        />
      );

      expect(screen.getByText('Your Todos (3)')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should maintain proper list structure with drag and drop', () => {
      const todos = [
        createMockTodo({ id: '1', text: 'First todo' }),
        createMockTodo({ id: '2', text: 'Second todo' }),
      ];

      render(
        <TodoList
          todos={todos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          reorderTodos={mockReorderTodos}
          moveUp={mockMoveUp}
          moveDown={mockMoveDown}
        />
      );

      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();

      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(2);
    });

    it('should have proper ARIA labels for drag and drop', () => {
      const todos = [createMockTodo({ id: '1', text: 'Accessible todo' })];

      render(
        <TodoList
          todos={todos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          reorderTodos={mockReorderTodos}
          moveUp={mockMoveUp}
          moveDown={mockMoveDown}
        />
      );

      const dragHandle = screen.getByTestId('drag-handle');
      expect(dragHandle).toHaveAttribute('aria-label', 'Drag to reorder todo');

      const moveUpButton = screen.getByRole('button', {
        name: /move todo up: accessible todo/i,
      });
      expect(moveUpButton).toBeInTheDocument();

      const moveDownButton = screen.getByRole('button', {
        name: /move todo down: accessible todo/i,
      });
      expect(moveDownButton).toBeInTheDocument();
    });
  });
});
