# Accessibility Requirements

## Standards Compliance

**🚨 MANDATORY**: All features must comply with WCAG 2.2 AA standards.

This document establishes explicit accessibility requirements for the Todo App project, ensuring that all
implementations maintain professional accessibility standards and provide inclusive user experiences.

## Core Requirements

### 1. Touch Targets

- **Minimum Size**: 44px × 44px for all interactive elements
- **Spacing**: Adequate spacing between adjacent interactive elements
- **Visual Feedback**: Clear hover and active states

### 2. Color Contrast

- **Normal Text**: Minimum 4.5:1 contrast ratio
- **Large Text**: Minimum 3:1 contrast ratio (18pt+ or 14pt+ bold)
- **UI Components**: Minimum 3:1 contrast for interactive elements and graphical objects
- **Focus Indicators**: Visible and distinct from default state

### 3. Keyboard Navigation

- **Full Accessibility**: All interactive elements accessible via keyboard
- **Logical Tab Order**: Sequential and intuitive focus order
- **Visible Focus**: Clear 2px focus ring on all focusable elements
- **Keyboard Shortcuts**: Standard conventions (Enter, Space, Escape, Arrow keys)
- **No Keyboard Traps**: Users can navigate away from all components

### 4. Screen Readers

- **Semantic HTML**: Use appropriate HTML5 elements (button, nav, main, etc.)
- **ARIA Implementation**: Complete and accurate ARIA labels, roles, and states
- **Alternative Text**: Descriptive text for all non-text content
- **Live Regions**: Announcements for dynamic content changes
- **Skip Links**: Navigation shortcuts where applicable

### 5. Focus Management

- **Visible Indicators**: 2px focus ring with sufficient contrast
- **Logical Order**: Tab order follows visual layout
- **Dynamic Content**: Focus management during state changes
- **Modal Dialogs**: Focus trapping and restoration

### 6. Alternative Methods

- **Drag-and-Drop Alternatives**: Keyboard/button alternatives required (WCAG 2.2 SC 2.5.7)
- **Time-Based Actions**: Alternatives to time-sensitive interactions
- **Motion Control**: Options to disable or reduce motion

## WCAG 2.2 Success Criteria

### Level A (Required)

#### Perceivable

- **1.1.1 Non-text Content**: All images, icons, and graphical content have text alternatives
- **1.3.1 Info and Relationships**: Structure and relationships conveyed programmatically
- **1.3.2 Meaningful Sequence**: Content order makes sense when linearized
- **1.4.1 Use of Color**: Color not used as only means of conveying information

#### Operable

- **2.1.1 Keyboard**: All functionality available via keyboard
- **2.1.2 No Keyboard Trap**: Focus can move away from all components
- **2.1.4 Character Key Shortcuts**: Single-key shortcuts can be remapped or turned off
- **2.4.1 Bypass Blocks**: Skip navigation mechanisms available
- **2.4.7 Focus Visible**: Keyboard focus indicator visible
- **2.5.1 Pointer Gestures**: Multi-point or path-based gestures have alternatives
- **2.5.2 Pointer Cancellation**: Down-event actions can be aborted or undone
- **2.5.3 Label in Name**: Accessible names match visible labels

#### Understandable

- **3.1.1 Language of Page**: Page language programmatically determined
- **3.2.1 On Focus**: Focus doesn't trigger unexpected context changes
- **3.2.2 On Input**: Input doesn't trigger unexpected context changes

#### Robust

- **4.1.1 Parsing**: HTML properly formed and validated
- **4.1.2 Name, Role, Value**: All UI components have proper accessibility attributes

### Level AA (Required)

#### Perceivable

- **1.4.3 Contrast (Minimum)**: 4.5:1 for text, 3:1 for large text
- **1.4.5 Images of Text**: Use actual text instead of text images
- **1.4.10 Reflow**: Content reflows at 320px without horizontal scrolling
- **1.4.11 Non-text Contrast**: 3:1 contrast for UI components and graphics
- **1.4.12 Text Spacing**: Content adapts to increased text spacing

#### Operable

- **2.4.5 Multiple Ways**: Multiple navigation methods available
- **2.4.6 Headings and Labels**: Descriptive headings and labels
- **2.4.7 Focus Visible**: Focus indicators clearly visible
- **2.5.7 Dragging Movements**: Drag-and-drop has non-dragging alternative (WCAG 2.2)
- **2.5.8 Target Size (Minimum)**: 24px minimum target size (WCAG 2.2)

#### Understandable

