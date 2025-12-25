/**
 * Text sanitization utilities for XSS prevention
 * Extracted from TodoItem.tsx to reduce component length (ADR-027 compliance)
 */

/**
 * Decodes HTML entities in text
 */
export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#34;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#40;/gi, '(')
    .replace(/&#41;/gi, ')')
    .replace(/&#60;/gi, '<')
    .replace(/&#62;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&#(\d+);/gi, (match, dec) =>
      String.fromCharCode(parseInt(dec, 10))
    )
    .replace(/&#x([0-9a-f]+);/gi, (match, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    );
}

/**
 * Sanitizes text for use in aria-labels and dialog messages
 * Prevents XSS by removing dangerous patterns
 */
export function sanitizeForAriaLabel(text: string): string {
  // First decode any URL encoding and HTML entities to catch encoded attacks
  let decoded: string;
  try {
    decoded = decodeURIComponent(text);
  } catch {
    // If decoding fails, use original text
    decoded = text;
  }

  // Also decode HTML entities
  decoded = decodeHtmlEntities(decoded);

  // Note: Using [^<]* instead of .*? to prevent ReDoS (S5852)
  // Using [^>]* in closing tags handles malformed HTML like </script > (CodeQL js/bad-tag-filter)
  // [^>]* alone matches whitespace and attributes without backtracking ambiguity
  return decoded
    .replace(/<script[^>]*>[^<]*<\/script[^>]*>/gi, '[removed]')
    .replace(/<iframe[^>]*>[^<]*<\/iframe[^>]*>/gi, '[removed]')
    .replace(/<object[^>]*>[^<]*<\/object[^>]*>/gi, '[removed]')
    .replace(/<embed[^>]*>[^<]*<\/embed[^>]*>/gi, '[removed]')
    .replace(/<form[^>]*>[^<]*<\/form[^>]*>/gi, '[removed]')
    .replace(/javascript:/gi, '[removed]:')
    .replace(/data:/gi, '[removed]:')
    .replace(/vbscript:/gi, '[removed]:')
    .replace(/file:/gi, '[removed]:')
    .replace(/ftp:/gi, '[removed]:')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '[removed]')
    .replace(/on\w+\s*=/gi, '[removed]=')
    .replace(/style\s*=\s*["'][^"']*["']/gi, '[removed]')
    .replace(/alert\s*\(/gi, '[removed](')
    .replace(/eval\s*\(/gi, '[removed](')
    .replace(/document\./gi, '[removed].')
    .replace(/window\./gi, '[removed].')
    .replace(/[<>]/g, '')
    .trim();
}
