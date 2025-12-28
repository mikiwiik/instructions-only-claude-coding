/**
 * Real-time synchronization types for shared todo lists
 */

export type SyncOperation =
  | 'create'
  | 'update'
  | 'delete'
  | 'reorder'
  | 'reorder-single';

export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'error';

export interface SyncQueueItem {
  id: string;
  operation: SyncOperation;
  todoId: string;
  data: unknown;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export interface SyncEvent {
  type: 'sync';
  operation: SyncOperation;
  todoId: string;
  data: unknown;
  timestamp: number;
  userId: string;
}

export interface SyncError {
  todoId: string;
  operation: SyncOperation;
  error: string;
  timestamp: number;
}

export interface SyncState {
  status: SyncStatus;
  pendingCount: number;
  lastSyncTime: number | null;
  errors: SyncError[];
}
