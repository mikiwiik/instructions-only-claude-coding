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

global.EventSource = MockEventSource as unknown as typeof EventSource;

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
    const { result } = renderHook(() =>
      useSharedTodoSync({
        listId: 'list-1',
        userId: 'user-1',
        onSync,
        enabled: true,
      })
    );

    await waitFor(() => {
      expect(result.current.syncState.status).not.toBe('pending');
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

    // Simulate connected event
    await act(async () => {
      const eventSource = (global.EventSource as unknown as jest.Mock).mock
        .instances[0] as MockEventSource;
      if (eventSource) {
        eventSource.simulateEvent('connected', { listId: 'list-1' });
      }
    });

    expect(result.current.isConnected).toBe(true);
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

    await act(async () => {
      const eventSource = (global.EventSource as unknown as jest.Mock).mock
        .instances[0] as MockEventSource;
      if (eventSource) {
        eventSource.simulateEvent('sync', {
          todos: mockTodos,
          lastModified: Date.now(),
        });
      }
    });

    expect(onSync).toHaveBeenCalledWith(mockTodos);
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

    await act(async () => {
      const eventSource = (global.EventSource as unknown as jest.Mock).mock
        .instances[0] as MockEventSource;
      if (eventSource) {
        eventSource.simulateEvent('error', {});
      }
    });

    await waitFor(() => {
      expect(result.current.syncState.status).toBe('error');
    });
  });

  it('should cleanup on unmount', () => {
    const onSync = jest.fn();
    const { unmount } = renderHook(() =>
      useSharedTodoSync({
        listId: 'list-1',
        userId: 'user-1',
        onSync,
        enabled: true,
      })
    );

    const eventSource = (global.EventSource as unknown as jest.Mock).mock
      .instances[0] as MockEventSource;
    const closeSpy = jest.spyOn(eventSource, 'close');

    unmount();

    expect(closeSpy).toHaveBeenCalled();
  });
});
