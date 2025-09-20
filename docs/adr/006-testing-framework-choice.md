# ADR-006: Choose React Testing Library + Jest for testing

## Status

Accepted

## Context

We need to select testing frameworks and libraries that support our TDD approach. Requirements:
- React component testing capabilities
- Good TypeScript support
- DOM manipulation and user interaction testing
- Mocking capabilities for localStorage and other APIs
- Good developer experience and debugging
- Integration with Next.js build system
- Active maintenance and community support

## Decision

Use Jest as our test runner with React Testing Library for component testing, complemented by user-event for interaction testing.

## Consequences

### Positive
- React Testing Library promotes testing user behavior over implementation details
- Jest provides excellent mocking, snapshots, and assertion capabilities
- Great TypeScript support with @types packages
- Built-in code coverage reporting
- Excellent integration with Next.js and VS Code
- Large community and extensive documentation
- Good performance with parallel test execution
- Rich ecosystem of matchers and utilities

### Negative
- Learning curve for developers used to Enzyme or other testing libraries
- Some complex component interactions may require more setup
- Snapshot testing can create maintenance overhead
- Limited support for testing implementation details when necessary

### Neutral
- Requires setup for testing environment and DOM simulation
- Need to configure custom render functions for providers
- Mock setup required for browser APIs like localStorage

## Alternatives Considered

- **Enzyme**: More implementation-focused testing, less aligned with user behavior
- **Cypress**: Excellent for e2e testing but overkill for unit tests
- **Playwright**: Great for e2e but not ideal for component unit tests
- **Vitest**: Faster than Jest but less mature ecosystem
- **Testing Library variants**: Considered Vue/Angular versions but React variant is most suitable

## References

- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library Guiding Principles](https://testing-library.com/docs/guiding-principles/)
- [Next.js Testing Setup](https://nextjs.org/docs/app/building-your-application/testing/jest)