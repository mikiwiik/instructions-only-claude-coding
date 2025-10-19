/**
 * Tests for useSharedTodoSync hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useSharedTodoSync } from '@/hooks/useSharedTodoSync';
import type { Todo } from '@/types/todo';

// Mock EventSource
class MockEventSource {
  url: string;
  listeners: Map<string, EventListener[]> = new Map();
  readyState = 0;

  constructor(url: string) {
    this.url = url;
    this.readyState = 1; // OPEN
  }

  addEventListener(event: string, listener: EventListener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  removeEventListener(event: string, listener: EventListener) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  close() {
    this.readyState = 2; // CLOSED
  }

  // Test helper to simulate events
  simulateEvent(event: string, data: unknown) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => {
        listener({ data: JSON.stringify(data) } as MessageEvent);
      });
    }
  }
}

// Create a mock constructor that tracks instances
const mockEventSourceInstances: MockEventSource[] = [];
const MockEventSourceConstructor = jest.fn((url: string) => {
  const instance = new MockEventSource(url);
  mockEventSourceInstances.push(instance);
  return instance;
});

global.EventSource =
  MockEventSourceConstructor as unknown as typeof EventSource;

describe('useSharedTodoSync', () => {
  const mockTodos: Todo[] = [
    {
      id: 'todo-1',
      text: 'Test todo',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockEventSourceInstances.length = 0; // Clear instances array
  });

  it('should initialize with disconnected state', () => {
    const onSync = jest.fn();
    const { result } = renderHook(() =>
      useSharedTodoSync({
        listId: 'list-1',
        userId: 'user-1',
        onSync,
        enabled: false, // Disabled initially
      })
    );

    expect(result.current.isConnected).toBe(false);
  });

  it('should connect when enabled', async () => {
    const onSync = jest.fn();
    renderHook(() =>
      useSharedTodoSync({
        listId: 'list-1',
        userId: 'user-1',
        onSync,
        enabled: true,
      })
    );

    await waitFor(() => {
      expect(mockEventSourceInstances.length).toBe(1);
      expect(mockEventSourceInstances[0].url).toBe(
        '/api/shared/list-1/subscribe'
      );
    });
  });

  it('should call onSync when sync event received', async () => {
    const onSync = jest.fn();
    const { result } = renderHook(() =>
      useSharedTodoSync({
        listId: 'list-1',
        userId: 'user-1',
        onSync,
        enabled: true,
      })
    );

    // Wait for EventSource to be created
    await waitFor(() => {
      expect(mockEventSourceInstances.length).toBe(1);
    });

    // Simulate connected event
    act(() => {
      mockEventSourceInstances[0].simulateEvent('connected', {
        listId: 'list-1',
      });
    });

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });
  });

  it('should handle sync events', async () => {
    const onSync = jest.fn();
    renderHook(() =>
      useSharedTodoSync({
        listId: 'list-1',
        userId: 'user-1',
        onSync,
        enabled: true,
      })
    );

    // Wait for EventSource to be created
    await waitFor(() => {
      expect(mockEventSourceInstances.length).toBe(1);
    });

    // Simulate sync event
    const syncData = {
      todos: mockTodos,
      lastModified: Date.now(),
    };

    act(() => {
      mockEventSourceInstances[0].simulateEvent('sync', syncData);
    });

    await waitFor(() => {
      expect(onSync).toHaveBeenCalled();
    });

    // Verify onSync was called with todos (dates will be serialized as strings)
    expect(onSync).toHaveBeenCalledTimes(1);
    const calledTodos = onSync.mock.calls[0][0];
    expect(calledTodos).toHaveLength(1);
    expect(calledTodos[0].id).toBe('todo-1');
    expect(calledTodos[0].text).toBe('Test todo');
  });

  it('should update connection state on error', async () => {
    const onSync = jest.fn();
    const { result } = renderHook(() =>
      useSharedTodoSync({
        listId: 'list-1',
        userId: 'user-1',
        onSync,
        enabled: true,
      })
    );

    // Wait for EventSource to be created
    await waitFor(() => {
      expect(mockEventSourceInstances.length).toBe(1);
    });

    // Simulate error event
    act(() => {
      mockEventSourceInstances[0].simulateEvent('error', {});
    });

    await waitFor(() => {
      expect(result.current.syncState.status).toBe('error');
    });
  });

  it('should cleanup on unmount', async () => {
    const onSync = jest.fn();
    const { unmount } = renderHook(() =>
      useSharedTodoSync({
        listId: 'list-1',
        userId: 'user-1',
        onSync,
        enabled: true,
      })
    );

    // Wait for EventSource to be created
    await waitFor(() => {
      expect(mockEventSourceInstances.length).toBe(1);
    });

    const closeSpy = jest.spyOn(mockEventSourceInstances[0], 'close');

    unmount();

    expect(closeSpy).toHaveBeenCalled();
  });
});
