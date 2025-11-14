/**
 * Mock Callback Utilities for Testing
 *
 * Centralized mock callback creation and management to eliminate duplication
 * across component tests. Used in 54+ test files.
 *
 * Benefits:
 * - Consistent mock setup across all TodoItem tests
 * - Single source of truth for callback interfaces
 * - Automatic TypeScript typing for all callbacks
 * - Easy cleanup with clearMockCallbacks()
 */

/**
 * Standard TodoItem callback mocks
 * This interface matches the props expected by TodoItem component
 */
export interface TodoItemCallbacks {
  mockOnToggle: jest.Mock;
  mockOnDelete: jest.Mock;
  mockOnEdit: jest.Mock;
  mockOnRestore?: jest.Mock;
}

/**
 * Extended callbacks for tests that need reordering
 */
export interface TodoItemCallbacksWithReorder extends TodoItemCallbacks {
  mockOnMoveUp: jest.Mock;
  mockOnMoveDown: jest.Mock;
}

/**
 * Create standard TodoItem callback mocks
 *
 * @returns Object containing all TodoItem callback mocks
 *
 * @example
 * const callbacks = createMockCallbacks();
 * render(<TodoItem todo={todo} {...callbacks} />);
 */
export const createMockCallbacks = (): TodoItemCallbacks => ({
  mockOnToggle: jest.fn(),
  mockOnDelete: jest.fn(),
  mockOnEdit: jest.fn(),
  mockOnRestore: jest.fn(),
});

/**
 * Create extended TodoItem callback mocks including reorder functions
 *
 * @returns Object containing all TodoItem callbacks plus reorder mocks
 *
 * @example
 * const callbacks = createMockCallbacksWithReorder();
 * render(<TodoItem todo={todo} {...callbacks} onMoveUp={callbacks.mockOnMoveUp} />);
 */
export const createMockCallbacksWithReorder =
  (): TodoItemCallbacksWithReorder => ({
    ...createMockCallbacks(),
    mockOnMoveUp: jest.fn(),
    mockOnMoveDown: jest.fn(),
  });

/**
 * Clear all mocks in a TodoItemCallbacks object
 *
 * Useful in beforeEach() to reset call counts between tests
 *
 * @param callbacks - The callbacks object to clear
 *
 * @example
 * const callbacks = createMockCallbacks();
 *
 * beforeEach(() => {
 *   clearMockCallbacks(callbacks);
 * });
 */
export const clearMockCallbacks = (
  callbacks: TodoItemCallbacks | TodoItemCallbacksWithReorder
): void => {
  Object.values(callbacks).forEach((mock) => {
    if (mock && typeof mock.mockClear === 'function') {
      mock.mockClear();
    }
  });
};

/**
 * Reset all mocks in a TodoItemCallbacks object (clears history and implementation)
 *
 * Use when you need to completely reset mocks including implementations
 *
 * @param callbacks - The callbacks object to reset
 *
 * @example
 * const callbacks = createMockCallbacks();
 * callbacks.mockOnToggle.mockImplementation(() => console.log('custom'));
 *
 * // Later: remove custom implementation
 * resetMockCallbacks(callbacks);
 */
export const resetMockCallbacks = (
  callbacks: TodoItemCallbacks | TodoItemCallbacksWithReorder
): void => {
  Object.values(callbacks).forEach((mock) => {
    if (mock && typeof mock.mockReset === 'function') {
      mock.mockReset();
    }
  });
};

/**
 * Verify no callbacks were called (useful for negative assertions)
 *
 * @param callbacks - The callbacks object to check
 * @param exclude - Optional array of callback names to exclude from check
 *
 * @example
 * const callbacks = createMockCallbacks();
 * // ... perform action
 * expectNoCallbacksCalled(callbacks); // Verifies none were called
 * expectNoCallbacksCalled(callbacks, ['mockOnToggle']); // Allows mockOnToggle to be called
 */
export const expectNoCallbacksCalled = (
  callbacks: TodoItemCallbacks | TodoItemCallbacksWithReorder,
  exclude: string[] = []
): void => {
  Object.entries(callbacks).forEach(([name, mock]) => {
    if (!exclude.includes(name) && mock && typeof mock === 'function') {
      expect(mock).not.toHaveBeenCalled();
    }
  });
};

// Simple test to satisfy Jest's requirement
describe('Mock Callbacks', () => {
  it('should export mock callback utilities', () => {
    expect(createMockCallbacks).toBeDefined();
    expect(createMockCallbacksWithReorder).toBeDefined();
    expect(clearMockCallbacks).toBeDefined();
    expect(resetMockCallbacks).toBeDefined();
    expect(expectNoCallbacksCalled).toBeDefined();
  });

  it('should create mock callbacks', () => {
    const callbacks = createMockCallbacks();
    expect(callbacks.mockOnToggle).toBeDefined();
    expect(callbacks.mockOnDelete).toBeDefined();
    expect(callbacks.mockOnEdit).toBeDefined();
    expect(callbacks.mockOnRestore).toBeDefined();
  });
});
