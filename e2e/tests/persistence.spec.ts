import { test, expect } from '@playwright/test';
import { TodoPage } from '../pages/todo-page';

test.describe('Data Persistence Flow', () => {
  let todoPage: TodoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
    await todoPage.clearLocalStorage();
    await page.reload();
  });

  test('should persist todos across page reloads', async ({ page }) => {
    // Add multiple todos
    await todoPage.addTodo('Persistent todo 1');
    await todoPage.addTodo('Persistent todo 2');
    await todoPage.addTodo('Persistent todo 3');

    // Verify todos are present
    let todoItems = await todoPage.getTodoItems();
    await expect(todoItems).toHaveCount(3);

    // Reload the page
    await page.reload();

    // Verify todos are still present after reload
    todoItems = await todoPage.getTodoItems();
    await expect(todoItems).toHaveCount(3);
    await expect(todoItems.nth(0)).toContainText('Persistent todo 1');
    await expect(todoItems.nth(1)).toContainText('Persistent todo 2');
    await expect(todoItems.nth(2)).toContainText('Persistent todo 3');
  });

  test('should persist completion state across page reloads', async ({
    page,
  }) => {
    // Add todos and complete one
    await todoPage.addTodo('Todo 1');
    await todoPage.addTodo('Todo 2');
    await todoPage.completeTodo('Todo 2');

    // Verify completion states before reload
    expect(await todoPage.isTodoCompleted('Todo 1')).toBe(false);
    expect(await todoPage.isTodoCompleted('Todo 2')).toBe(true);

    // Reload the page
    await page.reload();

    // Verify completion states are preserved
    expect(await todoPage.isTodoCompleted('Todo 1')).toBe(false);
    expect(await todoPage.isTodoCompleted('Todo 2')).toBe(true);
  });

  test('should preserve todo order across reloads', async ({ page }) => {
    // Add todos in specific order
    await todoPage.addTodo('First');
    await todoPage.addTodo('Second');
    await todoPage.addTodo('Third');

    // Reload page
    await page.reload();

    // Verify order is preserved
    const todoItems = await todoPage.getTodoItems();
    await expect(todoItems.nth(0)).toContainText('First');
    await expect(todoItems.nth(1)).toContainText('Second');
    await expect(todoItems.nth(2)).toContainText('Third');
  });
});
