import { render, screen } from '@testing-library/react';
import HomePage from '../page';

describe('HomePage', () => {
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

  it('shows the coming soon section', () => {
    render(<HomePage />);

    const comingSoon = screen.getByRole('heading', { name: /coming soon/i });
    expect(comingSoon).toBeInTheDocument();
  });

  it('displays the technology stack list', () => {
    render(<HomePage />);

    expect(
      screen.getByText(/next\.js 14 with app router/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/typescript for type safety/i)).toBeInTheDocument();
    expect(screen.getByText(/tailwind css for styling/i)).toBeInTheDocument();
    expect(
      screen.getByText(/test-driven development \(tdd\)/i)
    ).toBeInTheDocument();
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
});
