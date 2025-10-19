# Real-Time Synchronization Architecture

This document provides comprehensive architectural diagrams for the real-time synchronization feature introduced in
[GitHub Issue #122](https://github.com/mikiwiik/instructions-only-claude-coding/issues/122). For decision rationale
and alternatives, see
[ADR-022: Real-Time Synchronization Architecture](../adr/022-realtime-sync-architecture.md).

## System Architecture Overview

This diagram shows the high-level client-server architecture for real-time synchronization using Server-Sent Events
(SSE).

```mermaid
flowchart TB
    subgraph Browser["Browser (Client Side)"]
        UI["SharedTodoList Component"]
        Hooks["useSharedTodos Hook"]
        SyncHook["useSharedTodoSync Hook"]
        Queue["SyncQueue"]
        ES["EventSource (SSE Client)"]
    end

    subgraph Server["Next.js Edge Runtime (Server Side)"]
        SSE["SSE Subscribe Endpoint<br/>/api/shared/[listId]/subscribe"]
        SyncAPI["Sync API Endpoint<br/>/api/shared/[listId]/sync"]
        KV["KV Store<br/>(In-Memory)"]
    end

    UI -->|user action| Hooks
    Hooks -->|optimistic update| UI
    Hooks -->|queue operation| Queue
    Hooks -->|subscribe| SyncHook

    SyncHook -->|EventSource connection| ES
    ES -.->|SSE stream| SSE
    SSE -.->|sync events| ES
    ES -->|update todos| SyncHook
    SyncHook -->|apply updates| Hooks

    Queue -->|HTTP POST| SyncAPI
    SyncAPI -->|read/write| KV
    SSE -->|read| KV

    SyncAPI -->|broadcast trigger| SSE

    style Browser fill:#e1f5fe
    style Server fill:#fff3e0
    style KV fill:#e8f5e8
```

## Sync Lifecycle Sequence Diagram

This diagram illustrates a complete synchronization lifecycle from user action to propagation across all clients.

```mermaid
sequenceDiagram
    participant User
    participant UI as SharedTodoList
    participant Hook as useSharedTodos
    participant SyncHook as useSharedTodoSync
    participant Queue as SyncQueue
    participant SSE as SSE Endpoint
    participant API as Sync API
    participant KV as KV Store
    participant OtherClients as Other Clients

    Note over User,OtherClients: Initial Connection
    SyncHook->>SSE: Connect EventSource
    SSE->>KV: Add subscriber
    SSE-->>SyncHook: "connected" event
    SyncHook->>Hook: Update connection state

    Note over User,OtherClients: User Creates Todo
    User->>UI: Create todo "Buy milk"
    UI->>Hook: addTodo("Buy milk")

    Note over Hook: Optimistic Update
    Hook->>UI: Update UI immediately<br/>(tempId: temp-123)
    Hook->>Queue: Enqueue create operation

    Note over Queue,API: Sync to Server
    Queue->>API: POST /api/shared/list-1/sync<br/>{operation: "create", data: todo}
    API->>KV: Write todo (serverId: todo-456)
    API-->>Queue: Success {id: "todo-456"}
    Queue->>Hook: Replace tempId with serverId
    Hook->>UI: Update todo ID

    Note over SSE,OtherClients: Broadcast to All Clients
    API->>SSE: Trigger broadcast
    SSE->>KV: Read updated todos
    SSE-->>SyncHook: "sync" event {todos: [...]}
    SyncHook->>Hook: Update todos
    Hook->>UI: Re-render with server state

    SSE-->>OtherClients: "sync" event {todos: [...]}
    OtherClients->>OtherClients: Update UI

    Note over User,OtherClients: Error Handling
    User->>UI: Delete todo
    UI->>Hook: deleteTodo(id)
    Hook->>UI: Remove from UI (optimistic)
    Hook->>Queue: Enqueue delete
    Queue->>API: POST delete operation
    API--xQueue: Network error
    Queue->>Queue: Exponential backoff<br/>(retry 1/3)
    Queue->>API: Retry POST
    API->>KV: Delete todo
    API-->>Queue: Success
```

## Component Interaction Diagram

This diagram shows how React components, hooks, and server infrastructure interact to provide real-time
synchronization.

```mermaid
flowchart TD
    subgraph Components["React Components"]
        SharedTodoList["SharedTodoList<br/>(Presentation)"]
    end

    subgraph Hooks["Custom Hooks"]
        useSharedTodos["useSharedTodos<br/>(Orchestrator)"]
        useSharedTodoSync["useSharedTodoSync<br/>(SSE Connection)"]
    end

    subgraph Infrastructure["Client Infrastructure"]
        SyncQueue["SyncQueue<br/>(Retry Logic)"]
        EventSource["EventSource<br/>(Browser API)"]
    end

    subgraph Server["Server Endpoints"]
        SubscribeRoute["/api/shared/[listId]/subscribe<br/>(SSE Stream)"]
        SyncRoute["/api/shared/[listId]/sync<br/>(HTTP POST)"]
        KVStore["KV Store<br/>(Data Persistence)"]
    end

    SharedTodoList -->|"props: listId, userId"| useSharedTodos
    SharedTodoList <-->|"state: todos, syncState"| useSharedTodos

    useSharedTodos -->|"initialize"| useSharedTodoSync
    useSharedTodos -->|"initialize"| SyncQueue

    useSharedTodos -->|"onSync callback"| useSharedTodoSync
    useSharedTodoSync -->|"todos updates"| useSharedTodos

    useSharedTodos -->|"queue.add(operation)"| SyncQueue
    SyncQueue -->|"fetch POST"| SyncRoute

    useSharedTodoSync -->|"new EventSource(url)"| EventSource
    EventSource <-.->|"SSE connection"| SubscribeRoute

    SyncRoute <-->|"read/write"| KVStore
    SubscribeRoute -->|"read"| KVStore

    style Components fill:#e3f2fd
    style Hooks fill:#f3e5f5
    style Infrastructure fill:#fff3e0
    style Server fill:#e8f5e9
```

## Connection State Diagram

This diagram illustrates the connection lifecycle and state transitions for the SSE-based real-time sync.

```mermaid
stateDiagram-v2
    [*] --> Pending : Hook initialized

    Pending --> Connecting : EventSource created
    Connecting --> Synced : "connected" event received

    Synced --> Syncing : Receiving "sync" events
    Syncing --> Synced : Updates applied

    Synced --> Error : Connection error
    Connecting --> Error : Connection failed

    Error --> Reconnecting : Auto-reconnect triggered
    Reconnecting --> Connecting : Exponential backoff delay

    Synced --> Disconnected : Hook unmounted
    Error --> Disconnected : Hook unmounted
    Reconnecting --> Disconnected : Hook unmounted

    Disconnected --> [*]

    note right of Pending
        No EventSource instance
        UI shows "Initializing..."
    end note

    note right of Connecting
        EventSource connecting
        UI shows "Connecting..."
    end note

    note right of Synced
        Stable connection
        UI shows "Connected"
        Real-time updates active
    end note

    note right of Syncing
        Processing server updates
        UI shows sync indicator
    end note

    note right of Error
        Connection lost
        UI shows "Disconnected"
        Auto-reconnect scheduled
    end note

    note right of Reconnecting
        Waiting for backoff delay
        Delay: min(30s, 1s * 2^attempts)
        UI shows "Reconnecting..."
    end note
```

## Key Design Decisions

### 1. Server-Sent Events (SSE) over WebSockets

- **Unidirectional**: Server-to-client updates only
- **Simpler**: Built-in browser support, automatic reconnection
- **Scalable**: HTTP-based, works with standard infrastructure
- **Sufficient**: Updates flow server → client; client → server uses HTTP POST

### 2. Optimistic Updates with Rollback

- **Immediate Feedback**: UI updates instantly on user action
- **Temporary IDs**: Client generates temp IDs, replaced by server IDs
- **Rollback on Error**: Failed operations revert UI state
- **Better UX**: Feels instant even with network latency

### 3. Sync Queue with Retry Logic

- **Reliability**: Operations queued and retried on failure
- **Exponential Backoff**: 1s, 2s, 4s delays prevent server overload
- **Max Retries**: 3 attempts before marking operation as failed
- **Ordered Processing**: FIFO queue ensures operation order

### 4. Last-Write-Wins Conflict Resolution

- **Simple**: Server timestamp determines winner
- **Predictable**: Clear, understandable behavior
- **Stateless**: No complex merge logic or operational transforms
- **Trade-off**: Potential data loss in rare concurrent edit scenarios

See [ADR-023: Conflict Resolution Strategy](../adr/023-conflict-resolution.md) for detailed rationale.

## Data Flow Summary

### Create Todo Flow

1. User types todo text → clicks "Add"
2. `useSharedTodos` generates temporary ID → updates UI
3. `SyncQueue` enqueues create operation
4. `SyncQueue` POSTs to `/api/shared/[listId]/sync`
5. Server writes to KV store with real ID
6. Server returns real ID to client
7. Client replaces temp ID with real ID
8. SSE endpoint broadcasts to all clients
9. All clients receive sync event → update UI

### Update Todo Flow

1. User edits todo text or toggles completion
2. `useSharedTodos` updates UI optimistically
3. `SyncQueue` enqueues update operation
4. POST to sync endpoint → server updates KV
5. Broadcast to all clients via SSE
6. Clients apply server state

### Connection Recovery Flow

1. Network interruption → EventSource error
2. `useSharedTodoSync` detects error
3. Close existing EventSource
4. Schedule reconnect with exponential backoff
5. Attempt 1: Wait 1s → try to connect
6. Attempt 2: Wait 2s → try to connect
7. Attempt 3: Wait 4s → try to connect
8. Success → resume normal operation
9. Failure → continue backoff up to 30s max

## Performance Considerations

### Client-Side

- **EventSource**: Native browser API, efficient SSE handling
- **Debouncing**: Queue batches rapid operations
- **Memory**: Single EventSource per list, cleaned up on unmount

### Server-Side

- **Edge Runtime**: Low latency, global distribution
- **Polling**: 2s interval for development (production should use Redis Pub/Sub)
- **Heartbeat**: 30s ping to keep connections alive

### Network

- **SSE Overhead**: ~100 bytes per event
- **HTTP/2**: Connection multiplexing reduces overhead
- **Compression**: gzip/brotli for event payload

## Testing Strategy

### Unit Tests

- `useSharedTodoSync`: Connection management, event handling
- `useSharedTodos`: Optimistic updates, state management
- `SyncQueue`: Retry logic, exponential backoff

### Integration Tests

- Multi-client sync scenarios
- Connection resilience (disconnect/reconnect)
- Race conditions and conflict resolution

### Manual Testing

- Open multiple browser tabs
- Create/update/delete todos in one tab
- Verify instant updates in other tabs
- Test offline behavior and recovery

## Future Enhancements

### Short-term

- **Redis Pub/Sub**: Replace polling with real Pub/Sub
- **User Authentication**: Secure SSE connections with auth tokens
- **Presence Indicators**: Show active users in shared list

### Long-term

- **Operational Transforms**: More sophisticated conflict resolution
- **Collaborative Cursors**: Show where others are editing
- **Undo/Redo**: Sync-aware undo stack
- **Offline-First**: Service Worker for full offline support

## References

- [ADR-022: Real-Time Synchronization Architecture](../adr/022-realtime-sync-architecture.md)
- [ADR-023: Conflict Resolution Strategy](../adr/023-conflict-resolution.md)
- [Server-Sent Events Specification](https://html.spec.whatwg.org/multipage/server-sent-events.html)
- [MDN: Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [GitHub Issue #122](https://github.com/mikiwiik/instructions-only-claude-coding/issues/122)

---

This architecture diagram complements the ADRs and provides a visual reference for understanding and implementing
real-time synchronization in the todo application.
