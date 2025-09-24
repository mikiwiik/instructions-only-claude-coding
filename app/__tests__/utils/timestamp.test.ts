import { formatRelativeTime, getContextualTimestamp } from '../../utils/timestamp';
import { Todo } from '../../types/todo';

// Mock current time for consistent testing
const MOCK_NOW = new Date('2024-01-15T12:00:00Z');
const realDateNow = Date.now.bind(global.Date);

beforeEach(() => {
  global.Date.now = jest.fn(() => MOCK_NOW.getTime());
  jest.useFakeTimers();
  jest.setSystemTime(MOCK_NOW);
});

afterEach(() => {
  global.Date.now = realDateNow;
  jest.useRealTimers();
});

describe('formatRelativeTime', () => {
  describe('time range formatting', () => {
    it('should format time less than 1 minute ago', () => {
      const date = new Date(MOCK_NOW.getTime() - 30 * 1000); // 30 seconds ago
      expect(formatRelativeTime(date, 'Created')).toBe('Created 0 minutes ago');
    });

    it('should format minutes correctly', () => {
      const date = new Date(MOCK_NOW.getTime() - 5 * 60 * 1000); // 5 minutes ago
      expect(formatRelativeTime(date, 'Updated')).toBe('Updated 5 minutes ago');
    });

    it('should handle singular minute', () => {
      const date = new Date(MOCK_NOW.getTime() - 1 * 60 * 1000); // 1 minute ago
      expect(formatRelativeTime(date, 'Completed')).toBe('Completed 1 minute ago');
    });

    it('should format hours correctly', () => {
      const date = new Date(MOCK_NOW.getTime() - 3 * 60 * 60 * 1000); // 3 hours ago
      expect(formatRelativeTime(date, 'Deleted')).toBe('Deleted 3 hours ago');
    });

    it('should handle singular hour', () => {
      const date = new Date(MOCK_NOW.getTime() - 1 * 60 * 60 * 1000); // 1 hour ago
      expect(formatRelativeTime(date, 'Updated')).toBe('Updated 1 hour ago');
    });

    it('should format days correctly', () => {
      const date = new Date(MOCK_NOW.getTime() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
      expect(formatRelativeTime(date, 'Created')).toBe('Created 5 days ago');
    });

    it('should handle singular day', () => {
      const date = new Date(MOCK_NOW.getTime() - 1 * 24 * 60 * 60 * 1000); // 1 day ago
      expect(formatRelativeTime(date, 'Completed')).toBe('Completed 1 day ago');
    });

    it('should format weeks correctly', () => {
      const date = new Date(MOCK_NOW.getTime() - 2 * 7 * 24 * 60 * 60 * 1000); // 2 weeks ago
      expect(formatRelativeTime(date, 'Updated')).toBe('Updated 2 weeks ago');
    });

    it('should handle singular week', () => {
      const date = new Date(MOCK_NOW.getTime() - 1 * 7 * 24 * 60 * 60 * 1000); // 1 week ago
      expect(formatRelativeTime(date, 'Deleted')).toBe('Deleted 1 week ago');
    });

    it('should format absolute date for dates older than 30 days', () => {
      const date = new Date(MOCK_NOW.getTime() - 35 * 24 * 60 * 60 * 1000); // 35 days ago
      expect(formatRelativeTime(date, 'Created')).toBe('Created Dec 11, 2023');
    });
  });

  describe('boundary conditions', () => {
    it('should handle exactly 1 hour', () => {
      const date = new Date(MOCK_NOW.getTime() - 60 * 60 * 1000); // exactly 1 hour ago
      expect(formatRelativeTime(date, 'Updated')).toBe('Updated 1 hour ago');
    });

    it('should handle exactly 24 hours (transition to days)', () => {
      const date = new Date(MOCK_NOW.getTime() - 24 * 60 * 60 * 1000); // exactly 24 hours ago
      expect(formatRelativeTime(date, 'Created')).toBe('Created 1 day ago');
    });

    it('should handle exactly 7 days (transition to weeks)', () => {
      const date = new Date(MOCK_NOW.getTime() - 7 * 24 * 60 * 60 * 1000); // exactly 7 days ago
      expect(formatRelativeTime(date, 'Deleted')).toBe('Deleted 1 week ago');
    });

    it('should handle exactly 30 days (transition to absolute)', () => {
      const date = new Date(MOCK_NOW.getTime() - 30 * 24 * 60 * 60 * 1000); // exactly 30 days ago
      expect(formatRelativeTime(date, 'Updated')).toBe('Updated 4 weeks ago');
    });

    it('should handle exactly 31 days (first absolute date)', () => {
      const date = new Date(MOCK_NOW.getTime() - 31 * 24 * 60 * 60 * 1000); // exactly 31 days ago
      expect(formatRelativeTime(date, 'Created')).toBe('Created Dec 15, 2023');
    });
  });

  describe('edge cases', () => {
    it('should handle future dates gracefully', () => {
      const date = new Date(MOCK_NOW.getTime() + 60 * 60 * 1000); // 1 hour in future
      expect(formatRelativeTime(date, 'Updated')).toBe('Updated 0 minutes ago');
    });

    it('should handle very old dates', () => {
      const date = new Date('2020-01-01');
      expect(formatRelativeTime(date, 'Created')).toBe('Created Jan 1, 2020');
    });

    it('should handle different action types', () => {
      const date = new Date(MOCK_NOW.getTime() - 30 * 60 * 1000); // 30 minutes ago

      expect(formatRelativeTime(date, 'Created')).toBe('Created 30 minutes ago');
      expect(formatRelativeTime(date, 'Updated')).toBe('Updated 30 minutes ago');
      expect(formatRelativeTime(date, 'Completed')).toBe('Completed 30 minutes ago');
      expect(formatRelativeTime(date, 'Deleted')).toBe('Deleted 30 minutes ago');
    });

    it('should handle empty or undefined action', () => {
      const date = new Date(MOCK_NOW.getTime() - 60 * 60 * 1000); // 1 hour ago
      expect(formatRelativeTime(date, '')).toBe(' 1 hour ago');
    });
  });

  describe('date formatting consistency', () => {
    it('should use consistent month abbreviations', () => {
      const dates = [
        new Date('2023-01-15'), // Jan
        new Date('2023-02-15'), // Feb
        new Date('2023-03-15'), // Mar
        new Date('2023-04-15'), // Apr
        new Date('2023-05-15'), // May
        new Date('2023-06-15'), // Jun
        new Date('2023-07-15'), // Jul
        new Date('2023-08-15'), // Aug
        new Date('2023-09-15'), // Sep
        new Date('2023-10-15'), // Oct
        new Date('2023-11-15'), // Nov
        new Date('2023-12-15'), // Dec
      ];

      const results = dates.map(date => formatRelativeTime(date, 'Created'));

      expect(results).toContain('Created Jan 15, 2023');
      expect(results).toContain('Created Feb 15, 2023');
      expect(results).toContain('Created Dec 15, 2023');
    });

    it('should include year in absolute format', () => {
      const date = new Date('2020-06-15');
      expect(formatRelativeTime(date, 'Updated')).toBe('Updated Jun 15, 2020');
    });
  });

  describe('performance and reliability', () => {
    it('should handle large time differences efficiently', () => {
      const veryOldDate = new Date('1990-01-01');
      const start = performance.now();
      const result = formatRelativeTime(veryOldDate, 'Created');
      const end = performance.now();

      expect(result).toBe('Created Jan 1, 1990');
      expect(end - start).toBeLessThan(10); // Should complete in less than 10ms
    });

    it('should be consistent across multiple calls', () => {
      const date = new Date(MOCK_NOW.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago

      const result1 = formatRelativeTime(date, 'Updated');
      const result2 = formatRelativeTime(date, 'Updated');
      const result3 = formatRelativeTime(date, 'Updated');

      expect(result1).toBe('Updated 2 hours ago');
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });
  });
});

describe('getContextualTimestamp', () => {
  const createMockTodo = (overrides: Partial<Todo & { deletedAt?: Date }> = {}): Todo & { deletedAt?: Date } => ({
    id: '1',
    text: 'Test todo',
    completed: false,
    createdAt: new Date(MOCK_NOW.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(MOCK_NOW.getTime() - 24 * 60 * 60 * 1000), // 1 day ago (same as created)
    ...overrides,
  });

  describe('priority logic', () => {
    it('should prioritize deletedAt over other timestamps', () => {
      const todo = createMockTodo({
        deletedAt: new Date(MOCK_NOW.getTime() - 30 * 60 * 1000), // 30 minutes ago
        updatedAt: new Date(MOCK_NOW.getTime() - 60 * 60 * 1000), // 1 hour ago (newer than created)
        completed: true,
      });

      expect(getContextualTimestamp(todo)).toBe('Deleted 30 minutes ago');
    });

    it('should show "Completed" when todo is completed and updatedAt > createdAt', () => {
      const todo = createMockTodo({
        completed: true,
        updatedAt: new Date(MOCK_NOW.getTime() - 30 * 60 * 1000), // 30 minutes ago (newer than created)
      });

      expect(getContextualTimestamp(todo)).toBe('Completed 30 minutes ago');
    });

    it('should show "Updated" when todo is not completed and updatedAt > createdAt', () => {
      const todo = createMockTodo({
        completed: false,
        updatedAt: new Date(MOCK_NOW.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago (newer than created)
      });

      expect(getContextualTimestamp(todo)).toBe('Updated 2 hours ago');
    });

    it('should fall back to "Created" when updatedAt equals createdAt', () => {
      const createdDate = new Date(MOCK_NOW.getTime() - 3 * 60 * 60 * 1000); // 3 hours ago
      const todo = createMockTodo({
        createdAt: createdDate,
        updatedAt: createdDate, // Same as created
        completed: false,
      });

      expect(getContextualTimestamp(todo)).toBe('Created 3 hours ago');
    });

    it('should fall back to "Created" when updatedAt is before createdAt (edge case)', () => {
      const todo = createMockTodo({
        createdAt: new Date(MOCK_NOW.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        updatedAt: new Date(MOCK_NOW.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago (before created)
        completed: false,
      });

      expect(getContextualTimestamp(todo)).toBe('Created 2 hours ago');
    });
  });

  describe('completed todos context', () => {
    it('should show "Completed" for completed todos with newer updatedAt', () => {
      const todo = createMockTodo({
        completed: true,
        createdAt: new Date(MOCK_NOW.getTime() - 5 * 60 * 60 * 1000), // 5 hours ago
        updatedAt: new Date(MOCK_NOW.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
      });

      expect(getContextualTimestamp(todo)).toBe('Completed 1 hour ago');
    });

    it('should show "Created" for completed todos when completion time equals creation time', () => {
      const sameTime = new Date(MOCK_NOW.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
      const todo = createMockTodo({
        completed: true,
        createdAt: sameTime,
        updatedAt: sameTime,
      });

      expect(getContextualTimestamp(todo)).toBe('Created 2 hours ago');
    });
  });

  describe('soft delete scenarios', () => {
    it('should show "Deleted" for soft-deleted incomplete todos', () => {
      const todo = createMockTodo({
        completed: false,
        deletedAt: new Date(MOCK_NOW.getTime() - 15 * 60 * 1000), // 15 minutes ago
        updatedAt: new Date(MOCK_NOW.getTime() - 60 * 60 * 1000), // 1 hour ago
      });

      expect(getContextualTimestamp(todo)).toBe('Deleted 15 minutes ago');
    });

    it('should show "Deleted" for soft-deleted completed todos', () => {
      const todo = createMockTodo({
        completed: true,
        deletedAt: new Date(MOCK_NOW.getTime() - 45 * 60 * 1000), // 45 minutes ago
        updatedAt: new Date(MOCK_NOW.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      });

      expect(getContextualTimestamp(todo)).toBe('Deleted 45 minutes ago');
    });

    it('should handle deleted todos without deletedAt field (defensive)', () => {
      const todo = createMockTodo({
        completed: false,
        updatedAt: new Date(MOCK_NOW.getTime() - 30 * 60 * 1000), // 30 minutes ago
      });

      // Remove deletedAt to test undefined case
      const { deletedAt, ...todoWithoutDeletedAt } = todo;

      expect(getContextualTimestamp(todoWithoutDeletedAt)).toBe('Updated 30 minutes ago');
    });
  });

  describe('edge cases and data validation', () => {
    it('should handle todos with future updatedAt dates', () => {
      const todo = createMockTodo({
        completed: false,
        createdAt: new Date(MOCK_NOW.getTime() - 60 * 60 * 1000), // 1 hour ago
        updatedAt: new Date(MOCK_NOW.getTime() + 60 * 60 * 1000), // 1 hour in future
      });

      expect(getContextualTimestamp(todo)).toBe('Updated 0 minutes ago');
    });

    it('should handle todos with very old timestamps', () => {
      const todo = createMockTodo({
        completed: true,
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date('2020-01-15'),
      });

      expect(getContextualTimestamp(todo)).toBe('Completed Jan 15, 2020');
    });

    it('should handle todos with millisecond differences in timestamps', () => {
      const baseTime = MOCK_NOW.getTime() - 60 * 60 * 1000; // 1 hour ago
      const todo = createMockTodo({
        completed: false,
        createdAt: new Date(baseTime),
        updatedAt: new Date(baseTime + 1), // 1 millisecond later
      });

      expect(getContextualTimestamp(todo)).toBe('Updated 1 hour ago');
    });

    it('should be consistent across multiple calls', () => {
      const todo = createMockTodo({
        completed: true,
        updatedAt: new Date(MOCK_NOW.getTime() - 90 * 60 * 1000), // 1.5 hours ago
      });

      const result1 = getContextualTimestamp(todo);
      const result2 = getContextualTimestamp(todo);
      const result3 = getContextualTimestamp(todo);

      expect(result1).toBe('Completed 1 hour ago');
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });
  });

  describe('performance tests', () => {
    it('should perform efficiently with large datasets', () => {
      const todos = Array.from({ length: 1000 }, (_, i) =>
        createMockTodo({
          id: `${i}`,
          updatedAt: new Date(MOCK_NOW.getTime() - i * 60 * 1000), // Each todo 1 minute older
        })
      );

      const start = performance.now();
      todos.forEach(todo => getContextualTimestamp(todo));
      const end = performance.now();

      expect(end - start).toBeLessThan(50); // Should complete in less than 50ms
    });

    it('should handle concurrent access safely', async () => {
      const todo = createMockTodo({
        completed: false,
        updatedAt: new Date(MOCK_NOW.getTime() - 30 * 60 * 1000), // 30 minutes ago
      });

      const promises = Array.from({ length: 100 }, () =>
        Promise.resolve(getContextualTimestamp(todo))
      );

      const results = await Promise.all(promises);

      // All results should be identical
      expect(results.every(result => result === 'Updated 30 minutes ago')).toBe(true);
    });
  });
});