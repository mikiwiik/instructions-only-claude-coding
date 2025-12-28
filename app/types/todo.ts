import { z } from 'zod';

// ==================== Base Todo Type Definitions ====================

export interface Todo {
  id: string;
  text: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  // TODO: Make non-optional after #403 (Migration) is complete
  /** LexoRank string for ordering active todos (see ADR-034) */
  sortOrder?: string;
}

export type TodoFilter =
  | 'all'
  | 'active'
  | 'completed'
  | 'recently-deleted'
  | 'activity';

export interface ActivityEvent {
  id: string;
  todoId: string;
  todoText: string;
  action: 'created' | 'edited' | 'completed' | 'restored' | 'deleted';
  timestamp: Date;
  details?: string;
}

export interface TodoState {
  todos: Todo[];
  filter: TodoFilter;
}

// ==================== SHARED LIST TYPES ====================

/**
 * Extended todo item for shared lists
 * Includes synchronization and authorship metadata
 */
export interface SharedTodo extends Todo {
  /** Reference to the shared list this todo belongs to */
  listId: string;
  /** Anonymous participant ID who created this todo */
  authorId: string;
  /** ID of participant who last modified this todo */
  lastModifiedBy: string;
  /** Version number for conflict resolution (increments on each update) */
  syncVersion: number;
}

/**
 * Anonymous participant in a shared list
 * Identified by unique ID with UI color for differentiation
 */
export interface Participant {
  /** Unique participant identifier (UUID) */
  id: string;
  /** Color assigned to participant for UI visualization */
  color: string;
  /** Timestamp of participant's last activity */
  lastSeenAt: Date;
  /** Whether participant is currently active in the list */
  isActive: boolean;
}

/**
 * Shared todo list structure
 * Contains todos and participant information
 */
export interface SharedList {
  /** Unique list identifier (UUID) */
  id: string;
  /** Display name of the shared list */
  name: string;
  /** Array of todos in this shared list */
  todos: SharedTodo[];
  /** Timestamp when list was created */
  createdAt: Date;
  /** Timestamp when list was last updated */
  updatedAt: Date;
  /** Timestamp of last successful synchronization */
  lastSyncAt: Date;
  /** Array of participant IDs with access to this list */
  participantIds: string[];
  /** Optional access token for list authentication */
  accessToken?: string;
}

/**
 * Conflict detected during synchronization
 * Contains information needed for conflict resolution
 */
export interface Conflict {
  /** ID of the todo item with conflict */
  todoId: string;
  /** Local version of the todo */
  localVersion: SharedTodo;
  /** Remote version of the todo */
  remoteVersion: SharedTodo;
  /** Timestamp when conflict was detected */
  detectedAt: Date;
  /** Type of conflict (update, delete, etc.) */
  type: 'update' | 'delete' | 'concurrent-update';
}

/**
 * Request payload for creating a new shared list
 */
export interface CreateSharedListRequest {
  /** Name for the new shared list */
  name: string;
  /** Optional initial todos to add to the list */
  initialTodos?: Omit<Todo, 'id'>[];
}

/**
 * Response payload after creating a shared list
 */
export interface CreateSharedListResponse {
  /** The created shared list */
  list: SharedList;
  /** The current participant's information */
  participant: Participant;
  /** Access token for future requests */
  accessToken: string;
}

/**
 * Request payload for synchronizing list changes
 */
export interface SyncRequest {
  /** ID of the shared list to sync */
  listId: string;
  /** Access token for authentication */
  accessToken: string;
  /** Local changes to push to server */
  localChanges: {
    /** Todos added locally */
    added: SharedTodo[];
    /** Todos updated locally */
    updated: SharedTodo[];
    /** IDs of todos deleted locally */
    deleted: string[];
  };
  /** Last sync version known by client */
  lastSyncVersion: number;
}

/**
 * Response payload after synchronization
 */
export interface SyncResponse {
  /** Remote changes to apply locally */
  remoteChanges: {
    /** Todos added remotely */
    added: SharedTodo[];
    /** Todos updated remotely */
    updated: SharedTodo[];
    /** IDs of todos deleted remotely */
    deleted: string[];
  };
  /** Any conflicts detected during sync */
  conflicts: Conflict[];
  /** Updated participant list */
  participants: Participant[];
  /** New sync version after applying changes */
  newSyncVersion: number;
}

