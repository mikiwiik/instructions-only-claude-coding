/**
 * Types for shared todo lists and real-time collaboration
 */

/**
 * Shared todo item
 */
export interface SharedTodo {
  /** Unique identifier */
  id: string;
  /** Todo title/description */
  title: string;
  /** Completion status */
  completed: boolean;
  /** Creation timestamp */
  createdAt: number;
  /** Last update timestamp */
  updatedAt: number;
  /** ID of the shared list this todo belongs to */
  sharedListId: string;
}

/**
 * Shared todo list
 */
export interface SharedList {
  /** Unique identifier */
  id: string;
  /** List name */
  name: string;
  /** Optional description */
  description?: string;
  /** Creation timestamp */
  createdAt: number;
  /** Last update timestamp */
  updatedAt: number;
  /** Creator user ID (optional) */
  createdBy?: string;
}

/**
 * Participant in a shared list
 */
export interface SharedListParticipant {
  /** Unique identifier */
  id: string;
  /** Participant name or identifier */
  name: string;
  /** Joined timestamp */
  joinedAt: number;
  /** Last seen timestamp */
  lastSeenAt: number;
  /** Whether participant is currently online */
  online: boolean;
}
