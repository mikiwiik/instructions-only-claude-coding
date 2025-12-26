# Testing Strategy

This document defines the testing philosophy, hierarchy, and quality gates for the Todo application.

## Testing Philosophy

### Test-Driven Development (TDD)

All feature development follows the TDD cycle:

1. **Red**: Write a failing test that defines expected behavior
2. **Green**: Write minimal code to make the test pass
3. **Refactor**: Improve code quality while maintaining green tests

TDD ensures testable design, comprehensive coverage, and faster feedback loops.

### User Behavior Focus

Tests verify what users experience, not implementation details:

```typescript
// Preferred: Test user-visible behavior
expect(screen.getByRole('textbox')).toBeInTheDocument();

// Avoid: Test internal state
expect(component.state.isEditing).toBe(true);
```

Query priority follows React Testing Library recommendations:

1. `getByRole` - Accessibility-focused (preferred)
2. `getByLabelText` - Form controls
3. `getByPlaceholderText` - Forms only
4. `getByText` - Non-interactive content
5. `getByTestId` - Last resort

## Testing Pyramid

```text
        /\
       /  \
      / E2E \        ← Few, slow, high confidence
     /------\
    /        \
   /Integration\     ← Moderate, test user flows
  /------------\
 /              \
/     Unit       \   ← Many, fast, isolated
------------------
```

### Unit Tests (Jest + React Testing Library)

**Purpose**: Test isolated components, hooks, and utilities

**Coverage Target**: 90%+ for business logic, 80% overall

**Location**: `app/__tests__/`

**When to use**:

- Component rendering and interactions
- Hook behavior
- Utility functions
- Type validation
- Security (XSS prevention)

### Integration Tests

**Purpose**: Test component interactions and user flows

**Location**: `app/__tests__/integration/`

**When to use**:

- Multi-component workflows
- State management flows
- Form submission cycles
- Data synchronization

### E2E Tests (Playwright)

**Purpose**: Test complete user journeys in real browser

**Location**: `e2e/`

**When to use**:

- Critical user paths (add, complete, delete todos)
- Cross-browser compatibility
- Data persistence verification
- Full application flows

See [E2E Testing Guide](e2e-testing-guide.md) for details.

## Coverage Requirements

| Metric           | Threshold       | Enforcement             |
| ---------------- | --------------- | ----------------------- |
| Overall coverage | 80% minimum     | Jest                    |
| Critical paths   | 90%+            | Manual review           |
| XSS prevention   | 100%            | Required for user input |
| Accessibility    | Zero violations | jest-axe                |

Run coverage: `npm test -- --coverage`

## Quality Gates

### Pre-commit (Husky + lint-staged)

- ESLint on staged files
- Prettier formatting
- TypeScript compilation

### CI Pipeline (GitHub Actions)

All PRs must pass:

| Check      | Command                            | Requirement       |
| ---------- | ---------------------------------- | ----------------- |
| Tests      | `npm test`                         | All pass          |
| Coverage   | Jest thresholds                    | 80%+              |
| Types      | `npm run type-check`               | Zero errors       |
| Lint       | `npm run lint -- --max-warnings 1` | ≤1 warning        |
| E2E        | `npm run test:e2e`                 | All pass          |
| SonarCloud | Automatic scan                     | Quality gate pass |

### SonarCloud Quality Gate

[SonarCloud][sonarcloud-dashboard] provides additional code quality analysis:

[sonarcloud-dashboard]: https://sonarcloud.io/project/overview?id=mikiwiik_instructions-only-claude-coding

| Metric               | Threshold                |
| -------------------- | ------------------------ |
| Bugs                 | 0 (A rating)             |
| Vulnerabilities      | 0 (A rating)             |
| Code Smells          | Maintainability A rating |
| Coverage             | 80% on new code          |
| Duplications         | < 3% on new code         |
| Cognitive Complexity | ≤15 per function         |

**What SonarCloud catches:**

- Security vulnerabilities (OWASP Top 10)
- Bug patterns and code smells
- Cognitive complexity violations
- Code duplication
- Coverage gaps on new code

**Configuration:** See [SonarCloud Setup](../setup/sonarcloud-setup.md) and `sonar-project.properties`

### Definition of Done

A feature is complete when:

- [ ] All tests pass
- [ ] Coverage meets thresholds
- [ ] No ESLint errors or warnings
- [ ] Accessibility tests pass
- [ ] Type checking passes
- [ ] Security tests pass (if handling user input)

## Testing Documentation

| Document                                                    | Purpose                               |
| ----------------------------------------------------------- | ------------------------------------- |
| [Testing Guidelines](testing-guidelines.md)                 | Patterns, utilities, security testing |
| [Frontend Testing Checklist](frontend-testing-checklist.md) | Tool overview, implemented features   |
| [E2E Testing Guide](e2e-testing-guide.md)                   | Playwright setup and patterns         |
| [Test Utilities](../../app/__tests__/README.md)             | Factory functions, mocks, assertions  |

## Quick Reference

### Run Tests

```bash
npm test                    # Run all unit tests
npm test -- --watch         # Watch mode
npm test -- --coverage      # With coverage report
npm run test:e2e            # Run E2E tests
npm run test:e2e:ui         # E2E with visual UI
```

### Test Utilities

Always use project utilities instead of manual implementations:

```typescript
import { createMockTodo } from '../utils/test-utils';
import {
  createMockCallbacks,
  clearMockCallbacks,
} from '../utils/mock-callbacks';
import { renderTodoItem } from '../utils/render-helpers';
import { expectNoXSS } from '../utils/assertion-helpers';
import { TEST_UUIDS, XSS_PAYLOADS } from '../fixtures/test-constants';
```

See [Testing Guidelines](testing-guidelines.md) for comprehensive patterns and examples.

## Related ADRs

- [ADR-004](../adr/004-test-driven-development-approach.md) - TDD foundation
- [ADR-009](../adr/009-pre-commit-linting-strategy.md) - Pre-commit enforcement
- [ADR-026](../adr/026-security-scanning-ci-cd-pipeline.md) - SonarCloud integration
- [ADR-027](../adr/027-code-complexity-standards.md) - Complexity standards
- [ADR-029](../adr/029-e2e-testing-framework-selection.md) - E2E framework selection
