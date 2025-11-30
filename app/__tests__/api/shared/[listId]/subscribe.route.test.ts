/**
 * Tests for the subscribe API route (SSE endpoint)
 *
 * Note: SSE streaming is complex to test in JSDOM environment.
 * These tests focus on the structure and mock setup.
 */

import type { SharedTodoList } from '@/lib/kv-store';
import type { Todo } from '@/types/todo';

// Track addSubscriber calls
let addSubscriberCalls: Array<[string, string]> = [];
let removeSubscriberCalls: Array<[string, string]> = [];
let getListCalls: string[] = [];
let mockListResponse: SharedTodoList | null = null;

// Mock KVStore
jest.mock('@/lib/kv-store', () => {
  return {
    KVStore: {
      addSubscriber: jest.fn((listId: string, userId: string) => {
        addSubscriberCalls.push([listId, userId]);
        return Promise.resolve(undefined);
      }),
      removeSubscriber: jest.fn((listId: string, userId: string) => {
        removeSubscriberCalls.push([listId, userId]);
        return Promise.resolve(undefined);
      }),
      getList: jest.fn((listId: string) => {
        getListCalls.push(listId);
        return Promise.resolve(mockListResponse);
      }),
    },
  };
});

// Create a proper mock for NextRequest that works with the route
class MockHeaders {
  private headers: Map<string, string>;

  constructor(init?: Record<string, string>) {
    this.headers = new Map(Object.entries(init || {}));
  }

  get(key: string): string | null {
    return this.headers.get(key.toLowerCase()) || null;
  }
}

// Mock the request with proper headers.get support
class MockNextRequest {
  url: string;
  headers: MockHeaders;
  signal: { addEventListener: jest.Mock };

  constructor(url: string, init?: { headers?: Record<string, string> }) {
    this.url = url;
    this.headers = new MockHeaders(init?.headers);
    this.signal = {
      addEventListener: jest.fn(),
    };
  }
}

// Polyfill ReadableStream and related APIs
class MockReadableStreamController {
  enqueue = jest.fn();
  close = jest.fn();
}

class MockReadableStream {
  private startFn:
    | ((controller: MockReadableStreamController) => void)
    | undefined;
  controller = new MockReadableStreamController();

  constructor(options?: {
    start?: (controller: MockReadableStreamController) => void | Promise<void>;
  }) {
    this.startFn = options?.start;
    // Call start immediately to trigger the stream
    if (this.startFn) {
      this.startFn(this.controller);
    }
  }

  getReader() {
    return {
      read: jest.fn().mockResolvedValue({ done: true, value: undefined }),
      releaseLock: jest.fn(),
    };
  }
}

class MockTextEncoder {
  encode(text: string): Uint8Array {
    return new Uint8Array(Buffer.from(text));
  }
}

class MockResponse {
  body: MockReadableStream;
  headers: MockHeaders;
  status: number;

  constructor(
    body: MockReadableStream,
    init?: { headers?: Record<string, string>; status?: number }
  ) {
    this.body = body;
    // Normalize header keys to lowercase for consistent access
    const normalizedHeaders: Record<string, string> = {};
    if (init?.headers) {
      for (const [key, value] of Object.entries(init.headers)) {
        normalizedHeaders[key.toLowerCase()] = value;
      }
    }
    this.headers = new MockHeaders(normalizedHeaders);
    this.status = init?.status || 200;
  }
}

// Set up globals before importing the route
global.ReadableStream = MockReadableStream as unknown as typeof ReadableStream;
global.TextEncoder = MockTextEncoder as unknown as typeof TextEncoder;
global.Response = MockResponse as unknown as typeof Response;

// Now mock next/server
jest.mock('next/server', () => ({
  NextRequest: MockNextRequest,
}));

// Import route after mocks
import { GET } from '@/api/shared/[listId]/subscribe/route';

describe('Subscribe API Route', () => {
  const mockTodos: Todo[] = [
    {
      id: 'todo-1',
      text: 'Test todo',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    addSubscriberCalls = [];
    removeSubscriberCalls = [];
    getListCalls = [];
    mockListResponse = {
      id: 'list-1',
      todos: mockTodos,
      lastModified: Date.now(),
      subscribers: ['user-1'],
    };
  });

  describe('SSE Connection', () => {
    it('should return response with correct SSE headers', async () => {
      const request = new MockNextRequest(
        'http://localhost/api/shared/list-1/subscribe'
      );
      const response = await GET(request as never, {
        params: Promise.resolve({ listId: 'list-1' }),
      });

      expect(response.headers.get('content-type')).toBe('text/event-stream');
      expect(response.headers.get('cache-control')).toBe(
        'no-cache, no-transform'
      );
      expect(response.headers.get('connection')).toBe('keep-alive');
    });

    it('should use x-user-id header for subscriber identification', async () => {
      const request = new MockNextRequest(
        'http://localhost/api/shared/list-1/subscribe',
        {
          headers: { 'x-user-id': 'user-123' },
        }
      );

      await GET(request as never, {
        params: Promise.resolve({ listId: 'list-1' }),
      });

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Check addSubscriber was called with user-123
      expect(addSubscriberCalls).toContainEqual(['list-1', 'user-123']);
    });

    it('should use anonymous when x-user-id header is not provided', async () => {
      const request = new MockNextRequest(
        'http://localhost/api/shared/list-1/subscribe'
      );

      await GET(request as never, {
        params: Promise.resolve({ listId: 'list-1' }),
      });

      // Wait for async operations
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Check addSubscriber was called with anonymous
      expect(addSubscriberCalls).toContainEqual(['list-1', 'anonymous']);
    });

    it('should create a ReadableStream', async () => {
      const request = new MockNextRequest(
        'http://localhost/api/shared/list-1/subscribe'
      );
      const response = await GET(request as never, {
        params: Promise.resolve({ listId: 'list-1' }),
      });

      expect(response.body).toBeDefined();
      expect(response.body).toBeInstanceOf(MockReadableStream);
    });

    it('should register abort handler for cleanup', async () => {
      const request = new MockNextRequest(
        'http://localhost/api/shared/list-1/subscribe'
      );

      await GET(request as never, {
        params: Promise.resolve({ listId: 'list-1' }),
      });

      expect(request.signal.addEventListener).toHaveBeenCalledWith(
        'abort',
        expect.any(Function)
      );
    });
  });
});
