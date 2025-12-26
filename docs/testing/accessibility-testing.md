# Accessibility Testing

This document covers how to test accessibility compliance in the Todo application.

For accessibility requirements and WCAG standards, see [Accessibility Requirements](../ux/accessibility-requirements.md).

## Automated Testing

### ESLint jsx-a11y (Implemented)

The project uses `eslint-plugin-jsx-a11y` with the recommended ruleset for static accessibility linting.

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

### React Testing Library (Implemented)

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

## Manual Testing

### Keyboard Navigation

Test all interactive elements are keyboard accessible:

1. **Tab through interface** - Verify logical focus order
2. **Activate elements** - Enter/Space for buttons, checkboxes
3. **Escape key** - Closes modals and dialogs
4. **Arrow keys** - Navigation within components
5. **Focus visibility** - Clear 2px focus ring on all elements

### Screen Reader Testing

Test with at least one screen reader:

| Platform | Screen Reader                |
| -------- | ---------------------------- |
| macOS    | VoiceOver (built-in, Cmd+F5) |
| Windows  | NVDA (free) or JAWS          |
| iOS      | VoiceOver                    |
| Android  | TalkBack                     |

**Verify:**

- All content announced correctly
- ARIA labels read as expected
- Dynamic content changes announced
- Form errors associated with fields

### Color Contrast

Use browser DevTools or dedicated tools:

- Chrome DevTools (Accessibility panel)
- [WAVE Extension](https://wave.webaim.org/extension/)
- [axe DevTools](https://www.deque.com/axe/devtools/)

**Requirements:**

- Normal text: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum
- UI components: 3:1 minimum

### Touch Target Size

Verify 44px × 44px minimum for all interactive elements:

```bash
# In browser DevTools, inspect element dimensions
# Or use the "Inspect accessibility properties" feature
```

## Writing Accessibility Tests

### Component Test Pattern

```typescript
describe('Component Accessibility', () => {
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

  it('should announce dynamic content', async () => {
    render(<MyComponent />);

    // Trigger action that shows status message
    await userEvent.click(screen.getByRole('button'));

    // Verify live region exists
    expect(screen.getByRole('status')).toHaveTextContent('Saved');
  });
});
```

### Checklist for New Components

- [ ] Uses semantic HTML elements (`button`, `nav`, `main`, etc.)
- [ ] Has descriptive `aria-label` where text content is insufficient
- [ ] Keyboard navigation works (Tab, Enter, Space, Escape)
- [ ] Focus is visible and follows logical order
- [ ] Touch targets are 44px × 44px minimum
- [ ] Color contrast meets WCAG AA (4.5:1 text, 3:1 UI)
- [ ] Screen reader announces content correctly

## Future Enhancement: jest-axe

For automated WCAG violation detection, consider adding `jest-axe`:

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

This is not currently implemented but is recommended for comprehensive automated testing.

## Resources

- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [MDN Web Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Testing Library Queries](https://testing-library.com/docs/queries/about#priority)
- [Accessibility Requirements](../ux/accessibility-requirements.md)
