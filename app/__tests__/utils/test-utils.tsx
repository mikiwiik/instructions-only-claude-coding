import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

// Mock localStorage utilities for testing
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
    get store() {
      return { ...store };
    },
  };
};

// Create a todo factory for testing
export const createMockTodo = (
  overrides: Partial<{
    id: string;
    text: string;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
  }> = {}
) => ({
  id: '1',
  text: 'Test todo',
  completed: false,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  ...overrides,
});

// Custom render function that includes providers if needed
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { ...options });

export * from '@testing-library/react';
export { customRender as render };

// This file should be imported and used by other tests, not tested itself
// Adding a simple test to satisfy Jest's requirement
describe('Test Utils', () => {
  it('should export render function', () => {
    expect(customRender).toBeDefined();
    expect(typeof customRender).toBe('function');
  });

  it('should create mock todo with default values', () => {
    const todo = createMockTodo();
    expect(todo).toHaveProperty('id', '1');
    expect(todo).toHaveProperty('text', 'Test todo');
    expect(todo).toHaveProperty('completed', false);
  });

  it('should create mock todo with overrides', () => {
    const todo = createMockTodo({ text: 'Custom todo', completed: true });
    expect(todo.text).toBe('Custom todo');
    expect(todo.completed).toBe(true);
  });
});
