# Todo States Architecture

This document defines the conceptual states and state model for todo items in the
application.

## Overview

Todo items have a clear state model based on three primary boolean flags that
determine their current status and visibility in different views.

## Primary State Flags

### Core State Properties

| Property      | Type                | Description                           |
| ------------- | ------------------- | ------------------------------------- |
| `completedAt` | `Date \| undefined` | When the todo was marked as completed |
| `deletedAt`   | `Date \| undefined` | When the todo was soft-deleted        |
| `createdAt`   | `Date`              | When the todo was created (immutable) |
| `updatedAt`   | `Date`              | Last modification time (any change)   |

## Conceptual States

### 1. **Active State**

- **Condition**: `!completedAt && !deletedAt`
- **Description**: Todo is open and actionable
- **User Visibility**: Shown in "All" and "Active" filters
- **Actions Available**: Complete, Edit, Delete

### 2. **Completed State**

- **Condition**: `completedAt && !deletedAt`
- **Description**: Todo is finished but not deleted
- **User Visibility**: Shown in "All" and "Completed" filters
- **Actions Available**: Reopen, Edit, Delete

### 3. **Soft Deleted State**

- **Condition**: `deletedAt` (regardless of completion status)
- **Description**: Todo is deleted but recoverable
- **User Visibility**: Shown only in "Recently Deleted" filter
- **Actions Available**: Restore, Permanently Delete

## State Combinations

### Valid State Matrix

| `completedAt` | `deletedAt` | State                       | Description            |
| ------------- | ----------- | --------------------------- | ---------------------- |
| `undefined`   | `undefined` | **Active**                  | Open todo              |
| `Date`        | `undefined` | **Completed**               | Finished todo          |
| `undefined`   | `Date`      | **Deleted (was active)**    | Deleted open todo      |
| `Date`        | `Date`      | **Deleted (was completed)** | Deleted completed todo |

### Important Notes

1. **Deletion Precedence**: `deletedAt` takes precedence over `completedAt`
   for filtering
2. **Completion History**: When a completed todo is reopened, `completedAt`
   becomes `undefined`
3. **Soft Delete**: Deletion preserves the completion state for potential
   restoration

## State Transitions

### Allowed Transitions

See [todo-states-diagram.md](todo-states-diagram.md) for visual state transition diagrams and comprehensive state visualization.

### Transition Actions

| From State | To State         | Action    | Method                 |
| ---------- | ---------------- | --------- | ---------------------- |
| Active     | Completed        | Complete  | `toggleTodo()`         |
| Completed  | Active           | Reopen    | `toggleTodo()`         |
| Active     | Deleted          | Delete    | `deleteTodo()`         |
| Completed  | Deleted          | Delete    | `deleteTodo()`         |
| Deleted    | Active/Completed | Restore   | `restoreDeletedTodo()` |
| Any        | Active           | Edit text | `editTodo()`           |

## Filter Views

### User-Facing Filters

1. **All**: `!deletedAt` - Shows active and completed todos
2. **Active**: `!completedAt && !deletedAt` - Shows only active todos
3. **Completed**: `completedAt && !deletedAt` - Shows only completed todos
4. **Recently Deleted**: `deletedAt` - Shows soft-deleted todos

### Count Calculations

```typescript
// From app/page.tsx
const activeTodosCount = allTodos.filter(
  (todo) => !todo.completedAt && !todo.deletedAt
).length;

const completedTodosCount = allTodos.filter(
  (todo) => todo.completedAt && !todo.deletedAt
).length;

const deletedTodosCount = allTodos.filter((todo) => todo.deletedAt).length;
```

## Design Principles

### 1. **Explicit State Model**

- States are determined by presence/absence of timestamp fields
- No implicit or computed states
- Clear precedence rules (deletion > completion)

### 2. **Soft Delete Pattern**

- Deletion is reversible via `deletedAt` flag
- Original completion state is preserved during deletion
- Restoration returns to previous state

### 3. **Timestamp Immutability**

- `createdAt` never changes
- `updatedAt` changes on any modification
- State timestamps (`completedAt`, `deletedAt`) reflect transition time

### 4. **Simple Boolean Logic**

- All state checks use simple boolean conditions
- No complex state machines or enums
- Easy to reason about and test

## Implementation Notes

### State Validation

- `createdAt` must always be present and valid
- `updatedAt` must be >= `createdAt`
- If `completedAt` exists, it should be >= `createdAt`
- If `deletedAt` exists, it should be >= `createdAt`

### Edge Cases

- Rapid state changes update `updatedAt` to latest change time
- Text editing updates `updatedAt` but doesn't change state flags
- Restoration sets appropriate flags to `undefined` and updates `updatedAt`

This state model provides a clear, predictable foundation for todo management
while keeping the implementation simple and maintainable.
