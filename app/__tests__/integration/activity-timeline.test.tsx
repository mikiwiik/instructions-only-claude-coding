import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomePage from '../../page';

// Mock current time for consistent testing
const MOCK_NOW = new Date('2024-01-15T12:00:00Z');
const realDateNow = Date.now.bind(global.Date);

beforeEach(() => {
  global.Date.now = jest.fn(() => MOCK_NOW.getTime());
  jest.useFakeTimers();
  jest.setSystemTime(MOCK_NOW);

  // Clear localStorage before each test
  localStorage.clear();
});

afterEach(() => {
  global.Date.now = realDateNow;
  jest.useRealTimers();
});

describe('Activity Timeline Integration', () => {
  describe('Filter interaction', () => {
    it('should show activity filter tab with correct count', async () => {
      render(<HomePage />);

      // Initially should show activity count of 0
      const activityTab = screen.getByRole('tab', { name: /activity.*0/i });
      expect(activityTab).toBeInTheDocument();
    });

    it.skip('should switch to activity timeline when activity filter is clicked', async () => {
      const user = userEvent.setup();
      render(<HomePage />);

      // Click activity tab
      const activityTab = screen.getByRole('tab', { name: /activity/i });
      await user.click(activityTab);

      // Should show activity timeline content
      await waitFor(() => {
        expect(screen.getByText('No activity yet')).toBeInTheDocument();
      });
    }, 10000);

    it.skip('should show empty state initially in activity timeline', async () => {
      const user = userEvent.setup();
      render(<HomePage />);

      const activityTab = screen.getByRole('tab', { name: /activity/i });
      await user.click(activityTab);

      await waitFor(() => {
        expect(screen.getByText('No activity yet')).toBeInTheDocument();
      });
      expect(
        screen.getByText(
          'Start creating todos to see your activity timeline here'
        )
      ).toBeInTheDocument();
    }, 10000);

    it.skip('should switch back to todo list when other filters are clicked', async () => {
      const user = userEvent.setup();
      render(<HomePage />);

      // Start with activity view
      const activityTab = screen.getByRole('tab', { name: /activity/i });
      await user.click(activityTab);

      await waitFor(() => {
        expect(screen.getByText('No activity yet')).toBeInTheDocument();
      });

      // Switch to all view
      const allTab = screen.getByRole('tab', { name: /all/i });
      await user.click(allTab);

      await waitFor(() => {
        expect(screen.queryByText('No activity yet')).not.toBeInTheDocument();
      });
      expect(screen.getByText(/drag to reorder/i)).toBeInTheDocument(); // Todo list is shown
    }, 10000);
  });

  describe('Basic activity functionality', () => {
    it.skip('should show activity count and timeline', async () => {
      const user = userEvent.setup();
      render(<HomePage />);

      // Initially should show activity count of 0
      const activityTab = screen.getByRole('tab', { name: /activity.*0/i });
      expect(activityTab).toBeInTheDocument();

      // Switch to activity view should show empty state
      await user.click(activityTab);
      await waitFor(() => {
        expect(screen.getByText('No activity yet')).toBeInTheDocument();
      });
    }, 10000);
  });

  describe('Error handling', () => {
    it('should handle malformed localStorage data gracefully', async () => {
      // Set malformed data in localStorage
      localStorage.setItem('todos', 'invalid-json');

      expect(() => {
        render(<HomePage />);
      }).not.toThrow();

      // Should show empty state
      const activityTab = screen.getByRole('tab', { name: /activity.*0/i });
      expect(activityTab).toBeInTheDocument();
    });
  });
});
