# E2E Testing Guide

This guide explains how to write and run end-to-end (E2E) tests for the Todo application using Playwright.

## Quick Start

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI mode (recommended for development)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

## Test Structure

E2E tests are organized in the `e2e/` directory:

```text
e2e/
├── pages/
│   └── todo-page.ts        # Page Object Model
└── tests/
    ├── add-todo.spec.ts    # Add todo tests
    ├── complete-todo.spec.ts # Complete/toggle tests
    └── persistence.spec.ts # Data persistence tests
```

## Page Object Model

The `TodoPage` class (`e2e/pages/todo-page.ts`) provides reusable methods for interacting with the todo
application:

```typescript
import { TodoPage } from '../pages/todo-page';

test('example', async ({ page }) => {
  const todoPage = new TodoPage(page);
  await todoPage.goto();
  await todoPage.addTodo('My task', 'enter');
  await todoPage.completeTodo('My task');
});
```

### Key Methods

- `goto()` - Navigate to the application
- `addTodo(text, method)` - Add a todo ('enter' or 'button')
- `completeTodo(text)` - Toggle todo completion
- `isTodoCompleted(text)` - Check if todo is completed
- `getTodoItems()` - Get all todo items
- `getTodoByText(text)` - Get specific todo by text
- `clearLocalStorage()` - Clear local storage (use in beforeEach)

## Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { TodoPage } from '../pages/todo-page';

test.describe('Feature Name', () => {
  let todoPage: TodoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.clearLocalStorage();
    await todoPage.goto();
  });

  test('should do something', async () => {
    // Arrange
    await todoPage.addTodo('Test todo');

    // Act
    await todoPage.completeTodo('Test todo');

    // Assert
    expect(await todoPage.isTodoCompleted('Test todo')).toBe(true);
  });
});
```

### Best Practices

1. **Clear Local Storage**: Always clear localStorage in `beforeEach` to ensure test isolation
2. **Use Page Object Methods**: Prefer `todoPage.addTodo()` over direct element interactions
3. **Descriptive Names**: Test names should clearly describe the behavior being tested
4. **Arrange-Act-Assert**: Follow AAA pattern for test structure
5. **Wait for Elements**: Playwright auto-waits, but be explicit when needed
6. **Independent Tests**: Each test should be runnable in isolation

## Configuration

Playwright configuration is in `playwright.config.ts`:

- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Base URL**: `http://localhost:3000`
- **Retries**: 2 on CI, 0 locally
- **Workers**: 1 on CI, 4 locally
- **Screenshots**: On failure
- **Videos**: On retry
- **Trace**: On first retry

## CI/CD Integration

E2E tests run automatically in GitHub Actions after the build job completes:

1. Chromium browser is installed
2. Tests run with `npm run test:e2e`
3. Playwright report uploaded as artifact (available for 30 days)
4. Test results uploaded as artifact

View reports in GitHub Actions artifacts after test completion.

## Debugging Tests

### UI Mode (Recommended)

```bash
npm run test:e2e:ui
```

Features:

- Visual test runner
- Time travel debugging
- Watch mode
- Pick locators

### Headed Mode

```bash
npm run test:e2e:headed
```

See the browser while tests run.

### Debug Mode

```bash
npm run test:e2e:debug
```

Step through tests with Playwright Inspector.

## Test Coverage

Current E2E tests cover:

### Tier 1 - Critical Paths (Implemented)

- ✅ Add todo (Enter + button)
- ✅ Complete todo (checkbox toggle)
- ✅ Data persistence (reload page)

### Tier 2 - Standard Features (Future)

- ⏳ Edit todo
- ⏳ Delete todo (soft delete)
- ⏳ Undo completion
- ⏳ Filter functionality (All, Active, Completed)

### Tier 3 - Extended Features (Future)

- ⏳ Activity timeline
- ⏳ Recently Deleted
- ⏳ Markdown rendering
- ⏳ Responsive design validation

## Troubleshooting

### Tests Fail Locally

1. **Clear browser cache**: `npx playwright install --with-deps chromium`
2. **Check server**: Ensure dev server is running or build is available
3. **Check localhost**: Verify `http://localhost:3000` is accessible

### Flaky Tests

1. **Add explicit waits**: Use `await expect(element).toBeVisible()`
2. **Increase timeout**: Use `test.setTimeout(60000)` for slow tests
3. **Check timing**: Ensure proper ordering of async operations

### CI Failures

1. **Check artifacts**: Download Playwright report from GitHub Actions
2. **Screenshots**: View failure screenshots in artifacts
3. **Trace**: Download trace files and open in Playwright Trace Viewer

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [ADR-029: E2E Testing Framework Selection](../adr/029-e2e-testing-framework-selection.md)
- [Next.js + Playwright Guide](https://nextjs.org/docs/app/building-your-application/testing/playwright)
