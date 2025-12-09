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
  }

  async getTodoItems() {
    return this.page.getByRole('listitem');
  }

  async getTodoByText(text: string) {
    return this.page.getByRole('listitem').filter({ hasText: text });
  }

  async completeTodo(text: string) {
    const todo = await this.getTodoByText(text);
    const checkbox = todo.getByRole('checkbox');
    await checkbox.click();
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
    const todo = await this.getTodoByText(text);
    const checkbox = todo.getByRole('checkbox');
    return await checkbox.isChecked();
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
    if (!response.ok()) {
      throw new Error(`Failed to reset test data: ${response.status()}`);
    }
  }
}
