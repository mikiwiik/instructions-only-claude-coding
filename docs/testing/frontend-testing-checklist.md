# Frontend Testing Checklist

This document describes the frontend testing infrastructure and implemented features for the Todo App.

For high-level testing philosophy and quality gates, see [Testing Strategy](testing-strategy.md).

## Integrated Testing Tools

The following tools are integrated into the project's CI/CD pipeline:

- **ESLint jsx-a11y** - Accessibility linting during development and CI
- **SonarCloud** - Code quality, coverage analysis, and complexity metrics
- **Jest + React Testing Library** - Component and integration testing (90% coverage threshold)
- **Playwright** - E2E testing (Chromium in CI; full browser matrix locally)

For E2E testing details, see [E2E Testing Guide](e2e-testing-guide.md).

---

## Responsive Design

The app uses Tailwind CSS breakpoints throughout:

| Breakpoint | Width        | Layout                                   |
| ---------- | ------------ | ---------------------------------------- |
| Mobile     | 320px-767px  | Single column, stacked forms, compact UI |
| Tablet     | 768px-1023px | Responsive spacing, horizontal forms     |
| Desktop    | 1024px+      | Full layout, hover states, expanded UI   |

Key responsive classes used: `md:`, `lg:`, `sm:` prefixes on spacing, layout, and visibility.

See [Layout & Spacing Reference](../ux/layout-and-spacing-reference.md) for detailed breakpoint specifications.

---

## Touch and Gesture Support

Implemented gestures (with `GestureHint` UI for discovery):

| Gesture     | Action            | Implementation              |
| ----------- | ----------------- | --------------------------- |
| Swipe right | Toggle completion | `useSwipeGesture.ts`        |
| Swipe left  | Delete todo       | `useSwipeGesture.ts`        |
| Long press  | Enter edit mode   | `useLongPress.ts`           |
| Drag & drop | Reorder todos     | `useTodoItemDragAndDrop.ts` |

All touch targets meet 44px minimum (WCAG AAA).

---

## Accessibility (WCAG 2.1 AA)

Implemented accessibility features:

| Feature             | Implementation                                       |
| ------------------- | ---------------------------------------------------- |
| ARIA labels         | All interactive elements have descriptive labels     |
| Focus traps         | Dialogs trap focus (`useFocusTrap.ts`)               |
| Keyboard navigation | Tab, Escape, Enter support throughout                |
| Screen reader       | Landmark roles, reading order, dynamic announcements |
| Touch targets       | 44px minimum on all buttons and interactive elements |
| Color contrast      | Enforced via ESLint jsx-a11y                         |

See [Accessibility Requirements](../ux/accessibility-requirements.md) for full guidelines.

---

## Edge Cases (Tested via Jest)

The following edge cases are covered by unit/integration tests:

- **XSS Prevention** - 40+ attack vectors tested (`XSS_PAYLOADS` in test fixtures)
- **Very Long Text** - Text wrapping and overflow handling
- **Empty States** - Proper display when no todos exist
- **Special Characters** - Unicode and emoji support
- **Rapid Interactions** - Debouncing and state management

See [Testing Guidelines](testing-guidelines.md) for test utility usage.
