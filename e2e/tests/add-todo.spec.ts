import { test, expect } from '@playwright/test';
import { TodoPage } from '../pages/todo-page';

test.describe('Add Todo Flow', () => {
  let todoPage: TodoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
    await todoPage.resetTestData(); // Clear server-side data
    await todoPage.clearLocalStorage(); // Clear client-side data
    await page.reload();
    // Wait for empty state to be visible
    await page.waitForLoadState('networkidle');
  });

  test('should add new todo when Enter key is pressed', async () => {
    // Add a todo using Enter key
    await todoPage.addTodo('Buy groceries', 'enter');

    // Verify todo appears in the list
    const todoItems = await todoPage.getTodoItems();
    await expect(todoItems).toHaveCount(1);
    await expect(todoItems.first()).toContainText('Buy groceries');

    // Verify input is cleared
    await expect(todoPage.todoInput).toHaveValue('');
  });

  test('should add new todo when Add button is clicked', async () => {
    // Add a todo using button click
    await todoPage.addTodo('Write tests', 'button');

    // Verify todo appears in the list
    const todoItems = await todoPage.getTodoItems();
    await expect(todoItems).toHaveCount(1);
    await expect(todoItems.first()).toContainText('Write tests');

    // Verify input is cleared
    await expect(todoPage.todoInput).toHaveValue('');
  });

  test('should add multiple todos', async () => {
    // Add multiple todos
    await todoPage.addTodo('First todo', 'enter');
    await todoPage.addTodo('Second todo', 'button');
    await todoPage.addTodo('Third todo', 'enter');

    // Verify all todos appear (newest first)
    const todoItems = await todoPage.getTodoItems();
    await expect(todoItems).toHaveCount(3);
    await expect(todoItems.nth(0)).toContainText('Third todo');
    await expect(todoItems.nth(1)).toContainText('Second todo');
    await expect(todoItems.nth(2)).toContainText('First todo');
  });

  test('should not add empty todo', async () => {
    // Try to add empty todo
    await todoPage.todoInput.fill('   ');
    await todoPage.todoInput.press('Enter');

    // Verify no todo was added
    const todoItems = await todoPage.getTodoItems();
    await expect(todoItems).toHaveCount(0);
  });
});
