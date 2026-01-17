# E2E Feature Test Template

Use this template when adding a new user-facing feature to ensure the integration is tested
from the start.

## Why This Template Exists

Unit tests verify components in isolation but cannot catch when a component exists but isn't
rendered on the page. This "integration gap" allows bugs to reach production despite 100%
unit test coverage.

**Example from Issue #377**: ShareButton and ShareDialog had passing unit tests, but the
button never appeared on the page because `page.tsx` didn't pass the required prop. This
wasn't caught until manual testing in the Vercel preview.

## The Pattern: Outside-In TDD

1. **Write E2E visibility test FIRST** (before implementing the component)
2. **Run test** - It should FAIL (element not found)
3. **Implement feature** - Component, unit tests, page integration
4. **Run E2E test again** - It should PASS
5. **Add functional E2E tests** - User interactions

## Template

### 1. Visibility Test (Required)

Write this FIRST, before implementing any code.

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for app to load
    await expect(page.getByRole('heading', { name: 'TODO' })).toBeVisible();
  });

  test('feature is visible on page', async ({ page }) => {
    // Replace with actual element selector
    const feature = page.getByRole('button', { name: /feature name/i });
    await expect(feature).toBeVisible();
  });
});
```

### 2. Functionality Tests (Required for interactive features)

Add these after the visibility test passes.

```typescript
test('feature performs primary action', async ({ page }) => {
  // Setup (if needed)
  await page.getByPlaceholder('What needs to be done?').fill('Test item');
  await page.getByRole('button', { name: /add/i }).click();

  // Action
  await page.getByRole('button', { name: /feature/i }).click();

  // Assertion
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('feature completes successfully', async ({ page }) => {
  // Trigger feature
  await page.getByRole('button', { name: /feature/i }).click();

  // Wait for completion
  await expect(page.getByText('Success!')).toBeVisible({ timeout: 10000 });

  // Verify result
  await expect(page.getByRole('textbox', { name: /url/i })).toHaveValue(
    /expected-pattern/
  );
});
```

### 3. Error Handling Tests (Recommended)

```typescript
test('feature shows error state on failure', async ({ page }) => {
  // Mock failure scenario (e.g., network error)
  await page.route('**/api/endpoint', (route) => route.abort());

  // Trigger feature
  await page.getByRole('button', { name: /feature/i }).click();

  // Verify error state
  await expect(page.getByText(/error|failed/i)).toBeVisible();
});
```

### 4. Accessibility Tests (Recommended)

```typescript
test('feature has proper accessibility attributes', async ({ page }) => {
  const feature = page.getByRole('button', { name: /feature/i });

  await expect(feature).toBeVisible();
  await expect(feature).toHaveAttribute('type', 'button');
  await expect(feature).toHaveAccessibleName(/feature/i);
});

test('feature dialog can be closed with keyboard', async ({ page }) => {
  // Open dialog
  await page.getByRole('button', { name: /feature/i }).click();
  await expect(page.getByRole('dialog')).toBeVisible();

  // Close with Escape
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
});
```

## Checklist

Before implementing a new user-facing feature:

- [ ] Created E2E test file in `e2e/tests/`
- [ ] Added visibility test that FAILS (feature doesn't exist yet)
- [ ] Ran test to confirm failure
- [ ] Implemented feature (component, unit tests, page integration)
- [ ] Ran E2E test to confirm visibility test PASSES
- [ ] Added functional E2E tests for user interactions
- [ ] Added error handling tests (if applicable)
- [ ] Added accessibility tests

## Related Documentation

- [Testing Strategy - Integration Gap Anti-Pattern](testing-strategy.md#the-integration-gap-anti-pattern)
- [E2E Testing Guide](e2e-testing-guide.md)
- [Development Workflows - E2E-First](../core/workflows.md#e2e-first-for-user-facing-features)
- [Definition of Done](../development/project-management.md#definition-of-done)
