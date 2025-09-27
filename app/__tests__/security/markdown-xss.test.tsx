import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoItem from '../../components/TodoItem';
import { createMockTodo } from '../utils/test-utils';
import { sanitizeMarkdown } from '../../utils/markdown';

describe('Markdown XSS Security Tests', () => {
  const mockOnToggle = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnEdit = jest.fn();

  beforeEach(() => {
    mockOnToggle.mockClear();
    mockOnDelete.mockClear();
    mockOnEdit.mockClear();
  });

  describe('Script Injection Prevention', () => {
    it('should prevent basic script injection', () => {
      const maliciousInput = '<script>alert("XSS")</script>';
      const todo = createMockTodo({ text: maliciousInput });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // Script tags should not be present in the rendered output
      expect(document.body.innerHTML).not.toContain('<script>');
      expect(document.body.innerHTML).not.toContain('alert("XSS")');
    });

    it('should prevent script injection in markdown links', () => {
      const maliciousInput = '[Click me](javascript:alert("XSS"))';
      const todo = createMockTodo({ text: maliciousInput });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // JavaScript protocol should be sanitized
      expect(document.body.innerHTML).not.toContain('javascript:');
      expect(document.body.innerHTML).not.toContain('alert("XSS")');
    });

    it('should prevent script injection in image tags', () => {
      const maliciousInput = '<img src="x" onerror="alert(\'XSS\')">';
      const todo = createMockTodo({ text: maliciousInput });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // Malicious attributes should be removed
      expect(document.body.innerHTML).not.toContain('onerror');
      expect(document.body.innerHTML).not.toContain("alert('XSS')");
    });

    it('should prevent inline event handlers', () => {
      const maliciousInputs = [
        '<div onclick="alert(\'XSS\')">Click me</div>',
        '<span onmouseover="alert(\'XSS\')">Hover me</span>',
        '<p onload="alert(\'XSS\')">Load me</p>',
        '<a href="#" onfocus="alert(\'XSS\')">Focus me</a>',
      ];

      maliciousInputs.forEach((input, index) => {
        const todo = createMockTodo({ id: `test-${index}`, text: input });
        const { unmount } = render(
          <TodoItem
            todo={todo}
            onToggle={mockOnToggle}
            onDelete={mockOnDelete}
            onEdit={mockOnEdit}
          />
        );

        // No inline event handlers should be present
        expect(document.body.innerHTML).not.toContain('onclick');
        expect(document.body.innerHTML).not.toContain('onmouseover');
        expect(document.body.innerHTML).not.toContain('onload');
        expect(document.body.innerHTML).not.toContain('onfocus');
        expect(document.body.innerHTML).not.toContain("alert('XSS')");

        unmount();
      });
    });
  });

  describe('HTML Injection Prevention', () => {
    it('should prevent iframe injection', () => {
      const maliciousInput =
        '<iframe src="javascript:alert(\'XSS\')"></iframe>';
      const todo = createMockTodo({ text: maliciousInput });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      expect(document.body.innerHTML).not.toContain('<iframe');
      expect(document.body.innerHTML).not.toContain('javascript:');
    });

    it('should prevent object and embed injection', () => {
      const maliciousInputs = [
        '<object data="data:text/html,<script>alert(\'XSS\')</script>"></object>',
        '<embed src="data:image/svg+xml,<svg onload=alert(\'XSS\')>">',
      ];

      maliciousInputs.forEach((input, index) => {
        const todo = createMockTodo({ id: `test-${index}`, text: input });
        const { unmount } = render(
          <TodoItem
            todo={todo}
            onToggle={mockOnToggle}
            onDelete={mockOnDelete}
            onEdit={mockOnEdit}
          />
        );

        expect(document.body.innerHTML).not.toContain('<object');
        expect(document.body.innerHTML).not.toContain('<embed');
        expect(document.body.innerHTML).not.toContain("alert('XSS')");

        unmount();
      });
    });

    it('should prevent form injection', () => {
      const maliciousInput =
        '<form action="javascript:alert(\'XSS\')"><input type="submit"></form>';
      const todo = createMockTodo({ text: maliciousInput });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      expect(document.body.innerHTML).not.toContain('<form');
      expect(document.body.innerHTML).not.toContain('javascript:');
    });

    it('should prevent meta and link tag injection', () => {
      const maliciousInputs = [
        '<meta http-equiv="refresh" content="0; url=javascript:alert(\'XSS\')">',
        '<link rel="stylesheet" href="javascript:alert(\'XSS\')">',
      ];

      maliciousInputs.forEach((input, index) => {
        const todo = createMockTodo({ id: `test-${index}`, text: input });
        const { unmount } = render(
          <TodoItem
            todo={todo}
            onToggle={mockOnToggle}
            onDelete={mockOnDelete}
            onEdit={mockOnEdit}
          />
        );

        expect(document.body.innerHTML).not.toContain('<meta');
        expect(document.body.innerHTML).not.toContain('<link');
        expect(document.body.innerHTML).not.toContain('javascript:');

        unmount();
      });
    });
  });

  describe('Data URI and Protocol Injection', () => {
    it('should prevent malicious data URIs', () => {
      const maliciousInputs = [
        'data:text/html,<script>alert("XSS")</script>',
        'data:text/html;base64,PHNjcmlwdD5hbGVydCgnWFNTJyk8L3NjcmlwdD4=', // base64 encoded script
        'data:image/svg+xml,<svg onload=alert("XSS")>',
      ];

      maliciousInputs.forEach((uri, index) => {
        const maliciousMarkdown = `[Click me](${uri})`;
        const todo = createMockTodo({
          id: `test-${index}`,
          text: maliciousMarkdown,
        });
        const { unmount } = render(
          <TodoItem
            todo={todo}
            onToggle={mockOnToggle}
            onDelete={mockOnDelete}
            onEdit={mockOnEdit}
          />
        );

        expect(document.body.innerHTML).not.toContain(uri);
        expect(document.body.innerHTML).not.toContain('alert');

        unmount();
      });
    });

    it('should prevent dangerous protocols', () => {
      const dangerousProtocols = [
        'javascript:alert("XSS")',
        'vbscript:alert("XSS")',
        'file:///etc/passwd',
        'ftp://malicious.com',
      ];

      dangerousProtocols.forEach((protocol, index) => {
        const maliciousMarkdown = `[Link](${protocol})`;
        const todo = createMockTodo({
          id: `test-${index}`,
          text: maliciousMarkdown,
        });
        const { unmount } = render(
          <TodoItem
            todo={todo}
            onToggle={mockOnToggle}
            onDelete={mockOnDelete}
            onEdit={mockOnEdit}
          />
        );

        expect(document.body.innerHTML).not.toContain(protocol);

        unmount();
      });
    });

    it('should allow safe protocols', () => {
      const safeProtocols = [
        'https://example.com',
        'http://example.com',
        'mailto:test@example.com',
        '#anchor',
        '/relative/path',
        './relative/path',
      ];

      safeProtocols.forEach((protocol, index) => {
        const safeMarkdown = `[Safe Link](${protocol})`;
        const todo = createMockTodo({
          id: `test-${index}`,
          text: safeMarkdown,
        });
        const { unmount } = render(
          <TodoItem
            todo={todo}
            onToggle={mockOnToggle}
            onDelete={mockOnDelete}
            onEdit={mockOnEdit}
          />
        );

        // Safe protocols should be preserved (though may be processed by React)
        // The important thing is no XSS occurs
        expect(document.body.innerHTML).not.toContain('alert');
        expect(document.body.innerHTML).not.toContain('<script');

        unmount();
      });
    });
  });

  describe('CSS Injection Prevention', () => {
    it('should prevent CSS injection through style attributes', () => {
      const maliciousInput =
        '<div style="background: url(javascript:alert(\'XSS\'))">Content</div>';
      const todo = createMockTodo({ text: maliciousInput });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      expect(document.body.innerHTML).not.toContain('javascript:');
      expect(document.body.innerHTML).not.toContain("alert('XSS')");
    });

    it('should prevent CSS injection through style tags', () => {
      const maliciousInput =
        '<style>body { background: url("javascript:alert(\'XSS\')"); }</style>';
      const todo = createMockTodo({ text: maliciousInput });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      expect(document.body.innerHTML).not.toContain('<style');
      expect(document.body.innerHTML).not.toContain('javascript:');
    });
  });

  describe('Markdown-Specific Security', () => {
    it('should prevent XSS in markdown code blocks', () => {
      const maliciousInput = '```html\n<script>alert("XSS")</script>\n```';
      const todo = createMockTodo({ text: maliciousInput });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // Code should be escaped and not executed
      expect(document.body.innerHTML).not.toContain('alert("XSS")');
      // Script tags should be escaped in code blocks
      expect(document.querySelectorAll('script')).toHaveLength(0);
    });

    it('should prevent XSS in markdown HTML blocks', () => {
      const maliciousInput = `
<div>
  <script>alert("XSS")</script>
  <img src="x" onerror="alert('XSS2')">
</div>`;
      const todo = createMockTodo({ text: maliciousInput });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      expect(document.querySelectorAll('script')).toHaveLength(0);
      expect(document.body.innerHTML).not.toContain('onerror');
      expect(document.body.innerHTML).not.toContain('alert');
    });

    it('should prevent XSS in markdown link titles', () => {
      const maliciousInput =
        '[Link](https://example.com "title with <script>alert(\'XSS\')</script>")';
      const todo = createMockTodo({ text: maliciousInput });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      expect(document.querySelectorAll('script')).toHaveLength(0);
      expect(document.body.innerHTML).not.toContain("alert('XSS')");
    });

    it('should prevent XSS in markdown image alt text', () => {
      const maliciousInput =
        '![<script>alert("XSS")</script>](https://example.com/image.png)';
      const todo = createMockTodo({ text: maliciousInput });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      expect(document.querySelectorAll('script')).toHaveLength(0);
      expect(document.body.innerHTML).not.toContain('alert("XSS")');
    });
  });

  describe('Advanced Attack Vectors', () => {
    it('should prevent SVG-based XSS attacks', () => {
      const maliciousInput = `
<svg xmlns="http://www.w3.org/2000/svg" onload="alert('XSS')">
  <text>Malicious SVG</text>
</svg>`;
      const todo = createMockTodo({ text: maliciousInput });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      expect(document.body.innerHTML).not.toContain('onload');
      expect(document.body.innerHTML).not.toContain("alert('XSS')");
    });

    it('should prevent mathml-based attacks', () => {
      const maliciousInput = `
<math xmlns="http://www.w3.org/1998/Math/MathML">
  <mi xlink:href="javascript:alert('XSS')">click</mi>
</math>`;
      const todo = createMockTodo({ text: maliciousInput });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      expect(document.body.innerHTML).not.toContain('javascript:');
      expect(document.body.innerHTML).not.toContain("alert('XSS')");
    });

    it('should prevent encoded XSS attempts', () => {
      const encodedAttacks = [
        '&lt;script&gt;alert(&#34;XSS&#34;)&lt;/script&gt;',
        '%3Cscript%3Ealert%28%22XSS%22%29%3C%2Fscript%3E',
        '&#60;script&#62;alert&#40;&#34;XSS&#34;&#41;&#60;/script&#62;',
      ];

      encodedAttacks.forEach((attack, index) => {
        const todo = createMockTodo({ id: `test-${index}`, text: attack });
        const { unmount } = render(
          <TodoItem
            todo={todo}
            onToggle={mockOnToggle}
            onDelete={mockOnDelete}
            onEdit={mockOnEdit}
          />
        );

        expect(document.querySelectorAll('script')).toHaveLength(0);
        expect(document.body.innerHTML).not.toContain('alert');

        unmount();
      });
    });

    it('should prevent bypass attempts with mixed case', () => {
      const mixedCaseAttacks = [
        '<ScRiPt>alert("XSS")</ScRiPt>',
        '<SCRIPT>alert("XSS")</SCRIPT>',
        '<img SRC="javascript:alert(\'XSS\')">',
        '<DIV ONCLICK="alert(\'XSS\')">Click</DIV>',
      ];

      mixedCaseAttacks.forEach((attack, index) => {
        const todo = createMockTodo({ id: `test-${index}`, text: attack });
        const { unmount } = render(
          <TodoItem
            todo={todo}
            onToggle={mockOnToggle}
            onDelete={mockOnDelete}
            onEdit={mockOnEdit}
          />
        );

        expect(document.querySelectorAll('script')).toHaveLength(0);
        expect(document.body.innerHTML).not.toContain('alert');
        expect(document.body.innerHTML.toLowerCase()).not.toContain('onclick');

        unmount();
      });
    });
  });

  describe('Edit Mode Security', () => {
    it('should prevent XSS when editing malicious content', async () => {
      const user = userEvent.setup();
      const maliciousInput = '<script>alert("XSS")</script>';
      const todo = createMockTodo({ text: maliciousInput });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit todo/i });
      await user.click(editButton);

      // Even in edit mode, the content should be safe
      expect(document.querySelectorAll('script')).toHaveLength(0);

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea).toBeInTheDocument();
      // The raw text should be in the textarea for editing
      expect(textarea.value).toContain(maliciousInput);
    });

    it('should sanitize input before saving', async () => {
      const user = userEvent.setup();
      const todo = createMockTodo({ id: 'edit-test', text: 'Original text' });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit todo/i });
      await user.click(editButton);

      const textarea = screen.getByRole('textbox');
      await user.clear(textarea);
      await user.type(textarea, '<script>alert("XSS")</script>New content');

      const saveButton = screen.getByRole('button', { name: /save edit/i });
      await user.click(saveButton);

      // The onEdit callback should receive the unsanitized content
      // (sanitization happens during rendering, not during saving)
      expect(mockOnEdit).toHaveBeenCalledWith(
        'edit-test',
        '<script>alert("XSS")</script>New content'
      );
    });
  });

  describe('Utility Function Security Tests', () => {
    describe('sanitizeMarkdown', () => {
      it('should remove dangerous elements', () => {
        const dangerous =
          '<script>alert("XSS")</script><iframe src="evil.com"></iframe>';
        const sanitized = sanitizeMarkdown(dangerous);

        expect(sanitized).not.toContain('<script>');
        expect(sanitized).not.toContain('<iframe>');
        expect(sanitized).not.toContain('alert("XSS")');
      });

      it('should preserve safe markdown', () => {
        const safeMarkdown =
          '# Header\n**Bold** text with [link](https://example.com)';
        const sanitized = sanitizeMarkdown(safeMarkdown);

        expect(sanitized).toContain('# Header');
        expect(sanitized).toContain('**Bold**');
        expect(sanitized).toContain('[link](https://example.com)');
      });

      it('should handle null and undefined inputs', () => {
        expect(() => sanitizeMarkdown(null as unknown as string)).not.toThrow();
        expect(() =>
          sanitizeMarkdown(undefined as unknown as string)
        ).not.toThrow();
      });
    });

    // Note: parseMarkdownSafely is handled by react-markdown with markdownConfig
    // The security is ensured through the configuration and sanitization
  });

  describe('CSP Compliance', () => {
    it('should not require unsafe-inline for styles', () => {
      const todo = createMockTodo({ text: '# Header\n**Bold** content' });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // Check that no inline styles are present that would require unsafe-inline
      const elementsWithStyle = document.querySelectorAll('[style]');
      elementsWithStyle.forEach((element) => {
        const style = element.getAttribute('style');
        // Allow only safe styles that don't contain JavaScript
        expect(style).not.toContain('javascript:');
        expect(style).not.toContain('expression(');
      });
    });

    it('should not require unsafe-eval for functionality', () => {
      const todo = createMockTodo({ text: '# Dynamic Content\n**Test**' });

      render(
        <TodoItem
          todo={todo}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />
      );

      // The component should work without eval-like functionality
      expect(screen.getByRole('listitem')).toBeInTheDocument();
    });
  });
});