- **3.1.2 Language of Parts**: Language of passages programmatically determined
- **3.2.3 Consistent Navigation**: Navigation consistent across pages
- **3.2.4 Consistent Identification**: Same functionality identified consistently
- **3.3.3 Error Suggestion**: Error corrections suggested when possible
- **3.3.4 Error Prevention**: Submissions checked and reversible

#### Robust

- **4.1.3 Status Messages**: Status messages announced to assistive technologies (WCAG 2.1)

## Component-Specific Requirements

### Interactive Elements

**All Buttons:**

- Use semantic `<button>` elements
- Descriptive `aria-label` when text content insufficient
- Proper type attribute (`button`, `submit`, `reset`)
- Disabled state indicated with `aria-disabled`

**Toggle Controls:**

- Use `aria-pressed` for toggle buttons
- Use `aria-checked` for checkboxes
- Clear visual indication of state
- Keyboard activation with Space/Enter

**Form Inputs:**

- Associated `<label>` elements with `for` attribute
- Error messages linked with `aria-describedby`
- Required fields indicated with `aria-required`
- Input purpose identified with `autocomplete`

**Links:**

- Descriptive link text (avoid "click here")
- External links indicated with `aria-label`
- Current page indicated with `aria-current="page"`

### Navigation and Focus

**Focus Indicators:**

- 2px solid outline on focused elements
- Sufficient contrast ratio (minimum 3:1)
- Never remove focus indicators (`outline: none` prohibited)
- Custom focus styles must meet contrast requirements

**Tab Order:**

- Follows logical visual order
- Interactive elements receive focus in expected sequence
- Hidden elements not in tab order (`tabindex="-1"`)
- No positive tabindex values (maintain natural DOM order)

**Skip Links:**

- Provided for bypassing repeated content
- Visible on focus
- Navigate to main content area

**Focus Management:**

- Focus moved to new content in single-page navigation
- Modal dialogs trap focus appropriately
- Focus restored when modals close
- Dynamic content changes announced

### Touch and Mobile

**Touch Targets:**

- Minimum 44px × 44px for all interactive elements
- Adequate spacing (8px minimum) between targets
- Visual feedback on touch/tap
- Support for standard gestures

**Gesture Alternatives:**

- Complex gestures have simple alternatives
- Drag-and-drop has button/keyboard alternatives
- Swipe actions have visible button alternatives
- No single-finger path-based gestures without alternatives

**Responsive Design:**

- Maintains accessibility across all breakpoints
- Content reflows without horizontal scrolling at 320px
- Touch targets remain appropriately sized
- Readability maintained at all zoom levels

### Dynamic Content

**Live Regions:**

- Status updates announced with `aria-live="polite"`
- Urgent notifications use `aria-live="assertive"`
- Relevant regions marked with `aria-relevant`
- Atomic updates indicated with `aria-atomic`

**Loading States:**

- Loading indicators announced to screen readers
- `aria-busy` attribute used during loading
- Focus management during async operations
- Timeout handling with user notification

**Error Messages:**

- Announced immediately to screen readers
- Linked to form fields with `aria-describedby`
- Clear, actionable error descriptions
- Visual and programmatic association

## Testing Requirements

### Manual Testing

**Keyboard Navigation:**

- Tab through entire interface
- Activate all interactive elements with keyboard
- Verify focus visibility and logical order
- Test modal focus trapping and restoration

**Screen Reader Testing:**

- Test with at least one major screen reader (NVDA, JAWS, VoiceOver)
- Verify all content announced correctly
- Check ARIA labels and descriptions
- Test dynamic content announcements

**Color Contrast:**

- Use browser DevTools or contrast checkers
- Verify all text meets minimum ratios
- Check UI component contrast
- Test focus indicator contrast

**Touch Target Size:**

- Verify minimum 44px × 44px for interactive elements
- Check spacing between adjacent targets
- Test on actual mobile devices

### Automated Testing

**ESLint Integration:**

- **⚠️ TO BE IMPLEMENTED**: `eslint-plugin-jsx-a11y` should be added to enforce accessibility rules
- **Current State**: ESLint configured with React and TypeScript rules only
- **Recommended Setup**: Install and configure `eslint-plugin-jsx-a11y` with recommended rules
- **Goal**: Zero accessibility warnings in production code with pre-commit enforcement

**Jest Testing:**

- React Testing Library for component testing
- Test keyboard interactions
- Verify ARIA attributes
- Check semantic HTML structure

**Optional: jest-axe:**

- Automated accessibility testing in Jest
- Catches common WCAG violations
- Integrated into component test suites
- Reports accessibility issues during development

## Development Workflow Integration

### Pre-Implementation

**During Planning:**

