# Testing Documentation

This directory contains all testing-related documentation for the Todo application.

## Documents

| Document                                                    | Description                                               |
| ----------------------------------------------------------- | --------------------------------------------------------- |
| [Testing Strategy](testing-strategy.md)                     | High-level testing philosophy, pyramid, and quality gates |
| [Testing Guidelines](testing-guidelines.md)                 | Patterns, utilities, security testing, and best practices |
| [Frontend Testing Checklist](frontend-testing-checklist.md) | Implemented features and tool overview                    |
| [E2E Testing Guide](e2e-testing-guide.md)                   | Playwright setup, Page Object Model, and CI integration   |

## Quick Start

```bash
npm test                 # Run unit tests
npm test -- --coverage   # With coverage report
npm run test:e2e         # Run E2E tests
npm run test:e2e:ui      # E2E with visual UI
```

## Related Resources

- [Test Utilities](../../app/__tests__/README.md) - Factory functions, mocks, and assertions
- [ADR-004](../adr/004-test-driven-development-approach.md) - TDD foundation
- [ADR-029](../adr/029-e2e-testing-framework-selection.md) - E2E framework selection
