import { test, expect } from '@playwright/test';
import { TodoPage } from '../pages/todo-page';

/**
 * Bug Reproduction Attempt: New Todos Don't React to Initial Reorder Request
 *
 * Issue: #405 (part of Epic #397 - LexoRank Optimization)
 *
 * This test suite attempts to reproduce the production bug where newly added
 * todos don't respond to initial reorder button clicks.
 *
 * Root cause hypothesis: Stale closure in React hooks - the moveUp/moveDown
 * callbacks reference an old todos array until React re-renders.
 *
 * **Current Status**: Tests PASS in E2E environment
 *
 * This means the bug is either:
 * 1. Timing-sensitive beyond what E2E can reliably capture
 * 2. Dependent on production network conditions not present locally
 * 3. Related to Vercel Edge Runtime behavior vs local development
 *
 * These tests remain valuable as **regression tests** for the LexoRank
 * implementation to ensure reordering works correctly after the fix.
 */
test.describe('Reorder Race Condition (#405)', () => {
  let todoPage: TodoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
    await page.waitForLoadState('networkidle');
    await todoPage.resetTestData();
    await todoPage.clearLocalStorage();
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('should reorder newly added todo immediately after creation', async ({
    page,
  }) => {
    /**
     * This test attempts to reproduce the bug:
     * 1. Add an existing todo (so we have something to reorder against)
     * 2. Add a NEW todo
     * 3. Immediately click moveDown on the new todo (without waiting for network)
     * 4. Verify the reorder happened
     *
     * If the bug exists, the new todo won't move because the callback
     * references the old todos array that doesn't include the new todo.
     */

    // Add first todo and wait for it to be fully synced
    await todoPage.addTodo('Existing todo');
    await page.waitForLoadState('networkidle');

    // Add a new todo - use addTodoFast to minimize wait time
    await todoPage.addTodoFast('New todo');

    // Immediately try to move the new todo down (it should be at index 0)
    // Don't wait for network - we want to catch the race condition
    await todoPage.moveTodoDown('New todo');

    // Wait a moment for the reorder to take effect
    await page.waitForTimeout(500);

    // Get the current order
    const items = await todoPage.getTodoItems();
    const count = await items.count();

    expect(count).toBe(2);

    // Check the order - if reorder worked, "Existing todo" should be first
    const firstItemText = await items.nth(0).textContent();
    const secondItemText = await items.nth(1).textContent();

    // The new todo should have moved down to position 1
    expect(firstItemText).toContain('Existing todo');
    expect(secondItemText).toContain('New todo');
  });

  test('should handle rapid add-then-reorder sequence', async ({ page }) => {
    /**
     * More aggressive test: add and immediately reorder without any waits
     */

    // Add first todo
    await todoPage.addTodo('First');
    await page.waitForLoadState('networkidle');

    // Rapid sequence: add second todo and immediately try to reorder
    await todoPage.todoInput.fill('Second');
    await todoPage.todoInput.press('Enter');

    // Wait only for element to appear, then immediately click reorder
    await page.getByRole('listitem').filter({ hasText: 'Second' }).waitFor();
    await todoPage.moveTodoDown('Second');

    // Give time for any async operations
    await page.waitForTimeout(500);

    // Verify order
    const items = await todoPage.getTodoItems();
    expect(await items.count()).toBe(2);

    // Second should have moved down
    const firstItem = await items.nth(0).textContent();
    expect(firstItem).toContain('First');
  });

  test('should handle multiple rapid reorders on new todo', async ({
    page,
  }) => {
    /**
     * Test multiple rapid reorders on a newly added todo
     */

    // Add three todos with unique names
    await todoPage.addTodo('Alpha');
    await todoPage.addTodo('Beta');
    await page.waitForLoadState('networkidle');

    // Add new todo Gamma (will be at top: Gamma, Beta, Alpha)
    await todoPage.addTodoFast('Gamma');

    // Try to move Gamma down twice rapidly (Gamma should go from 0 -> 1 -> 2)
    await todoPage.moveTodoDown('Gamma');
    await page.waitForTimeout(100); // Small wait between clicks
    await todoPage.moveTodoDown('Gamma');

    // Wait for operations to complete
    await page.waitForTimeout(500);

    // Verify Gamma moved to the bottom
    const items = await todoPage.getTodoItems();
    expect(await items.count()).toBe(3);

    const lastItem = await items.nth(2).textContent();
    expect(lastItem).toContain('Gamma');
  });

  test('existing todos should reorder correctly', async ({ page }) => {
    /**
     * Control test: verify reordering works for todos that existed before
     * the test started (not newly added in this session)
     */

    // Add todos and ensure they're fully synced
    await todoPage.addTodo('First');
    await todoPage.addTodo('Second');
    await todoPage.addTodo('Third');
    await page.waitForLoadState('networkidle');

    // Order is: Third, Second, First (newest at top)
    // Move Third down
    await todoPage.moveTodoDown('Third');

    await page.waitForTimeout(300);

    // Verify Third moved down
    const items = await todoPage.getTodoItems();
    const firstItem = await items.nth(0).textContent();
    expect(firstItem).toContain('Second');
  });
});
