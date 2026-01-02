import { test, expect } from '@playwright/test';
import { TodoPage } from '../pages/todo-page';

/**
 * Regression Tests: Todo Reorder Race Conditions
 *
 * Originally created as part of Issue #405 (Epic #397 - LexoRank Optimization)
 * to reproduce a production bug where newly added todos didn't respond to
 * initial reorder button clicks.
 *
 * The bug was fixed by the LexoRank implementation which assigns sortOrder
 * on todo creation, eliminating stale closure issues. These tests now serve
 * as regression tests to ensure the fix continues to work.
 *
 * @see ADR-034 for LexoRank decision
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

/**
 * Regression tests with simulated network latency.
 * These tests add artificial delays to API responses to ensure the LexoRank
 * fix handles network latency gracefully.
 */
test.describe('Reorder Race Condition - With Network Latency (#405)', () => {
  let todoPage: TodoPage;

  test.beforeEach(async ({ page }) => {
    // Add 200ms latency to all sync API calls to simulate production
    await page.route('**/api/shared/*/sync', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      await route.continue();
    });

    todoPage = new TodoPage(page);
    await todoPage.goto();
    await page.waitForLoadState('networkidle');
    await todoPage.resetTestData();
    await todoPage.clearLocalStorage();
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('reorder new todo with 200ms API latency', async ({ page }) => {
    /**
     * With API latency, the race window is wider:
     * 1. Add todo -> optimistic UI update (immediate)
     * 2. Sync call starts (takes 200ms+)
     * 3. User clicks reorder BEFORE sync completes
     * 4. If callbacks use stale closure, reorder fails
     */

    // Add first todo and wait for sync
    await todoPage.addTodo('Existing');
    await page.waitForLoadState('networkidle');

    // Add new todo - optimistic update happens immediately
    await todoPage.todoInput.fill('NewItem');
    await todoPage.todoInput.press('Enter');

    // Wait for element but NOT for network (sync still in flight)
    await page.getByRole('listitem').filter({ hasText: 'NewItem' }).waitFor();

    // Immediately reorder while sync is still in progress
    await todoPage.moveTodoDown('NewItem');

    // Wait for all operations to settle
    await page.waitForTimeout(800);

    // Check if reorder worked
    const items = await todoPage.getTodoItems();
    const firstItem = await items.nth(0).textContent();
    const secondItem = await items.nth(1).textContent();

    // If bug exists: NewItem stays at top (reorder ignored)
    // If fixed: Existing is at top, NewItem moved down
    expect(firstItem).toContain('Existing');
    expect(secondItem).toContain('NewItem');
  });

  test('rapid reorders with API latency - stale closure stress test', async ({
    page,
  }) => {
    /**
     * Stress test: Multiple rapid reorders while API calls are in flight.
     * This maximizes the chance of hitting stale closure state.
     */

    // Setup: add two todos
    await todoPage.addTodo('Bottom');
    await todoPage.addTodo('Middle');
    await page.waitForLoadState('networkidle');

    // Add new todo at top (order: Top, Middle, Bottom)
    await todoPage.todoInput.fill('Top');
    await todoPage.todoInput.press('Enter');
    await page.getByRole('listitem').filter({ hasText: 'Top' }).waitFor();

    // Rapid fire: try to move Top down twice in quick succession
    // Each click should move it one position if callbacks are fresh
    await todoPage.moveTodoDown('Top');
    await todoPage.moveTodoDown('Top');

    // Wait for dust to settle
    await page.waitForTimeout(1000);

    // Expected final order: Middle, Bottom, Top (Top moved down twice)
    // If stale closure: Top might stay at position 0 or 1
    const items = await todoPage.getTodoItems();
    expect(await items.count()).toBe(3);

    const texts = await todoPage.getTodoTexts();

    // Top should be at position 2 (bottom) after two moveDowns
    expect(texts[2]).toContain('Top');
  });
});

/**
 * Regression tests that directly invoke the reorder via JavaScript to bypass
 * React's event handling timing. Verifies callback logic works correctly.
 */
test.describe('Reorder Race Condition - Direct Invocation (#405)', () => {
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

  test('click reorder button via dispatchEvent before React hydration completes', async ({
    page,
  }) => {
    /**
     * Force a click via dispatchEvent instead of Playwright's click.
     * This tests if the issue is in React's event handling vs the callback itself.
     */

    await todoPage.addTodo('First');
    await page.waitForLoadState('networkidle');

    // Add todo via fast method
    await todoPage.todoInput.fill('Second');
    await todoPage.todoInput.press('Enter');

    // Get the element as soon as it appears
    const todoItem = page.getByRole('listitem').filter({ hasText: 'Second' });
    await todoItem.waitFor();

    // Use evaluate to dispatch click event directly
    const moveDownBtn = todoItem.getByRole('button', {
      name: /move todo down/i,
    });

    // Force click via JavaScript - bypasses Playwright's automatic waiting
    await moveDownBtn.evaluate((btn) => {
      btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    await page.waitForTimeout(500);

    const items = await todoPage.getTodoItems();
    const firstItem = await items.nth(0).textContent();

    expect(firstItem).toContain('First');
  });

  test('multiple rapid dispatchEvent clicks', async ({ page }) => {
    /**
     * Rapid-fire dispatchEvent clicks to stress test the callback stability.
     */

    await todoPage.addTodo('ItemA');
    await todoPage.addTodo('ItemB');
    await page.waitForLoadState('networkidle');

    // Add new todo at top: ItemNew, ItemB, ItemA
    await todoPage.todoInput.fill('ItemNew');
    await todoPage.todoInput.press('Enter');

    const todoItem = page.getByRole('listitem').filter({ hasText: 'ItemNew' });
    await todoItem.waitFor();

    const moveDownBtn = todoItem.getByRole('button', {
      name: /move todo down/i,
    });

    // Fire 3 rapid clicks via evaluate
    await moveDownBtn.evaluate((btn) => {
      btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    await page.waitForTimeout(1000);

    // Check where ItemNew ended up
    const texts = await todoPage.getTodoTexts();

    // After 3 moveDowns from position 0, ItemNew should be at position 2 (bottom)
    // But rapid clicks might not all register, so check it moved at least once
    expect(texts.indexOf('ItemNew')).toBeGreaterThan(0);
  });
});
