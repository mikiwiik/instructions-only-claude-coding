import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import GestureHint from '../../components/GestureHint';

describe('GestureHint', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should display gesture hints after delay', async () => {
    render(<GestureHint />);

    // Initially not visible
    expect(
      screen.queryByText('Touch Gestures Available')
    ).not.toBeInTheDocument();

    // Fast-forward timer
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByText('Touch Gestures Available')).toBeInTheDocument();
    });
  });

  it('should show all gesture instructions', async () => {
    render(<GestureHint />);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByText(/Swipe right:/)).toBeInTheDocument();
      expect(screen.getByText(/Swipe left:/)).toBeInTheDocument();
      expect(screen.getByText(/Long press:/)).toBeInTheDocument();
    });
  });

  it('should dismiss hint when close button is clicked', async () => {
    render(<GestureHint />);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByText('Touch Gestures Available')).toBeInTheDocument();
    });

    const dismissButton = screen.getByLabelText('Dismiss gesture hints');
    fireEvent.click(dismissButton);

    await waitFor(() => {
      expect(
        screen.queryByText('Touch Gestures Available')
      ).not.toBeInTheDocument();
    });
  });

  it('should save dismissal state to localStorage', async () => {
    render(<GestureHint />);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(screen.getByText('Touch Gestures Available')).toBeInTheDocument();
    });

    const dismissButton = screen.getByLabelText('Dismiss gesture hints');
    fireEvent.click(dismissButton);

    await waitFor(() => {
      expect(localStorage.getItem('gesture-hints-dismissed')).toBe('true');
    });
  });

  it('should not show hint if already dismissed', () => {
    localStorage.setItem('gesture-hints-dismissed', 'true');

    render(<GestureHint />);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(
      screen.queryByText('Touch Gestures Available')
    ).not.toBeInTheDocument();
  });

  it('should have proper accessibility attributes', async () => {
    render(<GestureHint />);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });
  });

  it('should mention accessibility alternatives', async () => {
    render(<GestureHint />);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(
        screen.getByText(/All actions are also available via buttons/)
      ).toBeInTheDocument();
    });
  });
});
