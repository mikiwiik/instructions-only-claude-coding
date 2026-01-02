import { LexoRank } from 'lexorank';
import type { Todo } from '../../types/todo';
import {
  generateInitialSortOrder,
  generateBetweenSortOrder,
} from '../../lib/lexorank-utils';

// Helper to create mock todos for testing
function createMockTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: crypto.randomUUID(),
    text: 'Test todo',
    createdAt: new Date(),
    updatedAt: new Date(),
    sortOrder: LexoRank.middle().toString(),
    ...overrides,
  };
}

describe('lexorank-utils', () => {
  describe('generateInitialSortOrder', () => {
    it('should return a valid LexoRank string for empty list', () => {
      const sortOrder = generateInitialSortOrder([]);

      expect(typeof sortOrder).toBe('string');
      expect(sortOrder.length).toBeGreaterThan(0);
      // Should be parseable by LexoRank
      expect(() => LexoRank.parse(sortOrder)).not.toThrow();
    });

    it('should return rank before first todo when list has items', () => {
      const existingRank = LexoRank.middle().toString();
      const todos: Todo[] = [createMockTodo({ sortOrder: existingRank })];

      const newSortOrder = generateInitialSortOrder(todos);

      // New rank should come before existing rank lexicographically
      expect(newSortOrder < existingRank).toBe(true);
    });

    it('should handle todos without sortOrder (legacy todos)', () => {
      const todos: Todo[] = [
        createMockTodo(), // no sortOrder
        createMockTodo(), // no sortOrder
      ];

      const sortOrder = generateInitialSortOrder(todos);

      expect(typeof sortOrder).toBe('string');
      expect(() => LexoRank.parse(sortOrder)).not.toThrow();
    });

    it('should filter out completed and deleted todos', () => {
      const activeRank = LexoRank.middle().toString();
      const todos: Todo[] = [
        createMockTodo({ sortOrder: activeRank }), // active
        createMockTodo({ sortOrder: '0|000001:', completedAt: new Date() }), // completed
        createMockTodo({ sortOrder: '0|000002:', deletedAt: new Date() }), // deleted
      ];

      const newSortOrder = generateInitialSortOrder(todos);

      // Should only consider the active todo's rank
      expect(newSortOrder < activeRank).toBe(true);
    });
  });

  describe('generateBetweenSortOrder', () => {
    it('should generate rank between two existing ranks', () => {
      const rankA = LexoRank.middle().genPrev().toString();
      const rankB = LexoRank.middle().genNext().toString();

      const between = generateBetweenSortOrder(rankA, rankB);

      expect(between > rankA).toBe(true);
      expect(between < rankB).toBe(true);
    });

    it('should generate rank after when no afterRank provided', () => {
      const beforeRank = LexoRank.middle().toString();

      const newRank = generateBetweenSortOrder(beforeRank, undefined);

      expect(newRank > beforeRank).toBe(true);
    });

    it('should generate rank before when no beforeRank provided', () => {
      const afterRank = LexoRank.middle().toString();

      const newRank = generateBetweenSortOrder(undefined, afterRank);

      expect(newRank < afterRank).toBe(true);
    });

    it('should generate middle rank when both undefined', () => {
      const rank = generateBetweenSortOrder(undefined, undefined);

      expect(typeof rank).toBe('string');
      expect(() => LexoRank.parse(rank)).not.toThrow();
    });
  });
});
