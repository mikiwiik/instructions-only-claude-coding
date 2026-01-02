import { LexoRank } from 'lexorank';
import type { Todo } from '../types/todo';

function isActiveTodo(item: Todo): boolean {
  return !item.completedAt && !item.deletedAt;
}

/** Generate sortOrder for a new item at top of list. */
export function generateInitialSortOrder(items: Todo[]): string {
  const activeWithRank = items.filter(
    (item) => isActiveTodo(item) && item.sortOrder
  );

  if (activeWithRank.length === 0) {
    return LexoRank.middle().toString();
  }

  const sortedByRank = [...activeWithRank].sort((a, b) =>
    a.sortOrder.localeCompare(b.sortOrder)
  );

  const firstRank = LexoRank.parse(sortedByRank[0].sortOrder);
  return firstRank.genPrev().toString();
}

/** Generate sortOrder between two existing ranks. */
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
