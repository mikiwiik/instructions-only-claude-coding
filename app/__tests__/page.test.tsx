import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomePage from '../page';

describe('HomePage', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('renders the TODO title', async () => {
    render(<HomePage />);

    const heading = await screen.findByRole('heading', { name: /^TODO$/i });
    expect(heading).toBeInTheDocument();
  });

  it('includes agent implementation attribution', async () => {
    render(<HomePage />);

    // Wait for loading to complete
    await screen.findByLabelText(/add new todo/i);

    expect(
      screen.getByText(/100% agent implemented - 100% human instructed/i)
    ).toBeInTheDocument();

    const claudeLink = screen.getByRole('link', { name: /claude code/i });
    expect(claudeLink).toBeInTheDocument();
    expect(claudeLink).toHaveAttribute('href', 'https://claude.ai/code');
    expect(claudeLink).toHaveAttribute('target', '_blank');

    const githubLink = screen.getByRole('link', { name: /view on github/i });
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute(
      'href',
      'https://github.com/mikiwiik/instructions-only-claude-coding/'
    );
    expect(githubLink).toHaveAttribute('target', '_blank');
  });

  it('displays the check square icon', async () => {
    render(<HomePage />);

    // Wait for loading to complete
    await screen.findByLabelText(/add new todo/i);

    // The CheckSquare icon from lucide-react should be present
    const icon = document.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('renders TodoForm component', async () => {
    render(<HomePage />);

    const input = await screen.findByLabelText(/add new todo/i);
    const button = screen.getByRole('button', { name: /add todo/i });

    expect(input).toBeInTheDocument();
    expect(button).toBeInTheDocument();
  });

  it('shows empty state when no todos exist', async () => {
    render(<HomePage />);

    // Wait for loading to complete
    await screen.findByLabelText(/add new todo/i);

    expect(screen.getByText(/no todos yet/i)).toBeInTheDocument();
    expect(
      screen.getByText(/add your first todo above to get started/i)
    ).toBeInTheDocument();
  });

  it('allows adding a new todo and displays it', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    const input = await screen.findByLabelText(/add new todo/i);
    const button = screen.getByRole('button', { name: /add todo/i });

    await user.type(input, 'Test todo item');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText('Test todo item')).toBeInTheDocument();
    });
    expect(screen.getByText(/your todos \(1\)/i)).toBeInTheDocument();
  });

  it('displays todo count correctly', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    const input = await screen.findByLabelText(/add new todo/i);
    const button = screen.getByRole('button', { name: /add todo/i });

    // Add first todo
    await user.type(input, 'First todo');
    await user.click(button);

    // Add second todo
    await user.type(input, 'Second todo');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/your todos \(2\)/i)).toBeInTheDocument();
    });
    expect(screen.getByText('First todo')).toBeInTheDocument();
    expect(screen.getByText('Second todo')).toBeInTheDocument();
  });

  it('displays todo creation timestamp', async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    const input = await screen.findByLabelText(/add new todo/i);
    const button = screen.getByRole('button', { name: /add todo/i });

    await user.type(input, 'Timestamped todo');
    await user.click(button);

    // Check that a contextual timestamp is displayed
    await waitFor(() => {
      expect(
        screen.getByText(/created.*ago|created.*\d+/i)
      ).toBeInTheDocument();
    });
  });
});
