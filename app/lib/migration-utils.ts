/**
 * Migration utilities for LexoRank sortOrder
 *
 * @see ADR-034 for LexoRank decision
 * @see Issue #412 for post-migration cleanup
 */

import type { Todo } from '../types/todo';
import { SyncToBackendFn } from '../hooks/useTodoSync';
import { assignMissingSortOrders } from './lexorank-utils';

function isActiveTodo(todo: Todo): boolean {
  return !todo.completedAt && !todo.deletedAt;
}

/**
 * Migrate existing todos to LexoRank sortOrder.
 *
 * - Assigns sortOrder to active todos that lack one
 * - Syncs each migrated todo to backend
 * - Idempotent: safe to run multiple times
 * - Graceful: continues even if individual syncs fail
 *
 * @param todos - All todos to potentially migrate
 * @param syncToBackend - Function to sync todo updates to backend
 * @returns Updated todos with sortOrders assigned
 */
export async function migrateToLexoRank(
  todos: Todo[],
  syncToBackend: SyncToBackendFn
): Promise<Todo[]> {
  if (todos.length === 0) {
    return [];
  }

  // Check if migration is needed
  const activeTodosWithoutSortOrder = todos.filter(
    (t) => isActiveTodo(t) && !t.sortOrder
  );

  if (activeTodosWithoutSortOrder.length === 0) {
    // All active todos already have sortOrder, no migration needed
    return todos;
  }

  // Assign sortOrders to todos without them
  const migratedTodos = assignMissingSortOrders(todos);

  // Find which todos were actually modified
  const modifiedTodos = migratedTodos.filter((migrated) => {
    const original = todos.find((t) => t.id === migrated.id);
    return original && !original.sortOrder && migrated.sortOrder;
  });

  // Sync each modified todo to backend (fire and forget, graceful failure)
  await Promise.all(
    modifiedTodos.map(async (todo) => {
      try {
        await syncToBackend('update', todo);
      } catch {
        // Log but don't fail migration - sortOrder will be synced next edit
        // eslint-disable-next-line no-console
        console.warn(`Failed to sync migrated todo ${todo.id}`);
      }
    })
  );

  return migratedTodos;
}
