import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MarkdownHelpDrawer } from '../../components/MarkdownHelpDrawer';

describe('MarkdownHelpDrawer', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  afterEach(() => {
    // Clean up body overflow style
    document.body.style.overflow = '';
  });

  describe('Visibility', () => {
    it('should not render when isOpen is false', () => {
      render(<MarkdownHelpDrawer isOpen={false} onClose={mockOnClose} />);
      expect(
        screen.queryByRole('dialog', { name: /markdown/i })
      ).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(<MarkdownHelpDrawer isOpen={true} onClose={mockOnClose} />);
      expect(
        screen.getByRole('dialog', { name: /markdown/i })
      ).toBeInTheDocument();
    });
  });

  describe('Content', () => {
    beforeEach(() => {
      render(<MarkdownHelpDrawer isOpen={true} onClose={mockOnClose} />);
    });

    it('should display the drawer title', () => {
      expect(screen.getByText('Markdown Formatting Help')).toBeInTheDocument();
    });

    it('should display markdown syntax examples', () => {
      expect(screen.getByText('# Header 1')).toBeInTheDocument();
      expect(screen.getByText('**bold text**')).toBeInTheDocument();
    });

    it('should display example descriptions', () => {
      expect(screen.getByText('Large header')).toBeInTheDocument();
      expect(screen.getByText('Bold text')).toBeInTheDocument();
    });

    it('should display footer note about markdown support', () => {
      expect(
        screen.getByText(/Plain text will continue to work/i)
      ).toBeInTheDocument();
    });
  });

  describe('Close Functionality', () => {
    it('should call onClose when close button is clicked', () => {
      render(<MarkdownHelpDrawer isOpen={true} onClose={mockOnClose} />);
      const closeButton = screen.getByRole('button', {
        name: /close markdown help/i,
      });
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop is clicked', () => {
      render(<MarkdownHelpDrawer isOpen={true} onClose={mockOnClose} />);
      const backdrop = document.querySelector('.bg-black\\/40');
      expect(backdrop).toBeInTheDocument();
      fireEvent.click(backdrop!);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when Escape key is pressed', () => {
      render(<MarkdownHelpDrawer isOpen={true} onClose={mockOnClose} />);
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      render(<MarkdownHelpDrawer isOpen={true} onClose={mockOnClose} />);
    });

    it('should have role="dialog"', () => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    it('should have aria-modal="true"', () => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should have aria-labelledby pointing to title', () => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute(
        'aria-labelledby',
        'markdown-help-drawer-title'
      );
      expect(screen.getByText('Markdown Formatting Help')).toHaveAttribute(
        'id',
        'markdown-help-drawer-title'
      );
    });

    it('should have 44px minimum touch target for close button', () => {
      const closeButton = screen.getByRole('button', {
        name: /close markdown help/i,
      });
      expect(closeButton).toHaveClass('min-w-[44px]');
      expect(closeButton).toHaveClass('min-h-[44px]');
    });

    it('should focus first interactive element when opened', async () => {
      render(<MarkdownHelpDrawer isOpen={true} onClose={mockOnClose} />);

      await waitFor(
        () => {
          expect(document.activeElement?.tagName).toBe('BUTTON');
        },
        { timeout: 100 }
      );
    });

    it('should have drag handle with aria-hidden', () => {
      const dragHandle = document.querySelector('.bg-gray-600');
      expect(dragHandle).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Body Scroll Lock', () => {
    it('should lock body scroll when drawer is open', () => {
      const { rerender } = render(
        <MarkdownHelpDrawer isOpen={false} onClose={mockOnClose} />
      );
      expect(document.body.style.overflow).toBe('');

      rerender(<MarkdownHelpDrawer isOpen={true} onClose={mockOnClose} />);
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll when drawer is closed', () => {
      const { rerender } = render(
        <MarkdownHelpDrawer isOpen={true} onClose={mockOnClose} />
      );
      expect(document.body.style.overflow).toBe('hidden');

      rerender(<MarkdownHelpDrawer isOpen={false} onClose={mockOnClose} />);
      expect(document.body.style.overflow).toBe('');
    });

    it('should cleanup body scroll on unmount', () => {
      const { unmount } = render(
        <MarkdownHelpDrawer isOpen={true} onClose={mockOnClose} />
      );
      expect(document.body.style.overflow).toBe('hidden');

      unmount();
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Focus Trap', () => {
    it('should trap Tab key within drawer', () => {
      render(<MarkdownHelpDrawer isOpen={true} onClose={mockOnClose} />);
      const closeButton = screen.getByRole('button', {
        name: /close markdown help/i,
      });

      closeButton.focus();
      expect(document.activeElement).toBe(closeButton);

      // Simulate Tab to cycle through focusable elements
      fireEvent.keyDown(document, { key: 'Tab', code: 'Tab' });
      // Focus should remain within drawer
      expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(
        true
      );
    });

    it('should handle Shift+Tab to focus previous element', () => {
      render(<MarkdownHelpDrawer isOpen={true} onClose={mockOnClose} />);
      const closeButton = screen.getByRole('button', {
        name: /close markdown help/i,
      });

      closeButton.focus();
      fireEvent.keyDown(document, {
        key: 'Tab',
        code: 'Tab',
        shiftKey: true,
      });

      // Focus should remain within drawer
      expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(
        true
      );
    });
  });

  describe('Animation Classes', () => {
    it('should have slide-up animation on drawer', () => {
      render(<MarkdownHelpDrawer isOpen={true} onClose={mockOnClose} />);
      const drawer = screen.getByRole('dialog');
      expect(drawer).toHaveClass('animate-slide-up');
    });

    it('should have fade-in animation on backdrop', () => {
      render(<MarkdownHelpDrawer isOpen={true} onClose={mockOnClose} />);
      const backdrop = document.querySelector('.bg-black\\/40');
      expect(backdrop).toHaveClass('animate-fade-in');
    });
  });

  describe('Portal Rendering', () => {
    it('should render drawer as portal to document.body', () => {
      render(<MarkdownHelpDrawer isOpen={true} onClose={mockOnClose} />);
      const drawer = screen.getByRole('dialog');

      // Dialog should be direct child of body (portal)
      expect(drawer.parentElement).toBe(document.body);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should not close on other key presses', () => {
      render(<MarkdownHelpDrawer isOpen={true} onClose={mockOnClose} />);
      fireEvent.keyDown(document, { key: 'Enter', code: 'Enter' });
      expect(mockOnClose).not.toHaveBeenCalled();

      fireEvent.keyDown(document, { key: 'Space', code: 'Space' });
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});
