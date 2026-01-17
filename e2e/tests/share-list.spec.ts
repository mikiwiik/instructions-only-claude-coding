import { test, expect } from '@playwright/test';

test.describe('Share List', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    // Wait for the app to load
    await expect(page.getByRole('heading', { name: 'TODO' })).toBeVisible();
  });

  test('share button is visible on main page', async ({ page }) => {
    const shareButton = page.getByRole('button', { name: /share this list/i });
    await expect(shareButton).toBeVisible();
  });

  test('share button opens dialog when clicked', async ({ page }) => {
    // Add a todo first so the button is enabled
    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('Test todo for sharing');
    await page.getByRole('button', { name: /add todo/i }).click();

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
    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('Todo for share test');
    await page.getByRole('button', { name: /add todo/i }).click();
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
    const input = page.getByPlaceholder('What needs to be done?');
    await input.fill('Closable dialog test');
    await page.getByRole('button', { name: /add todo/i }).click();
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
