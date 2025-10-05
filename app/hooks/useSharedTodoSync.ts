/**
 * Real-time synchronization hook for shared todo lists
 */

'use client';

import { useEffect, useRef, useState } from 'react';
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

      eventSource.addEventListener('connected', () => {
        setSyncState((prev) => ({
          ...prev,
          status: 'synced',
          lastSyncTime: Date.now(),
        }));
      });

      eventSource.addEventListener('sync', (event) => {
        try {
          const data = JSON.parse(event.data);
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
      });

      eventSource.addEventListener('error', () => {
        setSyncState((prev) => ({
          ...prev,
          status: 'error',
        }));

        eventSource.close();

        // Attempt reconnection with exponential backoff
        reconnectTimeoutRef.current = setTimeout(
          connect,
          Math.min(30000, 1000 * Math.pow(2, syncState.errors.length))
        );
      });

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
  }, [listId, userId, onSync, enabled, syncState.errors.length]);

  return {
    syncState,
    isConnected: syncState.status === 'synced',
    hasErrors: syncState.errors.length > 0,
  };
}
