# Todo States Diagram

This diagram visualizes the todo state model and transitions described in
[todo-states.md](todo-states.md).

## State Transition Diagram

```mermaid
stateDiagram-v2
    [*] --> Active : create todo

    Active --> Completed : toggle/complete
    Completed --> Active : toggle/reopen

    Active --> DeletedActive : soft delete
    Completed --> DeletedCompleted : soft delete

    DeletedActive --> Active : restore
    DeletedCompleted --> Completed : restore

    DeletedActive --> [*] : permanent delete
    DeletedCompleted --> [*] : permanent delete

    Active --> Active : edit text
    Completed --> Completed : edit text

    note right of Active
        State: !completedAt && !deletedAt
        Visible: All, Active filters
        Actions: Complete, Edit, Delete
    end note

    note right of Completed
        State: completedAt && !deletedAt
        Visible: All, Completed filters
        Actions: Reopen, Edit, Delete
    end note

    note right of DeletedActive
        State: !completedAt && deletedAt
        Visible: Recently Deleted filter
        Actions: Restore, Permanent Delete
    end note

    note right of DeletedCompleted
        State: completedAt && deletedAt
        Visible: Recently Deleted filter
        Actions: Restore, Permanent Delete
    end note
```

## State Matrix Visualization

```mermaid
graph TD
    subgraph "Todo State Matrix"
        A["undefined completedAt<br/>undefined deletedAt<br/><strong>ACTIVE</strong>"]
        B["Date completedAt<br/>undefined deletedAt<br/><strong>COMPLETED</strong>"]
        C["undefined completedAt<br/>Date deletedAt<br/><strong>DELETED (was active)</strong>"]
        D["Date completedAt<br/>Date deletedAt<br/><strong>DELETED (was completed)</strong>"]
    end

    A -->|toggle/complete| B
    B -->|toggle/reopen| A
    A -->|delete| C
    B -->|delete| D
    C -->|restore| A
    D -->|restore| B

    style A fill:#e1f5fe
    style B fill:#e8f5e8
    style C fill:#fff3e0
    style D fill:#fff3e0
```

## Filter Views

```mermaid
graph LR
    subgraph "Filter Views"
        ALL["All Filter<br/>!deletedAt"]
        ACTIVE["Active Filter<br/>!completedAt && !deletedAt"]
        COMPLETED["Completed Filter<br/>completedAt && !deletedAt"]
        DELETED["Recently Deleted Filter<br/>deletedAt"]
    end

    subgraph "Todo States"
        S1["Active Todo"]
        S2["Completed Todo"]
        S3["Deleted Active Todo"]
        S4["Deleted Completed Todo"]
    end

    ALL --> S1
    ALL --> S2
    ACTIVE --> S1
    COMPLETED --> S2
    DELETED --> S3
    DELETED --> S4

    style S1 fill:#e1f5fe
    style S2 fill:#e8f5e8
    style S3 fill:#fff3e0
    style S4 fill:#fff3e0
```

## Key Design Principles

1. **Deletion Precedence**: `deletedAt` always takes precedence over
   `completedAt` for filtering
2. **Soft Delete**: Deletion preserves completion state for restoration
3. **Timestamp-Based**: States determined by presence/absence of timestamp
   fields
4. **Simple Boolean Logic**: Easy to reason about and implement

## Usage

This diagram complements the detailed state documentation in
[todo-states.md](todo-states.md) and provides a visual reference for:

- Understanding state transitions
- Implementing filter logic
- Debugging state-related issues
- Communicating state model to stakeholders
