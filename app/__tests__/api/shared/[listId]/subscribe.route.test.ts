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
let addSubscriberShouldFail = false;
let removeSubscriberShouldFail = false;

// Mock KVStore
jest.mock('@/lib/kv-store', () => {
  return {
    KVStore: {
      addSubscriber: jest.fn((listId: string, userId: string) => {
        addSubscriberCalls.push([listId, userId]);
        if (addSubscriberShouldFail) {
          return Promise.reject(new Error('Failed to add subscriber'));
        }
        return Promise.resolve(undefined);
      }),
      removeSubscriber: jest.fn((listId: string, userId: string) => {
        removeSubscriberCalls.push([listId, userId]);
        if (removeSubscriberShouldFail) {
          return Promise.reject(new Error('Failed to remove subscriber'));
        }
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
    jest.useFakeTimers();
    addSubscriberCalls = [];
    removeSubscriberCalls = [];
    getListCalls = [];
    addSubscriberShouldFail = false;
    removeSubscriberShouldFail = false;
    mockListResponse = {
      id: 'list-1',
      todos: mockTodos,
      lastModified: Date.now(),
      subscribers: ['user-1'],
    };
  });

  afterEach(() => {
    jest.useRealTimers();
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

      // Flush promises and advance timers
      await Promise.resolve();
      jest.advanceTimersByTime(100);
      await Promise.resolve();

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

      // Flush promises and advance timers
      await Promise.resolve();
      jest.advanceTimersByTime(100);
      await Promise.resolve();

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

    it('should handle addSubscriber error gracefully', async () => {
      addSubscriberShouldFail = true;

      const request = new MockNextRequest(
        'http://localhost/api/shared/list-1/subscribe',
        {
          headers: { 'x-user-id': 'user-123' },
        }
      );

      // Should not throw, error is caught and logged
      const response = await GET(request as never, {
        params: Promise.resolve({ listId: 'list-1' }),
      });

      // Flush promises and advance timers
      await Promise.resolve();
      jest.advanceTimersByTime(100);
      await Promise.resolve();

      // Response should still be returned
      expect(response).toBeDefined();
      expect(response.headers.get('content-type')).toBe('text/event-stream');
    });

    it('should trigger polling for list data', async () => {
      const request = new MockNextRequest(
        'http://localhost/api/shared/list-1/subscribe'
      );

      await GET(request as never, {
        params: Promise.resolve({ listId: 'list-1' }),
      });

      // Advance timers to trigger poll interval (2000ms)
      jest.advanceTimersByTime(2100);
      await Promise.resolve(); // Flush promises

      // getList should have been called by polling
      expect(getListCalls.length).toBeGreaterThan(0);
    });

    it('should close stream when list is deleted during polling', async () => {
      const request = new MockNextRequest(
        'http://localhost/api/shared/list-1/subscribe'
      );

      const response = await GET(request as never, {
        params: Promise.resolve({ listId: 'list-1' }),
      });

      // Set list to null (deleted)
      mockListResponse = null;

      // Advance timers to trigger poll interval
      jest.advanceTimersByTime(2100);
      await Promise.resolve(); // Flush promises

      // Stream should have been closed (controller.close called)
      expect(response.body.controller.close).toHaveBeenCalled();
    });

    it('should trigger ping to keep connection alive', async () => {
      const request = new MockNextRequest(
        'http://localhost/api/shared/list-1/subscribe'
      );

      const response = await GET(request as never, {
        params: Promise.resolve({ listId: 'list-1' }),
      });

      // Advance timers to trigger ping interval (30000ms)
      jest.advanceTimersByTime(30100);

      // Controller.enqueue should have been called with ping data
      const enqueueCalls = response.body.controller.enqueue.mock.calls;
      const hasPing = enqueueCalls.some((call: unknown[]) => {
        const encoded = call[0] as Uint8Array;
        const text = Buffer.from(encoded).toString();
        return text.includes('ping');
      });
      expect(hasPing).toBe(true);
    });

    it('should call removeSubscriber on abort', async () => {
      let abortHandler: (() => void) | null = null;

      const request = new MockNextRequest(
        'http://localhost/api/shared/list-1/subscribe',
        {
          headers: { 'x-user-id': 'user-456' },
        }
      );

      // Capture the abort handler
      request.signal.addEventListener = jest.fn(
        (event: string, handler: () => void) => {
          if (event === 'abort') {
            abortHandler = handler;
          }
        }
      );

      await GET(request as never, {
        params: Promise.resolve({ listId: 'list-1' }),
      });

      // Flush promises and advance timers
      await Promise.resolve();
      jest.advanceTimersByTime(100);
      await Promise.resolve();

      // Simulate abort by calling the handler
      if (abortHandler) {
        await (abortHandler as () => Promise<void>)();
      }

      // Flush promises after abort
      await Promise.resolve();
      jest.advanceTimersByTime(100);
      await Promise.resolve();

      // removeSubscriber should have been called
      expect(removeSubscriberCalls).toContainEqual(['list-1', 'user-456']);
    });

    it('should handle removeSubscriber error gracefully on abort', async () => {
      removeSubscriberShouldFail = true;
      let abortHandler: (() => void) | null = null;

      const request = new MockNextRequest(
        'http://localhost/api/shared/list-1/subscribe',
        {
          headers: { 'x-user-id': 'user-789' },
        }
      );

      // Capture the abort handler
      request.signal.addEventListener = jest.fn(
        (event: string, handler: () => void) => {
          if (event === 'abort') {
            abortHandler = handler;
          }
        }
      );

      await GET(request as never, {
        params: Promise.resolve({ listId: 'list-1' }),
      });

      // Flush promises and advance timers
      await Promise.resolve();
      jest.advanceTimersByTime(100);
      await Promise.resolve();

      // Simulate abort - should not throw
      if (abortHandler) {
        await (abortHandler as () => Promise<void>)();
      }

      // Flush promises after abort
      await Promise.resolve();
      jest.advanceTimersByTime(100);
      await Promise.resolve();

      // removeSubscriber was called (and failed gracefully)
      expect(removeSubscriberCalls).toContainEqual(['list-1', 'user-789']);
    });
  });
});
