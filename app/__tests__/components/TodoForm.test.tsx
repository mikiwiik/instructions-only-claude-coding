import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoForm from '../../components/TodoForm';

describe('TodoForm', () => {
  const mockOnAddTodo = jest.fn();

  beforeEach(() => {
    mockOnAddTodo.mockClear();
  });

  it('should render input field and submit button', () => {
    render(<TodoForm onAddTodo={mockOnAddTodo} />);

    expect(screen.getByLabelText(/add new todo/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /add todo/i })
    ).toBeInTheDocument();
  });

  it('should focus input field on mount', () => {
    render(<TodoForm onAddTodo={mockOnAddTodo} />);

    const input = screen.getByLabelText(/add new todo/i);
    expect(input).toHaveFocus();
  });

  it('should add todo when form is submitted with valid input', async () => {
    const user = userEvent.setup();
    render(<TodoForm onAddTodo={mockOnAddTodo} />);

    const input = screen.getByLabelText(/add new todo/i);
    const submitButton = screen.getByRole('button', { name: /add todo/i });

    await user.type(input, 'Learn React Testing');
    await user.click(submitButton);

    expect(mockOnAddTodo).toHaveBeenCalledWith('Learn React Testing');
  });

  it('should add todo when Enter key is pressed', async () => {
    const user = userEvent.setup();
    render(<TodoForm onAddTodo={mockOnAddTodo} />);

    const input = screen.getByLabelText(/add new todo/i);

    await user.type(input, 'Learn TypeScript');
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

    const input = screen.getByLabelText(/add new todo/i);
    const submitButton = screen.getByRole('button', { name: /add todo/i });

    await user.type(input, '   ');
    await user.click(submitButton);

    expect(mockOnAddTodo).not.toHaveBeenCalled();
  });

  it('should trim whitespace from input before adding todo', async () => {
    const user = userEvent.setup();
    render(<TodoForm onAddTodo={mockOnAddTodo} />);

    const input = screen.getByLabelText(/add new todo/i);
    const submitButton = screen.getByRole('button', { name: /add todo/i });

    await user.type(input, '  Learn Jest  ');
    await user.click(submitButton);

    expect(mockOnAddTodo).toHaveBeenCalledWith('Learn Jest');
  });

  it('should clear input after successful submission', async () => {
    const user = userEvent.setup();
    render(<TodoForm onAddTodo={mockOnAddTodo} />);

    const input = screen.getByLabelText(/add new todo/i) as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /add todo/i });

    await user.type(input, 'Test todo');
    await user.click(submitButton);

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('should have proper accessibility attributes', () => {
    render(<TodoForm onAddTodo={mockOnAddTodo} />);

    const input = screen.getByLabelText(/add new todo/i);
    const form = input.closest('form');

    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('placeholder');
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

    const input = screen.getByLabelText(/add new todo/i);
    const submitButton = screen.getByRole('button', { name: /add todo/i });

    await user.type(input, 'Valid todo');

    expect(submitButton).toBeEnabled();
  });
});
