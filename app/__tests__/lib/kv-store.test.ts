/**
 * Tests for KVStore
 *
 * Uses Jest mocks to test the KVStore class without requiring actual Upstash credentials.
 */

import type { Todo } from '@/types/todo';

// Tell Jest to use the manual mock from __mocks__/@upstash/redis.ts
jest.mock('@upstash/redis');

// Import mock functions from the mocked module
import {
  __mockGet as mockGet,
  __mockSet as mockSet,
  __mockDel as mockDel,
} from '@upstash/redis';

// Import the module under test
import { KVStore, type SharedTodoList } from '@/lib/kv-store';

describe('KVStore', () => {
  const mockTodos: Todo[] = [
    {
      id: 'todo-1',
      text: 'Test todo 1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 'todo-2',
      text: 'Test todo 2',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (mockGet as jest.Mock).mockResolvedValue(null);
    (mockSet as jest.Mock).mockResolvedValue('OK');
    (mockDel as jest.Mock).mockResolvedValue(1);
  });

  describe('getList', () => {
    it('should return null for non-existent list', async () => {
      (mockGet as jest.Mock).mockResolvedValue(null);

      const result = await KVStore.getList('non-existent');

      expect(result).toBeNull();
      expect(mockGet).toHaveBeenCalledWith('shared:list:non-existent');
    });

    it('should return list when it exists', async () => {
      const storedList: SharedTodoList = {
        id: 'list-1',
        todos: mockTodos,
        lastModified: Date.now(),
        subscribers: ['user-1'],
      };
      (mockGet as jest.Mock).mockResolvedValue(storedList);

      const result = await KVStore.getList('list-1');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('list-1');
      expect(result?.todos).toHaveLength(2);
      expect(mockGet).toHaveBeenCalledWith('shared:list:list-1');
    });
  });

  describe('setList', () => {
    it('should create a new list with todos', async () => {
      await KVStore.setList('list-1', mockTodos, 'user-1');

      expect(mockSet).toHaveBeenCalledWith(
        'shared:list:list-1',
        expect.objectContaining({
          id: 'list-1',
          todos: mockTodos,
          subscribers: ['user-1'],
        })
      );
    });

    it('should set initial subscriber', async () => {
      await KVStore.setList('list-1', mockTodos, 'user-1');

      expect(mockSet).toHaveBeenCalledWith(
        'shared:list:list-1',
        expect.objectContaining({
          subscribers: ['user-1'],
        })
      );
    });

    it('should set lastModified timestamp', async () => {
      const before = Date.now();
      await KVStore.setList('list-1', mockTodos, 'user-1');
      const after = Date.now();

      const setCall = (mockSet as jest.Mock).mock.calls[0][1] as SharedTodoList;
      expect(setCall.lastModified).toBeGreaterThanOrEqual(before);
      expect(setCall.lastModified).toBeLessThanOrEqual(after);
    });
  });

  describe('updateTodos', () => {
    it('should update todos in existing list', async () => {
      const existingList: SharedTodoList = {
        id: 'list-1',
        todos: mockTodos,
        lastModified: Date.now() - 1000,
        subscribers: ['user-1'],
      };
      (mockGet as jest.Mock).mockResolvedValue(existingList);

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

      expect(mockSet).toHaveBeenCalledWith(
        'shared:list:list-1',
        expect.objectContaining({
          todos: updatedTodos,
        })
      );
    });

    it('should update lastModified timestamp', async () => {
      const oldTimestamp = Date.now() - 10000;
      const existingList: SharedTodoList = {
        id: 'list-1',
        todos: mockTodos,
        lastModified: oldTimestamp,
        subscribers: ['user-1'],
      };
      (mockGet as jest.Mock).mockResolvedValue(existingList);

      await KVStore.updateTodos('list-1', mockTodos);

      const setCall = (mockSet as jest.Mock).mock.calls[0][1] as SharedTodoList;
      expect(setCall.lastModified).toBeGreaterThan(oldTimestamp);
    });

    it('should throw error for non-existent list', async () => {
      (mockGet as jest.Mock).mockResolvedValue(null);

      await expect(
        KVStore.updateTodos('non-existent', mockTodos)
      ).rejects.toThrow('List not found');
    });
  });

  describe('addSubscriber', () => {
    it('should add new subscriber to list', async () => {
      const existingList: SharedTodoList = {
        id: 'list-1',
        todos: mockTodos,
        lastModified: Date.now(),
        subscribers: ['user-1'],
      };
      (mockGet as jest.Mock).mockResolvedValue(existingList);

      await KVStore.addSubscriber('list-1', 'user-2');

      expect(mockSet).toHaveBeenCalledWith(
        'shared:list:list-1',
        expect.objectContaining({
          subscribers: ['user-1', 'user-2'],
        })
      );
    });

    it('should not add duplicate subscriber', async () => {
      const existingList: SharedTodoList = {
        id: 'list-1',
        todos: mockTodos,
        lastModified: Date.now(),
        subscribers: ['user-1'],
      };
      (mockGet as jest.Mock).mockResolvedValue(existingList);

      await KVStore.addSubscriber('list-1', 'user-1');

      expect(mockSet).not.toHaveBeenCalled();
    });

    it('should throw error for non-existent list', async () => {
      (mockGet as jest.Mock).mockResolvedValue(null);

      await expect(
        KVStore.addSubscriber('non-existent', 'user-1')
      ).rejects.toThrow('List not found');
    });
  });

  describe('removeSubscriber', () => {
    it('should remove subscriber from list', async () => {
      const existingList: SharedTodoList = {
        id: 'list-1',
        todos: mockTodos,
        lastModified: Date.now(),
        subscribers: ['user-1', 'user-2'],
      };
      (mockGet as jest.Mock).mockResolvedValue(existingList);

      await KVStore.removeSubscriber('list-1', 'user-1');

      expect(mockSet).toHaveBeenCalledWith(
        'shared:list:list-1',
        expect.objectContaining({
          subscribers: ['user-2'],
        })
      );
    });

    it('should not throw error for non-existent list', async () => {
      (mockGet as jest.Mock).mockResolvedValue(null);

      await expect(
        KVStore.removeSubscriber('non-existent', 'user-1')
      ).resolves.not.toThrow();
    });
  });

  describe('deleteList', () => {
    it('should delete list completely', async () => {
      await KVStore.deleteList('list-1');

      expect(mockDel).toHaveBeenCalledWith('shared:list:list-1');
    });

    it('should not throw error for non-existent list', async () => {
      await expect(KVStore.deleteList('non-existent')).resolves.not.toThrow();
      expect(mockDel).toHaveBeenCalledWith('shared:list:non-existent');
    });
  });
});
