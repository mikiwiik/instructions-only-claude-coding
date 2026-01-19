/**
 * Tests for ShareIndicator component
 * Displays when viewing a shared list with copy URL functionality
 */

import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShareIndicator from '@/components/ShareIndicator';
import * as listManager from '@/lib/list-manager';

// Mock the list-manager module
jest.mock('@/lib/list-manager', () => ({
  copyToClipboard: jest.fn(),
}));

describe('ShareIndicator', () => {
  const mockCopyToClipboard = listManager.copyToClipboard as jest.Mock;

  const defaultProps = {
    shareUrl: 'https://example.com/list/abc-123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCopyToClipboard.mockResolvedValue(true);
  });

  describe('rendering', () => {
    it('renders the shared indicator', () => {
      render(<ShareIndicator {...defaultProps} />);
      expect(
        screen.getByRole('status', { name: /shared list/i })
      ).toBeInTheDocument();
    });

    it('shows "Shared" text', () => {
      render(<ShareIndicator {...defaultProps} />);
      expect(screen.getByText('Shared')).toBeInTheDocument();
    });

    it('renders copy URL button', () => {
      render(<ShareIndicator {...defaultProps} />);
      expect(
        screen.getByRole('button', { name: /copy.*url/i })
      ).toBeInTheDocument();
    });
  });

  describe('copy functionality', () => {
    it('copies URL when copy button is clicked', async () => {
      const user = userEvent.setup();
      render(<ShareIndicator {...defaultProps} />);

      const copyButton = screen.getByRole('button', { name: /copy.*url/i });
      await user.click(copyButton);

      expect(mockCopyToClipboard).toHaveBeenCalledWith(
        'https://example.com/list/abc-123'
      );
    });

    it('shows copied state after successful copy', async () => {
      const user = userEvent.setup();
      render(<ShareIndicator {...defaultProps} />);

      const copyButton = screen.getByRole('button', { name: /copy.*url/i });
      await user.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText(/copied/i)).toBeInTheDocument();
      });
    });

    it('resets copied state after timeout', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<ShareIndicator {...defaultProps} />);

      const copyButton = screen.getByRole('button', { name: /copy.*url/i });
      await user.click(copyButton);

      // Wait for copied state
      await waitFor(() => {
        expect(screen.getByText(/copied/i)).toBeInTheDocument();
      });

      // Advance timers to reset state - wrap in act for state update
      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.queryByText(/copied/i)).not.toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it('handles copy failure gracefully', async () => {
      mockCopyToClipboard.mockResolvedValue(false);
      const user = userEvent.setup();
      render(<ShareIndicator {...defaultProps} />);

      const copyButton = screen.getByRole('button', { name: /copy.*url/i });
      await user.click(copyButton);

      // Should not show copied state on failure
      await waitFor(() => {
        expect(screen.queryByText(/copied/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('accessibility', () => {
    it('has proper aria-label for status region', () => {
      render(<ShareIndicator {...defaultProps} />);
      const indicator = screen.getByRole('status', { name: /shared list/i });
      expect(indicator).toHaveAttribute('aria-label', expect.any(String));
    });

    it('copy button has accessible label', () => {
      render(<ShareIndicator {...defaultProps} />);
      const copyButton = screen.getByRole('button', { name: /copy.*url/i });
      expect(copyButton).toHaveAccessibleName();
    });

    it('meets minimum touch target size (44px)', () => {
      render(<ShareIndicator {...defaultProps} />);
      const copyButton = screen.getByRole('button', { name: /copy.*url/i });
      // Check for min-w-[44px] and min-h-[44px] classes
      expect(copyButton.className).toMatch(/min-[wh]-\[44px\]/);
    });
  });
});
