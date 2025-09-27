import React from 'react';

/**
 * Markdown utility functions for todo text processing
 * Provides safe markdown detection and rendering with security considerations
 */

/**
 * Detects if text contains markdown syntax using simple heuristics
 * @param text - The text to check for markdown syntax
 * @returns true if markdown syntax is detected, false otherwise
 */
export function hasMarkdownSyntax(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }

  // Common markdown patterns to detect
  const markdownPatterns = [
    /^#{1,6}\s+/m, // Headers (# ## ### etc.)
    /\*\*.*?\*\*/, // Bold (**text**)
    /\*.*?\*/, // Italic (*text*)
    /__.*?__/, // Bold (__text__)
    /_.*?_/, // Italic (_text_)
    /\[.*?\]\(.*?\)/, // Links [text](url)
    /^[\s]*[-*+]\s+/m, // Unordered lists (- * +)
    /^[\s]*\d+\.\s+/m, // Ordered lists (1. 2. etc.)
    /`.*?`/, // Inline code (`code`)
    /^```/m, // Code blocks (```)
    /^>\s+/m, // Blockquotes (>)
    /^\|.*\|/m, // Tables (| col | col |)
    /~~.*?~~/, // Strikethrough (~~text~~)
  ];

  return markdownPatterns.some((pattern) => pattern.test(text));
}

/**
 * Configuration for react-markdown to ensure safe rendering
 * Disallows HTML and potentially dangerous elements
 */
export const markdownConfig = {
  // Disable HTML parsing for security
  disallowedElements: [
    'script',
    'iframe',
    'object',
    'embed',
    'form',
    'input',
    'button',
  ],
  unwrapDisallowed: true,

  // Custom components for styling
  components: {
    // Style headers to match app design
    h1: ({ children, ...props }: React.ComponentPropsWithoutRef<'h1'>) => (
      <h1
        className='text-lg font-bold text-gray-900 dark:text-gray-100 mb-2'
        {...props}
      >
        {children}
      </h1>
    ),
    h2: ({ children, ...props }: React.ComponentPropsWithoutRef<'h2'>) => (
      <h2
        className='text-base font-semibold text-gray-900 dark:text-gray-100 mb-2'
        {...props}
      >
        {children}
      </h2>
    ),
    h3: ({ children, ...props }: React.ComponentPropsWithoutRef<'h3'>) => (
      <h3
        className='text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1'
        {...props}
      >
        {children}
      </h3>
    ),

    // Style lists
    ul: ({ children, ...props }: React.ComponentPropsWithoutRef<'ul'>) => (
      <ul className='list-disc list-inside ml-4 mb-2 space-y-1' {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }: React.ComponentPropsWithoutRef<'ol'>) => (
      <ol className='list-decimal list-inside ml-4 mb-2 space-y-1' {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }: React.ComponentPropsWithoutRef<'li'>) => (
      <li className='text-gray-900 dark:text-gray-100' {...props}>
        {children}
      </li>
    ),

    // Style text formatting
    strong: ({
      children,
      ...props
    }: React.ComponentPropsWithoutRef<'strong'>) => (
      <strong
        className='font-semibold text-gray-900 dark:text-gray-100'
        {...props}
      >
        {children}
      </strong>
    ),
    em: ({ children, ...props }: React.ComponentPropsWithoutRef<'em'>) => (
      <em className='italic text-gray-900 dark:text-gray-100' {...props}>
        {children}
      </em>
    ),

    // Style code
    code: ({ children, ...props }: React.ComponentPropsWithoutRef<'code'>) => (
      <code
        className='bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-1 py-0.5 rounded text-sm font-mono'
        {...props}
      >
        {children}
      </code>
    ),
    pre: ({ children, ...props }: React.ComponentPropsWithoutRef<'pre'>) => (
      <pre
        className='bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-3 rounded-md overflow-x-auto text-sm font-mono mb-2'
        {...props}
      >
        {children}
      </pre>
    ),

    // Style links
    a: ({ children, ...props }: React.ComponentPropsWithoutRef<'a'>) => (
      <a
        className='text-blue-600 dark:text-blue-400 hover:underline'
        target='_blank'
        rel='noopener noreferrer'
        {...props}
      >
        {children}
      </a>
    ),

    // Style blockquotes
    blockquote: ({
      children,
      ...props
    }: React.ComponentPropsWithoutRef<'blockquote'>) => (
      <blockquote
        className='border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-700 dark:text-gray-300 mb-2'
        {...props}
      >
        {children}
      </blockquote>
    ),

    // Style strikethrough
    del: ({ children, ...props }: React.ComponentPropsWithoutRef<'del'>) => (
      <del className='line-through text-gray-500 dark:text-gray-400' {...props}>
        {children}
      </del>
    ),

    // Style paragraphs
    p: ({ children, ...props }: React.ComponentPropsWithoutRef<'p'>) => (
      <p className='text-gray-900 dark:text-gray-100 mb-2 last:mb-0' {...props}>
        {children}
      </p>
    ),
  },
};

