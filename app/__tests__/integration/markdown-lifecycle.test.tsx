import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoItem from '../../components/TodoItem';
import TodoForm from '../../components/TodoForm';
import TodoList from '../../components/TodoList';
import { createMockTodo } from '../utils/test-utils';

// Mock react-markdown for predictable testing
jest.mock('react-markdown', () => {
  return function MockReactMarkdown({ children }: { children: string }) {
    return <div>{children}</div>;
  };
});

describe('Markdown Feature Integration Tests', () => {
  describe('Todo Creation with Markdown', () => {
    it('should create a todo with markdown content', async () => {
      const user = userEvent.setup();
      const mockOnAdd = jest.fn();

      render(<TodoForm onAddTodo={mockOnAdd} />);

      const input = screen.getByRole('textbox', { name: /new todo/i });
      const markdownContent =
        '# Important Task\n- [x] Subtask 1\n- [ ] Subtask 2';

      await user.click(input);
      await user.paste(markdownContent);
      await user.keyboard('{Enter}');

      expect(mockOnAdd).toHaveBeenCalledWith(markdownContent);
    });

    it('should create a todo with plain text content', async () => {
      const user = userEvent.setup();
      const mockOnAdd = jest.fn();

      render(<TodoForm onAddTodo={mockOnAdd} />);

      const input = screen.getByRole('textbox', { name: /new todo/i });
      const plainContent = 'Simple todo item';

      await user.type(input, plainContent);
      await user.keyboard('{Enter}');

      expect(mockOnAdd).toHaveBeenCalledWith(plainContent);
    });

    it('should handle multiline input in todo creation', async () => {
      const user = userEvent.setup();
      const mockOnAdd = jest.fn();

      render(<TodoForm onAddTodo={mockOnAdd} />);

      const input = screen.getByRole('textbox', { name: /new todo/i });
      const multilineContent = 'Line 1\nLine 2\nLine 3';

      await user.type(input, multilineContent);
      await user.keyboard('{Enter}');

      expect(mockOnAdd).toHaveBeenCalledWith(multilineContent);
    });
  });

  describe('Todo Display and Rendering Lifecycle', () => {
    it('should render multiple todos with mixed content types', () => {
      const todos = [
        createMockTodo({ id: '1', text: '# Markdown Todo\n**Bold** content' }),
        createMockTodo({ id: '2', text: 'Plain text todo' }),
        createMockTodo({ id: '3', text: '- [ ] Task 1\n- [x] Task 2' }),
        createMockTodo({ id: '4', text: 'Another plain todo' }),
      ];

      const mockProps = {
        todos,
        onToggle: jest.fn(),
        onDelete: jest.fn(),
        onEdit: jest.fn(),
        filter: 'all' as const,
      };

      render(<TodoList {...mockProps} />);

      // Markdown todos should render with markdown parser
      expect(screen.getAllByTestId('markdown-content')).toHaveLength(2);

      // Plain text todos should render as plain text
      expect(screen.getByText('Plain text todo')).toBeInTheDocument();
      expect(screen.getByText('Another plain todo')).toBeInTheDocument();
    });

    it('should maintain rendering consistency across re-renders', () => {
      const todo = createMockTodo({ text: '# Consistent Rendering\n**Test**' });
      const mockProps = {
        todo,
        onToggle: jest.fn(),
        onDelete: jest.fn(),
        onEdit: jest.fn(),
      };

      const { rerender } = render(<TodoItem {...mockProps} />);

      // Initial render
      expect(screen.getByTestId('markdown-content')).toBeInTheDocument();

      // Re-render with same props
      rerender(<TodoItem {...mockProps} />);
      expect(screen.getByTestId('markdown-content')).toBeInTheDocument();

      // Re-render with updated props (different handler functions)
      rerender(<TodoItem {...mockProps} onToggle={jest.fn()} />);
      expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
    });
  });

  describe('Todo Editing Lifecycle', () => {
    it('should handle complete edit workflow for markdown content', async () => {
      const user = userEvent.setup();
      const mockOnEdit = jest.fn();
      const originalMarkdown = '# Original Header\n**Bold** text';
      const updatedMarkdown =
        '## Updated Header\n*Italic* text with (https://example.com)';

      const todo = createMockTodo({ id: 'edit-test', text: originalMarkdown });

      render(
        <TodoItem
          todo={todo}
          onToggle={jest.fn()}
          onDelete={jest.fn()}
          onEdit={mockOnEdit}
        />
      );

      // Initial state - should render markdown
      expect(screen.getByTestId('markdown-content')).toHaveTextContent(
        '# Original Header **Bold** text'
      );

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit todo/i });
      await user.click(editButton);

      // Should show textarea with original content
      const textarea = screen.getByRole('textbox', { name: /edit todo text/i });
      expect(textarea).toHaveValue(originalMarkdown);

      // Should show markdown help
      expect(
        screen.getByRole('button', { name: /markdown formatting help/i })
      ).toBeInTheDocument();

      // Edit the content
      await user.clear(textarea);
      await user.type(textarea, updatedMarkdown);

      // Save changes
      const saveButton = screen.getByRole('button', { name: /save edit/i });
      await user.click(saveButton);

      // Should call onEdit with updated content
      expect(mockOnEdit).toHaveBeenCalledWith('edit-test', updatedMarkdown);
    });

    it('should handle switching from plain text to markdown', async () => {
      const user = userEvent.setup();
      const mockOnEdit = jest.fn();
      const originalText = 'Plain text todo';
      const markdownText = '# Now with markdown!\n**Converted** content';

      const todo = createMockTodo({ id: 'convert-test', text: originalText });

      render(
        <TodoItem
          todo={todo}
          onToggle={jest.fn()}
          onDelete={jest.fn()}
          onEdit={mockOnEdit}
        />
      );

      // Should initially render as plain text
      expect(screen.queryByTestId('markdown-content')).not.toBeInTheDocument();
      expect(screen.getByText(originalText)).toBeInTheDocument();

      // Enter edit mode and convert to markdown
      const editButton = screen.getByRole('button', { name: /edit todo/i });
      await user.click(editButton);

      const textarea = screen.getByRole('textbox', { name: /edit todo text/i });
      await user.clear(textarea);
      await user.type(textarea, markdownText);

      const saveButton = screen.getByRole('button', { name: /save edit/i });
      await user.click(saveButton);

      expect(mockOnEdit).toHaveBeenCalledWith('convert-test', markdownText);
    });

    it('should handle switching from markdown to plain text', async () => {
      const user = userEvent.setup();
      const mockOnEdit = jest.fn();
      const originalMarkdown = '# Markdown Todo\n**Bold** content';
      const plainText = 'Converted to plain text';

      const todo = createMockTodo({ id: 'plain-test', text: originalMarkdown });

      render(
        <TodoItem
          todo={todo}
          onToggle={jest.fn()}
          onDelete={jest.fn()}
          onEdit={mockOnEdit}
        />
      );

      // Should initially render as markdown
      expect(screen.getByTestId('markdown-content')).toBeInTheDocument();

      // Enter edit mode and convert to plain text
      const editButton = screen.getByRole('button', { name: /edit todo/i });
      await user.click(editButton);

      const textarea = screen.getByRole('textbox', { name: /edit todo text/i });
      await user.clear(textarea);
      await user.type(textarea, plainText);

      const saveButton = screen.getByRole('button', { name: /save edit/i });
      await user.click(saveButton);

      expect(mockOnEdit).toHaveBeenCalledWith('plain-test', plainText);
    });

    it('should handle canceling edit and preserve original content', async () => {
      const user = userEvent.setup();
      const mockOnEdit = jest.fn();
      const originalMarkdown =
        '# Original Content\n**Should remain unchanged**';

      const todo = createMockTodo({ text: originalMarkdown });

      render(
        <TodoItem
          todo={todo}
          onToggle={jest.fn()}
          onDelete={jest.fn()}
          onEdit={mockOnEdit}
        />
      );

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit todo/i });
      await user.click(editButton);

      // Make changes but don't save
      const textarea = screen.getByRole('textbox', { name: /edit todo text/i });
      await user.clear(textarea);
      await user.type(textarea, '# Different content');

      // Cancel instead of saving
      const cancelButton = await screen.findByRole('button', {
        name: /cancel edit/i,
      });
      await user.click(cancelButton);

      // Should not call onEdit
      expect(mockOnEdit).not.toHaveBeenCalled();

      // Should still show original content
      expect(screen.getByTestId('markdown-content')).toHaveTextContent(
        '# Original Content **Should remain unchanged**'
      );
    });
  });

  describe('Todo State Management with Markdown', () => {
    it('should handle completion lifecycle for markdown todos', async () => {
      const user = userEvent.setup();
      const mockOnToggle = jest.fn();
      const markdownText =
        '# Task to Complete\n- [x] Subtask 1\n- [ ] Subtask 2';

      const todo = createMockTodo({ id: 'complete-test', text: markdownText });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={jest.fn()}
          onEdit={jest.fn()}
        />
      );

      // Should initially render as incomplete markdown
      expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
      expect(screen.getByTestId('incomplete-icon')).toBeInTheDocument();

      // Complete the todo
      const toggleButton = screen.getByRole('button', { name: /toggle todo/i });
      await user.click(toggleButton);

      expect(mockOnToggle).toHaveBeenCalledWith('complete-test');
    });

    it('should handle restoration lifecycle for completed markdown todos', async () => {
      const user = userEvent.setup();
      const mockOnRestore = jest.fn();
      const markdownText =
        '# Completed Task\n**Was completed** but now restored';

      const todo = createMockTodo({
        id: 'restore-test',
        text: markdownText,
        completedAt: new Date(),
      });

      render(
        <TodoItem
          todo={todo}
          onToggle={jest.fn()}
          onDelete={jest.fn()}
          onEdit={jest.fn()}
          onRestore={mockOnRestore}
        />
      );

      // Should render as completed markdown with strikethrough
      expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
      expect(screen.getByTestId('completed-icon')).toBeInTheDocument();

      const markdownContainer =
        screen.getByTestId('markdown-content').parentElement;
      expect(markdownContainer).toHaveClass('line-through');

      // Restore the todo
      const restoreButton = screen.getByRole('button', {
        name: /undo completion/i,
      });
      await user.click(restoreButton);

      expect(mockOnRestore).toHaveBeenCalledWith('restore-test');
    });

    it('should handle deletion lifecycle for markdown todos', async () => {
      const user = userEvent.setup();
      const mockOnDelete = jest.fn();
      const markdownText =
        '# Todo to Delete\n**Important** content to be deleted';

      const todo = createMockTodo({ id: 'delete-test', text: markdownText });

      render(
        <TodoItem
          todo={todo}
          onToggle={jest.fn()}
          onDelete={mockOnDelete}
          onEdit={jest.fn()}
        />
      );

      // Should render markdown content
      expect(screen.getByTestId('markdown-content')).toBeInTheDocument();

      // Delete the todo
      const deleteButton = screen.getByRole('button', { name: /delete todo/i });
      await user.click(deleteButton);

      // Confirm deletion
      const confirmButton = screen.getByRole('button', {
        name: /delete action/i,
      });
      await user.click(confirmButton);

      expect(mockOnDelete).toHaveBeenCalledWith('delete-test');
    });
  });

  describe('Markdown Help Integration', () => {
    it('should show and hide markdown help during editing', async () => {
      const user = userEvent.setup();
      const todo = createMockTodo({ text: 'Todo to edit' });

      render(
        <TodoItem
          todo={todo}
          onToggle={jest.fn()}
          onDelete={jest.fn()}
          onEdit={jest.fn()}
        />
      );

      // Enter edit mode
      const editButton = screen.getByRole('button', { name: /edit todo/i });
      await user.click(editButton);

      // Should show markdown help toggle
      const helpToggle = screen.getByRole('button', {
        name: /markdown formatting help/i,
      });
      expect(helpToggle).toBeInTheDocument();

      // Expand help
      await user.click(helpToggle);
      expect(
        screen.getByText(/markdown formatting will be automatically detected/i)
      ).toBeInTheDocument();

      // Collapse help
      await user.click(helpToggle);
      expect(
        screen.queryByText(
          /markdown formatting will be automatically detected/i
        )
      ).not.toBeInTheDocument();

      // Exit edit mode
      const cancelButton = await screen.findByRole('button', {
        name: /cancel edit/i,
      });
      await user.click(cancelButton);

      // Help should no longer be visible
      expect(
        screen.queryByRole('button', { name: /markdown formatting help/i })
      ).not.toBeInTheDocument();
    });

    it('should maintain help state during edit session', async () => {
      const user = userEvent.setup();
      const todo = createMockTodo({ text: 'Test todo' });

      render(
        <TodoItem
          todo={todo}
          onToggle={jest.fn()}
          onDelete={jest.fn()}
          onEdit={jest.fn()}
        />
      );

      // Enter edit mode and expand help
      const editButton = screen.getByRole('button', { name: /edit todo/i });
      await user.click(editButton);

      const helpToggle = screen.getByRole('button', {
        name: /markdown formatting help/i,
      });
      await user.click(helpToggle);

      expect(
        screen.getByText(/markdown formatting will be automatically detected/i)
      ).toBeInTheDocument();

      // Type some content
      const textarea = screen.getByRole('textbox', { name: /edit todo text/i });
      await user.type(textarea, 'Some content');

      // Help should still be visible
      expect(
        screen.getByText(/markdown formatting will be automatically detected/i)
      ).toBeInTheDocument();
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should recover gracefully from rendering errors', () => {
      const problematicTodos = [
        createMockTodo({
          id: '1',
          text: '# Header with problem\n**unclosed bold',
        }),
        createMockTodo({ id: '2', text: '[link with problem](incomplete' }),
        createMockTodo({ id: '3', text: 'Normal todo' }),
        createMockTodo({ id: '4', text: '```\nunclosed code block' }),
      ];

      const mockProps = {
        todos: problematicTodos,
        onToggle: jest.fn(),
        onDelete: jest.fn(),
        onEdit: jest.fn(),
        filter: 'all' as const,
      };

      expect(() => render(<TodoList {...mockProps} />)).not.toThrow();

      // Should still render the normal todo
      expect(screen.getByText('Normal todo')).toBeInTheDocument();
    });

    it('should handle rapid state changes gracefully', async () => {
      const user = userEvent.setup();
      const mockOnEdit = jest.fn();
      const todo = createMockTodo({ text: '# Rapid Changes Test' });

      render(
        <TodoItem
          todo={todo}
          onToggle={jest.fn()}
          onDelete={jest.fn()}
          onEdit={mockOnEdit}
        />
      );

      // Rapid edit mode entry/exit
      for (let i = 0; i < 3; i++) {
        const editButton = screen.getByRole('button', { name: /edit todo/i });
        await user.click(editButton);

        // Wait for edit mode to activate
        const cancelButton = await screen.findByRole('button', {
          name: /cancel edit/i,
        });
        await user.click(cancelButton);

        // Wait for edit mode to deactivate
        await screen.findByRole('button', { name: /edit todo/i });
      }

      // Should still be functional
      const editButton = screen.getByRole('button', { name: /edit todo/i });
      await user.click(editButton);
      expect(
        await screen.findByRole('textbox', { name: /edit todo text/i })
      ).toBeInTheDocument();
    });
  });

  describe('Performance and Memory Management', () => {
    it('should handle large markdown content efficiently', () => {
      const largeMarkdown = `# Large Content Test

      ${'## Section'.repeat(100)}

      ${Array.from({ length: 50 }, (_, i) => `- Item ${i + 1}`).join('\n')}

      ${'**Bold text** '.repeat(100)}

      ${Array.from({ length: 20 }, (_, i) => `[Link ${i + 1}](https://example${i + 1}.com)`).join('\n\n')}`;

      const todo = createMockTodo({ text: largeMarkdown });

      const start = performance.now();
      render(
        <TodoItem
          todo={todo}
          onToggle={jest.fn()}
          onDelete={jest.fn()}
          onEdit={jest.fn()}
        />
      );
      const end = performance.now();

      // Should render without significant delay
      expect(end - start).toBeLessThan(1000); // 1 second threshold

      expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
    });

    it('should handle many todos with mixed content types', () => {
      const manyTodos = Array.from({ length: 100 }, (_, i) => {
        const isMarkdown = i % 3 === 0;
        return createMockTodo({
          id: `todo-${i}`,
          text: isMarkdown
            ? `# Todo ${i}\n**Content** for todo number ${i}`
            : `Plain text todo ${i}`,
        });
      });

      const mockProps = {
        todos: manyTodos,
        onToggle: jest.fn(),
        onDelete: jest.fn(),
        onEdit: jest.fn(),
        filter: 'all' as const,
      };

      const start = performance.now();
      render(<TodoList {...mockProps} />);
      const end = performance.now();

      // Should render without significant delay
      expect(end - start).toBeLessThan(2000); // 2 second threshold for 100 items

      // Should render all todos
      expect(screen.getAllByRole('listitem')).toHaveLength(100);
    });
  });

  describe('Accessibility Integration', () => {
    it('should maintain accessibility with markdown content', () => {
      const markdownTodos = [
        createMockTodo({
          id: '1',
          text: '# Accessible Header\n**Bold** content',
        }),
        createMockTodo({
          id: '2',
          text: '- [x] Completed task\n- [ ] Pending task',
        }),
        createMockTodo({ id: '3', text: '[Link text](https://example.com)' }),
      ];

      const mockProps = {
        todos: markdownTodos,
        onToggle: jest.fn(),
        onDelete: jest.fn(),
        onEdit: jest.fn(),
        filter: 'all' as const,
      };

      render(<TodoList {...mockProps} />);

      // All todos should be accessible as list items
      expect(screen.getAllByRole('listitem')).toHaveLength(3);

      // All toggle buttons should be accessible
      expect(
        screen.getAllByRole('button', { name: /toggle todo/i })
      ).toHaveLength(3);

      // Should have proper ARIA labels even with markdown content
      const toggleButtons = screen.getAllByRole('button', {
        name: /toggle todo/i,
      });
      toggleButtons.forEach((button) => {
        expect(button).toHaveAttribute('aria-label');
        expect(button).toHaveAttribute('aria-pressed');
      });
    });

    it('should support keyboard navigation with markdown content', async () => {
      const user = userEvent.setup();
      const todo = createMockTodo({
        text: '# Keyboard Test\n**Navigation** test',
      });

      render(
        <TodoItem
          todo={todo}
          onToggle={jest.fn()}
          onDelete={jest.fn()}
          onEdit={jest.fn()}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /toggle todo/i });
      toggleButton.focus();
      expect(toggleButton).toHaveFocus();

      // Navigate to next button
      await user.keyboard('{Tab}');
      const editButton = screen.getByRole('button', { name: /edit todo/i });
      expect(editButton).toHaveFocus();

      // Navigate to delete button
      await user.keyboard('{Tab}');
      const deleteButton = screen.getByRole('button', { name: /delete todo/i });
      expect(deleteButton).toHaveFocus();
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain compatibility with existing plain text todos', () => {
      const existingTodos = [
        createMockTodo({ id: '1', text: 'Old plain text todo' }),
        createMockTodo({ id: '2', text: 'Another old todo\nwith line breaks' }),
        createMockTodo({ id: '3', text: 'Todo with special chars !@#$%^&*()' }),
      ];

      const mockProps = {
        todos: existingTodos,
        onToggle: jest.fn(),
        onDelete: jest.fn(),
        onEdit: jest.fn(),
        filter: 'all' as const,
      };

      render(<TodoList {...mockProps} />);

      // All should render as plain text (no markdown content detected)
      expect(screen.queryAllByTestId('markdown-content')).toHaveLength(0);

      // All content should be visible
      expect(screen.getByText('Old plain text todo')).toBeInTheDocument();
      expect(
        screen.getByText(
          (content) =>
            content.includes('Another old todo') &&
            content.includes('with line breaks')
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText('Todo with special chars !@#$%^&*()')
      ).toBeInTheDocument();
    });

    it('should handle mixed old and new content seamlessly', () => {
      const mixedTodos = [
        createMockTodo({ id: '1', text: 'Old plain text' }),
        createMockTodo({ id: '2', text: '# New markdown header' }),
        createMockTodo({ id: '3', text: 'Another old one' }),
        createMockTodo({ id: '4', text: '**New bold text**' }),
      ];

      const mockProps = {
        todos: mixedTodos,
        onToggle: jest.fn(),
        onDelete: jest.fn(),
        onEdit: jest.fn(),
        filter: 'all' as const,
      };

      render(<TodoList {...mockProps} />);

      // Should have 2 markdown-rendered items
      expect(screen.getAllByTestId('markdown-content')).toHaveLength(2);

      // Should have 2 plain text items
      expect(screen.getByText('Old plain text')).toBeInTheDocument();
      expect(screen.getByText('Another old one')).toBeInTheDocument();
    });
  });
});
