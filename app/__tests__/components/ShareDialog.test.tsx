/**
 * Tests for ShareDialog component
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ShareDialog from '@/components/ShareDialog';
import * as listManager from '@/lib/list-manager';

// Mock the list-manager module
jest.mock('@/lib/list-manager', () => ({
  copyToClipboard: jest.fn(),
}));

describe('ShareDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    shareUrl: 'https://example.com/list/abc-123',
    isSharing: false,
    error: undefined,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering states', () => {
    it('renders nothing when not open', () => {
      render(<ShareDialog {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders dialog when open', () => {
      render(<ShareDialog {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('shows sharing state', () => {
      render(<ShareDialog {...defaultProps} isSharing shareUrl='' />);

      expect(screen.getByText('Sharing list...')).toBeInTheDocument();
      expect(
        screen.getByText('Creating your shareable list...')
      ).toBeInTheDocument();
    });

    it('shows success state with URL', () => {
      render(<ShareDialog {...defaultProps} />);

      expect(screen.getByText('List shared!')).toBeInTheDocument();
      expect(
        screen.getByText('Anyone with this link can view and edit this list.')
      ).toBeInTheDocument();
      expect(screen.getByLabelText('Share URL')).toHaveValue(
        'https://example.com/list/abc-123'
      );
    });

    it('shows error state', () => {
      render(
        <ShareDialog
          {...defaultProps}
          error='Something went wrong'
          shareUrl=''
        />
      );

      expect(screen.getByText('Share failed')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('URL display', () => {
    it('does not show URL input when sharing', () => {
      render(<ShareDialog {...defaultProps} isSharing shareUrl='' />);
      expect(screen.queryByLabelText('Share URL')).not.toBeInTheDocument();
    });

    it('does not show URL input when error', () => {
      render(<ShareDialog {...defaultProps} error='Error' shareUrl='' />);
      expect(screen.queryByLabelText('Share URL')).not.toBeInTheDocument();
    });

    it('shows URL input on success', () => {
      render(<ShareDialog {...defaultProps} />);
      expect(screen.getByLabelText('Share URL')).toBeInTheDocument();
    });

    it('selects URL text when input is clicked', async () => {
      const user = userEvent.setup();
      render(<ShareDialog {...defaultProps} />);

      const input = screen.getByLabelText('Share URL');
      const selectSpy = jest.spyOn(input as HTMLInputElement, 'select');

      await user.click(input);

      expect(selectSpy).toHaveBeenCalled();
    });
  });

  describe('copy functionality', () => {
    it('copies URL to clipboard when copy button clicked', async () => {
      const user = userEvent.setup();
      (listManager.copyToClipboard as jest.Mock).mockResolvedValueOnce(true);

      render(<ShareDialog {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /copy url/i }));

      expect(listManager.copyToClipboard).toHaveBeenCalledWith(
        'https://example.com/list/abc-123'
      );
    });

    it('shows copied feedback after successful copy', async () => {
      const user = userEvent.setup();
      (listManager.copyToClipboard as jest.Mock).mockResolvedValueOnce(true);

      render(<ShareDialog {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /copy url/i }));

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /copied to clipboard/i })
        ).toBeInTheDocument();
      });
    });

    it('does not show copy button when sharing', () => {
      render(<ShareDialog {...defaultProps} isSharing shareUrl='' />);

      // No copy button should be visible when sharing
      expect(
        screen.queryByRole('button', { name: /copy/i })
      ).not.toBeInTheDocument();
    });

    it('does not show copy button when error', () => {
      render(<ShareDialog {...defaultProps} error='Error' shareUrl='' />);

      // No copy button should be visible when error
      expect(
        screen.queryByRole('button', { name: /copy/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('close behavior', () => {
    it('calls onClose when close button clicked', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      render(<ShareDialog {...defaultProps} onClose={onClose} />);

      await user.click(screen.getByRole('button', { name: /close dialog/i }));

      expect(onClose).toHaveBeenCalled();
    });

    it('calls onClose when Done button clicked', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      render(<ShareDialog {...defaultProps} onClose={onClose} />);

      await user.click(screen.getByRole('button', { name: 'Done' }));

      expect(onClose).toHaveBeenCalled();
    });

    it('calls onClose when backdrop clicked', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      render(<ShareDialog {...defaultProps} onClose={onClose} />);

      // Click the backdrop (the outer div with role="presentation")
      const backdrop = screen.getByRole('presentation');
      await user.click(backdrop);

      expect(onClose).toHaveBeenCalled();
    });

    it('calls onClose when Escape key pressed', async () => {
      const user = userEvent.setup();
      const onClose = jest.fn();
      render(<ShareDialog {...defaultProps} onClose={onClose} />);

      await user.keyboard('{Escape}');

      expect(onClose).toHaveBeenCalled();
    });

    it('shows Close button text when error', () => {
      render(
        <ShareDialog {...defaultProps} error='Error occurred' shareUrl='' />
      );

      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });
  });

  describe('open in new tab', () => {
    it('shows open in new tab link on success', () => {
      render(<ShareDialog {...defaultProps} />);

      const link = screen.getByRole('link', { name: /open in new tab/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://example.com/list/abc-123');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('does not show open in new tab link when sharing', () => {
      render(<ShareDialog {...defaultProps} isSharing shareUrl='' />);

      expect(
        screen.queryByRole('link', { name: /open in new tab/i })
      ).not.toBeInTheDocument();
    });

    it('does not show open in new tab link when error', () => {
      render(<ShareDialog {...defaultProps} error='Error' shareUrl='' />);

      expect(
        screen.queryByRole('link', { name: /open in new tab/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<ShareDialog {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'share-dialog-title');
      expect(dialog).toHaveAttribute(
        'aria-describedby',
        'share-dialog-description'
      );
    });

    it('focuses close button when opened', () => {
      render(<ShareDialog {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: /close dialog/i })
      ).toHaveFocus();
    });

    it('has minimum touch target size on buttons', () => {
      render(<ShareDialog {...defaultProps} />);

      const closeButton = screen.getByRole('button', { name: /close dialog/i });
      expect(closeButton).toHaveClass('min-w-[44px]', 'min-h-[44px]');

      const copyButton = screen.getByRole('button', { name: /copy/i });
      expect(copyButton).toHaveClass('min-w-[44px]', 'min-h-[44px]');
    });
  });
});
