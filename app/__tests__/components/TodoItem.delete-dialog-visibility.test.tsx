import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodoItem from '../../components/TodoItem';
import { Todo } from '../../types/todo';

describe('TodoItem Delete Dialog Visibility', () => {
  const longText = `From wikipedia
[32] Sed ut perspiciatis, unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa, quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt, explicabo. Nemo enim ipsam voluptatem, quia voluptas sit, aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos, qui ratione voluptatem sequi nesciunt, neque porro quisquam est, qui dolorem ipsum, quia dolor sit amet consectetur adipisci[ng] velit, sed quia non numquam [do] eius modi tempora inci[di]dunt, ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum[d] exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? [D]Quis autem vel eum i[r]ure reprehenderit, qui in ea voluptate velit esse, quam nihil molestiae consequatur, vel illum, qui dolorem eum fugiat, quo voluptas nulla pariatur?

[33] At vero eos et accusamus et iusto odio dignissimos ducimus, qui blanditiis praesentium voluptatum deleniti atque corrupti, quos dolores et quas molestias excepturi sint, obcaecati cupiditate non provident, similique sunt in culpa, qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem reru[d]um facilis est e[r]t expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio, cumque nihil impedit, quo minus id, quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellend[a]us. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet, ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.`;

  const createLongTextTodo = (): Todo => ({
    id: '1',
    text: longText,
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const createDeletedLongTextTodo = (): Todo => ({
    id: '2',
    text: longText,
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: new Date(),
  });

  const mockOnDelete = jest.fn();
  const mockOnPermanentlyDelete = jest.fn();
  const mockOnToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Active todo with extremely long text', () => {
    it('shows delete confirmation dialog with truncated text', async () => {
      const todo = createLongTextTodo();

      render(
        <TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      // Click delete button (find by role since label is too long)
      const deleteButtons = screen.getAllByRole('button');
      const deleteButton = deleteButtons.find((button) =>
        button.getAttribute('aria-label')?.startsWith('Delete todo:')
      );
      expect(deleteButton).toBeInTheDocument();
      fireEvent.click(deleteButton!);

      // Wait for dialog to appear
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Check that dialog title is visible
      expect(screen.getByText('Delete Todo')).toBeVisible();

      // Check that confirmation message contains truncated text (not full text)
      const dialogDescription = screen
        .getByRole('dialog')
        .querySelector('#dialog-description');
      expect(dialogDescription).toBeInTheDocument();
      expect(dialogDescription?.textContent).toContain(
        'Are you sure you want to delete'
      );
      expect(dialogDescription?.textContent).toContain('...');
      expect(dialogDescription?.textContent).not.toContain(longText); // Should not contain full text

      // Verify message is truncated to ~100 characters plus ellipsis
      const messageText = dialogDescription?.textContent || '';
      const quotedText = messageText.match(/"([^"]*)"/)?.[1] || '';
      expect(quotedText.length).toBeLessThanOrEqual(103); // 100 chars + "..."
    });

    it('ensures both Cancel and Delete buttons are visible and functional', async () => {
      const todo = createLongTextTodo();

      render(
        <TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      // Open delete confirmation dialog (find by role since label is too long)
      const deleteButtons = screen.getAllByRole('button');
      const deleteButton = deleteButtons.find((button) =>
        button.getAttribute('aria-label')?.startsWith('Delete todo:')
      );
      expect(deleteButton).toBeInTheDocument();
      fireEvent.click(deleteButton!);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Check both buttons are visible and accessible
      const cancelButton = screen.getByText('Cancel');
      const confirmDeleteButton = screen.getByText('Delete');

      expect(cancelButton).toBeVisible();
      expect(confirmDeleteButton).toBeVisible();

      // Verify buttons are clickable (not obscured)
      expect(cancelButton).not.toBeDisabled();
      expect(confirmDeleteButton).not.toBeDisabled();

      // Test Cancel button functionality
      fireEvent.click(cancelButton);
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
      expect(mockOnDelete).not.toHaveBeenCalled();
    });

    it('handles delete confirmation for long text todo', async () => {
      const todo = createLongTextTodo();

      render(
        <TodoItem todo={todo} onToggle={mockOnToggle} onDelete={mockOnDelete} />
      );

      // Open and confirm delete (find by role since label is too long)
      const deleteButtons = screen.getAllByRole('button');
      const deleteButton = deleteButtons.find((button) =>
        button.getAttribute('aria-label')?.startsWith('Delete todo:')
      );
      expect(deleteButton).toBeInTheDocument();
      fireEvent.click(deleteButton!);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const confirmDeleteButton = screen.getByText('Delete');
      fireEvent.click(confirmDeleteButton);

      // Verify delete was called
      expect(mockOnDelete).toHaveBeenCalledWith(todo.id);
    });
  });

  describe('Deleted todo with extremely long text', () => {
    it('shows permanent delete confirmation with truncated text', async () => {
      const todo = createDeletedLongTextTodo();

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onPermanentlyDelete={mockOnPermanentlyDelete}
        />
      );

      // Click permanent delete button (find by role since label is too long)
      const deleteButtons = screen.getAllByRole('button');
      const deleteButton = deleteButtons.find((button) =>
        button
          .getAttribute('aria-label')
          ?.startsWith('Permanently delete todo:')
      );
      expect(deleteButton).toBeInTheDocument();
      fireEvent.click(deleteButton!);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Check permanent delete dialog
      expect(screen.getByText('Permanently Delete Todo')).toBeVisible();

      const dialogDescription = screen
        .getByRole('dialog')
        .querySelector('#dialog-description');
      expect(dialogDescription?.textContent).toContain('permanently delete');
      expect(dialogDescription?.textContent).toContain('...');
      expect(dialogDescription?.textContent).toContain('cannot be undone');

      // Check buttons are visible
      expect(screen.getByText('Cancel')).toBeVisible();
      expect(screen.getByText('Permanently Delete')).toBeVisible();
    });
  });

  describe('Text truncation edge cases', () => {
    it('does not truncate short text', async () => {
      const shortTextTodo: Todo = {
        id: '3',
        text: 'Short todo text',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      render(
        <TodoItem
          todo={shortTextTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByLabelText(
        `Delete todo: ${shortTextTodo.text}`
      );
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const dialogDescription = screen
        .getByRole('dialog')
        .querySelector('#dialog-description');
      expect(dialogDescription?.textContent).toContain(shortTextTodo.text);
      expect(dialogDescription?.textContent).not.toContain('...');
    });

    it('truncates text at exactly 100 characters', async () => {
      const exactlyLongText = 'A'.repeat(100) + 'B'; // 101 characters
      const exactlyLongTodo: Todo = {
        id: '4',
        text: exactlyLongText,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      render(
        <TodoItem
          todo={exactlyLongTodo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByLabelText(
        `Delete todo: ${exactlyLongTodo.text}`
      );
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const dialogDescription = screen
        .getByRole('dialog')
        .querySelector('#dialog-description');
      const messageText = dialogDescription?.textContent || '';
      const quotedText = messageText.match(/"([^"]*)"/)?.[1] || '';

      // Should be truncated to 100 chars + "..."
      expect(quotedText).toBe('A'.repeat(100) + '...');
      expect(quotedText).not.toContain('B'); // The 101st character should not be included
    });
  });
});
