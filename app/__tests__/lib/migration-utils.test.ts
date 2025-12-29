import { migrateToLexoRank } from '../../lib/migration-utils';
import { Todo } from '../../types/todo';

describe('migration-utils', () => {
  describe('migrateToLexoRank', () => {
    const mockSyncToBackend = jest.fn();

    beforeEach(() => {
      mockSyncToBackend.mockResolvedValue(undefined);
      jest.clearAllMocks();
    });

    const createTodo = (overrides: Partial<Todo> = {}): Todo => ({
      id: `todo-${Math.random().toString(36).slice(2)}`,
      text: 'Test todo',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    });

    it('should assign sortOrder to todos without one', async () => {
      const todos: Todo[] = [
        createTodo({ id: 'todo-1', text: 'First' }),
        createTodo({ id: 'todo-2', text: 'Second' }),
      ];

      const result = await migrateToLexoRank(todos, mockSyncToBackend);

      expect(result).toHaveLength(2);
      expect(result[0].sortOrder).toBeDefined();
      expect(result[1].sortOrder).toBeDefined();
    });

    it('should preserve existing sortOrders', async () => {
      const existingSortOrder = '0|hzzzzz:';
      const todos: Todo[] = [
        createTodo({ id: 'todo-1', sortOrder: existingSortOrder }),
        createTodo({ id: 'todo-2' }),
      ];

      const result = await migrateToLexoRank(todos, mockSyncToBackend);

      const preserved = result.find((t) => t.id === 'todo-1');
      expect(preserved?.sortOrder).toBe(existingSortOrder);
    });

    it('should sync migrated todos to backend', async () => {
      const todos: Todo[] = [
        createTodo({ id: 'todo-1' }),
        createTodo({ id: 'todo-2' }),
      ];

      await migrateToLexoRank(todos, mockSyncToBackend);

      // Should sync each migrated todo
      expect(mockSyncToBackend).toHaveBeenCalledWith(
        'update',
        expect.objectContaining({ id: 'todo-1', sortOrder: expect.any(String) })
      );
      expect(mockSyncToBackend).toHaveBeenCalledWith(
        'update',
        expect.objectContaining({ id: 'todo-2', sortOrder: expect.any(String) })
      );
    });

    it('should be idempotent - not modify already migrated todos', async () => {
      const existingSortOrder = '0|hzzzzz:';
      const todos: Todo[] = [
        createTodo({ id: 'todo-1', sortOrder: existingSortOrder }),
      ];

      const result = await migrateToLexoRank(todos, mockSyncToBackend);

      expect(result[0].sortOrder).toBe(existingSortOrder);
      // Should not sync anything since all todos already have sortOrder
      expect(mockSyncToBackend).not.toHaveBeenCalled();
    });

    it('should return unchanged array if all todos have sortOrder', async () => {
      const todos: Todo[] = [
        createTodo({ id: 'todo-1', sortOrder: '0|hzzzzz:' }),
        createTodo({ id: 'todo-2', sortOrder: '0|i00000:' }),
      ];

      const result = await migrateToLexoRank(todos, mockSyncToBackend);

      expect(result).toHaveLength(2);
      expect(mockSyncToBackend).not.toHaveBeenCalled();
    });

    it('should handle empty todo list', async () => {
      const result = await migrateToLexoRank([], mockSyncToBackend);

      expect(result).toHaveLength(0);
      expect(mockSyncToBackend).not.toHaveBeenCalled();
    });

    it('should skip completed todos during migration', async () => {
      const todos: Todo[] = [
        createTodo({ id: 'active-1' }),
        createTodo({ id: 'completed-1', completedAt: new Date() }),
      ];

      const result = await migrateToLexoRank(todos, mockSyncToBackend);

      const activeTodo = result.find((t) => t.id === 'active-1');
      const completedTodo = result.find((t) => t.id === 'completed-1');

      expect(activeTodo?.sortOrder).toBeDefined();
      expect(completedTodo?.sortOrder).toBeUndefined();
      // Only sync the active todo
      expect(mockSyncToBackend).toHaveBeenCalledTimes(1);
      expect(mockSyncToBackend).toHaveBeenCalledWith(
        'update',
        expect.objectContaining({ id: 'active-1' })
      );
    });

    it('should skip deleted todos during migration', async () => {
      const todos: Todo[] = [
        createTodo({ id: 'active-1' }),
        createTodo({ id: 'deleted-1', deletedAt: new Date() }),
      ];

      const result = await migrateToLexoRank(todos, mockSyncToBackend);

      const activeTodo = result.find((t) => t.id === 'active-1');
      const deletedTodo = result.find((t) => t.id === 'deleted-1');

      expect(activeTodo?.sortOrder).toBeDefined();
      expect(deletedTodo?.sortOrder).toBeUndefined();
    });

    it('should continue migration even if one sync fails', async () => {
      mockSyncToBackend
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Sync failed'))
        .mockResolvedValueOnce(undefined);

      const todos: Todo[] = [
        createTodo({ id: 'todo-1' }),
        createTodo({ id: 'todo-2' }),
        createTodo({ id: 'todo-3' }),
      ];

      // Should not throw
      const result = await migrateToLexoRank(todos, mockSyncToBackend);

      // Should still return migrated todos even with sync failure
      expect(result).toHaveLength(3);
      expect(result.every((t) => t.sortOrder !== undefined)).toBe(true);
    });
  });
});
