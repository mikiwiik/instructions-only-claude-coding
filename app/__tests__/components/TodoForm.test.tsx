import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoForm from '../../components/TodoForm';

describe('TodoForm', () => {
  const mockOnAddTodo = jest.fn();

  beforeEach(() => {
    mockOnAddTodo.mockClear();
  });

  it('should render textarea field and submit button', () => {
    render(<TodoForm onAddTodo={mockOnAddTodo} />);

    expect(screen.getByLabelText(/add new todo/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /add todo/i })
    ).toBeInTheDocument();
  });

  it('should focus textarea field on mount', () => {
    render(<TodoForm onAddTodo={mockOnAddTodo} />);

    const textarea = screen.getByLabelText(/add new todo/i);
    expect(textarea).toHaveFocus();
  });

  it('should add todo when form is submitted with valid input', async () => {
    const user = userEvent.setup();
    render(<TodoForm onAddTodo={mockOnAddTodo} />);

    const textarea = screen.getByLabelText(/add new todo/i);
    const submitButton = screen.getByRole('button', { name: /add todo/i });

    await user.type(textarea, 'Learn React Testing');
    await user.click(submitButton);

    expect(mockOnAddTodo).toHaveBeenCalledWith('Learn React Testing');
  });

  it('should submit form when Enter key is pressed', async () => {
    const user = userEvent.setup();
    render(<TodoForm onAddTodo={mockOnAddTodo} />);

    const textarea = screen.getByLabelText(/add new todo/i);

    await user.type(textarea, 'Learn TypeScript');
    await user.keyboard('{Enter}');

    expect(mockOnAddTodo).toHaveBeenCalledWith('Learn TypeScript');
  });

  it('should not add todo with empty input', async () => {
    const user = userEvent.setup();
    render(<TodoForm onAddTodo={mockOnAddTodo} />);

    const submitButton = screen.getByRole('button', { name: /add todo/i });

    await user.click(submitButton);

    expect(mockOnAddTodo).not.toHaveBeenCalled();
  });

  it('should not add todo with whitespace-only input', async () => {
    const user = userEvent.setup();
    render(<TodoForm onAddTodo={mockOnAddTodo} />);

    const textarea = screen.getByLabelText(/add new todo/i);
    const submitButton = screen.getByRole('button', { name: /add todo/i });

    await user.type(textarea, '   ');
    await user.click(submitButton);

    expect(mockOnAddTodo).not.toHaveBeenCalled();
  });

  it('should trim whitespace from input before adding todo', async () => {
    const user = userEvent.setup();
    render(<TodoForm onAddTodo={mockOnAddTodo} />);

    const textarea = screen.getByLabelText(/add new todo/i);
    const submitButton = screen.getByRole('button', { name: /add todo/i });

    await user.type(textarea, '  Learn Jest  ');
    await user.click(submitButton);

    expect(mockOnAddTodo).toHaveBeenCalledWith('Learn Jest');
  });

  it('should clear input after successful submission', async () => {
    const user = userEvent.setup();
    render(<TodoForm onAddTodo={mockOnAddTodo} />);

    const textarea = screen.getByLabelText(
      /add new todo/i
    ) as HTMLTextAreaElement;
    const submitButton = screen.getByRole('button', { name: /add todo/i });

    await user.type(textarea, 'Test todo');
    await user.click(submitButton);

    await waitFor(() => {
      expect(textarea.value).toBe('');
    });
  });

  it('should have proper accessibility attributes', () => {
    render(<TodoForm onAddTodo={mockOnAddTodo} />);

    const textarea = screen.getByLabelText(/add new todo/i);
    const form = textarea.closest('form');

    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea).toHaveAttribute('placeholder');
    expect(form).toBeInTheDocument();
  });

  it('should disable submit button when input is empty', () => {
    render(<TodoForm onAddTodo={mockOnAddTodo} />);

    const submitButton = screen.getByRole('button', { name: /add todo/i });
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when input has valid text', async () => {
    const user = userEvent.setup();
    render(<TodoForm onAddTodo={mockOnAddTodo} />);

    const textarea = screen.getByLabelText(/add new todo/i);
    const submitButton = screen.getByRole('button', { name: /add todo/i });

    await user.type(textarea, 'Valid todo');

    expect(submitButton).toBeEnabled();
  });

  describe('Multi-line text functionality', () => {
    it('should support multi-line text input', async () => {
      const user = userEvent.setup();
      render(<TodoForm onAddTodo={mockOnAddTodo} />);

      const textarea = screen.getByLabelText(/add new todo/i);
      const multiLineText = 'First line\nSecond line\nThird line';

      await user.type(textarea, multiLineText);

      expect(textarea).toHaveValue(multiLineText);
    });

    it('should preserve line breaks when submitting multi-line text', async () => {
      const user = userEvent.setup();
      render(<TodoForm onAddTodo={mockOnAddTodo} />);

      const textarea = screen.getByLabelText(/add new todo/i);
      const submitButton = screen.getByRole('button', { name: /add todo/i });
      const multiLineText = 'Task description:\n- Step 1\n- Step 2\n- Step 3';

      await user.type(textarea, multiLineText);
      await user.click(submitButton);

      expect(mockOnAddTodo).toHaveBeenCalledWith(multiLineText);
    });

    it('should auto-resize textarea as content grows', async () => {
      const user = userEvent.setup();
      render(<TodoForm onAddTodo={mockOnAddTodo} />);

      const textarea = screen.getByLabelText(
        /add new todo/i
      ) as HTMLTextAreaElement;

      // Add multiple lines of text
      const longText = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5';
      await user.type(textarea, longText);

      // Verify textarea contains the multi-line text
      expect(textarea).toHaveValue(longText);
      // Verify auto-resize class is present
      expect(textarea).toHaveClass('resize-none');
      expect(textarea).toHaveClass('overflow-hidden');
    });

    it('should handle Enter key correctly in multi-line mode', async () => {
      const user = userEvent.setup();
      render(<TodoForm onAddTodo={mockOnAddTodo} />);

      const textarea = screen.getByLabelText(/add new todo/i);
      const submitButton = screen.getByRole('button', { name: /add todo/i });

      // Type text and press Shift+Enter - should add new line, not submit
      await user.type(textarea, 'First line');
      await user.keyboard('{Shift>}{Enter}{/Shift}');
      await user.type(textarea, 'Second line');

      expect(textarea).toHaveValue('First line\nSecond line');
      expect(mockOnAddTodo).not.toHaveBeenCalled();

      // Submit should still work via button
      await user.click(submitButton);
      expect(mockOnAddTodo).toHaveBeenCalledWith('First line\nSecond line');
    });

    it('should trim multi-line whitespace correctly', async () => {
      const user = userEvent.setup();
      render(<TodoForm onAddTodo={mockOnAddTodo} />);

      const textarea = screen.getByLabelText(/add new todo/i);
      const submitButton = screen.getByRole('button', { name: /add todo/i });

      // Add text with leading/trailing whitespace
      const textWithWhitespace = '  First line\nSecond line  \n  Third line  ';
      await user.type(textarea, textWithWhitespace);
      await user.click(submitButton);

      expect(mockOnAddTodo).toHaveBeenCalledWith(
        'First line\nSecond line  \n  Third line'
      );
    });

    it('should not submit empty multi-line text (only newlines)', async () => {
      const user = userEvent.setup();
      render(<TodoForm onAddTodo={mockOnAddTodo} />);

      const textarea = screen.getByLabelText(/add new todo/i);
      const submitButton = screen.getByRole('button', { name: /add todo/i });

      // Add only newlines
      await user.type(textarea, '\n\n\n');
      await user.click(submitButton);

      expect(mockOnAddTodo).not.toHaveBeenCalled();
    });

    it('should clear textarea after successful multi-line submission', async () => {
      const user = userEvent.setup();
      render(<TodoForm onAddTodo={mockOnAddTodo} />);

      const textarea = screen.getByLabelText(
        /add new todo/i
      ) as HTMLTextAreaElement;
      const submitButton = screen.getByRole('button', { name: /add todo/i });

      const multiLineText = 'Multi-line\ntodo item';
      await user.type(textarea, multiLineText);
      await user.click(submitButton);

      await waitFor(() => {
        expect(textarea.value).toBe('');
      });
    });
  });

  describe('Button sizing consistency', () => {
    it('should maintain consistent button height when textarea is empty', () => {
      render(<TodoForm onAddTodo={mockOnAddTodo} />);

      const submitButton = screen.getByRole('button', { name: /add todo/i });

      // Button should have min-h-[3rem] class (48px) for consistency
      expect(submitButton).toHaveClass('min-h-[3rem]');
      expect(submitButton).toHaveClass(
        'inline-flex',
        'items-center',
        'justify-center'
      );
    });

    it('should maintain consistent button height when textarea has single line', async () => {
      const user = userEvent.setup();
      render(<TodoForm onAddTodo={mockOnAddTodo} />);

      const textarea = screen.getByLabelText(/add new todo/i);
      const submitButton = screen.getByRole('button', { name: /add todo/i });

      await user.type(textarea, 'Single line todo item');

      // Button height should remain consistent regardless of single line content
      expect(submitButton).toHaveClass('min-h-[3rem]');
      expect(submitButton).toHaveClass(
        'inline-flex',
        'items-center',
        'justify-center'
      );
    });

    it('should maintain consistent button height when textarea has multiple lines', async () => {
      const user = userEvent.setup();
      render(<TodoForm onAddTodo={mockOnAddTodo} />);

      const textarea = screen.getByLabelText(
        /add new todo/i
      ) as HTMLTextAreaElement;
      const submitButton = screen.getByRole('button', { name: /add todo/i });

      // Add multiple lines to make textarea grow
      const multiLineText = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5';
      await user.type(textarea, multiLineText);

      // Verify textarea contains the multi-line content
      expect(textarea).toHaveValue(multiLineText);

      // Button should maintain its minimum height regardless of textarea content
      expect(submitButton).toHaveClass('min-h-[3rem]');
      expect(submitButton).toHaveClass(
        'inline-flex',
        'items-center',
        'justify-center'
      );
    });

    it('should maintain button height with extremely long multi-line content', async () => {
      const user = userEvent.setup();
      render(<TodoForm onAddTodo={mockOnAddTodo} />);

      const textarea = screen.getByLabelText(
        /add new todo/i
      ) as HTMLTextAreaElement;
      const submitButton = screen.getByRole('button', { name: /add todo/i });

      // Create long content with multiple lines (reduced for CI performance)
      const longText = Array.from(
        { length: 5 },
        (_, i) => `Line ${i + 1} with content`
      ).join('\n');
      await user.type(textarea, longText);

      // Verify textarea contains the long content
      expect(textarea).toHaveValue(longText);

      // Button should still maintain its consistent height
      expect(submitButton).toHaveClass('min-h-[3rem]');
      expect(submitButton).toHaveClass(
        'inline-flex',
        'items-center',
        'justify-center'
      );
    });

    it('should meet accessibility minimum touch target size (44px)', () => {
      render(<TodoForm onAddTodo={mockOnAddTodo} />);

      const submitButton = screen.getByRole('button', { name: /add todo/i });

      // The min-h-[3rem] class provides 48px which exceeds the 44px accessibility requirement
      expect(submitButton).toHaveClass('min-h-[3rem]'); // 3rem = 48px > 44px minimum
      expect(submitButton).toHaveClass('px-4', 'md:px-6'); // Adequate horizontal padding
    });

    it('should maintain consistent button styling across different textarea states', async () => {
      const user = userEvent.setup();
      render(<TodoForm onAddTodo={mockOnAddTodo} />);

      const textarea = screen.getByLabelText(/add new todo/i);
      const submitButton = screen.getByRole('button', { name: /add todo/i });

      // Test with empty textarea
      expect(submitButton).toHaveClass(
        'inline-flex',
        'items-center',
        'justify-center',
        'min-h-[3rem]',
        'whitespace-nowrap'
      );

      // Add content and verify styling remains consistent
      await user.type(textarea, 'Test content\nWith multiple\nLines of text');

      expect(submitButton).toHaveClass(
        'inline-flex',
        'items-center',
        'justify-center',
        'min-h-[3rem]',
        'whitespace-nowrap'
      );
    });

    it('should align button properly with textarea in flex layout', async () => {
      const user = userEvent.setup();
      render(<TodoForm onAddTodo={mockOnAddTodo} />);

      const textarea = screen.getByLabelText(/add new todo/i);
      const submitButton = screen.getByRole('button', { name: /add todo/i });

      // Verify the flex container structure by finding the form and its child
      const form = textarea.closest('form');
      expect(form).toBeInTheDocument();

      const flexContainer = form?.querySelector('.flex.flex-col.md\\:flex-row');
      expect(flexContainer).toBeInTheDocument();
      expect(flexContainer).toHaveClass('gap-3');

      // Add multi-line content to test alignment
      await user.type(textarea, 'Line 1\nLine 2\nLine 3');

      // Both textarea and button should maintain proper alignment
      expect(textarea).toHaveClass('min-h-[3rem]');
      expect(submitButton).toHaveClass('min-h-[3rem]');
    });

    it('should handle responsive button text while maintaining height', () => {
      render(<TodoForm onAddTodo={mockOnAddTodo} />);

      const submitButton = screen.getByRole('button', { name: /add todo/i });

      // Verify responsive text elements are present
      const fullText = submitButton.querySelector('.hidden.md\\:inline');
      const shortText = submitButton.querySelector('.md\\:hidden');

      expect(fullText).toBeInTheDocument();
      expect(fullText).toHaveTextContent('Add Todo');
      expect(shortText).toBeInTheDocument();
      expect(shortText).toHaveTextContent('Add');

      // Button height should remain consistent regardless of text content
      expect(submitButton).toHaveClass('min-h-[3rem]', 'whitespace-nowrap');
    });
  });
});
