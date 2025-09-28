# Activity Audit Log Architecture

This document defines the activity tracking system that provides a comprehensive
audit log of todo lifecycle events.

## Overview

The activity system generates a chronological audit trail of all todo
interactions, providing users with visibility into their productivity patterns
and todo lifecycle management.

## Conceptual Separation

### Todo States vs Activities

- **Todo States**: Current snapshot of todo status
  (see [todo-states.md](todo-states.md))
- **Activities**: Historical sequence of events and state transitions
- **Key Principle**: Activities are derived from todo data, not stored
  separately

## Activity Event Model

### ActivityEvent Interface

```typescript
interface ActivityEvent {
  id: string; // Unique identifier for this activity
  todoId: string; // Reference to the todo item
  todoText: string; // Todo text at time of activity
  action: ActivityAction; // Type of activity
  timestamp: Date; // When the activity occurred
  details?: string; // Optional additional context
}

type ActivityAction =
  | 'created'
  | 'edited'
  | 'completed'
  | 'restored' // Reopened from completed OR undeleted
  | 'deleted';
```

## Current Activity Generation Logic

### Derivation Strategy

Activities are **derived from todo state** rather than stored as separate
events:

1. **Creation Activity**: Always present based on `createdAt`
2. **Update Activity**: Generated if `updatedAt > createdAt`
3. **Deletion Activity**: Generated if `deletedAt` exists

### Current Implementation Logic

```typescript
function generateTodoActivities(todo: Todo): ActivityEvent[] {
  const activities = [];

  // 1. Creation (always present)
  activities.push({
    action: 'created',
    timestamp: todo.createdAt,
  });

  // 2. Update event (if modified after creation)
  if (todo.updatedAt > todo.createdAt) {
    const action = todo.completedAt ? 'completed' : 'edited';
    activities.push({
      action,
      timestamp: todo.updatedAt,
    });
  }

  // 3. Deletion event (if deleted)
  if (todo.deletedAt) {
    activities.push({
      action: 'deleted',
      timestamp: todo.deletedAt,
    });
  }

  return activities;
}
```

## Current Limitations

### Known Issues

1. **Reopening Detection**: When a completed todo is reopened, it shows as
   "edited" instead of "restored"
2. **Undeletion Detection**: When a deleted todo is restored, no "restored"
   activity is generated
3. **Complex Transitions**: Multiple simultaneous changes (edit + complete +
   undelete) are not properly detected
4. **Text Change Detection**: Cannot distinguish between text edits and state
   changes

### Missing Activity Types

| Scenario           | Current Activity | Should Be                |
| ------------------ | ---------------- | ------------------------ |
| Complete → Active  | `edited`         | `restored` (reopened)    |
| Deleted → Active   | `created`        | `restored` (undeleted)   |
| Deleted → Complete | `completed`      | `restored` + `completed` |
| Edit + Complete    | `completed`      | `edited` + `completed`   |

## Design Constraints

### Current Architecture Constraints

1. **Stateless Generation**: Activities are computed on-demand, not stored
2. **Single Todo Context**: Activity generation only sees current todo state
3. **No History**: Previous states are not available for comparison
4. **Single Update Event**: One `updatedAt` timestamp for potentially
   multiple changes

### Benefits of Current Approach

- **Simple Implementation**: No additional storage required
- **Consistency**: Activities always reflect current todo state
- **Performance**: Fast generation from existing data
- **Backward Compatible**: Works with existing todo data

## Timeline Display Features

### Time Grouping

Activities are grouped by relative time periods for user-friendly display:

- **Today**: Activities from current calendar day
- **Yesterday**: Activities from previous calendar day
- **This Week**: Activities from current week (7 days)
- **Earlier**: Activities older than current week

### Visual Representation

Each activity type has associated visual indicators:

- **Created**: 📝 (memo/note)
- **Edited**: ✏️ (pencil)
- **Completed**: ✅ (check mark)
- **Restored**: ↩️ (return/undo)
- **Deleted**: 🗑️ (trash)

### Sort Order

Activities are displayed in **reverse chronological order** (most recent
first) within each time group.

## Future Enhancements

### Potential Improvements

1. **Context-Aware Generation**: Pass todo history or activity context to
   improve detection
2. **Multiple Activities per Update**: Generate multiple activities for
   complex state changes
3. **Text Diff Detection**: Compare text changes to distinguish edits from
   state changes
4. **Enhanced Restoration Logic**: Better detection of reopening vs
   undeletion scenarios

### Alternative Approaches

1. **Event Sourcing**: Store actual events instead of deriving from state
2. **State History**: Track previous todo states for comparison
3. **Granular Timestamps**: Separate timestamps for different types of changes
4. **Activity Metadata**: Store additional context about what changed

## Integration Points

### With Todo State Model

- Activities derive meaning from todo state transitions
- Activity generation respects todo state precedence rules
- Timeline reflects the todo state filter system

### With User Interface

- Activity timeline provides alternative view to todo lists
- Activities complement todo filtering without replacing it
- Time grouping aligns with user mental models of recent activity

### With Backend Systems

- Activity log provides audit trail for debugging and analytics
- Generated activities could be cached or stored for performance
- Activity patterns could inform user behavior insights

## Implementation Philosophy

### Current Design Goals

1. **Simplicity**: Easy to understand and maintain
2. **Consistency**: Activities always match current todo state
3. **Performance**: Fast generation without additional storage
4. **User Value**: Provide meaningful productivity insights

### Acknowledged Limitations

The current implementation prioritizes simplicity over perfect accuracy. Some
edge cases in activity detection are acceptable trade-offs for:

- Reduced complexity
- Better performance
- Easier maintenance
- Lower risk of data inconsistency

This activity system provides valuable user insights while maintaining
architectural simplicity. Future enhancements can address detection
limitations without requiring fundamental changes to the core approach.
