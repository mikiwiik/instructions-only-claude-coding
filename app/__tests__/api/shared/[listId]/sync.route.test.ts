/**
 * Tests for the sync API route
 */

import type { Todo } from '@/types/todo';
import type { SharedTodoList } from '@/lib/kv-store';

// Mock KVStore before importing route
jest.mock('@/lib/kv-store', () => {
  return {
    KVStore: {
      getList: jest.fn(),
      setList: jest.fn(),
      updateTodos: jest.fn(),
    },
  };
});

// Mock next/server before importing route
jest.mock('next/server', () => {
  class MockNextRequest {
    url: string;
    method: string;
    private bodyContent: string;

    constructor(url: string, options?: { method?: string; body?: string }) {
      this.url = url;
      this.method = options?.method || 'GET';
      this.bodyContent = options?.body || '';
    }

    async json() {
      return JSON.parse(this.bodyContent);
    }
  }

  return {
    NextRequest: MockNextRequest,
    NextResponse: {
      json: (data: unknown, init?: { status?: number }) => ({
        status: init?.status || 200,
        json: async () => data,
      }),
    },
  };
});

// Import route handlers and KVStore after mocks are set up
import { POST, GET } from '@/api/shared/[listId]/sync/route';
import { KVStore } from '@/lib/kv-store';

// Create request helper
function createRequest(
  url: string,
  options?: { method?: string; body?: string }
) {
  const { NextRequest } = jest.requireMock('next/server');
  return new NextRequest(url, options);
}

// Get mocked KVStore
const mockedKVStore = jest.mocked(KVStore);

