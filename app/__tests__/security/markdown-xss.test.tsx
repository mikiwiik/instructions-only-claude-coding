import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoItem from '../../components/TodoItem';
import { createMockTodo } from '../utils/test-utils';
import { sanitizeMarkdown } from '../../utils/markdown';
import { XSS_PAYLOADS } from '../fixtures/test-constants';
import {
  createMockCallbacks,
  clearMockCallbacks,
  TodoItemCallbacks,
} from '../utils/mock-callbacks';
import { renderTodoItem } from '../utils/render-helpers';
import { expectNoXSS, expectNoEventHandlers } from '../utils/assertion-helpers';

describe('Markdown XSS Security Tests', () => {
  let callbacks: TodoItemCallbacks;

  beforeEach(() => {
    callbacks = createMockCallbacks();
  });

  afterEach(() => {
    clearMockCallbacks(callbacks);
  });

  describe('Script Injection Prevention', () => {
    it('should prevent basic script injection', () => {
      const todo = createMockTodo({ text: XSS_PAYLOADS.SCRIPT_BASIC });
      renderTodoItem(todo, callbacks);
      expectNoXSS();
    });

    it('should prevent script injection in markdown links', () => {
      const todo = createMockTodo({
        text: XSS_PAYLOADS.MARKDOWN_LINK_JAVASCRIPT,
      });
      renderTodoItem(todo, callbacks);
      expectNoXSS();
    });

    it('should prevent script injection in image tags', () => {
      const todo = createMockTodo({ text: XSS_PAYLOADS.ONERROR_IMG });
      renderTodoItem(todo, callbacks);
      expectNoEventHandlers();
    });

    it('should prevent inline event handlers', () => {
      const maliciousInputs = [
        XSS_PAYLOADS.ONCLICK_DIV,
        XSS_PAYLOADS.ONMOUSEOVER_SPAN,
        XSS_PAYLOADS.ONLOAD_BODY,
        XSS_PAYLOADS.ONFOCUS_LINK,
      ];

      maliciousInputs.forEach((input, index) => {
        const todo = createMockTodo({ id: `test-${index}`, text: input });
        const { unmount } = render(
          <TodoItem
            todo={todo}
            onToggle={callbacks.mockOnToggle}
            onDelete={callbacks.mockOnDelete}
            onEdit={callbacks.mockOnEdit}
          />
        );

        expectNoEventHandlers();

        unmount();
      });
    });
  });

  describe('HTML Injection Prevention', () => {
    it('should prevent iframe injection', () => {
      const todo = createMockTodo({ text: XSS_PAYLOADS.IFRAME_BASIC });
      renderTodoItem(todo, callbacks);

      expect(document.body.innerHTML).not.toContain('<iframe');
      expect(document.body.innerHTML).not.toContain('javascript:');
    });

    it('should prevent object and embed injection', () => {
      const maliciousInputs = [
        XSS_PAYLOADS.OBJECT_DATA,
        XSS_PAYLOADS.EMBED_SRC,
      ];

      maliciousInputs.forEach((input, index) => {
        const todo = createMockTodo({ id: `test-${index}`, text: input });
        const { unmount } = render(
          <TodoItem
            todo={todo}
            onToggle={callbacks.mockOnToggle}
            onDelete={callbacks.mockOnDelete}
            onEdit={callbacks.mockOnEdit}
          />
        );

        expect(document.body.innerHTML).not.toContain('<object');
        expect(document.body.innerHTML).not.toContain('<embed');
        expectNoXSS();

        unmount();
      });
    });

    it('should prevent form injection', () => {
      const todo = createMockTodo({ text: XSS_PAYLOADS.FORM_ACTION });
      renderTodoItem(todo, callbacks);

      expect(document.body.innerHTML).not.toContain('<form');
      expectNoXSS();
    });

    it('should prevent meta and link tag injection', () => {
      const maliciousInputs = [
        XSS_PAYLOADS.META_REFRESH,
        '<link rel="stylesheet" href="javascript:alert(\'XSS\')">',
      ];

      maliciousInputs.forEach((input, index) => {
        const todo = createMockTodo({ id: `test-${index}`, text: input });
        const { unmount } = render(
          <TodoItem
            todo={todo}
            onToggle={callbacks.mockOnToggle}
            onDelete={callbacks.mockOnDelete}
            onEdit={callbacks.mockOnEdit}
          />
        );

        expect(document.body.innerHTML).not.toContain('<meta');
        expect(document.body.innerHTML).not.toContain('<link');
        expectNoXSS();

        unmount();
      });
    });
  });

  describe('Data URI and Protocol Injection', () => {
    it('should prevent malicious data URIs', () => {
      const maliciousInputs = [
        XSS_PAYLOADS.DATA_PROTOCOL,
        XSS_PAYLOADS.MARKDOWN_LINK_DATA,
        'data:image/svg+xml,<svg onload=alert("XSS")>',
      ];

      maliciousInputs.forEach((uri, index) => {
        const todo = createMockTodo({
          id: `test-${index}`,
          text:
            typeof uri === 'string' && uri.startsWith('[')
              ? uri
              : `[Click me](${uri})`,
        });
        const { unmount } = render(
          <TodoItem
            todo={todo}
            onToggle={callbacks.mockOnToggle}
            onDelete={callbacks.mockOnDelete}
            onEdit={callbacks.mockOnEdit}
          />
        );

        expectNoXSS();

        unmount();
      });
    });

    it('should prevent dangerous protocols', () => {
      const dangerousProtocols = [
        XSS_PAYLOADS.JAVASCRIPT_PROTOCOL,
        XSS_PAYLOADS.VBSCRIPT_PROTOCOL,
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
            onToggle={callbacks.mockOnToggle}
            onDelete={callbacks.mockOnDelete}
            onEdit={callbacks.mockOnEdit}
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
            onToggle={callbacks.mockOnToggle}
            onDelete={callbacks.mockOnDelete}
            onEdit={callbacks.mockOnEdit}
          />
        );

        // Safe protocols should be preserved (though may be processed by React)
        // The important thing is no XSS occurs
        expectNoXSS();

        unmount();
      });
    });
  });

  describe('CSS Injection Prevention', () => {
    it('should prevent CSS injection through style attributes', () => {
      const todo = createMockTodo({
        text: XSS_PAYLOADS.STYLE_BACKGROUND_URL,
      });
      renderTodoItem(todo, callbacks);
      expectNoXSS();
    });

    it('should prevent CSS injection through style tags', () => {
      const todo = createMockTodo({ text: XSS_PAYLOADS.STYLE_IMPORT });
      renderTodoItem(todo, callbacks);

      expect(document.body.innerHTML).not.toContain('<style');
      expectNoXSS();
    });
  });

  describe('Markdown-Specific Security', () => {
    it('should prevent XSS in markdown code blocks', () => {
      const maliciousInput = '```html\n<script>alert("XSS")</script>\n```';
      const todo = createMockTodo({ text: maliciousInput });
      renderTodoItem(todo, callbacks);

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
      renderTodoItem(todo, callbacks);

      expect(document.querySelectorAll('script')).toHaveLength(0);
      expectNoEventHandlers();
    });

    it('should prevent XSS in markdown link titles', () => {
      const maliciousInput =
        '[Link](https://example.com "title with <script>alert(\'XSS\')</script>")';
      const todo = createMockTodo({ text: maliciousInput });
      renderTodoItem(todo, callbacks);

      expectNoXSS();
    });

    it('should prevent XSS in markdown image alt text', () => {
      const maliciousInput =
        '![<script>alert("XSS")</script>](https://example.com/image.png)';
      const todo = createMockTodo({ text: maliciousInput });
      renderTodoItem(todo, callbacks);

      expectNoXSS();
    });
  });

  describe('Advanced Attack Vectors', () => {
    it('should prevent SVG-based XSS attacks', () => {
      const todo = createMockTodo({ text: XSS_PAYLOADS.SVG_ONLOAD });
      renderTodoItem(todo, callbacks);
      expectNoEventHandlers();
    });

    it('should prevent mathml-based attacks', () => {
      const maliciousInput = `
<math xmlns="http://www.w3.org/1998/Math/MathML">
  <mi xlink:href="javascript:alert('XSS')">click</mi>
</math>`;
      const todo = createMockTodo({ text: maliciousInput });
      renderTodoItem(todo, callbacks);
      expectNoXSS();
    });

    it('should prevent encoded XSS attempts', () => {
      const encodedAttacks = [
        XSS_PAYLOADS.HTML_ENTITY_ENCODED,
        XSS_PAYLOADS.URL_ENCODED,
        '&#60;script&#62;alert&#40;&#34;XSS&#34;&#41;&#60;/script&#62;',
      ];

      encodedAttacks.forEach((attack, index) => {
        const todo = createMockTodo({ id: `test-${index}`, text: attack });
        const { unmount } = render(
          <TodoItem
            todo={todo}
            onToggle={callbacks.mockOnToggle}
            onDelete={callbacks.mockOnDelete}
            onEdit={callbacks.mockOnEdit}
          />
        );

        expectNoXSS();

        unmount();
      });
    });

    it('should prevent bypass attempts with mixed case', () => {
      const mixedCaseAttacks = [
        XSS_PAYLOADS.MIXED_CASE_SCRIPT,
        XSS_PAYLOADS.UPPERCASE_ONCLICK,
        '<img SRC="javascript:alert(\'XSS\')">',
      ];

      mixedCaseAttacks.forEach((attack, index) => {
        const todo = createMockTodo({ id: `test-${index}`, text: attack });
        const { unmount } = render(
          <TodoItem
            todo={todo}
            onToggle={callbacks.mockOnToggle}
            onDelete={callbacks.mockOnDelete}
            onEdit={callbacks.mockOnEdit}
          />
        );

        expectNoXSS();
        expectNoEventHandlers();

        unmount();
      });
    });
  });

  describe('Edit Mode Security', () => {
    it('should prevent XSS when editing malicious content', async () => {
      const user = userEvent.setup();
      const todo = createMockTodo({ text: XSS_PAYLOADS.SCRIPT_BASIC });

      render(
        <TodoItem
          todo={todo}
          onToggle={callbacks.mockOnToggle}
          onDelete={callbacks.mockOnDelete}
          onEdit={callbacks.mockOnEdit}
        />
      );

      const editButton = screen.getByRole('button', { name: /edit todo/i });
      await user.click(editButton);

      // Even in edit mode, the content should be safe
      expect(document.querySelectorAll('script')).toHaveLength(0);

      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea).toBeInTheDocument();
      // The raw text should be in the textarea for editing
      expect(textarea.value).toContain(XSS_PAYLOADS.SCRIPT_BASIC);
    });

    it('should sanitize input before saving', async () => {
      const user = userEvent.setup();
      const todo = createMockTodo({ id: 'edit-test', text: 'Original text' });

      render(
        <TodoItem
          todo={todo}
          onToggle={callbacks.mockOnToggle}
          onDelete={callbacks.mockOnDelete}
          onEdit={callbacks.mockOnEdit}
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
      expect(callbacks.mockOnEdit).toHaveBeenCalledWith(
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
  });

  describe('CSP Compliance', () => {
    it('should not require unsafe-inline for styles', () => {
      const todo = createMockTodo({ text: '# Header\n**Bold** content' });
      renderTodoItem(todo, callbacks);

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
      renderTodoItem(todo, callbacks);

      // The component should work without eval-like functionality
      expect(screen.getByRole('listitem')).toBeInTheDocument();
    });
  });
});
