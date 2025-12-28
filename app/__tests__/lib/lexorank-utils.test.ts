import { LexoRank } from 'lexorank';
import type { Todo } from '../../types/todo';
import {
  generateInitialSortOrder,
  generateBetweenSortOrder,
  assignMissingSortOrders,
} from '../../lib/lexorank-utils';

// Helper to create mock todos for testing
function createMockTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: crypto.randomUUID(),
    text: 'Test todo',
    createdAt: new Date(),
    updatedAt: new Date(),
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

  describe('assignMissingSortOrders', () => {
    it('should assign sortOrder to todos without one', () => {
      const todos: Todo[] = [
        createMockTodo({ id: '1' }),
        createMockTodo({ id: '2' }),
        createMockTodo({ id: '3' }),
      ];

      const result = assignMissingSortOrders(todos);

      expect(result).toHaveLength(3);
      result.forEach((todo) => {
        expect(todo.sortOrder).toBeDefined();
        expect(() => LexoRank.parse(todo.sortOrder!)).not.toThrow();
      });
    });

    it('should preserve existing sortOrder values', () => {
      const existingRank = LexoRank.middle().toString();
      const todos: Todo[] = [
        createMockTodo({ id: '1', sortOrder: existingRank }),
        createMockTodo({ id: '2' }), // no sortOrder
      ];

      const result = assignMissingSortOrders(todos);

      expect(result[0].sortOrder).toBe(existingRank);
      expect(result[1].sortOrder).toBeDefined();
      expect(result[1].sortOrder).not.toBe(existingRank);
    });

    it('should maintain relative order based on array position', () => {
      const todos: Todo[] = [
        createMockTodo({ id: 'first' }),
        createMockTodo({ id: 'second' }),
        createMockTodo({ id: 'third' }),
      ];

      const result = assignMissingSortOrders(todos);

      // First should come before second, second before third
      expect(result[0].sortOrder! < result[1].sortOrder!).toBe(true);
      expect(result[1].sortOrder! < result[2].sortOrder!).toBe(true);
    });

    it('should return empty array for empty input', () => {
      const result = assignMissingSortOrders([]);

      expect(result).toEqual([]);
    });

    it('should skip completed and deleted todos', () => {
      const todos: Todo[] = [
        createMockTodo({ id: '1' }), // active, no sortOrder
        createMockTodo({ id: '2', completedAt: new Date() }), // completed
        createMockTodo({ id: '3', deletedAt: new Date() }), // deleted
      ];

      const result = assignMissingSortOrders(todos);

      // Only first todo should have sortOrder assigned
      expect(result[0].sortOrder).toBeDefined();
      expect(result[1].sortOrder).toBeUndefined();
      expect(result[2].sortOrder).toBeUndefined();
    });
  });
});