- Consider accessibility requirements in task breakdown
- Plan keyboard navigation patterns
- Design for multiple interaction methods
- Document ARIA requirements

**During Design:**

- Verify color contrast in design mockups
- Ensure touch target sizes in layouts
- Plan focus order and indicators
- Consider screen reader announcements

### During Implementation

**TDD Approach:**

```typescript
describe('Component Accessibility', () => {
  it('should meet touch target requirements (44px minimum)', () => {
    // Test implementation
  });

  it('should provide complete keyboard navigation', () => {
    // Test Tab order, Enter/Space activation, Escape handling
  });

  it('should have proper ARIA implementation', () => {
    // Test labels, roles, states
  });

  it('should support screen readers', () => {
    // Test semantic HTML, announcements
  });
});
```

**Implementation Checklist:**

- [ ] Semantic HTML elements used
- [ ] ARIA labels and roles added
- [ ] Keyboard navigation implemented
- [ ] Touch targets sized appropriately
- [ ] Color contrast verified
- [ ] Focus indicators visible
- [ ] Screen reader testing completed

### Pre-Commit

**Quality Gates:**

- ESLint accessibility checks pass
- Manual keyboard testing completed
- ARIA attributes verified
- Touch target sizes confirmed

### Code Review

**Accessibility Review:**

- Verify semantic HTML usage
- Check ARIA implementation
- Test keyboard navigation
- Validate color contrast
- Review touch target sizes

## Tools and Resources

### Browser Extensions

- **WAVE**: Web accessibility evaluation tool
- **axe DevTools**: Automated accessibility testing
- **Lighthouse**: Google's accessibility auditing tool
- **Color Contrast Analyzer**: WCAG contrast checking

### Screen Readers

- **NVDA**: Free Windows screen reader
- **JAWS**: Professional Windows screen reader
- **VoiceOver**: Built-in macOS/iOS screen reader
- **TalkBack**: Built-in Android screen reader

### Testing Libraries

- **React Testing Library**: Accessibility-focused component testing (installed)
- **jest-axe**: Automated WCAG testing in Jest (recommended for future implementation)
- **eslint-plugin-jsx-a11y**: JSX accessibility linting (recommended for future implementation)

### Documentation

- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [MDN Web Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/resources/)

## Common Patterns

### Accessible Button

```tsx
<button
  type='button'
  aria-label='Delete todo item'
  className='min-w-[44px] min-h-[44px]'
  onClick={handleDelete}
>
  <TrashIcon aria-hidden='true' />
</button>
```

### Accessible Toggle

```tsx
<button
  type='button'
  role='switch'
  aria-checked={isComplete}
  aria-label='Mark todo as complete'
  className='min-w-[44px] min-h-[44px]'
  onClick={handleToggle}
>
  {isComplete ? (
    <CheckIcon aria-hidden='true' />
  ) : (
    <CircleIcon aria-hidden='true' />
  )}
</button>
```

### Accessible Form Field

```tsx
<div>
  <label htmlFor='todo-input' className='sr-only'>
    Add new todo
  </label>
  <input
    id='todo-input'
    type='text'
    aria-describedby={error ? 'todo-error' : undefined}
    aria-invalid={!!error}
    className='min-h-[44px]'
  />
  {error && (
    <p id='todo-error' role='alert'>
      {error}
    </p>
  )}
</div>
```

### Accessible Modal

```tsx
<div
  role='dialog'
  aria-modal='true'
  aria-labelledby='dialog-title'
  aria-describedby='dialog-description'
>
  <h2 id='dialog-title'>Confirm Deletion</h2>
  <p id='dialog-description'>Are you sure you want to delete this todo?</p>
  {/* Focus trap implementation */}
</div>
```

## Success Metrics

### Compliance Indicators

- Zero ESLint accessibility warnings
- All components pass keyboard navigation testing
- Screen reader testing confirms proper announcements
- Color contrast ratios meet or exceed WCAG minimums
- Touch targets meet 44px minimum size

### Quality Benchmarks

- 100% of interactive elements keyboard accessible
- 100% of images have alternative text
- All forms have proper labels and error handling
- Focus indicators visible on all interactive elements
- Dynamic content changes properly announced

---

**Implementation Status**: This document establishes the accessibility standards for the Todo App project. All
new features and modifications must comply with these requirements before being considered complete.

**Related Documentation**:

- [ADR-012: Todo Reordering UX Approach](../adr/012-todo-reordering-ux-approach.md) - WCAG 2.2 SC 2.5.7 implementation
- [Definition of Done](../development/project-management.md) - Quality assurance integration
- [CLAUDE.md Task Planning Protocol](../../CLAUDE.md) - AI development integration
