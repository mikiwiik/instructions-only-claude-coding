import { test, expect } from '@playwright/test';
import { TodoPage } from '../pages/todo-page';

test.describe('Complete Todo Flow', () => {
  let todoPage: TodoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
    await todoPage.clearLocalStorage();
    await page.reload();
  });

  test('should mark todo as completed when checkbox is clicked', async () => {
    // Add a todo
    await todoPage.addTodo('Complete this task');

    // Verify todo is not completed initially
    expect(await todoPage.isTodoCompleted('Complete this task')).toBe(false);

    // Complete the todo
    await todoPage.completeTodo('Complete this task');

    // Verify todo is marked as completed
    expect(await todoPage.isTodoCompleted('Complete this task')).toBe(true);
  });

  test('should toggle todo completion state', async () => {
    // Add and complete a todo
    await todoPage.addTodo('Toggle me');
    await todoPage.completeTodo('Toggle me');
    expect(await todoPage.isTodoCompleted('Toggle me')).toBe(true);

    // Toggle back to incomplete
    await todoPage.completeTodo('Toggle me');
    expect(await todoPage.isTodoCompleted('Toggle me')).toBe(false);
  });

  test('should complete multiple todos independently', async () => {
    // Add multiple todos
    await todoPage.addTodo('First task');
    await todoPage.addTodo('Second task');
    await todoPage.addTodo('Third task');

    // Complete only the second todo
    await todoPage.completeTodo('Second task');

    // Verify completion states
    expect(await todoPage.isTodoCompleted('First task')).toBe(false);
    expect(await todoPage.isTodoCompleted('Second task')).toBe(true);
    expect(await todoPage.isTodoCompleted('Third task')).toBe(false);
  });
});
