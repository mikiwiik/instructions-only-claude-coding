/**
 * Tests for KVStore
 */

import { KVStore } from '@/lib/kv-store';
import type { Todo } from '@/types/todo';

describe('KVStore', () => {
  const mockTodos: Todo[] = [
    {
      id: 'todo-1',
      text: 'Test todo 1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'todo-2',
      text: 'Test todo 2',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    // Clear the in-memory store between tests
    jest.clearAllMocks();
  });

  describe('getList', () => {
    it('should return null for non-existent list', async () => {
      const result = await KVStore.getList('non-existent');
      expect(result).toBeNull();
    });

    it('should return list after it is created', async () => {
      await KVStore.setList('list-1', mockTodos, 'user-1');
      const result = await KVStore.getList('list-1');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('list-1');
      expect(result?.todos).toHaveLength(2);
    });
  });

  describe('setList', () => {
    it('should create a new list with todos', async () => {
      await KVStore.setList('list-1', mockTodos, 'user-1');
      const result = await KVStore.getList('list-1');

      expect(result).toMatchObject({
        id: 'list-1',
        todos: mockTodos,
        subscribers: ['user-1'],
      });
      expect(result?.lastModified).toBeGreaterThan(0);
    });

    it('should set initial subscriber', async () => {
      await KVStore.setList('list-1', mockTodos, 'user-1');
      const result = await KVStore.getList('list-1');

      expect(result?.subscribers).toContain('user-1');
    });
  });

  describe('updateTodos', () => {
    it('should update todos in existing list', async () => {
      await KVStore.setList('list-1', mockTodos, 'user-1');

      const updatedTodos: Todo[] = [
        ...mockTodos,
        {
          id: 'todo-3',
          text: 'New todo',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      await KVStore.updateTodos('list-1', updatedTodos);
      const result = await KVStore.getList('list-1');

      expect(result?.todos).toHaveLength(3);
    });

    it('should update lastModified timestamp', async () => {
      await KVStore.setList('list-1', mockTodos, 'user-1');
      const firstResult = await KVStore.getList('list-1');
      const firstTimestamp = firstResult?.lastModified;

      // Wait a bit to ensure timestamp changes
      await new Promise((resolve) => setTimeout(resolve, 10));

      await KVStore.updateTodos('list-1', mockTodos);
      const secondResult = await KVStore.getList('list-1');

      expect(secondResult?.lastModified).toBeGreaterThan(firstTimestamp!);
    });

    it('should throw error for non-existent list', async () => {
      await expect(
        KVStore.updateTodos('non-existent', mockTodos)
      ).rejects.toThrow('List not found');
    });
  });

  describe('addSubscriber', () => {
    it('should add new subscriber to list', async () => {
      await KVStore.setList('list-1', mockTodos, 'user-1');
      await KVStore.addSubscriber('list-1', 'user-2');

      const result = await KVStore.getList('list-1');
      expect(result?.subscribers).toContain('user-2');
      expect(result?.subscribers).toHaveLength(2);
    });

    it('should not add duplicate subscriber', async () => {
      await KVStore.setList('list-1', mockTodos, 'user-1');
      await KVStore.addSubscriber('list-1', 'user-1');

      const result = await KVStore.getList('list-1');
      expect(result?.subscribers).toHaveLength(1);
    });

    it('should throw error for non-existent list', async () => {
      await expect(
        KVStore.addSubscriber('non-existent', 'user-1')
      ).rejects.toThrow('List not found');
    });
  });

  describe('removeSubscriber', () => {
    it('should remove subscriber from list', async () => {
      await KVStore.setList('list-1', mockTodos, 'user-1');
      await KVStore.addSubscriber('list-1', 'user-2');
      await KVStore.removeSubscriber('list-1', 'user-1');

      const result = await KVStore.getList('list-1');
      expect(result?.subscribers).not.toContain('user-1');
      expect(result?.subscribers).toHaveLength(1);
    });

    it('should not throw error for non-existent list', async () => {
      await expect(
        KVStore.removeSubscriber('non-existent', 'user-1')
      ).resolves.not.toThrow();
    });
  });

  describe('deleteList', () => {
    it('should delete list completely', async () => {
      await KVStore.setList('list-1', mockTodos, 'user-1');
      await KVStore.deleteList('list-1');

      const result = await KVStore.getList('list-1');
      expect(result).toBeNull();
    });

    it('should not throw error for non-existent list', async () => {
      await expect(KVStore.deleteList('non-existent')).resolves.not.toThrow();
    });
  });
});
