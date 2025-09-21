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
});
