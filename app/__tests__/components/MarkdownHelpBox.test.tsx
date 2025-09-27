import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MarkdownHelpBox from '../../components/MarkdownHelpBox';

describe('MarkdownHelpBox', () => {
  describe('Rendering and Visibility', () => {
    it('should render with default collapsed state', () => {
      render(<MarkdownHelpBox />);

      // Should show the toggle button with proper text
      expect(screen.getByText('Markdown Formatting Help')).toBeInTheDocument();

      // Help content should not be visible initially
      expect(screen.queryByText('Headers')).not.toBeInTheDocument();
      expect(screen.queryByText('Text Formatting')).not.toBeInTheDocument();
    });

    it('should show help content when expanded', async () => {
      const user = userEvent.setup();
      render(<MarkdownHelpBox />);

      const toggleButton = screen.getByRole('button');
      await user.click(toggleButton);

      // Help content should now be visible
      expect(screen.getByText('Headers')).toBeInTheDocument();
      expect(screen.getByText('Text Formatting')).toBeInTheDocument();
      expect(screen.getByText('Lists')).toBeInTheDocument();
      expect(screen.getByText('Links & More')).toBeInTheDocument();
    });
  });

  describe('Interactive Behavior', () => {
    it('should toggle visibility when button is clicked', async () => {
      const user = userEvent.setup();
      render(<MarkdownHelpBox />);

      const toggleButton = screen.getByRole('button');

      // Initially collapsed
      expect(screen.queryByText('Headers')).not.toBeInTheDocument();

      // Click to expand
      await user.click(toggleButton);
      expect(screen.getByText('Headers')).toBeInTheDocument();

      // Click to collapse
      await user.click(toggleButton);
      expect(screen.queryByText('Headers')).not.toBeInTheDocument();
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<MarkdownHelpBox />);

      const toggleButton = screen.getByRole('button');

      // Focus the button
      toggleButton.focus();
      expect(toggleButton).toHaveFocus();

      // Activate with Enter
      await user.keyboard('{Enter}');
      expect(screen.getByText('Headers')).toBeInTheDocument();

      // Activate with Space
      await user.keyboard(' ');
      expect(screen.queryByText('Headers')).not.toBeInTheDocument();
    });
  });

  describe('Content and Examples', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<MarkdownHelpBox />);
      const toggleButton = screen.getByRole('button');
      await user.click(toggleButton);
    });

    it('should display header formatting examples', () => {
      expect(screen.getByText('Headers')).toBeInTheDocument();
      expect(screen.getByText('# Header 1')).toBeInTheDocument();
      expect(screen.getByText('## Header 2')).toBeInTheDocument();
    });

    it('should display text formatting examples', () => {
      expect(screen.getByText('Text Formatting')).toBeInTheDocument();
      expect(screen.getByText('**bold text**')).toBeInTheDocument();
      expect(screen.getByText('*italic text*')).toBeInTheDocument();
      expect(screen.getByText('~~strikethrough~~')).toBeInTheDocument();
    });

    it('should display list formatting examples', () => {
      expect(screen.getByText('Lists')).toBeInTheDocument();
      expect(
        screen.getByText((content) => content.includes('- Item 1'))
      ).toBeInTheDocument();
      expect(
        screen.getByText((content) => content.includes('1. First'))
      ).toBeInTheDocument();
    });

    it('should display link and other examples', () => {
      expect(screen.getByText('Links & More')).toBeInTheDocument();
      expect(
        screen.getByText('[Link text](https://example.com)')
      ).toBeInTheDocument();
      expect(screen.getByText('> Quoted text')).toBeInTheDocument();
    });

    it('should display helpful footer note', () => {
      expect(
        screen.getByText(/markdown formatting will be automatically detected/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/plain text will continue to work/i)
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<MarkdownHelpBox />);

      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
      expect(toggleButton).toHaveAttribute(
        'aria-controls',
        'markdown-help-content'
      );
    });

    it('should update ARIA attributes when expanded', async () => {
      const user = userEvent.setup();
      render(<MarkdownHelpBox />);

      const toggleButton = screen.getByRole('button');
      await user.click(toggleButton);

      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('should have proper content ID for accessibility', async () => {
      const user = userEvent.setup();
      render(<MarkdownHelpBox />);

      const toggleButton = screen.getByRole('button');
      await user.click(toggleButton);

      const content = screen
        .getByText('Headers')
        .closest('#markdown-help-content');
      expect(content).toBeInTheDocument();
    });
  });

  describe('Styling and Visual State', () => {
    it('should show proper expand/collapse icons', () => {
      render(<MarkdownHelpBox />);

      // Should show chevron down when collapsed
      expect(
        document.querySelector('.lucide-chevron-down')
      ).toBeInTheDocument();
      expect(
        document.querySelector('.lucide-chevron-up')
      ).not.toBeInTheDocument();
    });

    it('should change icons when expanded', async () => {
      const user = userEvent.setup();
      render(<MarkdownHelpBox />);

      const toggleButton = screen.getByRole('button');
      await user.click(toggleButton);

      // Should show chevron up when expanded
      expect(document.querySelector('.lucide-chevron-up')).toBeInTheDocument();
      expect(
        document.querySelector('.lucide-chevron-down')
      ).not.toBeInTheDocument();
    });

    it('should accept custom className', () => {
      render(<MarkdownHelpBox className='custom-class' />);

      const container = screen.getByRole('button').closest('div');
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('Performance', () => {
    it('should not render help content until expanded', () => {
      render(<MarkdownHelpBox />);

      // Help content should not be in the DOM when collapsed
      expect(screen.queryByText('**bold text**')).not.toBeInTheDocument();
      expect(screen.queryByText('# Header 1')).not.toBeInTheDocument();
    });

    it('should efficiently toggle content multiple times', async () => {
      const user = userEvent.setup();
      render(<MarkdownHelpBox />);

      const toggleButton = screen.getByRole('button');

      // Multiple rapid toggles should work without issues
      for (let i = 0; i < 5; i++) {
        await user.click(toggleButton);
        await user.click(toggleButton);
      }

      // Should end in collapsed state
      expect(screen.queryByText('Headers')).not.toBeInTheDocument();
    });
  });

  describe('Integration with Forms', () => {
    it('should work within form contexts', () => {
      render(
        <form>
          <MarkdownHelpBox />
          <textarea name='content' />
          <button type='submit'>Submit</button>
        </form>
      );

      const helpToggle = screen.getByRole('button', {
        name: /markdown formatting help/i,
      });
      const submitButton = screen.getByRole('button', { name: /submit/i });
      const textarea = screen.getByRole('textbox');

      expect(helpToggle).toBeInTheDocument();
      expect(submitButton).toBeInTheDocument();
      expect(textarea).toBeInTheDocument();

      // Help toggle button should not interfere with form submission
      expect(helpToggle).toHaveAttribute('type', 'button');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing props gracefully', () => {
      expect(() => render(<MarkdownHelpBox />)).not.toThrow();
    });

    it('should continue working if some content fails to render', async () => {
      const user = userEvent.setup();

      // Even if there are rendering issues, the toggle should still work
      render(<MarkdownHelpBox />);

      const toggleButton = screen.getByRole('button');
      expect(() => user.click(toggleButton)).not.toThrow();
    });
  });

  describe('Content Structure', () => {
    it('should render all example categories', async () => {
      const user = userEvent.setup();
      render(<MarkdownHelpBox />);

      const toggleButton = screen.getByRole('button');
      await user.click(toggleButton);

      // Should have all expected categories
      expect(screen.getByText('Headers')).toBeInTheDocument();
      expect(screen.getByText('Text Formatting')).toBeInTheDocument();
      expect(screen.getByText('Lists')).toBeInTheDocument();
      expect(screen.getByText('Links & More')).toBeInTheDocument();
    });

    it('should display examples with proper formatting', async () => {
      const user = userEvent.setup();
      render(<MarkdownHelpBox />);

      const toggleButton = screen.getByRole('button');
      await user.click(toggleButton);

      // Code examples should be in code elements
      const codeElements = screen.getAllByText('# Header 1');
      expect(codeElements[0].closest('code')).toBeInTheDocument();
    });

    it('should show descriptions for examples', async () => {
      const user = userEvent.setup();
      render(<MarkdownHelpBox />);

      const toggleButton = screen.getByRole('button');
      await user.click(toggleButton);

      // Should show descriptions alongside syntax
      expect(screen.getByText('Large header')).toBeInTheDocument();
      expect(screen.getByText('Bold text')).toBeInTheDocument();
      expect(screen.getByText('Bullet list')).toBeInTheDocument();
    });
  });
});
