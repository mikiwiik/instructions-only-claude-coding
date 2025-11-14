/**
 * Render Helper Utilities for Testing
 *
 * Centralized render helpers to eliminate duplication in component tests.
 * Provides consistent TodoItem rendering with automatic callback setup.
 *
 * Used in 30+ test files to reduce boilerplate from ~10 lines to 1 line.
 */

import { render, RenderResult } from '@testing-library/react';
import TodoItem from '../../components/TodoItem';
import { Todo } from '../../types/todo';
import { TodoItemCallbacks, createMockCallbacks } from './mock-callbacks';

/**
 * TodoItem render result with callbacks included for easy access
 */
export interface TodoItemRenderResult extends RenderResult {
  callbacks: TodoItemCallbacks;
}

/**
 * Render TodoItem component with automatic callback setup
 *
 * Eliminates the repetitive pattern of:
 * - Creating individual mock callbacks
 * - Passing all callbacks to TodoItem
 * - Managing callback references
 *
 * @param todo - The todo item to render
 * @param callbackOverrides - Optional partial callbacks to override defaults
 * @returns Render result with callbacks attached
 *
 * @example
 * // Before (10 lines):
 * const mockOnToggle = jest.fn();
 * const mockOnDelete = jest.fn();
 * const mockOnEdit = jest.fn();
 * const mockOnRestore = jest.fn();
 * render(
 *   <TodoItem
 *     todo={todo}
 *     onToggle={mockOnToggle}
 *     onDelete={mockOnDelete}
 *     onEdit={mockOnEdit}
 *     onRestore={mockOnRestore}
 *   />
 * );
 *
 * // After (1 line):
 * const { callbacks } = renderTodoItem(todo);
 *
 * @example
 * // Custom callback implementation:
 * const customOnToggle = jest.fn(() => console.log('toggled'));
 * const { callbacks } = renderTodoItem(todo, { mockOnToggle: customOnToggle });
 * expect(callbacks.mockOnToggle).toBe(customOnToggle);
 */
export const renderTodoItem = (
  todo: Todo,
  callbackOverrides?: Partial<TodoItemCallbacks>
): TodoItemRenderResult => {
  const defaultCallbacks = createMockCallbacks();
  const callbacks = { ...defaultCallbacks, ...callbackOverrides };

  const renderResult = render(
    <TodoItem
      todo={todo}
      onToggle={callbacks.mockOnToggle}
      onDelete={callbacks.mockOnDelete}
      onEdit={callbacks.mockOnEdit}
      onRestore={callbacks.mockOnRestore}
    />
  );

  return {
    ...renderResult,
    callbacks,
  };
};

/**
 * Render TodoItem with custom props (for advanced testing scenarios)
 *
 * Use when you need full control over props but still want callback setup
 *
 * @param todo - The todo item to render
 * @param additionalProps - Additional props to pass to TodoItem
 * @returns Render result with callbacks
 *
 * @example
 * const { callbacks } = renderTodoItemWithProps(todo, {
 *   className: 'custom-class',
 *   'data-testid': 'special-todo',
 * });
 */
export const renderTodoItemWithProps = (
  todo: Todo,
  additionalProps?: Record<string, unknown>
): TodoItemRenderResult => {
  const callbacks = createMockCallbacks();

  const renderResult = render(
    <TodoItem
      todo={todo}
      onToggle={callbacks.mockOnToggle}
      onDelete={callbacks.mockOnDelete}
      onEdit={callbacks.mockOnEdit}
      onRestore={callbacks.mockOnRestore}
      {...additionalProps}
    />
  );

  return {
    ...renderResult,
    callbacks,
  };
};

// Simple test to satisfy Jest's requirement
describe('Render Helpers', () => {
  it('should export render helper functions', () => {
    expect(renderTodoItem).toBeDefined();
    expect(renderTodoItemWithProps).toBeDefined();
  });
});