// Helper function to decode HTML entities
const decodeHtmlEntities = (text: string): string => {
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
};

/**
 * Sanitizes text to prevent XSS attacks while preserving markdown
 * @param text - The text to sanitize
 * @returns Sanitized text safe for markdown rendering
 */
export function sanitizeMarkdown(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // First decode any URL encoding to catch encoded attacks
  let decoded = text;
  try {
    // Decode multiple times to catch nested encoding
    for (let i = 0; i < 3; i++) {
      const newDecoded = decodeURIComponent(decoded);
      if (newDecoded === decoded) break;
      decoded = newDecoded;
    }
  } catch {
    // If decoding fails, use original text
    decoded = text;
  }

  // Also decode HTML entities
  decoded = decodeHtmlEntities(decoded);

  // Remove potential script tags and other dangerous HTML/JS content
  return decoded
    .replace(/<script[^>]*>.*?<\/script>/gi, '[removed]')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '[removed]')
    .replace(/<object[^>]*>.*?<\/object>/gi, '[removed]')
    .replace(/<embed[^>]*>.*?<\/embed>/gi, '[removed]')
    .replace(/<form[^>]*>.*?<\/form>/gi, '[removed]')
    .replace(/<img[^>]*>/gi, (match) => {
      // Remove dangerous img attributes
      return match
        .replace(/src\s*=\s*["']?data:[^"'>\s]*/gi, 'src="[removed]"')
        .replace(/src\s*=\s*["']?file:[^"'>\s]*/gi, 'src="[removed]"')
        .replace(/src\s*=\s*["']?ftp:[^"'>\s]*/gi, 'src="[removed]"')
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    })
    .replace(/javascript:/gi, '[removed]:')
    .replace(/data:/gi, '[removed]:')
    .replace(/vbscript:/gi, '[removed]:')
    .replace(/file:/gi, '[removed]:')
    .replace(/ftp:/gi, '[removed]:')
    .replace(/on\w+\s*=/gi, '[removed]=')
    .replace(/style\s*=\s*["'][^"']*["']/gi, '[removed]')
    .replace(/alert\s*\(/gi, '[removed](')
    .replace(/eval\s*\(/gi, '[removed](')
    .replace(/document\./gi, '[removed].')
    .replace(/window\./gi, '[removed].')
    .replace(/<svg[^>]*>.*?<\/svg>/gi, '[removed]')
    .replace(/<math[^>]*>.*?<\/math>/gi, '[removed]');
}

/**
 * Common markdown syntax examples for help documentation
 */
export const markdownExamples = [
  {
    category: 'Headers',
    examples: [
      { syntax: '# Header 1', description: 'Large header' },
      { syntax: '## Header 2', description: 'Medium header' },
      { syntax: '### Header 3', description: 'Small header' },
    ],
  },
  {
    category: 'Text Formatting',
    examples: [
      { syntax: '**bold text**', description: 'Bold text' },
      { syntax: '*italic text*', description: 'Italic text' },
      { syntax: '~~strikethrough~~', description: 'Strikethrough text' },
      { syntax: '`inline code`', description: 'Inline code' },
    ],
  },
  {
    category: 'Lists',
    examples: [
      { syntax: '- Item 1\n- Item 2', description: 'Bullet list' },
      { syntax: '1. First\n2. Second', description: 'Numbered list' },
    ],
  },
  {
    category: 'Links & More',
    examples: [
      { syntax: '[Link text](https://example.com)', description: 'Web link' },
      { syntax: '> Quoted text', description: 'Blockquote' },
    ],
  },
];
