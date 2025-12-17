import { type Locator, type Page } from '@playwright/test';

/**
 * Page Object Model for the Todo application
 * Provides reusable methods and locators for E2E testing
 */
export class TodoPage {
  readonly page: Page;
  readonly todoInput: Locator;
  readonly addButton: Locator;
  readonly todoList: Locator;
  readonly filterAll: Locator;
  readonly filterActive: Locator;
  readonly filterCompleted: Locator;

  constructor(page: Page) {
    this.page = page;
    this.todoInput = page.getByRole('textbox', { name: /add.*todo/i });
    this.addButton = page.getByRole('button', { name: /add/i });
    this.todoList = page.getByRole('list').first();
    this.filterAll = page.getByRole('button', { name: /^all$/i });
    this.filterActive = page.getByRole('button', { name: /active/i });
    this.filterCompleted = page.getByRole('button', { name: /completed/i });
  }

  async goto() {
    await this.page.goto('/');
  }

  async addTodo(text: string, method: 'enter' | 'button' = 'enter') {
    await this.todoInput.fill(text);
    if (method === 'enter') {
      await this.todoInput.press('Enter');
    } else {
      await this.addButton.click();
    }
    // Wait for the todo item to appear in the list
    await this.page.getByRole('listitem').filter({ hasText: text }).waitFor();
  }

  async getTodoItems() {
    return this.page.getByRole('listitem');
  }

  async getTodoByText(text: string) {
    return this.page.getByRole('listitem').filter({ hasText: text });
  }

  async completeTodo(text: string) {
    // Use aria-label to find the toggle button directly
    // The button has aria-label="Toggle todo: {text}"
    const toggleButton = this.page.getByRole('button', {
      name: new RegExp(`toggle todo:.*${this.escapeRegex(text)}`, 'i'),
    });
    await toggleButton.waitFor({ state: 'visible' });
    await toggleButton.click();
  }

  // Helper to escape regex special characters
  private escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async deleteTodo(text: string) {
    const todo = await this.getTodoByText(text);
    const deleteButton = todo.getByRole('button', { name: /delete/i });
    await deleteButton.click();
    // Confirm deletion in dialog
    const confirmButton = this.page.getByRole('button', { name: /confirm/i });
    await confirmButton.click();
  }

  async isTodoCompleted(text: string): Promise<boolean> {
    // Use aria-label to find the toggle button directly
    // The button has aria-label="Toggle todo: {text}" and aria-pressed
    const toggleButton = this.page.getByRole('button', {
      name: new RegExp(`toggle todo:.*${this.escapeRegex(text)}`, 'i'),
    });
    await toggleButton.waitFor({ state: 'visible' });
    const ariaPressed = await toggleButton.getAttribute('aria-pressed');
    return ariaPressed === 'true';
  }

  async clearLocalStorage() {
    await this.page.evaluate(() => localStorage.clear());
  }

  /**
   * Reset server-side test data (in-memory store)
   * Must be called before each test to ensure clean state
   */
  async resetTestData() {
    const response = await this.page.request.post('/api/test/reset');
    const body = await response.text();
    // Log response for debugging in CI
    // eslint-disable-next-line no-console
    console.log(`[E2E Reset] Status: ${response.status()}, Body: ${body}`);
    if (!response.ok()) {
      throw new Error(
        `Failed to reset test data: ${response.status()} - ${body}`
      );
    }

    // Debug: Check KVStore state after reset
    const debugResponse = await this.page.request.get('/api/test/debug');
    const debugBody = await debugResponse.text();
    // eslint-disable-next-line no-console
    console.log(`[E2E Debug] After reset: ${debugBody}`);
  }
}
