# ADR-017: Shared Todo List Data Model Design

**Status**: Proposed
**Date**: 2025-01-04
**Deciders**: AI Agent (frontend-specialist, quality-assurance, documentation-agent)
**Related Issues**:
[#120 - Design shared todo list data model and API schema](https://github.com/mikiwiik/instructions-only-claude-coding/issues/120)
**Related ADRs**: ADR-013 (Shared Lists Backend Architecture),
ADR-014 (Anonymous Sharing Architecture), ADR-018 (API Schema Design)

## Context

The Todo App currently uses localStorage for single-user, single-device usage.
To enable collaborative features and multi-device access, we need to extend the data model to support:

- **Shared lists** accessible by multiple anonymous participants
- **Real-time synchronization** between devices
- **Conflict resolution** for concurrent edits
- **Backward compatibility** with existing local-only todos
- **Participant management** without user authentication

This ADR defines the data structures and interfaces that will enable these collaborative features
while maintaining the app's educational focus and avoiding authentication complexity (per ADR-014).

## Decision

We will extend the existing `Todo` interface with shared list capabilities using the following data model:

### Core Interfaces

```typescript
// Base Todo interface (existing - unchanged)
export interface Todo {
  id: string; // UUID v4
  text: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Extended todo for shared lists
export interface SharedTodo extends Todo {
  listId: string; // Reference to SharedList (UUID)
  authorId: string; // Anonymous participant who created this
  lastModifiedBy: string; // Last participant to edit
  syncVersion: number; // For conflict detection (increments on each change)
}

// Shared list metadata
export interface SharedList {
  id: string; // UUID v4 for sharing
  name: string; // Display name for the list
  todos: SharedTodo[]; // All todos in this list
  createdAt: Date;
  updatedAt: Date;
  lastSyncAt: Date; // Last successful sync timestamp
  participantIds: string[]; // Array of anonymous participant UUIDs
  accessToken?: string; // Optional access control
}

// Anonymous participant
export interface Participant {
  id: string; // UUID v4 (device-persistent)
  color: string; // For UI differentiation (#RRGGBB)
  lastSeenAt: Date; // For presence tracking
  isActive: boolean; // Active within last 30 seconds
}

// Conflict detection and resolution
export interface Conflict {
  todoId: string;
  localVersion: SharedTodo;
  remoteVersion: SharedTodo;
  detectedAt: Date;
  type: 'update' | 'delete' | 'concurrent-update';
}
```

### API Request/Response Types

```typescript
// Create shared list
export interface CreateSharedListRequest {
  name: string;
  initialTodos?: Omit<Todo, 'id'>[];
}

export interface CreateSharedListResponse {
  list: SharedList;
  participant: Participant;
  accessToken: string;
}

// Synchronization
export interface SyncRequest {
  listId: string;
  accessToken: string;
  localChanges: {
    added: SharedTodo[];
    updated: SharedTodo[];
    deleted: string[]; // Todo IDs
  };
  lastSyncVersion: number;
}

export interface SyncResponse {
  remoteChanges: {
    added: SharedTodo[];
    updated: SharedTodo[];
    deleted: string[];
  };
  conflicts: Conflict[];
  participants: Participant[];
  newSyncVersion: number;
}
```

### Conflict Resolution Strategy

**Last-Write-Wins (LWW) with Version Tracking:**

1. Each `SharedTodo` has a `syncVersion` that increments on every update
2. Client sends `lastSyncVersion` with sync request
3. Server compares versions to detect conflicts
4. Latest `updatedAt` timestamp wins in conflicts
5. Losing versions preserved in `conflicts[]` for user review
6. Users can manually select preferred version if desired

### Storage Strategy

**Separation of Local and Shared:**

- Local todos: `localStorage['todos']` (existing)
- Shared todos: `localStorage['shared-todos-${listId}']` (new namespaced keys)
- Shared lists metadata: `localStorage['shared-lists']`
- Participant ID: `localStorage['participant-id']` (device-persistent)

### Backward Compatibility

**Type Guards for Differentiation:**

```typescript
export function isSharedTodo(todo: Todo | SharedTodo): todo is SharedTodo {
  return 'listId' in todo && 'syncVersion' in todo;
}

export function isLocalTodo(todo: Todo | SharedTodo): todo is Todo {
  return !isSharedTodo(todo);
}
```

**Gradual Migration:**

- Existing `Todo` objects remain unchanged
- `SharedTodo` fields are additions, not modifications
- Users can maintain both local and shared lists simultaneously

## Rationale

### Why Last-Write-Wins?

**Alternatives Considered:**

1. **Operational Transformation (OT)**
   - ✅ Sophisticated conflict resolution
   - ❌ Extremely complex to implement correctly
   - ❌ Overkill for todo list use case
   - **Rejected**: Unnecessary complexity

2. **CRDT (Conflict-free Replicated Data Types)**
   - ✅ Automatic conflict resolution
   - ❌ Significant implementation complexity
   - ❌ Larger data payloads
   - ❌ Harder to debug and reason about
   - **Rejected**: Added complexity not justified

3. **Timestamp-only Resolution**
   - ✅ Simplest possible approach
   - ❌ Clock skew issues across devices
   - ❌ No reliable ordering guarantee
   - **Rejected**: Unreliable without version numbers

4. **Chosen: LWW with Version Tracking**
   - ✅ Simple to implement and understand
   - ✅ Reliable conflict detection
   - ✅ Works well for low-conflict scenarios
   - ✅ Graceful degradation (conflicts preserved)
   - ⚠️ May lose edits in high-contention scenarios (acceptable trade-off)

### Why Anonymous Participants?

Per ADR-014 (Anonymous Sharing Architecture), we avoid user authentication to:

- Maintain educational focus
- Reduce implementation complexity
- Enable instant collaboration without signup friction
- Minimize privacy concerns

### Why Upstash Redis Compatible?

Per ADR-013 (Shared Lists Backend Architecture), we're using Upstash Redis (Redis-compatible) which requires:

- Flat data structures (easily serialized)
- UUID-based keys for partitioning
- Efficient incremental sync operations

## Security Considerations

### Input Validation

- **Zod Schemas**: All shared todo list data validated using Zod
  - `TodoSchema`: Base todo validation
  - `SharedTodoSchema`: Extended validation with listId, syncVersion
  - `ParticipantSchema`: Anonymous participant validation
  - `SharedListSchema`: Complete list structure validation

### Authorization

- **Access Tokens**: Optional tokens for private lists
- **URL-based Access**: Share URLs as primary access control
- **No Personal Data**: Only functional collaboration data stored
- **UUID Validation**: All IDs validated as proper UUIDs

### Rate Limiting

- **API Protection**: Rate limits on list creation and sync operations
- **Abuse Prevention**: Throttling for high-frequency sync requests
- **DoS Mitigation**: Maximum list size and participant limits

### Data Sanitization

- **XSS Prevention**: Todo text sanitized before storage/display
- **SQL Injection**: N/A (using Upstash Redis, not SQL)
- **Input Constraints**: Maximum lengths for todo text and list names

## Accessibility Considerations (WCAG 2.2 AA)

### Screen Reader Support

- `participants` array with timestamps enables announcements for joins/leaves
- `syncVersion` and `lastModifiedBy` support ARIA live regions for todo changes
- Structured data allows announcing "who did what" (e.g., "Alice completed 'Buy milk'")

### Keyboard Navigation

- Participant data supports keyboard-accessible participant lists
- Edit tracking enables accessible edit history views

### Color Independence

- **Conflict Detection**: Version-based, not color-based
- **Participant Attribution**: `lastModifiedBy` provides text-based attribution
- `color` field for visual enhancement only, not sole indicator
- `isActive` boolean for semantic status (not just color dots)

### Touch Targets

- Structured participant data enables 44×44px minimum touch targets

### Semantic Structure

- Clear relationships (participant→user, todo→editor) support ARIA attributes
- ISO 8601 timestamps enable accessible relative time formatting

## Testing Strategy

### Unit Tests (>95% coverage)

- Type guards (`isSharedTodo`, `isLocalTodo`)
- Validation functions (Zod schema tests)
- Conflict detection logic
- Version increment utilities

### Integration Tests (>90% coverage)

- Sync operations with mock server
- Participant management workflows
- Conflict scenarios (concurrent edits, version mismatches)
- Migration between local and shared

### End-to-End Tests (>85% coverage)

- Multi-user collaboration scenarios (3+ participants)
- Conflict resolution user experience
- Network failure recovery
- Real-time sync validation

### Performance Tests

- Large list handling (1000+ todos)
- Concurrent users (50+ participants)
- Sync latency measurements (<200ms target)
- Memory usage monitoring

## Performance Requirements

- **Initial Load**: <500ms for lists with up to 100 items
- **Sync Latency**: <200ms for single item updates
- **List Rendering**: 60fps for 1000+ items (with virtualization)
- **Maximum List Size**: 10,000 todos before pagination required
- **Sync Interval**: 5 seconds default, configurable

## Consequences

### Positive

- **Backward Compatible**: Existing local todos work unchanged
- **Simple Mental Model**: LWW easy to understand and debug
- **Offline-First**: Works seamlessly offline with sync on reconnection
- **Anonymous Collaboration**: No authentication barrier
- **Conflict Transparency**: Users see and can resolve conflicts
- **Incremental Adoption**: Local and shared lists coexist
- **Type Safety**: TypeScript ensures correct usage

### Negative

- **Storage Overhead**: Additional metadata per shared todo (~40-60 bytes)
- **Sync Complexity**: Requires robust sync logic and error handling
- **LWW Limitations**: May lose edits in high-contention scenarios
- **localStorage Limits**: Multiple shared lists approach 5MB quota
- **Migration Friction**: Users must explicitly convert local to shared
- **No Real-time Updates**: Polling-based (5s interval), not instant

### Neutral

- **Testing Burden**: Requires comprehensive tests for sync scenarios
- **Documentation Need**: Clear guidance on local vs. shared lists required
- **Monitoring Need**: Track sync performance and conflict rates

## Implementation Notes

### Phase 1: Core Data Structures

1. Define TypeScript interfaces in `app/types/todo.ts`
2. Implement Zod schemas for validation
3. Add type guards and utility functions
4. Create participant ID generation logic

### Phase 2: Storage Layer

1. Implement shared todo storage with namespaced keys
2. Add shared list metadata management
3. Create participant presence tracking
4. Implement conflict detection logic

### Phase 3: Migration & Testing

1. Add migration utilities (local ↔ shared)
2. Comprehensive unit tests for all scenarios
3. Integration tests for sync operations
4. Performance testing with large lists

## References

- Issue #120: Design shared todo list data model and API schema
- ADR-013: Shared Lists Backend Architecture
- ADR-014: Anonymous Sharing Architecture
- ADR-018: API Schema Design for Shared Lists
- [WCAG 2.2 AA Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [Accessibility Requirements](../guidelines/accessibility-requirements.md)
- [AWS Last-Write-Wins Resolution](https://docs.aws.amazon.com/amazondynamodb/latest/)
- [Firebase Offline Capabilities](https://firebase.google.com/docs/database/web/offline-capabilities)

---

**This ADR establishes the data model foundation for shared todo lists, enabling collaborative features
while maintaining backward compatibility and avoiding authentication complexity.**
