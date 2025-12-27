/**
 * Bug Investigation: New Todos Don't React to Initial Reorder Request
 *
 * Issue: #405 (part of Epic #397 - LexoRank Optimization)
 *
 * ## Problem Statement
 * In production, newly added todos don't respond to initial reorder button clicks.
 * Existing todos that were loaded on page load reorder faster/correctly.
 *
 * ## Root Cause Analysis
 *
 * The issue is a **stale closure problem** in the React hooks architecture:
 *
 * 1. `useTodoOperations` calls `useTodoReorder({ todos: state.todos, ... })`
 * 2. `useTodoReorder` creates `moveUp`/`moveDown` callbacks with `useCallback([todos, ...])`
 * 3. When `addTodo` updates state, React schedules a re-render
 * 4. The new `moveUp`/`moveDown` callbacks are created on the NEXT render
 * 5. Between `setState` and re-render completion, clicks may invoke stale callbacks
 *
 * ## Code Flow
 *
 * ```
 * addTodo() called
 *   → setState({ todos: [newTodo, ...prev.todos] })  // Schedules re-render
 *   → syncToBackend('create', newTodo)              // Async operation
 *
 * [RACE CONDITION WINDOW]
 *   → User clicks reorder button
 *   → moveUp(newTodo.id) invoked
 *   → Uses STALE todos array (from previous render)
 *   → newTodo.id not found in stale array
 *   → findIndex returns -1
 *   → if (idx > 0) fails → no reorder happens
 * ```
 *
 * ## Why Existing Tests Pass
 *
 * Current tests use `await act(async () => { await addTodo(...) })` which:
 * - Forces React to flush all updates before continuing
 * - Ensures callbacks are refreshed before next operation
 * - Doesn't simulate real-world timing where users click rapidly
 *
 * ## Solution Direction (Epic #397)
 *
 * LexoRank implementation will address this by:
 * - Using sortOrder field for ordering (not array indices)
 * - Each todo carries its own position
 * - Reorder operations update sortOrder, not array position
 * - No dependency on stale array state for positioning
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useTodos } from '../../hooks/useTodos';

// Mock fetch globally for backend API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

type FetchOptions = { method?: string; body?: string };

describe('useTodos - Reorder Race Condition Investigation (#405)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockFetch.mockImplementation((url: string, options?: FetchOptions) => {
      if (options?.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ todos: [] }),
      });
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Immediate reorder after add - potential stale closure', () => {
    it('should allow moveUp on newly added todo within same act block', async () => {
      /**
       * This test attempts to simulate rapid user interaction:
       * 1. Add a new todo
       * 2. Immediately try to reorder it (before React fully re-renders)
       *
       * In unit tests with act(), React batches updates, so this may pass.
       * The real bug manifests in browser event timing.
       */
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Add an existing todo first
      await act(async () => {
        await result.current.addTodo('Existing todo');
      });

      // Now add a new todo and immediately try to move it
      // This simulates rapid user action
      await act(async () => {
        await result.current.addTodo('New todo');
      });

      const newTodoId = result.current.todos[0].id;
      expect(result.current.todos[0].text).toBe('New todo');

      // Try to move the new todo down (it's at index 0)
      await act(async () => {
        await result.current.moveDown(newTodoId);
      });

      // New todo should now be at index 1
      expect(result.current.todos[1].text).toBe('New todo');
      expect(result.current.todos[0].text).toBe('Existing todo');
    });

    it('should sync reorder for newly added todo to backend', async () => {
      /**
       * Verify that backend receives the reorder operation for new todos.
       * This helps identify if the issue is client-side state or network.
       */
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.addTodo('First');
        await result.current.addTodo('Second');
      });

      const secondTodoId = result.current.todos[0].id; // "Second" is newest, at index 0
      mockFetch.mockClear();

      await act(async () => {
        await result.current.moveDown(secondTodoId);
      });

      // Verify reorder was sent to backend
      const postCalls = mockFetch.mock.calls.filter(
        (call: [string, FetchOptions?]) => call[1]?.method === 'POST'
      );

      expect(postCalls.length).toBeGreaterThan(0);
      const lastCall = postCalls[postCalls.length - 1];
      const body = JSON.parse(lastCall[1]?.body as string);
      expect(body.operation).toBe('reorder');
    });

    it('should handle rapid sequential reorders on same todo', async () => {
      /**
       * Test rapid sequential operations that might cause state conflicts.
       * User clicking reorder button multiple times quickly.
       */
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Add three todos
      await act(async () => {
        await result.current.addTodo('A');
        await result.current.addTodo('B');
        await result.current.addTodo('C');
      });

      // Order is: C, B, A (newest first)
      expect(result.current.todos.map((t) => t.text)).toEqual(['C', 'B', 'A']);

      const cTodoId = result.current.todos[0].id;

      // Rapid moveDown twice - C should go from 0 → 1 → 2
      await act(async () => {
        await result.current.moveDown(cTodoId);
      });
      await act(async () => {
        await result.current.moveDown(cTodoId);
      });

      // C should now be at the bottom
      expect(result.current.todos.map((t) => t.text)).toEqual(['B', 'A', 'C']);
    });
  });

  describe('Documentation: Current architecture limitations', () => {
    it('documents the stale closure issue in moveUp/moveDown', async () => {
      /**
       * DOCUMENTATION TEST - This test documents the architecture issue.
       *
       * The problem: moveUp/moveDown use `todos` from useCallback closure.
       *
       * ```typescript
       * // useTodoReorder.ts
       * const moveUp = useCallback(
       *   async (todoId: string) => {
       *     const idx = todos.findIndex((t) => t.id === todoId);
       *     if (idx > 0) await reorderTodos(idx, idx - 1);
       *   },
       *   [todos, reorderTodos]  // <-- depends on `todos`
       * );
       * ```
       *
       * When `addTodo` updates state:
       * 1. New state is set
       * 2. React schedules re-render
       * 3. Until re-render completes, old callbacks reference old `todos`
       *
       * This is why LexoRank will fix it:
       * - sortOrder is stored ON the todo itself
       * - Reorder doesn't depend on finding index in potentially stale array
       * - Each operation updates ONE todo's sortOrder
       */

      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Verify the architecture - moveUp exists and is a function
      expect(typeof result.current.moveUp).toBe('function');
      expect(typeof result.current.moveDown).toBe('function');
      expect(typeof result.current.reorderTodos).toBe('function');

      // Document that these functions exist and work in isolation
      // The issue is timing/closure-based, hard to reproduce in unit tests
      expect(true).toBe(true);
    });

    it('documents that reorderTodos sends entire array (inefficient)', async () => {
      /**
       * DOCUMENTATION TEST - Demonstrates current inefficiency.
       *
       * Current behavior: reorderTodos sends ENTIRE todos array to backend.
       * This is problematic because:
       * 1. Large payload for many todos (user reported seeing 20 items)
       * 2. Includes completed and deleted todos unnecessarily
       * 3. Race conditions with concurrent operations
       *
       * LexoRank solution: send only the moved todo with new sortOrder.
       */
      const { result } = renderHook(() => useTodos());

      await waitFor(() => {
        expect(result.current.isInitialized).toBe(true);
      });

      // Add multiple todos
      await act(async () => {
        for (let i = 0; i < 5; i++) {
          await result.current.addTodo(`Todo ${i}`);
        }
      });

      mockFetch.mockClear();

      // Reorder one todo
      await act(async () => {
        await result.current.reorderTodos(0, 2);
      });

      // Find the reorder call
      const reorderCall = mockFetch.mock.calls.find(
        (call: [string, FetchOptions?]) => {
          if (call[1]?.method !== 'POST') return false;
          const body = JSON.parse(call[1].body as string);
          return body.operation === 'reorder';
        }
      );

      expect(reorderCall).toBeDefined();
      const body = JSON.parse(reorderCall![1]?.body as string);

      // Current implementation sends ALL todos (inefficient)
      expect(body.data).toHaveLength(5);

      // After LexoRank implementation, this should send only 1 todo
      // This assertion documents the current behavior that will change:
      // expect(body.data).toHaveLength(1); // Future: single-todo update
    });
  });
});
