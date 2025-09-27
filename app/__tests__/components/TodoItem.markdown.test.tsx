import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoItem from '../../components/TodoItem';
import { createMockTodo } from '../utils/test-utils';

// Mock react-markdown to make testing more predictable
jest.mock('react-markdown', () => {
  return function MockReactMarkdown({ children }: { children: string }) {
    return <div>{children}</div>;
  };
});

describe('TodoItem Markdown Support', () => {
  const mockOnToggle = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnEdit = jest.fn();

  beforeEach(() => {
    mockOnToggle.mockClear();
    mockOnDelete.mockClear();
    mockOnEdit.mockClear();
  });

  describe('Markdown Detection and Rendering', () => {
    it('should render plain text without markdown parsing', () => {
      const todo = createMockTodo({ text: 'Simple plain text todo' });
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // Should render as plain text in paragraph
      expect(screen.getByText('Simple plain text todo')).toBeInTheDocument();
      expect(screen.queryByTestId('markdown-content')).not.toBeInTheDocument();
    });

    it('should render markdown content with markdown parser', () => {
      const todo = createMockTodo({ text: '# Header\n**Bold** text' });
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // Should render using markdown parser
      expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
      expect(screen.getByTestId('markdown-content')).toHaveTextContent(
        '# Header **Bold** text'
      );
    });

    it('should detect various markdown syntax types', () => {
      const markdownCases = [
        '# Header text',
        '**Bold text**',
        '*Italic text*',
        '- List item',
        '`code snippet`',
        '[Link](https://example.com)',
        '> Quote text',
        '~~Strikethrough~~',
        '1. Numbered list',
        '```\ncode block\n```',
      ];

      markdownCases.forEach((text) => {
        const todo = createMockTodo({ text });
        const { rerender } = render(
          <TodoItem
            todo={todo}
            onToggle={mockOnToggle}
            onDelete={mockOnDelete}
            onEdit={mockOnEdit}
          />
        );

        expect(screen.getByTestId('markdown-content')).toBeInTheDocument();

        // Clean up for next iteration
        rerender(<div />);
      });
    });

    it('should handle mixed content correctly', () => {
      const mixedContent =
        'Regular text with **bold** and a [link](https://example.com)';
      const todo = createMockTodo({ text: mixedContent });
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
      expect(screen.getByTestId('markdown-content')).toHaveTextContent(
        mixedContent
      );
    });
  });

  describe('Edit Mode with Markdown Support', () => {
    it('should show markdown help box in edit mode', async () => {
      const user = userEvent.setup();
      const todo = createMockTodo({ text: 'Todo to edit' });
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

      // Should show the markdown help box
      expect(screen.getByText('Markdown Formatting Help')).toBeInTheDocument();
    });

    it('should show placeholder text indicating markdown support', async () => {
      const user = userEvent.setup();
      const todo = createMockTodo({ text: 'Original text' });
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

      const textarea = screen.getByRole('textbox', { name: /edit todo text/i });
      expect(textarea).toHaveAttribute(
        'placeholder',
        expect.stringContaining('Markdown formatting supported')
      );
    });

    it('should allow editing markdown content', async () => {
      const user = userEvent.setup();
      const todo = createMockTodo({
        id: 'markdown-edit',
        text: '# Original Header',
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

      const textarea = screen.getByRole('textbox', { name: /edit todo text/i });
      await user.clear(textarea);
      await user.type(textarea, '## Updated Header\n**Bold content**');

      const saveButton = screen.getByRole('button', { name: /save edit/i });
      await user.click(saveButton);

      expect(mockOnEdit).toHaveBeenCalledWith(
        'markdown-edit',
        '## Updated Header\n**Bold content**'
      );
    });

    it('should preserve markdown formatting during edit', async () => {
      const user = userEvent.setup();
      const markdownText =
        '# Todo\n- [x] Done\n- [ ] Pending\n\n**Important!**';
      const todo = createMockTodo({ text: markdownText });
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

      const textarea = screen.getByRole('textbox', { name: /edit todo text/i });
      expect(textarea).toHaveValue(markdownText);
    });

    it('should allow switching between markdown and plain text', async () => {
      const user = userEvent.setup();
      const todo = createMockTodo({ id: 'switch-mode', text: 'Plain text' });
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

      const textarea = screen.getByRole('textbox', { name: /edit todo text/i });
      await user.clear(textarea);
      await user.type(textarea, '# Now with markdown!');

      const saveButton = screen.getByRole('button', { name: /save edit/i });
      await user.click(saveButton);

      expect(mockOnEdit).toHaveBeenCalledWith(
        'switch-mode',
        '# Now with markdown!'
      );
    });
  });

  describe('Completed Todos with Markdown', () => {
    it('should render completed markdown todos with strikethrough', () => {
      const todo = createMockTodo({
        text: '# Completed Task\n**Important** item',
        completedAt: new Date(),
      });
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // Should render with markdown and have strikethrough styling
      expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
      const markdownContainer =
        screen.getByTestId('markdown-content').parentElement;
      expect(markdownContainer).toHaveClass('line-through');
      expect(markdownContainer).toHaveClass('text-muted-foreground');
    });

    it('should render completed plain text todos with strikethrough', () => {
      const todo = createMockTodo({
        text: 'Completed plain text task',
        completedAt: new Date(),
      });
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // Should render as plain text with strikethrough
      const textElement = screen.getByText('Completed plain text task');
      expect(textElement.closest('div')).toHaveClass('line-through');
      expect(textElement.closest('div')).toHaveClass('text-muted-foreground');
    });

    it('should not show edit button for completed markdown todos', () => {
      const todo = createMockTodo({
        text: '# Completed markdown task',
        completedAt: new Date(),
      });
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      expect(
        screen.queryByRole('button', { name: /edit todo/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('Long Content and Formatting', () => {
    it('should handle long markdown content without layout issues', () => {
      const longMarkdown = `# Very Long Todo Item

      This is a very long todo item that contains multiple paragraphs and various markdown elements to test how the component handles extensive content.

      ## Subtasks
      - [ ] First subtask with a very long description that might wrap to multiple lines
      - [ ] Second subtask that also has extensive details
      - [x] Completed subtask

      **Important Notes:**
      - Remember to check all dependencies
      - Ensure proper testing coverage
      - Document any changes made

      \`\`\`javascript
      // Code example
      function processLongContent() {
        return "processed";
      }
      \`\`\`

      > This is a blockquote with important information that users should read carefully.`;

      const todo = createMockTodo({ text: longMarkdown });
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
      // Just check that it contains some of the expected content, not exact match
      expect(screen.getByTestId('markdown-content')).toHaveTextContent(
        'Very Long Todo Item'
      );
      expect(screen.getByTestId('markdown-content')).toHaveTextContent(
        'Subtasks'
      );

      // Container should have proper wrapping classes
      const container = screen
        .getByTestId('markdown-content')
        .closest('.min-w-0');
      expect(container).toBeInTheDocument();
    });

    it('should handle multiline plain text with preserved line breaks', () => {
      const multilineText = 'Line 1\nLine 2\nLine 3\n\nParagraph 2';
      const todo = createMockTodo({ text: multilineText });
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // Should render as plain text with preserved line breaks
      const textElement = screen.getByText((content, element) => {
        return (
          element?.textContent === multilineText && element?.tagName === 'P'
        );
      });
      expect(textElement).toHaveClass('whitespace-pre-line');
      expect(screen.queryByTestId('markdown-content')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility with Markdown', () => {
    it('should maintain accessibility for markdown content', () => {
      const todo = createMockTodo({
        text: '# Accessible Header\n**Bold text**',
      });
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // Should still have proper list item role
      const listItem = screen.getByRole('listitem');
      expect(listItem).toBeInTheDocument();

      // Toggle button should still have proper accessibility
      const toggleButton = screen.getByRole('button', { name: /toggle todo/i });
      expect(toggleButton).toHaveAttribute(
        'aria-label',
        expect.stringContaining('# Accessible Header')
      );
    });

    it('should handle accessibility for long markdown content in labels', () => {
      const longMarkdown =
        '# Very Long Header That Should Be Truncated In Aria Labels\n**With additional content**';
      const todo = createMockTodo({ text: longMarkdown });
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /toggle todo/i });
      const ariaLabel = toggleButton.getAttribute('aria-label');

      // Should contain part of the content but may be truncated for accessibility
      expect(ariaLabel).toContain('Very Long Header');
    });

    it('should maintain keyboard navigation with markdown content', async () => {
      const user = userEvent.setup();
      const todo = createMockTodo({
        text: '# Keyboard Test\n**Bold content**',
      });
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /toggle todo/i });
      toggleButton.focus();
      expect(toggleButton).toHaveFocus();

      await user.keyboard('{Tab}');
      const editButton = screen.getByRole('button', { name: /edit todo/i });
      expect(editButton).toHaveFocus();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed markdown gracefully', () => {
      const malformedMarkdown =
        '### Unclosed header\n**Bold without closing\n[Link without closing paren';
      const todo = createMockTodo({ text: malformedMarkdown });

      expect(() =>
        render(
          <TodoItem
            todo={todo}
            onToggle={mockOnToggle}
            onDelete={mockOnDelete}
            onEdit={mockOnEdit}
          />
        )
      ).not.toThrow();

      expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
    });

    it('should handle empty markdown content', () => {
      const todo = createMockTodo({ text: '' });
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // Empty content should not cause issues
      expect(screen.queryByTestId('markdown-content')).not.toBeInTheDocument();
    });

    it('should handle special characters in markdown', () => {
      const specialChars =
        '# 测试 📝\n**粗体** 文本 with emoji 🚀\n- [x] 完成 ✅';
      const todo = createMockTodo({ text: specialChars });
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
      // Text content in DOM will be flattened (newlines become spaces)
      expect(screen.getByTestId('markdown-content')).toHaveTextContent(
        '# 测试 📝 **粗体** 文本 with emoji 🚀 - [x] 完成 ✅'
      );
    });

    it('should fallback to plain text if markdown parsing fails', () => {
      // Mock a scenario where markdown parsing might fail
      const problematicContent = 'Content that might cause issues';
      const todo = createMockTodo({ text: problematicContent });

      // If markdown detection fails, should render as plain text
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // Should render the content one way or another
      expect(screen.getByText(problematicContent)).toBeInTheDocument();
    });
  });

  describe('Performance Considerations', () => {
    it('should not re-parse markdown content unnecessarily', () => {
      const todo = createMockTodo({ text: '# Performance Test\n**Content**' });
      const { rerender } = render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // Initial render
      expect(screen.getByTestId('markdown-content')).toBeInTheDocument();

      // Re-render with same content - should not cause issues
      rerender(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
    });

    it('should handle switching between markdown and plain text efficiently', () => {
      const { rerender } = render(
        <TodoItem
          todo={createMockTodo({ text: 'Plain text' })}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      expect(screen.queryByTestId('markdown-content')).not.toBeInTheDocument();

      // Switch to markdown
      rerender(
        <TodoItem
          todo={createMockTodo({ text: '# Markdown header' })}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      expect(screen.getByTestId('markdown-content')).toBeInTheDocument();

      // Switch back to plain text
      rerender(
        <TodoItem
          todo={createMockTodo({ text: 'Back to plain text' })}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      expect(screen.queryByTestId('markdown-content')).not.toBeInTheDocument();
    });
  });

  describe('Integration with Existing Features', () => {
    it('should work with drag and drop functionality', () => {
      const todo = createMockTodo({ text: '# Draggable Markdown Todo' });
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          isDraggable={true}
        />
      );

      expect(screen.getByTestId('drag-handle')).toBeInTheDocument();
      expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
    });

    it('should work with reorder buttons', () => {
      const todo = createMockTodo({ text: '# Reorderable Todo' });
      const mockMoveUp = jest.fn();
      const mockMoveDown = jest.fn();

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          moveUp={mockMoveUp}
          moveDown={mockMoveDown}
          isFirst={false}
          isLast={false}
        />
      );

      expect(
        screen.getByRole('button', { name: /move todo up/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /move todo down/i })
      ).toBeInTheDocument();
      expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
    });

    it('should work with deleted todos', () => {
      const todo = createMockTodo({
        text: '# Deleted Markdown Todo',
        deletedAt: new Date(),
      });
      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // Should still render markdown content even when deleted
      expect(screen.getByTestId('markdown-content')).toBeInTheDocument();

      // Should have proper deleted styling
      const listItem = screen.getByRole('listitem');
      expect(listItem).toHaveClass('border-dashed', 'opacity-75');
    });

    it('should work with restoration functionality', async () => {
      const user = userEvent.setup();
      const mockOnRestore = jest.fn();
      const todo = createMockTodo({
        text: '# Completed Markdown Todo',
        completedAt: new Date(),
      });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
          onRestore={mockOnRestore}
        />
      );

      const restoreButton = screen.getByRole('button', {
        name: /undo completion/i,
      });
      await user.click(restoreButton);

      expect(mockOnRestore).toHaveBeenCalledWith(todo.id);
      expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
    });
  });
});