describe('Sync API Route', () => {
  const mockTodos: Todo[] = [
    {
      id: 'todo-1',
      text: 'Test todo 1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      sortOrder: '0|0i0000:',
    },
    {
      id: 'todo-2',
      text: 'Test todo 2',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      sortOrder: '0|0i0001:',
    },
  ];

  const mockList: SharedTodoList = {
    id: 'list-1',
    todos: mockTodos,
    lastModified: Date.now(),
    subscribers: ['user-1'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return list when it exists', async () => {
      mockedKVStore.getList.mockResolvedValue(mockList);

      const request = createRequest('http://localhost/api/shared/list-1/sync');
      const response = await GET(request as never, {
        params: Promise.resolve({ listId: 'list-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.todos).toHaveLength(2);
      expect(data.lastModified).toBe(mockList.lastModified);
    });

    it('should return 404 for non-existent list', async () => {
      mockedKVStore.getList.mockResolvedValue(null);

      const request = createRequest(
        'http://localhost/api/shared/non-existent/sync'
      );
      const response = await GET(request as never, {
        params: Promise.resolve({ listId: 'non-existent' }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('List not found');
    });

    it('should return 500 on error', async () => {
      mockedKVStore.getList.mockRejectedValue(new Error('Database error'));

      const request = createRequest('http://localhost/api/shared/list-1/sync');
      const response = await GET(request as never, {
        params: Promise.resolve({ listId: 'list-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch list');
    });
  });

  describe('POST', () => {
    describe('create operation', () => {
      it('should create a new todo', async () => {
        mockedKVStore.getList.mockResolvedValue(mockList);
        mockedKVStore.updateTodos.mockResolvedValue(undefined);

        const newTodo: Todo = {
          id: 'todo-3',
          text: 'New todo',
          createdAt: new Date(),
          updatedAt: new Date(),
          sortOrder: '0|0i0002:',
        };

        const request = createRequest(
          'http://localhost/api/shared/list-1/sync',
          {
            method: 'POST',
            body: JSON.stringify({
              operation: 'create',
              data: newTodo,
            }),
          }
        );

        const response = await POST(request as never, {
          params: Promise.resolve({ listId: 'list-1' }),
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.todos).toHaveLength(3);
        expect(mockedKVStore.updateTodos).toHaveBeenCalledWith(
          'list-1',
          expect.arrayContaining([expect.objectContaining({ id: 'todo-3' })])
        );
      });
    });

    describe('update operation', () => {
      it('should update an existing todo', async () => {
        mockedKVStore.getList.mockResolvedValue(mockList);
        mockedKVStore.updateTodos.mockResolvedValue(undefined);

        const updatedTodo: Todo = {
          ...mockTodos[0],
          text: 'Updated text',
        };

        const request = createRequest(
          'http://localhost/api/shared/list-1/sync',
          {
            method: 'POST',
            body: JSON.stringify({
              operation: 'update',
              data: updatedTodo,
            }),
          }
        );

        const response = await POST(request as never, {
          params: Promise.resolve({ listId: 'list-1' }),
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(mockedKVStore.updateTodos).toHaveBeenCalledWith(
          'list-1',
          expect.arrayContaining([
            expect.objectContaining({ id: 'todo-1', text: 'Updated text' }),
          ])
        );
      });

      it('should not fail when updating non-existent todo', async () => {
        mockedKVStore.getList.mockResolvedValue(mockList);
        mockedKVStore.updateTodos.mockResolvedValue(undefined);

        const updatedTodo: Todo = {
          id: 'non-existent',
          text: 'Updated text',
          createdAt: new Date(),
          updatedAt: new Date(),
          sortOrder: '0|0i0003:',
        };

        const request = createRequest(
          'http://localhost/api/shared/list-1/sync',
          {
            method: 'POST',
            body: JSON.stringify({
              operation: 'update',
              data: updatedTodo,
            }),
          }
        );

        const response = await POST(request as never, {
          params: Promise.resolve({ listId: 'list-1' }),
        });

        expect(response.status).toBe(200);
      });
    });

    describe('delete operation', () => {
      it('should delete a todo', async () => {
        mockedKVStore.getList.mockResolvedValue(mockList);
        mockedKVStore.updateTodos.mockResolvedValue(undefined);

        const request = createRequest(
          'http://localhost/api/shared/list-1/sync',
          {
            method: 'POST',
            body: JSON.stringify({
              operation: 'delete',
              data: 'todo-1',
            }),
          }
        );

        const response = await POST(request as never, {
          params: Promise.resolve({ listId: 'list-1' }),
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.todos).toHaveLength(1);
        expect(data.todos[0].id).toBe('todo-2');
      });
    });

    describe('reorder-single operation', () => {
      it('should update a single todo sortOrder', async () => {
        const todosWithSortOrder: Todo[] = [
          { ...mockTodos[0], sortOrder: '0|0i0000:' },
          { ...mockTodos[1], sortOrder: '0|0i0001:' },
        ];
        const listWithSortOrder: SharedTodoList = {
          ...mockList,
          todos: todosWithSortOrder,
        };
        mockedKVStore.getList.mockResolvedValue(listWithSortOrder);
        mockedKVStore.updateTodos.mockResolvedValue(undefined);

        const updatedTodo: Todo = {
          ...todosWithSortOrder[0],
          sortOrder: '0|0i0002:',
        };

        const request = createRequest(
          'http://localhost/api/shared/list-1/sync',
          {
            method: 'POST',
            body: JSON.stringify({
              operation: 'reorder-single',
              data: updatedTodo,
            }),
          }
        );

        const response = await POST(request as never, {
          params: Promise.resolve({ listId: 'list-1' }),
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.todos).toHaveLength(2);
        expect(mockedKVStore.updateTodos).toHaveBeenCalledWith(
          'list-1',
          expect.arrayContaining([
            expect.objectContaining({ id: 'todo-1', sortOrder: '0|0i0002:' }),
          ])
        );
      });

      it('should be a no-op when todo ID does not exist', async () => {
        mockedKVStore.getList.mockResolvedValue(mockList);
        mockedKVStore.updateTodos.mockResolvedValue(undefined);

        const nonExistentTodo: Todo = {
          id: 'non-existent',
          text: 'Does not exist',
          createdAt: new Date(),
          updatedAt: new Date(),
          sortOrder: '0|0i0000:',
        };

        const request = createRequest(
          'http://localhost/api/shared/list-1/sync',
          {
            method: 'POST',
            body: JSON.stringify({
              operation: 'reorder-single',
              data: nonExistentTodo,
            }),
          }
        );

        const response = await POST(request as never, {
          params: Promise.resolve({ listId: 'list-1' }),
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        // Original todos should be unchanged
        expect(data.todos).toHaveLength(2);
        expect(data.todos[0].id).toBe('todo-1');
        expect(data.todos[1].id).toBe('todo-2');
      });

      it('should preserve other todos when updating one', async () => {
        const todosWithSortOrder: Todo[] = [
          { ...mockTodos[0], sortOrder: '0|0i0000:' },
          { ...mockTodos[1], sortOrder: '0|0i0001:' },
        ];
        const listWithSortOrder: SharedTodoList = {
          ...mockList,
          todos: todosWithSortOrder,
        };
        mockedKVStore.getList.mockResolvedValue(listWithSortOrder);
        mockedKVStore.updateTodos.mockResolvedValue(undefined);

        const updatedTodo: Todo = {
          ...todosWithSortOrder[0],
          sortOrder: '0|0i0002:',
        };

        const request = createRequest(
          'http://localhost/api/shared/list-1/sync',
          {
            method: 'POST',
            body: JSON.stringify({
              operation: 'reorder-single',
              data: updatedTodo,
            }),
          }
        );

        const response = await POST(request as never, {
          params: Promise.resolve({ listId: 'list-1' }),
        });
        const data = await response.json();

        // Verify second todo is preserved unchanged
        const secondTodo = data.todos.find((t: Todo) => t.id === 'todo-2');
        expect(secondTodo).toBeDefined();
        expect(secondTodo.sortOrder).toBe('0|0i0001:');
        expect(secondTodo.text).toBe('Test todo 2');
      });

      it('should return updated todos array in response', async () => {
        const todosWithSortOrder: Todo[] = [
          { ...mockTodos[0], sortOrder: '0|0i0000:' },
          { ...mockTodos[1], sortOrder: '0|0i0001:' },
        ];
        const listWithSortOrder: SharedTodoList = {
          ...mockList,
          todos: todosWithSortOrder,
        };
        mockedKVStore.getList.mockResolvedValue(listWithSortOrder);
        mockedKVStore.updateTodos.mockResolvedValue(undefined);

        const updatedTodo: Todo = {
          ...todosWithSortOrder[0],
          sortOrder: '0|0i0002:',
        };

        const request = createRequest(
          'http://localhost/api/shared/list-1/sync',
          {
            method: 'POST',
            body: JSON.stringify({
              operation: 'reorder-single',
              data: updatedTodo,
            }),
          }
        );

        const response = await POST(request as never, {
          params: Promise.resolve({ listId: 'list-1' }),
        });
        const data = await response.json();

        expect(data).toHaveProperty('success', true);
        expect(data).toHaveProperty('todos');
        expect(data).toHaveProperty('timestamp');
        expect(Array.isArray(data.todos)).toBe(true);
      });
    });

    describe('error handling', () => {
      it('should return 404 for non-existent list on non-create operations', async () => {
        mockedKVStore.getList.mockResolvedValue(null);

        const request = createRequest(
          'http://localhost/api/shared/non-existent/sync',
          {
            method: 'POST',
            body: JSON.stringify({
              operation: 'update',
              data: { id: 'todo-1', text: 'Updated' },
            }),
          }
        );

        const response = await POST(request as never, {
          params: Promise.resolve({ listId: 'non-existent' }),
        });
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.error).toBe('List not found');
      });

      it('should return 400 for invalid operation', async () => {
        mockedKVStore.getList.mockResolvedValue(mockList);

        const request = createRequest(
          'http://localhost/api/shared/list-1/sync',
          {
            method: 'POST',
            body: JSON.stringify({
              operation: 'invalid',
              data: {},
            }),
          }
        );

        const response = await POST(request as never, {
          params: Promise.resolve({ listId: 'list-1' }),
        });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid operation');
      });

      it('should return 500 on internal error', async () => {
        mockedKVStore.getList.mockResolvedValue(mockList);
        mockedKVStore.updateTodos.mockRejectedValue(
          new Error('Database error')
        );

        const request = createRequest(
          'http://localhost/api/shared/list-1/sync',
          {
            method: 'POST',
            body: JSON.stringify({
              operation: 'create',
              data: {
                id: 'new',
                text: 'New',
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            }),
          }
        );

        const response = await POST(request as never, {
          params: Promise.resolve({ listId: 'list-1' }),
        });
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Sync operation failed');
      });
    });
  });
});
