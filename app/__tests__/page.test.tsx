import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomePage from '../page';

describe('HomePage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('renders the Todo App title', () => {
    render(<HomePage />);

    const heading = screen.getByRole('heading', { name: /todo app/i });
    expect(heading).toBeInTheDocument();
  });

  it('displays the app description', () => {
    render(<HomePage />);

    const description = screen.getByText(
      /next\.js todo application built with test-driven development/i
    );
    expect(description).toBeInTheDocument();
  });

  it('includes Claude Code attribution', () => {
    render(<HomePage />);

    const claudeLink = screen.getByRole('link', { name: /claude code/i });
    expect(claudeLink).toBeInTheDocument();
    expect(claudeLink).toHaveAttribute('href', 'https://claude.ai/code');
    expect(claudeLink).toHaveAttribute('target', '_blank');
  });

  it('displays the check square icon', () => {
    render(<HomePage />);

    // The CheckSquare icon from lucide-react should be present
    const icon = document.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('renders TodoForm component', () => {
    render(<HomePage />);

    const input = screen.getByLabelText(/add new todo/i);
    const button = screen.getByRole('button', { name: /add todo/i });

    expect(input).toBeInTheDocument();
    expect(button).toBeInTheDocument();
  });

  it('shows empty state when no todos exist', () => {
    render(<HomePage />);

    expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
    expect(
      screen.getByText(/add your first todo above to get started/i)
    ).toBeInTheDocument();
  });

  it('allows adding a new todo and displays it', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    const input = screen.getByLabelText(/add new todo/i);
    const button = screen.getByRole('button', { name: /add todo/i });

    await user.type(input, 'Test todo item');
    await user.click(button);

    expect(screen.getByText('Test todo item')).toBeInTheDocument();
    expect(screen.getByText(/your todos \(1\)/i)).toBeInTheDocument();
  });

  it('displays todo count correctly', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    const input = screen.getByLabelText(/add new todo/i);
    const button = screen.getByRole('button', { name: /add todo/i });

    // Add first todo
    await user.type(input, 'First todo');
    await user.click(button);

    // Add second todo
    await user.type(input, 'Second todo');
    await user.click(button);

    expect(screen.getByText(/your todos \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText('First todo')).toBeInTheDocument();
    expect(screen.getByText('Second todo')).toBeInTheDocument();
  });

  it('displays todo creation timestamp', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    const input = screen.getByLabelText(/add new todo/i);
    const button = screen.getByRole('button', { name: /add todo/i });

    await user.type(input, 'Timestamped todo');
    await user.click(button);

    // Check that a timestamp is displayed
    expect(
      screen.getByText(/added \d+\/\d+\/\d+ at \d+:\d+:\d+/i)
    ).toBeInTheDocument();
  });
});