// ==================== ZOD VALIDATION SCHEMAS ====================

/**
 * UUID validation regex (RFC 4122 v4)
 */
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * UUID schema
 */
const UUIDSchema = z.string().regex(UUID_REGEX, 'Invalid UUID format');

/**
 * Base Todo schema
 */
export const TodoSchema = z.object({
  id: UUIDSchema,
  text: z
    .string()
    .min(1, 'Todo text cannot be empty')
    .max(500, 'Todo text too long'),
  completedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().optional(),
  sortOrder: z.string().optional(),
});

/**
 * SharedTodo schema (extends Todo)
 */
export const SharedTodoSchema = z.object({
  id: UUIDSchema,
  text: z
    .string()
    .min(1, 'Todo text cannot be empty')
    .max(500, 'Todo text too long'),
  completedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().optional(),
  sortOrder: z.string().optional(),
  listId: UUIDSchema,
  authorId: UUIDSchema,
  lastModifiedBy: UUIDSchema,
  syncVersion: z.number().int().positive(),
});

/**
 * Participant schema
 */
export const ParticipantSchema = z.object({
  id: UUIDSchema,
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  lastSeenAt: z.date(),
  isActive: z.boolean(),
});

/**
 * SharedList schema
 */
export const SharedListSchema = z.object({
  id: UUIDSchema,
  name: z
    .string()
    .min(1, 'List name cannot be empty')
    .max(100, 'List name too long'),
  todos: z.array(SharedTodoSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastSyncAt: z.date(),
  participantIds: z.array(UUIDSchema),
  accessToken: z.string().optional(),
});

/**
 * Conflict schema
 */
export const ConflictSchema = z.object({
  todoId: UUIDSchema,
  localVersion: SharedTodoSchema,
  remoteVersion: SharedTodoSchema,
  detectedAt: z.date(),
  type: z.enum(['update', 'delete', 'concurrent-update']),
});

// ==================== TYPE GUARDS ====================

/**
 * Type guard to check if a todo is a SharedTodo
 */
export function isSharedTodo(todo: Todo | SharedTodo): todo is SharedTodo {
  return 'listId' in todo && 'syncVersion' in todo && 'lastModifiedBy' in todo;
}

/**
 * Type guard to check if a todo is a local Todo (not shared)
 */
export function isLocalTodo(todo: Todo | SharedTodo): todo is Todo {
  return !isSharedTodo(todo);
}

/**
 * Type guard to check if an unknown object is a Participant
 */
export function isParticipant(obj: unknown): obj is Participant {
  const result = ParticipantSchema.safeParse(obj);
  return result.success;
}

/**
 * Type guard to check if an unknown object is a Conflict
 */
export function isConflict(obj: unknown): obj is Conflict {
  const result = ConflictSchema.safeParse(obj);
  return result.success;
}

// ==================== VALIDATION UTILITY FUNCTIONS ====================

/**
 * Validates and returns a typed Todo
 * @throws ZodError if validation fails
 */
export function validateTodo(data: unknown): Todo {
  return TodoSchema.parse(data);
}

/**
 * Validates and returns a typed SharedTodo
 * @throws ZodError if validation fails
 */
export function validateSharedTodo(data: unknown): SharedTodo {
  return SharedTodoSchema.parse(data);
}

/**
 * Validates a UUID string
 * @returns true if valid UUID, false otherwise
 */
export function isValidUUID(value: string): boolean {
  return UUID_REGEX.test(value);
}

/**
 * Safe validation that returns a result object instead of throwing
 */
export function safeParseTodo(
  data: unknown
): { success: true; data: Todo } | { success: false; error: z.ZodError } {
  const result = TodoSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Safe validation for SharedTodo
 */
export function safeParseSharedTodo(
  data: unknown
): { success: true; data: SharedTodo } | { success: false; error: z.ZodError } {
  const result = SharedTodoSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
