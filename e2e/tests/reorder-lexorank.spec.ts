import { test, expect } from '@playwright/test';
import { TodoPage } from '../pages/todo-page';

/**
 * LexoRank Todo Ordering E2E Tests
 *
 * Tests the complete reorder flow with LexoRank sortOrder:
 * - New todos receive sortOrder on creation
 * - Reordering updates sortOrder and syncs to backend
 * - Order persists across page reloads
 *
 * @see ADR-034 for LexoRank decision
 *
 * Note: Rate limiting (30 req/30s) affects how many tests can run.
 * These tests are designed to be minimal and focused.
 */
test.describe('LexoRank Todo Ordering', () => {
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

  test('new todos should appear at top of list', async ({ page }) => {
    // Add todos sequentially
    await todoPage.addTodo('First todo');
    await page.waitForLoadState('networkidle');
    await todoPage.addTodo('Second todo');
    await page.waitForLoadState('networkidle');
    await todoPage.addTodo('Third todo');
    await page.waitForLoadState('networkidle');

    // Newest should be at top
    const items = await todoPage.getTodoItems();
    expect(await items.count()).toBe(3);

    const texts = await todoPage.getTodoTexts();
    expect(texts[0]).toContain('Third todo');
    expect(texts[1]).toContain('Second todo');
    expect(texts[2]).toContain('First todo');
  });

  test('reorder and reload should preserve order', async ({ page }) => {
    // Add todos
    await todoPage.addTodo('Alpha');
    await page.waitForLoadState('networkidle');
    await todoPage.addTodo('Beta');
    await page.waitForLoadState('networkidle');

    // Order: Beta, Alpha (newest at top)

    // Move Beta down (swap positions)
    await todoPage.moveTodoDown('Beta');
    await page.waitForLoadState('networkidle');

    // Order should now be: Alpha, Beta
    let texts = await todoPage.getTodoTexts();
    expect(texts[0]).toContain('Alpha');
    expect(texts[1]).toContain('Beta');

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Order should persist
    texts = await todoPage.getTodoTexts();
    expect(texts[0]).toContain('Alpha');
    expect(texts[1]).toContain('Beta');
  });

  test('boundary button states should be correct', async ({ page }) => {
    // Add todos
    await todoPage.addTodo('First');
    await page.waitForLoadState('networkidle');
    await todoPage.addTodo('Second');
    await page.waitForLoadState('networkidle');

    // Order: Second, First
    // Second is at top - its move-up button should be disabled
    const topItem = page.getByRole('listitem').filter({ hasText: 'Second' });
    const topMoveUpBtn = topItem.getByRole('button', { name: /move todo up/i });
    await expect(topMoveUpBtn).toBeDisabled();

    // First is at bottom - its move-down button should be disabled
    const bottomItem = page.getByRole('listitem').filter({ hasText: 'First' });
    const bottomMoveDownBtn = bottomItem.getByRole('button', {
      name: /move todo down/i,
    });
    await expect(bottomMoveDownBtn).toBeDisabled();
  });
});
