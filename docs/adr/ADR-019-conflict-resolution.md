# ADR-019: Conflict Resolution Strategy

**Status**: Accepted
**Date**: 2025-10-04
**Decision Makers**: frontend-specialist, testing-specialist
**Related Issues**: #122

## Context

With real-time synchronization across multiple clients, concurrent modifications to the same todo item can create
conflicts. We need a consistent and predictable strategy to resolve these conflicts while maintaining data integrity
and user trust.

## Decision

Implement a **Last-Write-Wins (LWW)** strategy with server timestamps as the source of truth, combined with
optimistic locking for critical operations.

### Resolution Strategy

1. **Last-Write-Wins (LWW)**
   - Server timestamp determines winning update
   - Simple, predictable behavior for users
   - No merge conflicts for users to resolve

2. **Optimistic Locking**
   - Version numbers for critical fields
   - Detect concurrent modifications
   - Force refresh on version mismatch

3. **Conflict Detection**
   - Compare client and server versions
   - Identify conflicting updates
   - Apply resolution strategy automatically

### Implementation Details

```typescript
interface Todo {
  id: string;
  title: string;
  completed: boolean;
  version: number; // Optimistic locking
  updatedAt: number; // Server timestamp
  updatedBy: string; // User identifier
}

// Conflict Resolution
const resolveConflict = (clientTodo: Todo, serverTodo: Todo): Todo => {
  // Server timestamp wins
  if (serverTodo.updatedAt > clientTodo.updatedAt) {
    return serverTodo;
  }

  // Client version mismatch - force refresh
  if (serverTodo.version !== clientTodo.version - 1) {
    return serverTodo;
  }

  return clientTodo;
};

// Update with Version Check
const updateTodo = async (todo: Todo) => {
  const response = await api.updateTodo({
    ...todo,
    version: todo.version + 1,
  });

  if (response.conflict) {
    // Server rejected due to version mismatch
    store.replaceTodo(response.serverVersion);
    throw new ConflictError('Todo was modified by another session');
  }

  return response.data;
};
```

### Conflict Scenarios

1. **Simultaneous Title Edit**
   - Action: Last write wins based on server timestamp
   - User Feedback: Toast notification of overwrite

2. **Toggle Complete Status**
   - Action: Last write wins
   - User Feedback: Visual confirmation of final state

3. **Delete During Edit**
   - Action: Delete takes precedence
   - User Feedback: Alert that todo was deleted elsewhere

4. **Offline Edits**
   - Action: Queue updates, apply on reconnection
   - User Feedback: Sync status indicator

## Alternatives Considered

### Operational Transformation (OT)

- **Pros**: Can merge concurrent text edits
- **Cons**: Complex implementation, overkill for simple todo fields
- **Rejection Reason**: Too complex for our simple data model

### Conflict-free Replicated Data Types (CRDTs)

- **Pros**: Automatic conflict resolution, no central authority needed
- **Cons**: Complex implementation, larger data structures
- **Rejection Reason**: Unnecessary complexity for todo application

### Manual Conflict Resolution

- **Pros**: User control over conflicts
- **Cons**: Poor user experience, friction in workflow
- **Rejection Reason**: Interrupts user flow, not suitable for simple todos

### First-Write-Wins

- **Pros**: Simpler implementation
- **Cons**: Later updates lost, unpredictable for users
- **Rejection Reason**: Violates user expectations of seeing latest data

## Consequences

### Positive

- Predictable conflict resolution
- No user intervention required
- Simple implementation and testing
- Clear data consistency model
- Fast conflict resolution

### Negative

- Potential data loss on concurrent edits
- Users may lose their changes
- Need for good user feedback
- Version number overhead

### Neutral

- Server becomes source of truth
- Requires clear user notifications
- Need for comprehensive testing

## User Experience Considerations

### Feedback Mechanisms

1. **Conflict Notifications**
   - Toast message on overwrite
   - Visual indicator of sync status
   - Undo option when possible

2. **Optimistic UI**
   - Immediate feedback on actions
   - Gray out during server sync
   - Rollback animation on conflict

3. **Status Indicators**
   - Sync status in UI
   - Connection health indicator
   - Last sync timestamp

### Edge Cases

1. **Rapid Edits**
   - Debounce updates to reduce conflicts
   - Queue local changes
   - Batch updates when possible

2. **Network Issues**
   - Offline queue for updates
   - Retry with exponential backoff
   - Clear indication of offline state

3. **Stale Data**
   - Auto-refresh on focus
   - Manual refresh option
   - Cache invalidation strategy

## Testing Strategy

### Unit Tests

- Conflict detection logic
- Version comparison
- Timestamp ordering

### Integration Tests

- Concurrent update scenarios
- Network failure recovery
- Offline queue processing

### E2E Tests

- Multi-tab synchronization
- Real-time update propagation
- Conflict resolution UX

## Implementation Plan

1. **Phase 1**: Add version and timestamp fields
2. **Phase 2**: Implement conflict detection
3. **Phase 3**: Add LWW resolution logic
4. **Phase 4**: User feedback mechanisms
5. **Phase 5**: Edge case handling

## Success Metrics

- Zero data corruption incidents
- Clear user feedback on all conflicts
- Sub-100ms conflict resolution
- 99% user satisfaction with sync behavior
- Comprehensive test coverage (>90%)

## Future Considerations

- Advanced merge strategies for complex fields
- User preference for conflict handling
- Conflict history and audit trail
- Multi-field merge capabilities

## References

- [Conflict Resolution Patterns](https://martinfowler.com/articles/patterns-of-distributed-systems/version-vector.html)
- [Optimistic Locking](https://en.wikipedia.org/wiki/Optimistic_concurrency_control)
- [Last-Write-Wins](https://en.wikipedia.org/wiki/Last-write-wins)
- ADR-018: Real-Time Synchronization Architecture
