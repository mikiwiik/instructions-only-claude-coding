/**
 * Assertion Helper Utilities for Testing
 *
 * Centralized assertion patterns to reduce duplication in security
 * and component tests. Used extensively in XSS tests (30+ occurrences).
 */

/**
 * Assert that no XSS attack vectors are present in the DOM
 *
 * Checks for common XSS patterns:
 * - <script> tags
 * - javascript: protocol
 * - alert() calls
 * - Script elements in DOM
 *
 * Used in 30+ XSS security tests
 *
 * @example
 * render(<TodoItem todo={todo} {...callbacks} />);
 * expectNoXSS();
 */
export const expectNoXSS = (): void => {
  const bodyHTML = document.body.innerHTML;

  // Check for script tags
  expect(bodyHTML).not.toContain('<script>');
  expect(bodyHTML).not.toContain('<script');
  expect(bodyHTML).not.toContain('</script>');

  // Check for javascript protocol
  expect(bodyHTML).not.toContain('javascript:');

  // Check for alert calls (common XSS payload)
  expect(bodyHTML).not.toContain('alert(');
  expect(bodyHTML).not.toContain('alert("');
  expect(bodyHTML).not.toContain("alert('");

  // Check actual script elements in DOM
  const scriptElements = document.querySelectorAll('script');
  expect(scriptElements).toHaveLength(0);
};

/**
 * Assert that no inline event handlers are present in the DOM
 *
 * Checks for common event handler attributes:
 * - onclick, onmouseover, onload, etc.
 * - onerror (common in image-based XSS)
 * - onfocus, oninput, onchange
 *
 * Used in 20+ XSS security tests
 *
 * @example
 * render(<TodoItem todo={todo} {...callbacks} />);
 * expectNoEventHandlers();
 */
export const expectNoEventHandlers = (): void => {
  const bodyHTML = document.body.innerHTML;

  // Common event handlers that should be stripped
  const dangerousHandlers = [
    'onclick',
    'onmouseover',
    'onmouseout',
    'onload',
    'onerror',
    'onfocus',
    'onblur',
    'oninput',
    'onchange',
    'onsubmit',
    'onkeydown',
    'onkeyup',
    'onkeypress',
  ];

  dangerousHandlers.forEach((handler) => {
    expect(bodyHTML).not.toContain(handler);
  });
};

/**
 * Assert that dangerous HTML elements are not present in the DOM
 *
 * Checks for elements commonly used in XSS attacks:
 * - <iframe>, <object>, <embed>
 * - <meta> refresh redirects
 * - <base> href manipulation
 * - <form> with javascript action
 *
 * Used in 15+ XSS security tests
 *
 * @example
 * render(<TodoItem todo={todo} {...callbacks} />);
 * expectNoDangerousElements();
 */
export const expectNoDangerousElements = (): void => {
  const bodyHTML = document.body.innerHTML;

  // Elements that can be used for XSS
  const dangerousElements = ['<iframe', '<object', '<embed', '<meta', '<base'];

  dangerousElements.forEach((element) => {
    expect(bodyHTML).not.toContain(element);
  });

  // Check DOM directly
  expect(document.querySelectorAll('iframe')).toHaveLength(0);
  expect(document.querySelectorAll('object')).toHaveLength(0);
  expect(document.querySelectorAll('embed')).toHaveLength(0);
};

/**
 * Comprehensive XSS assertion - combines all XSS checks
 *
 * Single function that performs all XSS security assertions:
 * - No script tags or javascript protocol
 * - No inline event handlers
 * - No dangerous HTML elements
 *
 * Use this for comprehensive XSS testing in a single call
 *
 * @example
 * render(<TodoItem todo={todo} {...callbacks} />);
 * expectComprehensiveXSSSafety();
 */
export const expectComprehensiveXSSSafety = (): void => {
  expectNoXSS();
  expectNoEventHandlers();
  expectNoDangerousElements();
};

/**
 * Assert that CSS-based XSS attacks are prevented
 *
 * Checks for CSS injection patterns:
 * - expression() (IE-specific)
 * - url(javascript:...)
 * - @import with javascript
 *
 * Used in 5+ CSS injection tests
 *
 * @example
 * render(<TodoItem todo={todo} {...callbacks} />);
 * expectNoCSSInjection();
 */
export const expectNoCSSInjection = (): void => {
  const bodyHTML = document.body.innerHTML;

  // CSS-based XSS patterns
  expect(bodyHTML).not.toContain('expression(');
  expect(bodyHTML).not.toContain('url(javascript:');
  expect(bodyHTML).not.toContain('@import');
  expect(bodyHTML).not.toContain('-moz-binding');
};

/**
 * Assert that SVG-based XSS attacks are prevented
 *
 * Checks for SVG injection patterns:
 * - <svg> with onload
 * - <animate> with event handlers
 * - <script> inside SVG
 *
 * Used in 5+ SVG injection tests
 *
 * @example
 * render(<TodoItem todo={todo} {...callbacks} />);
 * expectNoSVGInjection();
 */
export const expectNoSVGInjection = (): void => {
  // Check for SVG-based XSS
  const svgElements = document.querySelectorAll('svg');

  svgElements.forEach((svg) => {
    // No onload handlers
    expect(svg.hasAttribute('onload')).toBe(false);

    // No script children
    const scripts = svg.querySelectorAll('script');
    expect(scripts).toHaveLength(0);

    // No animate with event handlers
    const animates = svg.querySelectorAll('animate');
    animates.forEach((animate) => {
      expect(animate.hasAttribute('onbegin')).toBe(false);
      expect(animate.hasAttribute('onend')).toBe(false);
    });
  });
};

// Simple test to satisfy Jest's requirement
describe('Assertion Helpers', () => {
  it('should export assertion helper functions', () => {
    expect(expectNoXSS).toBeDefined();
    expect(expectNoEventHandlers).toBeDefined();
    expect(expectNoDangerousElements).toBeDefined();
    expect(expectComprehensiveXSSSafety).toBeDefined();
    expect(expectNoCSSInjection).toBeDefined();
    expect(expectNoSVGInjection).toBeDefined();
  });
});
