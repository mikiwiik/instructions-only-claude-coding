/**
 * Real-time synchronization hook for shared todo lists
 * Refactored to meet ADR-027 code complexity standards
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Todo } from '../types/todo';
import type { SyncState } from '../types/sync';

interface UseSharedTodoSyncOptions {
  listId: string;
  userId: string;
  onSync: (todos: Todo[]) => void;
  enabled?: boolean;
}

export function useSharedTodoSync({
  listId,
  userId,
  onSync,
  enabled = true,
}: UseSharedTodoSyncOptions) {
  const [syncState, setSyncState] = useState<SyncState>({
    status: 'pending',
    pendingCount: 0,
    lastSyncTime: null,
    errors: [],
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Extract event handlers to reduce nesting depth (ADR-027)
  const handleConnectedEvent = useCallback(() => {
    setSyncState((prev) => ({
      ...prev,
      status: 'synced',
      lastSyncTime: Date.now(),
    }));
  }, []);

  const handleSyncEvent = useCallback(
    (event: Event) => {
      try {
        const messageEvent = event as MessageEvent;
        const data = JSON.parse(messageEvent.data);
        onSync(data.todos);
        setSyncState((prev) => ({
          ...prev,
          status: 'synced',
          lastSyncTime: data.lastModified,
        }));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to parse sync event:', error);
      }
    },
    [onSync]
  );

  const handleErrorEvent = useCallback(
    (eventSource: EventSource, connect: () => void, errorsLength: number) =>
      () => {
        setSyncState((prev) => ({
          ...prev,
          status: 'error',
        }));

        eventSource.close();

        // Attempt reconnection with exponential backoff
        reconnectTimeoutRef.current = setTimeout(
          connect,
          Math.min(30000, 1000 * Math.pow(2, errorsLength))
        );
      },
    []
  );

  useEffect(() => {
    if (!enabled || !listId) {
      return;
    }

    const connect = () => {
      // Clean up existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Create new SSE connection
      const eventSource = new EventSource(`/api/shared/${listId}/subscribe`, {
        withCredentials: true,
      });

      eventSource.addEventListener('connected', handleConnectedEvent);
      eventSource.addEventListener('sync', handleSyncEvent);
      eventSource.addEventListener(
        'error',
        handleErrorEvent(eventSource, connect, syncState.errors.length)
      );

      eventSourceRef.current = eventSource;
    };

    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [
    listId,
    userId,
    enabled,
    syncState.errors.length,
    handleConnectedEvent,
    handleSyncEvent,
    handleErrorEvent,
  ]);

  return {
    syncState,
    isConnected: syncState.status === 'synced',
    hasErrors: syncState.errors.length > 0,
  };
}
