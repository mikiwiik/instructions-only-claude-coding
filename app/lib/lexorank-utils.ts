/**
 * LexoRank Utility Functions
 *
 * Provides helper functions for generating and managing LexoRank-based
 * sort orders for todo items. See ADR-033 for design decisions.
 *
 * @see docs/adr/033-lexorank-todo-ordering.md
 */

import { LexoRank } from 'lexorank';
import type { Todo } from '../types/todo';

/**
 * Check if a todo is active (not completed or deleted)
 */
function isActiveTodo(todo: Todo): boolean {
  return !todo.completedAt && !todo.deletedAt;
}

/**
 * Generate a sortOrder for a new todo that will appear at the top of the list.
 *
 * @param todos - Current list of todos (used to find the first active todo's rank)
 * @returns LexoRank string that sorts before all existing active todos
 */
export function generateInitialSortOrder(todos: Todo[]): string {
  // Filter to active todos with valid sortOrder
  const activeTodosWithRank = todos.filter(
    (todo) => isActiveTodo(todo) && todo.sortOrder
  );

  if (activeTodosWithRank.length === 0) {
    // No existing ranked todos, return middle rank
    return LexoRank.middle().toString();
  }

  // Find the minimum (first) sortOrder among active todos
  const sortedByRank = activeTodosWithRank.sort((a, b) =>
    a.sortOrder!.localeCompare(b.sortOrder!)
  );

  const firstRank = LexoRank.parse(sortedByRank[0].sortOrder!);
  return firstRank.genPrev().toString();
}

/**
 * Generate a sortOrder between two existing ranks.
 *
 * @param beforeRank - The rank to insert after (undefined = insert at start)
 * @param afterRank - The rank to insert before (undefined = insert at end)
 * @returns LexoRank string between the two ranks
 */
export function generateBetweenSortOrder(
  beforeRank: string | undefined,
  afterRank: string | undefined
): string {
  if (!beforeRank && !afterRank) {
    // No context, return middle
    return LexoRank.middle().toString();
  }

  if (!beforeRank) {
    // Insert before afterRank (at the start)
    const after = LexoRank.parse(afterRank!);
    return after.genPrev().toString();
  }

  if (!afterRank) {
    // Insert after beforeRank (at the end)
    const before = LexoRank.parse(beforeRank);
    return before.genNext().toString();
  }

  // Insert between two ranks
  const before = LexoRank.parse(beforeRank);
  const after = LexoRank.parse(afterRank);
  return before.between(after).toString();
}

/**
 * Assign sortOrder to todos that don't have one (migration utility).
 * Only assigns to active todos. Completed/deleted todos don't need sortOrder.
 *
 * @param todos - Array of todos, some may lack sortOrder
 * @returns New array with sortOrder assigned to active todos that lacked it
 */
export function assignMissingSortOrders(todos: Todo[]): Todo[] {
  if (todos.length === 0) {
    return [];
  }

  // Find max existing rank to start after it
  const existingRanks = todos
    .filter((todo) => isActiveTodo(todo) && todo.sortOrder)
    .map((todo) => LexoRank.parse(todo.sortOrder!));

  // Start after the max existing rank, or from middle if none exist
  let currentRank =
    existingRanks.length > 0
      ? existingRanks.reduce((max, rank) =>
          rank.compareTo(max) > 0 ? rank : max
        )
      : LexoRank.middle().genPrev(); // Start before middle so first gets middle

  return todos.map((todo) => {
    // Skip if already has sortOrder or not active
    if (todo.sortOrder || !isActiveTodo(todo)) {
      return todo;
    }

    // Advance and assign
    currentRank = currentRank.genNext();
    return { ...todo, sortOrder: currentRank.toString() };
  });
}
