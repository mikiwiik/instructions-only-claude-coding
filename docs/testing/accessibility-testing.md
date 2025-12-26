# Accessibility Testing

This document covers accessibility testing for the Todo application.

For accessibility requirements and WCAG standards, see [Accessibility Requirements](../ux/accessibility-requirements.md).

## Implementation Status

| Testing Method                | Status             | Enforcement     |
| ----------------------------- | ------------------ | --------------- |
| ESLint jsx-a11y               | ✅ Implemented     | Pre-commit + CI |
| React Testing Library queries | ✅ Implemented     | In test suite   |
| Keyboard navigation tests     | ✅ Implemented     | In test suite   |
| jest-axe                      | ❌ Not implemented | -               |
| Screen reader testing         | ❌ Not implemented | -               |
| Color contrast verification   | ❌ Not implemented | -               |

---

## Currently Implemented

### ESLint jsx-a11y

Static accessibility linting catches issues at development time.

**Configuration** (`eslint.config.mjs`):

```javascript
import jsxA11y from 'eslint-plugin-jsx-a11y';

{
  files: ['**/*.{js,jsx,ts,tsx}'],
  plugins: { 'jsx-a11y': jsxA11y },
  rules: jsxA11y.configs.recommended.rules,
}
```

**What it catches:**

- Missing alt text on images
- Invalid ARIA attributes
- Missing form labels
- Incorrect role usage
- Non-interactive elements with click handlers

**Enforcement:**

- Pre-commit hooks via Husky/lint-staged
- CI pipeline (`npm run lint`)

### React Testing Library Queries

Tests use accessibility-focused queries that verify semantic HTML:

```typescript
// Preferred: queries that reflect accessibility tree
screen.getByRole('button', { name: /delete/i });
screen.getByRole('checkbox', { name: /complete/i });
screen.getByLabelText('Add new todo');

// Avoid: queries that bypass accessibility
screen.getByTestId('delete-button'); // Last resort only
```

**Query Priority:**

1. `getByRole` - Accessibility tree (preferred)
2. `getByLabelText` - Form controls
3. `getByPlaceholderText` - Forms only
4. `getByText` - Non-interactive content
5. `getByTestId` - Last resort

### Keyboard Navigation Tests

Component tests verify keyboard accessibility:

```typescript
it('should be keyboard accessible', async () => {
  const user = userEvent.setup();
  render(<MyComponent />);

  const button = screen.getByRole('button', { name: /submit/i });
  button.focus();
  expect(button).toHaveFocus();

  await user.keyboard('{Enter}');
  expect(mockOnSubmit).toHaveBeenCalled();
});

it('should have proper ARIA attributes', () => {
  render(<MyComponent isOpen={true} />);

  const dialog = screen.getByRole('dialog');
  expect(dialog).toHaveAttribute('aria-modal', 'true');
  expect(dialog).toHaveAttribute('aria-labelledby');
});
```

---

## Not Implemented (Future Enhancements)

### jest-axe - Automated WCAG Testing

Automated accessibility violation detection in Jest tests.

**To implement:**

```bash
npm install --save-dev jest-axe @types/jest-axe
```

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should have no accessibility violations', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

**Benefits:** Catches WCAG violations automatically in CI.

### Screen Reader Testing

Manual testing with assistive technology.

**Tools:**

| Platform | Screen Reader       |
| -------- | ------------------- |
| macOS    | VoiceOver (Cmd+F5)  |
| Windows  | NVDA (free) or JAWS |
| iOS      | VoiceOver           |
| Android  | TalkBack            |

**What to verify:**

- All content announced correctly
- ARIA labels read as expected
- Dynamic content changes announced
- Form errors associated with fields

### Color Contrast Verification

Manual verification of WCAG contrast requirements.

**Tools:**

- Chrome DevTools (Accessibility panel)
- [WAVE Extension](https://wave.webaim.org/extension/)
- [axe DevTools](https://www.deque.com/axe/devtools/)

**Requirements:**

- Normal text: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum
- UI components: 3:1 minimum

### Touch Target Size Verification

Manual verification of 44px × 44px minimum for interactive elements.

**How to check:** Inspect element dimensions in browser DevTools.

---

## Checklist for New Components

- [ ] Uses semantic HTML elements (`button`, `nav`, `main`, etc.)
- [ ] Has descriptive `aria-label` where text content is insufficient
- [ ] Keyboard navigation works (Tab, Enter, Space, Escape)
- [ ] Focus is visible and follows logical order
- [ ] Touch targets are 44px × 44px minimum
- [ ] Color contrast meets WCAG AA (4.5:1 text, 3:1 UI)
- [ ] Screen reader announces content correctly

## Resources

- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [MDN Web Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Testing Library Queries](https://testing-library.com/docs/queries/about#priority)
- [Accessibility Requirements](../ux/accessibility-requirements.md)
