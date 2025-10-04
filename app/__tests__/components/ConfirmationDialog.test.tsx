import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmationDialog from '../../components/ConfirmationDialog';

describe('ConfirmationDialog', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnConfirm.mockClear();
    // Reset body overflow style
    document.body.style.overflow = 'unset';
  });

  afterEach(() => {
    // Cleanup body overflow style
    document.body.style.overflow = 'unset';
  });

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    title: 'Test Dialog',
    message: 'Are you sure you want to proceed?',
  };

  describe('Basic rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<ConfirmationDialog {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render dialog when isOpen is true', () => {
      render(<ConfirmationDialog {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Test Dialog')).toBeInTheDocument();
      expect(
        screen.getByText('Are you sure you want to proceed?')
      ).toBeInTheDocument();
    });

    it('should render with default button labels', () => {
      render(<ConfirmationDialog {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: /delete action/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /cancel action/i })
      ).toBeInTheDocument();
    });

    it('should render with custom button labels', () => {
      render(
        <ConfirmationDialog
          {...defaultProps}
          confirmLabel='Proceed'
          cancelLabel='Go Back'
        />
      );

      expect(
        screen.getByRole('button', { name: /proceed action/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /go back action/i })
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<ConfirmationDialog {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby');
      expect(dialog).toHaveAttribute('aria-describedby');
    });

    it('should focus cancel button initially', async () => {
      render(<ConfirmationDialog {...defaultProps} />);

      await waitFor(() => {
        const cancelButton = screen.getByRole('button', {
          name: /cancel action/i,
        });
        expect(cancelButton).toHaveFocus();
      });
    });

    it('should prevent body scroll when open', () => {
      render(<ConfirmationDialog {...defaultProps} />);

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll when closed', () => {
      const { rerender } = render(<ConfirmationDialog {...defaultProps} />);

      expect(document.body.style.overflow).toBe('hidden');

      rerender(<ConfirmationDialog {...defaultProps} isOpen={false} />);

      expect(document.body.style.overflow).toBe('unset');
    });
  });

  describe('User interactions', () => {
    it('should call onConfirm when confirm button is clicked', async () => {
      const user = userEvent.setup();
      render(<ConfirmationDialog {...defaultProps} />);

      const confirmButton = screen.getByRole('button', {
        name: /delete action/i,
      });
      await user.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<ConfirmationDialog {...defaultProps} />);

      const cancelButton = screen.getByRole('button', {
        name: /cancel action/i,
      });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<ConfirmationDialog {...defaultProps} />);

      const closeButton = screen.getByRole('button', { name: /close dialog/i });
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('should call onClose when backdrop is clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(<ConfirmationDialog {...defaultProps} />);

      // Click on the backdrop (presentation layer, not the dialog content)
      const backdrop = container.querySelector('[role="presentation"]');
      expect(backdrop).toBeInTheDocument();

      await user.click(backdrop!);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Keyboard navigation', () => {
    it('should call onClose when Escape key is pressed', async () => {
      const user = userEvent.setup();
      render(<ConfirmationDialog {...defaultProps} />);

      await user.keyboard('{Escape}');

      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('should call onConfirm when Enter key is pressed', async () => {
      const user = userEvent.setup();
      render(<ConfirmationDialog {...defaultProps} />);

      await user.keyboard('{Enter}');

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should not call onConfirm on Enter when loading', async () => {
      const user = userEvent.setup();
      render(<ConfirmationDialog {...defaultProps} isLoading={true} />);

      await user.keyboard('{Enter}');

      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('should not call onConfirm on Enter when confirm is disabled', async () => {
      const user = userEvent.setup();
      render(<ConfirmationDialog {...defaultProps} isConfirmDisabled={true} />);

      await user.keyboard('{Enter}');

      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('should trap focus with Tab key navigation', async () => {
      const user = userEvent.setup();
      render(<ConfirmationDialog {...defaultProps} />);

      const cancelButton = screen.getByRole('button', {
        name: /cancel action/i,
      });
      const confirmButton = screen.getByRole('button', {
        name: /delete action/i,
      });
      const closeButton = screen.getByRole('button', { name: /close dialog/i });

      // Cancel button should be focused initially
      await waitFor(() => {
        expect(cancelButton).toHaveFocus();
      });

      // Tab should move to confirm button
      await user.keyboard('{Tab}');
      expect(confirmButton).toHaveFocus();

      // Tab should move to close button
      await user.keyboard('{Tab}');
      expect(closeButton).toHaveFocus();

      // Tab should wrap back to cancel button
      await user.keyboard('{Tab}');
      expect(cancelButton).toHaveFocus();
    });

    it('should handle Shift+Tab navigation (reverse focus)', async () => {
      const user = userEvent.setup();
      render(<ConfirmationDialog {...defaultProps} />);

      const cancelButton = screen.getByRole('button', {
        name: /cancel action/i,
      });
      const closeButton = screen.getByRole('button', { name: /close dialog/i });

      // Cancel button should be focused initially
      await waitFor(() => {
        expect(cancelButton).toHaveFocus();
      });

      // Shift+Tab should move to last element (close button)
      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(closeButton).toHaveFocus();
    });
  });

  describe('Loading state', () => {
    it('should show loading spinner when isLoading is true', () => {
      render(<ConfirmationDialog {...defaultProps} isLoading={true} />);

      const confirmButton = screen.getByRole('button', {
        name: /delete action/i,
      });
      expect(confirmButton).toBeDisabled();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(confirmButton.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('should disable confirm button when isConfirmDisabled is true', () => {
      render(<ConfirmationDialog {...defaultProps} isConfirmDisabled={true} />);

      const confirmButton = screen.getByRole('button', {
        name: /delete action/i,
      });
      expect(confirmButton).toBeDisabled();
      expect(confirmButton).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Variants', () => {
    it('should render destructive variant by default', () => {
      render(<ConfirmationDialog {...defaultProps} />);

      const confirmButton = screen.getByRole('button', {
        name: /delete action/i,
      });
      expect(confirmButton).toHaveClass('bg-destructive');

      // Should show alert triangle icon
      const icon = screen
        .getByRole('dialog')
        .querySelector('.text-destructive');
      expect(icon).toBeInTheDocument();
    });

    it('should render warning variant', () => {
      render(<ConfirmationDialog {...defaultProps} variant='warning' />);

      const confirmButton = screen.getByRole('button', {
        name: /delete action/i,
      });
      expect(confirmButton).toHaveClass('bg-yellow-500');

      // Should show alert triangle icon with yellow color
      const icon = screen.getByRole('dialog').querySelector('.text-yellow-500');
      expect(icon).toBeInTheDocument();
    });

    it('should render info variant', () => {
      render(<ConfirmationDialog {...defaultProps} variant='info' />);

      const confirmButton = screen.getByRole('button', {
        name: /delete action/i,
      });
      expect(confirmButton).toHaveClass('bg-blue-500');

      // Should show alert triangle icon with blue color
      const icon = screen.getByRole('dialog').querySelector('.text-blue-500');
      expect(icon).toBeInTheDocument();
    });

    it('should handle invalid variant by falling back to destructive', () => {
      render(
        <ConfirmationDialog
          {...defaultProps}
          // @ts-expect-error Testing invalid variant
          variant='invalid'
        />
      );

      const confirmButton = screen.getByRole('button', {
        name: /delete action/i,
      });
      expect(confirmButton).toHaveClass('bg-destructive');

      // Should show alert triangle icon
      const icon = screen
        .getByRole('dialog')
        .querySelector('.text-destructive');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Complex scenarios', () => {
    it('should handle long message text properly', () => {
      const longMessage =
        'This is a very long confirmation message that should wrap properly and not break the layout. ';
      render(<ConfirmationDialog {...defaultProps} message={longMessage} />);

      // Check that the message element exists and has the right class
      const messageElement = screen.getByText(
        /this is a very long confirmation message/i
      );
      expect(messageElement).toBeInTheDocument();
      expect(messageElement).toHaveClass('text-balance');
    });

    it('should handle long title text properly', () => {
      const longTitle = 'Very Long Dialog Title That Should Wrap Properly';
      render(<ConfirmationDialog {...defaultProps} title={longTitle} />);

      expect(screen.getByText(longTitle)).toBeInTheDocument();
      expect(screen.getByText(longTitle)).toHaveClass('text-balance');
    });

    it('should maintain focus management when rapidly opening and closing', async () => {
      const { rerender } = render(
        <ConfirmationDialog {...defaultProps} isOpen={false} />
      );

      // Open dialog
      rerender(<ConfirmationDialog {...defaultProps} isOpen={true} />);

      await waitFor(() => {
        const cancelButton = screen.getByRole('button', {
          name: /cancel action/i,
        });
        expect(cancelButton).toHaveFocus();
      });

      // Close dialog
      rerender(<ConfirmationDialog {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should handle button interactions when disabled', async () => {
      const user = userEvent.setup();
      render(
        <ConfirmationDialog
          {...defaultProps}
          isLoading={true}
          isConfirmDisabled={true}
        />
      );

      const confirmButton = screen.getByRole('button', {
        name: /delete action/i,
      });

      // Should not respond to clicks when disabled
      await user.click(confirmButton);
      expect(mockOnConfirm).not.toHaveBeenCalled();

      // Should not respond to keyboard activation when disabled
      confirmButton.focus();
      await user.keyboard('{Enter}');
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });
  });
});
