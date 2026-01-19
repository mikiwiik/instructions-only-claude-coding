import { test, expect } from '@playwright/test';
import { TodoPage } from '../pages/todo-page';

test.describe('Shared List Indicator', () => {
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

  test('shared list indicator is visible when viewing a shared list', async ({
    page,
  }) => {
    // Add a todo first so we have something to share
    await todoPage.addTodo('Test todo for indicator');
    await expect(page.getByText('Test todo for indicator')).toBeVisible();

    // Share the list
    await page.getByRole('button', { name: /share this list/i }).click();

    // Wait for share dialog to complete
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('List shared!')).toBeVisible({
      timeout: 10000,
    });

    // Get the share URL from the input
    const urlInput = dialog.getByRole('textbox', { name: /share url/i });
    const shareUrl = await urlInput.inputValue();

    // Close dialog
    await dialog.getByRole('button', { name: 'Done' }).click();
    await expect(dialog).not.toBeVisible();

    // Navigate to the shared list URL
    await page.goto(shareUrl);
    await page.waitForLoadState('networkidle');

    // Verify the shared list indicator is visible
    const indicator = page.getByRole('status', { name: /shared list/i });
    await expect(indicator).toBeVisible();

    // Verify it shows 'Shared' text
    await expect(indicator).toContainText(/shared/i);
  });

  test('shared list indicator shows copy URL button', async ({ page }) => {
    // Add and share a todo
    await todoPage.addTodo('Todo for copy test');
    await page.getByRole('button', { name: /share this list/i }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('List shared!')).toBeVisible({
      timeout: 10000,
    });

    const urlInput = dialog.getByRole('textbox', { name: /share url/i });
    const shareUrl = await urlInput.inputValue();

    await dialog.getByRole('button', { name: 'Done' }).click();

    // Navigate to shared list
    await page.goto(shareUrl);
    await page.waitForLoadState('networkidle');

    // Verify copy button is present in the indicator
    const copyButton = page.getByRole('button', { name: /copy.*url/i });
    await expect(copyButton).toBeVisible();
  });

  test('shared list indicator is not visible on main page', async ({
    page,
  }) => {
    // Main page should not show the shared list indicator
    const indicator = page.getByRole('status', { name: /shared list/i });
    await expect(indicator).not.toBeVisible();
  });

  test('shared list indicator has proper accessibility attributes', async ({
    page,
  }) => {
    // Share a list first
    await todoPage.addTodo('Accessibility test todo');
    await page.getByRole('button', { name: /share this list/i }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('List shared!')).toBeVisible({
      timeout: 10000,
    });

    const urlInput = dialog.getByRole('textbox', { name: /share url/i });
    const shareUrl = await urlInput.inputValue();

    await dialog.getByRole('button', { name: 'Done' }).click();

    // Navigate to shared list
    await page.goto(shareUrl);
    await page.waitForLoadState('networkidle');

    // Verify accessibility attributes
    const indicator = page.getByRole('status', { name: /shared list/i });
    await expect(indicator).toBeVisible();
    await expect(indicator).toHaveAttribute('aria-label', /shared list/i);
  });
});
