/**
 * Tests for text sanitization utilities
 * TDD: Tests written first for CodeQL alert #11 (bad HTML filtering regex)
 */

import {
  decodeHtmlEntities,
  sanitizeForAriaLabel,
} from '../../utils/textSanitization';

describe('decodeHtmlEntities', () => {
  it('should decode basic HTML entities', () => {
    expect(decodeHtmlEntities('&lt;script&gt;')).toBe('<script>');
    expect(decodeHtmlEntities('&quot;test&quot;')).toBe('"test"');
    expect(decodeHtmlEntities('&amp;')).toBe('&');
  });

  it('should decode numeric entities', () => {
    expect(decodeHtmlEntities('&#60;')).toBe('<');
    expect(decodeHtmlEntities('&#62;')).toBe('>');
    expect(decodeHtmlEntities('&#34;')).toBe('"');
  });

  it('should decode hex entities', () => {
    expect(decodeHtmlEntities('&#x3c;')).toBe('<');
    expect(decodeHtmlEntities('&#x3e;')).toBe('>');
  });
});

describe('sanitizeForAriaLabel', () => {
  describe('basic sanitization', () => {
    it('should remove script tags', () => {
      const input = '<script>alert(1)</script>';
      const result = sanitizeForAriaLabel(input);
      expect(result).not.toContain('script');
      expect(result).not.toContain('alert');
    });

    it('should remove javascript: protocol', () => {
      const input = 'javascript:alert(1)';
      const result = sanitizeForAriaLabel(input);
      expect(result).toContain('[removed]:');
      expect(result).not.toContain('javascript:');
    });

    it('should remove event handlers', () => {
      const input = 'onclick="alert(1)"';
      const result = sanitizeForAriaLabel(input);
      expect(result).not.toContain('onclick=');
    });
  });

  describe('malformed HTML edge cases (CodeQL alert #11)', () => {
    it('should remove script tags with space in closing tag', () => {
      // Browsers accept </script > as valid
      const input = '<script>alert(1)</script >';
      const result = sanitizeForAriaLabel(input);
      expect(result).not.toContain('alert');
      expect(result).not.toContain('script');
    });

    it('should remove script tags with attributes in closing tag', () => {
      // Browsers accept </script foo="bar"> as valid (parser error but still works)
      const input = '<script>alert(1)</script foo="bar">';
      const result = sanitizeForAriaLabel(input);
      expect(result).not.toContain('alert');
    });

    it('should remove script tags with newline in closing tag', () => {
      const input = '<script>alert(1)</script\n>';
      const result = sanitizeForAriaLabel(input);
      expect(result).not.toContain('alert');
    });

    it('should remove iframe tags with space in closing tag', () => {
      const input = '<iframe src="x">content</iframe >';
      const result = sanitizeForAriaLabel(input);
      expect(result).not.toContain('iframe');
    });

    it('should remove object tags with attributes in closing tag', () => {
      const input = '<object data="x">content</object foo>';
      const result = sanitizeForAriaLabel(input);
      expect(result).not.toContain('object');
    });

    it('should remove embed tags with space in closing tag', () => {
      const input = '<embed src="x"></embed >';
      const result = sanitizeForAriaLabel(input);
      expect(result).not.toContain('embed');
    });

    it('should remove form tags with attributes in closing tag', () => {
      const input = '<form action="x">content</form bar="baz">';
      const result = sanitizeForAriaLabel(input);
      expect(result).not.toContain('form');
    });
  });

  describe('URL encoded attacks', () => {
    it('should handle URL encoded script tags', () => {
      const input = '%3Cscript%3Ealert(1)%3C/script%3E';
      const result = sanitizeForAriaLabel(input);
      expect(result).not.toContain('alert');
    });
  });
});
