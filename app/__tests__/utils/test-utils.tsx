import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { SharedTodo, Participant } from '../../types/todo';
import { TEST_UUIDS, TEST_COLORS } from '../fixtures/test-constants';

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

/**
 * Setup window.localStorage mock with proper configuration for test isolation.
 * Returns both the mock storage and the original localStorage for cleanup.
 *
 * @example
 * const { mockStorage, restoreLocalStorage } = setupLocalStorageMock();
 *
 * describe('My Tests', () => {
 *   afterAll(restoreLocalStorage);
 *
 *   beforeEach(() => {
 *     mockStorage.clear();
 *   });
 *   // ... tests
 * });
 */
export const setupLocalStorageMock = () => {
  const mockStorage = mockLocalStorage();
  const originalLocalStorage = window.localStorage;

  Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
    writable: true,
    configurable: true,
  });

  const restoreLocalStorage = () => {
    if (originalLocalStorage) {
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
        configurable: true,
      });
    } else {
      delete (window as { localStorage?: Storage }).localStorage;
    }
  };

  return { mockStorage, restoreLocalStorage };
};

// Create a todo factory for testing
export const createMockTodo = (
  overrides: Partial<{
    id: string;
    text: string;
    completed?: boolean; // For backward compatibility in tests
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
  }> = {}
) => {
  const base = {
    id: '1',
    text: 'Test todo',
    completedAt: undefined,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    deletedAt: undefined,
  };

  // Handle legacy completed boolean for backward compatibility
  if ('completed' in overrides && overrides.completed) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { completed, ...rest } = overrides;
    return {
      ...base,
      ...rest,
      completedAt: new Date('2023-01-01'),
    };
  }

  return {
    ...base,
    ...overrides,
  };
};

/**
 * Create a mock SharedTodo for testing shared list functionality
 *
 * @param overrides - Partial SharedTodo properties to override defaults
 * @returns Complete SharedTodo object with defaults
 *
 * @example
 * const sharedTodo = createMockSharedTodo({
 *   text: 'Shared task',
 *   authorId: TEST_UUIDS.USER_2,
 * });
 */
export const createMockSharedTodo = (
  overrides?: Partial<SharedTodo>
): SharedTodo => {
  const baseTodo = createMockTodo(overrides);

  return {
    ...baseTodo,
    listId: TEST_UUIDS.LIST_1,
    authorId: TEST_UUIDS.USER_1,
    lastModifiedBy: TEST_UUIDS.USER_1,
    syncVersion: 1,
    ...overrides,
  };
};

/**
 * Create a mock Participant for testing shared list participants
 *
 * @param overrides - Partial Participant properties to override defaults
 * @returns Complete Participant object with defaults
 *
 * @example
 * const participant = createMockParticipant({
 *   id: TEST_UUIDS.USER_2,
 *   color: TEST_COLORS.BLUE,
 * });
 */
export const createMockParticipant = (
  overrides?: Partial<Participant>
): Participant => {
  return {
    id: TEST_UUIDS.USER_1,
    color: TEST_COLORS.RED,
    lastSeenAt: new Date('2023-01-01'),
    isActive: true,
    ...overrides,
  };
};

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
    expect(todo).toHaveProperty('completedAt', undefined);
  });

  it('should create mock todo with overrides', () => {
    const todo = createMockTodo({
      text: 'Custom todo',
      completedAt: new Date('2023-01-02'),
    });
    expect(todo.text).toBe('Custom todo');
    expect(todo.completedAt).toEqual(new Date('2023-01-02'));
  });

  it('should handle legacy completed boolean for backward compatibility', () => {
    const todo = createMockTodo({
      text: 'Legacy completed todo',
      completed: true,
    });
    expect(todo.text).toBe('Legacy completed todo');
    expect(todo.completedAt).toEqual(new Date('2023-01-01'));
    expect(todo).not.toHaveProperty('completed');
  });

  it('should create mock shared todo with default values', () => {
    const sharedTodo = createMockSharedTodo();
    expect(sharedTodo).toHaveProperty('id', '1');
    expect(sharedTodo).toHaveProperty('text', 'Test todo');
    expect(sharedTodo).toHaveProperty('listId', TEST_UUIDS.LIST_1);
    expect(sharedTodo).toHaveProperty('authorId', TEST_UUIDS.USER_1);
    expect(sharedTodo).toHaveProperty('lastModifiedBy', TEST_UUIDS.USER_1);
    expect(sharedTodo).toHaveProperty('syncVersion', 1);
  });

  it('should create mock shared todo with overrides', () => {
    const sharedTodo = createMockSharedTodo({
      text: 'Custom shared todo',
      authorId: TEST_UUIDS.USER_2,
      syncVersion: 5,
    });
    expect(sharedTodo.text).toBe('Custom shared todo');
    expect(sharedTodo.authorId).toBe(TEST_UUIDS.USER_2);
    expect(sharedTodo.syncVersion).toBe(5);
  });

  it('should create mock participant with default values', () => {
    const participant = createMockParticipant();
    expect(participant).toHaveProperty('id', TEST_UUIDS.USER_1);
    expect(participant).toHaveProperty('color', TEST_COLORS.RED);
    expect(participant).toHaveProperty('isActive', true);
    expect(participant.lastSeenAt).toEqual(new Date('2023-01-01'));
  });

  it('should create mock participant with overrides', () => {
    const participant = createMockParticipant({
      id: TEST_UUIDS.USER_2,
      color: TEST_COLORS.BLUE,
      isActive: false,
    });
    expect(participant.id).toBe(TEST_UUIDS.USER_2);
    expect(participant.color).toBe(TEST_COLORS.BLUE);
    expect(participant.isActive).toBe(false);
  });
});
