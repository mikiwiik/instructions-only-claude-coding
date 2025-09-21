import React from 'react';
import { render, screen } from '@testing-library/react';
import TodoItem from '../../components/TodoItem';
import { Todo } from '../../types/todo';

const mockTodo: Todo = {
  id: '1',
  text: 'Test todo',
  completed: false,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
};

const defaultProps = {
  todo: mockTodo,
  onToggle: jest.fn(),
  onDelete: jest.fn(),
  onEdit: jest.fn(),
  moveUp: jest.fn(),
  moveDown: jest.fn(),
  isDraggable: true,
  isFirst: false,
  isLast: false,
};

describe('TodoItem - Layout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Horizontal button layout', () => {
    it('should arrange buttons horizontally to reduce vertical space', () => {
      render(<TodoItem {...defaultProps} />);

      const todoItem = screen.getByRole('listitem');
      const buttonContainer = todoItem.querySelector(
        '.flex.flex-col.md\\:flex-row'
      );

      expect(buttonContainer).toBeInTheDocument();
      expect(buttonContainer).toHaveClass(
        'flex',
        'flex-col',
        'md:flex-row',
        'items-center'
      );
    });

    it('should group reorder buttons together', () => {
      render(<TodoItem {...defaultProps} />);

      const reorderGroup = screen.getByRole('group', {
        name: /reorder todo/i,
      });
      const moveUpButton = screen.getByRole('button', {
        name: /move todo up/i,
      });
      const moveDownButton = screen.getByRole('button', {
        name: /move todo down/i,
      });

      expect(reorderGroup).toBeInTheDocument();
      expect(reorderGroup).toContainElement(moveUpButton);
      expect(reorderGroup).toContainElement(moveDownButton);
      expect(reorderGroup).toHaveClass('flex', 'items-center', 'gap-1');
    });

    it('should group action buttons together', () => {
      render(<TodoItem {...defaultProps} />);

      const actionsGroup = screen.getByRole('group', {
        name: /todo actions/i,
      });
      const editButton = screen.getByRole('button', { name: /edit todo/i });
      const deleteButton = screen.getByRole('button', { name: /delete todo/i });

      expect(actionsGroup).toBeInTheDocument();
      expect(actionsGroup).toContainElement(editButton);
      expect(actionsGroup).toContainElement(deleteButton);
      expect(actionsGroup).toHaveClass('flex', 'items-center', 'gap-1');
    });

    it('should maintain proper spacing between button groups', () => {
      render(<TodoItem {...defaultProps} />);

      const reorderGroup = screen.getByRole('group', {
        name: /reorder todo/i,
      });

      const containerDiv = reorderGroup.parentElement;
      expect(containerDiv).toHaveClass(
        'flex',
        'flex-col',
        'md:flex-row',
        'items-center',
        'gap-1',
        'md:gap-2'
      );
    });
  });

  describe('Touch target accessibility', () => {
    it('should provide 44px minimum touch targets for all buttons', () => {
      render(<TodoItem {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      const actionButtons = buttons.filter(
        (button) =>
          button.getAttribute('aria-label')?.includes('move') ||
          button.getAttribute('aria-label')?.includes('edit') ||
          button.getAttribute('aria-label')?.includes('delete')
      );

      actionButtons.forEach((button) => {
        expect(button).toHaveClass('min-w-[44px]', 'min-h-[44px]');
        expect(button).toHaveClass('flex', 'items-center', 'justify-center');
      });
    });

    it('should maintain accessibility with proper ARIA roles', () => {
      render(<TodoItem {...defaultProps} />);

      const reorderGroup = screen.getByRole('group', {
        name: /reorder todo/i,
      });
      const actionsGroup = screen.getByRole('group', {
        name: /todo actions/i,
      });

      expect(reorderGroup).toHaveAttribute('role', 'group');
      expect(reorderGroup).toHaveAttribute('aria-label', 'Reorder todo');
      expect(actionsGroup).toHaveAttribute('role', 'group');
      expect(actionsGroup).toHaveAttribute('aria-label', 'Todo actions');
    });
  });

  describe('Conditional rendering', () => {
    it('should not render reorder group when move functions are not provided', () => {
      render(
        <TodoItem {...defaultProps} moveUp={undefined} moveDown={undefined} />
      );

      const reorderGroup = screen.queryByRole('group', {
        name: /reorder todo/i,
      });
      expect(reorderGroup).not.toBeInTheDocument();
    });

    it('should still render actions group when only delete is available', () => {
      render(<TodoItem {...defaultProps} onEdit={undefined} />);

      const actionsGroup = screen.getByRole('group', {
        name: /todo actions/i,
      });
      const deleteButton = screen.getByRole('button', { name: /delete todo/i });

      expect(actionsGroup).toBeInTheDocument();
      expect(actionsGroup).toContainElement(deleteButton);
    });

    it('should render both individual move buttons when only one is provided', () => {
      render(<TodoItem {...defaultProps} moveDown={undefined} />);

      const reorderGroup = screen.getByRole('group', {
        name: /reorder todo/i,
      });
      const moveUpButton = screen.getByRole('button', {
        name: /move todo up/i,
      });
      const moveDownButton = screen.queryByRole('button', {
        name: /move todo down/i,
      });

      expect(reorderGroup).toBeInTheDocument();
      expect(reorderGroup).toContainElement(moveUpButton);
      expect(moveDownButton).not.toBeInTheDocument();
    });
  });

  describe('Layout responsiveness', () => {
    it('should maintain responsive layout on different screen sizes', () => {
      render(<TodoItem {...defaultProps} />);

      const buttonContainer = screen
        .getByRole('listitem')
        .querySelector('.flex.flex-col.md\\:flex-row');

      expect(buttonContainer).toHaveClass(
        'flex',
        'flex-col',
        'md:flex-row',
        'items-center'
      );
    });
  });
});
