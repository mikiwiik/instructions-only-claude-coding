import { test, expect } from '@playwright/test';
import { TodoPage } from '../pages/todo-page';

test.describe('Share List', () => {
  let todoPage: TodoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
    // Wait for initial page load to complete before resetting
    await page.waitForLoadState('networkidle');
    await todoPage.resetTestData(); // Clear server-side data
    await todoPage.clearLocalStorage(); // Clear client-side data
    await page.reload();
    // Wait for clean state after reload
    await page.waitForLoadState('networkidle');
  });

  test('share button is visible on main page', async ({ page }) => {
    const shareButton = page.getByRole('button', { name: /share this list/i });
    await expect(shareButton).toBeVisible();
  });

  test('share button opens dialog when clicked', async ({ page }) => {
    // Add a todo first so the button is enabled
    await todoPage.addTodo('Test todo for sharing');

    // Wait for todo to appear
    await expect(page.getByText('Test todo for sharing')).toBeVisible();

    // Click share button
    const shareButton = page.getByRole('button', { name: /share this list/i });
    await shareButton.click();

    // Dialog should open
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Should show sharing state initially
    await expect(dialog.getByText(/sharing list|list shared/i)).toBeVisible();
  });

  test('share dialog shows URL on success', async ({ page }) => {
    // Add a todo first
    await todoPage.addTodo('Todo for share test');
    await expect(page.getByText('Todo for share test')).toBeVisible();

    // Click share button
    await page.getByRole('button', { name: /share this list/i }).click();

    // Wait for dialog to show success state
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('List shared!')).toBeVisible({
      timeout: 10000,
    });

    // URL input should be visible
    const urlInput = dialog.getByRole('textbox', { name: /share url/i });
    await expect(urlInput).toBeVisible();
    await expect(urlInput).toHaveValue(/\/list\//);

    // Copy button should be visible
    await expect(dialog.getByRole('button', { name: /copy/i })).toBeVisible();

    // Done button should be visible
    await expect(dialog.getByRole('button', { name: 'Done' })).toBeVisible();
  });

  test('share dialog can be closed', async ({ page }) => {
    // Add a todo
    await todoPage.addTodo('Closable dialog test');
    await expect(page.getByText('Closable dialog test')).toBeVisible();

    // Open share dialog
    await page.getByRole('button', { name: /share this list/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Wait for share to complete
    await expect(dialog.getByText('List shared!')).toBeVisible({
      timeout: 10000,
    });

    // Close with Done button
    await dialog.getByRole('button', { name: 'Done' }).click();

    // Dialog should be closed
    await expect(dialog).not.toBeVisible();
  });

  test('share button has proper accessibility attributes', async ({ page }) => {
    // Verify the share button has correct ARIA attributes
    const shareButton = page.getByRole('button', { name: /share this list/i });
    await expect(shareButton).toBeVisible();
    await expect(shareButton).toHaveAttribute('type', 'button');
    // Button should have an accessible label
    await expect(shareButton).toHaveAccessibleName(/share this list/i);
  });
});
