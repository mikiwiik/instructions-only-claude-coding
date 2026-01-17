/**
 * Real-time synchronization types for shared todo lists
 */

/**
 * Sync operations for shared todo lists.
 *
 * - `reorder-single`: LexoRank optimized (sends 1 todo with updated sortOrder, ~200B)
 * - `replace-all`: Bulk replace all todos (used for initial share)
 *
 * @see ADR-034 for LexoRank decision
 */
export type SyncOperation =
  | 'create'
  | 'update'
  | 'delete'
  | 'reorder-single'
  | 'replace-all';

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
