# ADR-018: API Schema Design for Shared Lists

**Status**: Proposed
**Date**: 2025-01-04
**Deciders**: AI Agent (frontend-specialist, quality-assurance, documentation-agent)
**Related Issues**:
[#120 - Design shared todo list data model and API schema](https://github.com/mikiwiik/instructions-only-claude-coding/issues/120)
**Related ADRs**: ADR-013 (Shared Lists Backend Architecture),
ADR-017 (Shared Todo List Data Model)

## Context

The shared todo list feature (defined in ADR-017) requires a REST API to:

- Create and manage shared lists
- Synchronize todos between multiple clients
- Handle participant join/leave operations
- Track participant presence
- Resolve conflicts during concurrent edits
- Support deployment on Vercel serverless functions

This ADR defines the complete API schema, endpoints, request/response structures,
and performance requirements for the shared list backend.

## Decision

We will implement a RESTful API with the following structure:

### Base URL Structure

```text
Production:  https://my-first-claude-code.vercel.app/api
Development: http://localhost:3000/api
```

### API Versioning

**URL-Based Versioning:**

```text
/api/v1/lists
/api/v1/todos
/api/v1/participants
```

**Version Policy:**

- Current version: `v1`
- Breaking changes require new version (`v2`, `v3`, etc.)
- Previous versions maintained for 6 months minimum
- Deprecation announced in response headers: `Sunset: <date>`

### Core Endpoints

#### 1. Create Shared List

```http
POST /api/v1/lists
Content-Type: application/json

Request:
{
  "name": "Grocery Shopping",
  "participantId": "550e8400-e29b-41d4-a716-446655440000",
  "initialTodos": [
    {
      "text": "Milk",
      "completed": false
    }
  ]
}

Response: 201 Created
{
  "listId": "7f3d8a1c-4b5e-6c7d-8e9f-0a1b2c3d4e5f",
  "shareCode": "ABC12XYZ",
  "name": "Grocery Shopping",
  "createdAt": "2025-01-04T10:00:00.000Z",
  "syncVersion": 1,
  "participants": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "color": "#3B82F6",
      "joinedAt": "2025-01-04T10:00:00.000Z",
      "isCreator": true
    }
  ],
  "todos": [
    {
      "id": "8a9b0c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d",
      "text": "Milk",
      "completed": false,
      "createdAt": "2025-01-04T10:00:00.000Z",
      "updatedAt": "2025-01-04T10:00:00.000Z",
      "syncVersion": 1,
      "lastEditedBy": "550e8400-e29b-41d4-a716-446655440000"
    }
  ]
}

Errors:
400 Bad Request - Invalid request data
429 Too Many Requests - Rate limit exceeded
500 Internal Server Error - Server error
```

#### 2. Join Shared List

```http
POST /api/v1/lists/join
Content-Type: application/json

Request:
{
  "shareCode": "ABC12XYZ",
  "participantId": "660f9511-f3ac-52e5-b827-557766551111"
}

Response: 200 OK
{
  "listId": "7f3d8a1c-4b5e-6c7d-8e9f-0a1b2c3d4e5f",
  "name": "Grocery Shopping",
  "syncVersion": 5,
  "participant": {
    "id": "660f9511-f3ac-52e5-b827-557766551111",
    "color": "#EF4444",
    "joinedAt": "2025-01-04T10:05:00.000Z"
  },
  "todos": [/* Full current state */]
}

Errors:
404 Not Found - Invalid share code
410 Gone - List has been deleted
429 Too Many Requests - Rate limit exceeded
```

#### 3. Sync Todos (Incremental)

```http
POST /api/v1/lists/{listId}/sync
Content-Type: application/json

Request:
{
  "participantId": "550e8400-e29b-41d4-a716-446655440000",
  "lastSyncVersion": 3,
  "changes": [
    {
      "id": "8a9b0c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d",
      "text": "Milk (2%)",
      "completed": true,
      "updatedAt": "2025-01-04T10:10:00.000Z",
      "syncVersion": 4
    },
    {
      "id": "9b0c1d2e-3f4a-5b6c-7d8e-9f0a1b2c3d4e",
      "text": "Eggs",
      "completed": false,
      "createdAt": "2025-01-04T10:10:10.000Z",
      "updatedAt": "2025-01-04T10:10:10.000Z",
      "syncVersion": 5,
      "isNew": true
    }
  ]
}

Response: 200 OK
{
  "syncVersion": 6,
  "lastSyncedAt": "2025-01-04T10:10:20.000Z",
  "serverChanges": [
    {
      "id": "0c1d2e3f-4a5b-6c7d-8e9f-0a1b2c3d4e5f",
      "text": "Bread",
      "completed": false,
      "createdAt": "2025-01-04T10:10:05.000Z",
      "updatedAt": "2025-01-04T10:10:05.000Z",
      "syncVersion": 4,
      "lastEditedBy": "660f9511-f3ac-52e5-b827-557766551111"
    }
  ],
  "conflicts": [
    {
      "todoId": "8a9b0c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d",
      "localVersion": {
        "text": "Milk (2%)",
        "completed": true,
        "syncVersion": 4,
        "updatedAt": "2025-01-04T10:10:00.000Z"
      },
      "serverVersion": {
        "text": "Milk (Whole)",
        "completed": false,
        "syncVersion": 4,
        "updatedAt": "2025-01-04T10:09:58.000Z",
        "lastEditedBy": "660f9511-f3ac-52e5-b827-557766551111"
      },
      "resolution": "local-wins"
    }
  ],
  "deletedTodoIds": []
}

Errors:
404 Not Found - List not found
409 Conflict - Major version mismatch (full sync required)
429 Too Many Requests - Rate limit exceeded
```

#### 4. Update Participant Presence

```http
PUT /api/v1/lists/{listId}/presence
Content-Type: application/json

Request:
{
  "participantId": "550e8400-e29b-41d4-a716-446655440000",
  "isActive": true,
  "currentTodoId": "8a9b0c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d"
}

Response: 200 OK
{
  "participants": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "color": "#3B82F6",
      "isActive": true,
      "currentTodoId": "8a9b0c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d",
      "lastActivityAt": "2025-01-04T10:15:00.000Z"
    },
    {
      "id": "660f9511-f3ac-52e5-b827-557766551111",
      "color": "#EF4444",
      "isActive": false,
      "lastActivityAt": "2025-01-04T10:14:50.000Z"
    }
  ]
}

Errors:
404 Not Found - List or participant not found
```

#### 5. Delete Shared List

```http
DELETE /api/v1/lists/{listId}
Content-Type: application/json

Request:
{
  "participantId": "550e8400-e29b-41d4-a716-446655440000"
}

Response: 204 No Content

Errors:
403 Forbidden - Only creator can delete
404 Not Found - List not found
```

### Error Response Schema

**Standardized Error Format:**

```json
{
  "error": {
    "code": "SYNC_VERSION_MISMATCH",
    "message": "Client version too far behind server. Full sync required.",
    "details": {
      "clientVersion": 3,
      "serverVersion": 15,
      "requiredAction": "full-sync"
    },
    "timestamp": "2025-01-04T10:20:00.000Z"
  }
}
```

**Error Codes:**

- `INVALID_REQUEST`: Malformed request data
- `LIST_NOT_FOUND`: Requested list doesn't exist
- `INVALID_SHARE_CODE`: Share code invalid or expired
- `SYNC_VERSION_MISMATCH`: Version conflict requiring full sync
- `PARTICIPANT_NOT_FOUND`: Participant ID not in list
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server-side error

## Performance Requirements

### Concrete Metrics

- **Initial Load**: < 500ms for lists with up to 100 items
- **Sync Latency**: < 200ms for single item update propagation
- **List Render**: Maintain 60fps for 1000+ items (with virtualization)
- **Maximum List Size**: 10,000 items before pagination/archival required
- **Sync Interval**: Default 5 seconds for polling, configurable per deployment
- **Concurrent Users**: Support up to 50 simultaneous participants per list
- **Cold Start**: < 1s for Vercel serverless functions
- **Warm Request**: < 100ms for sync endpoint

### Performance Optimizations

#### 1. Incremental Sync Strategy

**Client Tracking:**

```typescript
interface SyncState {
  listId: string;
  lastSyncVersion: number;
  lastSyncedAt: number;
  pendingChanges: SharedTodo[];
}
```

**Server Response:**

- Only return todos changed since `lastSyncVersion`
- Use `If-None-Match` header with `syncVersion` for caching
- Return `304 Not Modified` if no changes

#### 2. Data Compression

**Request/Response Headers:**

```http
Accept-Encoding: gzip, br
Content-Encoding: gzip
```

**Compression Savings:**

- JSON compression: ~60-70% size reduction
- Typical sync: 2KB → 600-800 bytes

#### 3. Batch Operations

**Multiple Todo Changes:**

```json
{
  "changes": [
    { "id": "...", "action": "update", "data": {...} },
    { "id": "...", "action": "delete" },
    { "id": "...", "action": "create", "data": {...} }
  ]
}
```

**Benefits:**

- Single network round trip
- Atomic transaction on server
- Reduced sync latency

#### 4. Conditional Requests

**ETag Support:**

```http
GET /api/v1/lists/{listId}/todos
If-None-Match: "version-5"

Response: 304 Not Modified (if no changes)
Response: 200 OK + ETag: "version-6" (if changed)
```

## Vercel Serverless Compatibility

### Function Configuration

**vercel.json:**

```json
{
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "regions": ["iad1"],
  "env": {
    "SYNC_INTERVAL_MS": "5000",
    "MAX_LIST_SIZE": "1000"
  }
}
```

### Cold Start Optimization

**Strategies:**

- Minimal dependencies in API routes
- Lazy load heavy libraries
- Use edge functions for simple reads
- Cache participant data in memory

**Expected Performance:**

- Cold start: <1s
- Warm request: <100ms
- Sync endpoint: <200ms

### Data Storage

**Upstash Redis (Redis):**

```typescript
// List metadata
await kv.set(`list:${listId}`, listData, { ex: 86400 * 30 }); // 30 days TTL

// Todos (hash for efficient partial updates)
await kv.hset(`todos:${listId}`, todoId, todoData);

// Participant presence (short TTL)
await kv.set(`presence:${listId}:${participantId}`, presenceData, { ex: 60 });
```

**Storage Limits:**

- Free tier: 256MB
- Pro tier: 1GB
- Expected usage: ~1KB per todo, ~500 bytes per list metadata

### Rate Limiting

**Vercel Edge Config + KV:**

```typescript
const rateLimit = {
  windowMs: 60000, // 1 minute
  maxRequests: 100, // per participant per minute
  message: 'Rate limit exceeded',
};

// Implementation
const key = `ratelimit:${participantId}`;
const count = await kv.incr(key);
if (count === 1) await kv.expire(key, 60);
if (count > rateLimit.maxRequests) {
  return new Response('Rate limit exceeded', { status: 429 });
}
```

## Security Considerations

### Input Validation

- Validate all API request payloads against defined Zod schemas
- Sanitize participant names and list names (max length, no special chars)
- Reject malformed vector clocks/sync versions
- Validate UUIDs for all ID fields

### Rate Limiting

- **Per-participant limits**: 100 requests/minute for sync operations
- **Per-list limits**: 500 total requests/minute across all participants
- **Join endpoint**: 10 requests/minute per IP to prevent abuse
- Return 429 status with `Retry-After` header when exceeded

### CORS Configuration

- Whitelist Vercel deployment domains only
- No wildcard origins in production
- Include credentials for authenticated requests
- Strict same-site cookie policies

### Error Message Sanitization

- Never expose internal error details to clients
- No stack traces in production responses
- Generic error messages for authentication failures
- Log sensitive errors server-side only
- Use error codes instead of descriptive messages for security issues

### Data Protection

- Encrypt list IDs in join URLs
- Implement list access tokens for private lists
- Auto-expire participant sessions after 7 days of inactivity
- Secure deletion of participant data on leave

## Accessibility Considerations (WCAG 2.2 AA)

### API Design for Accessible Clients

#### Screen Reader Announcements

- **Status Endpoints**: `/participants` endpoint provides data for announcing presence changes

  ```typescript
  // Enables: "Sarah joined the list"
  GET /api/v1/lists/{id}/participants
  Response: Participant[]  // With joinedAt timestamps
  ```

- **Event Types**: Explicit change types enable semantic announcements

  ```typescript
  // Enables: "John marked 'Buy milk' as complete"
  SyncResponse.serverChanges includes lastEditedBy
  ```

#### Structured Error Responses

- **Accessible Error Messages**: Conflict responses provide semantic data

  ```typescript
  // 409 Conflict response supports:
  // "Cannot save. Sarah updated this item while you were editing."
  {
    "error": "version_conflict",
    "details": {
      "serverVersion": { lastEditedBy: "participant-id" }
    }
  }
  ```

#### Participant Activity Data

- **Presence Indicators**: Activity data supports accessible presence indicators

  ```typescript
  // Enables: "Sarah is currently active" (not just green dot)
  PUT /api/v1/lists/{id}/presence
  Response includes isActive boolean
  ```

#### Semantic Data Structure

- **Edit Attribution**: `lastEditedBy` field in all mutations supports text-based attribution
- **Timestamps**: ISO 8601 timestamps enable accessible relative time formatting
- **Activity Status**: Boolean activity status (not just color coding)

### Client Implementation Requirements

Clients consuming this API must:

- Announce participant join/leave events to screen readers
- Provide keyboard-accessible conflict resolution UI
- Use ARIA live regions for real-time todo updates
- Ensure all error states are accessible without color alone

## Testing Strategy

### API Contract Tests

- Version conflict scenarios (concurrent edits)
- Participant join/leave flows
- Authentication and authorization
- Error response format consistency

### Integration Tests

- Multiple clients connected simultaneously
- Conflict resolution with real version numbers
- Participant activity timeout handling
- Full sync vs. incremental sync

### Load Testing

- 50+ concurrent participants per list
- High-frequency sync operations (100+ changes/minute)
- Upstash Redis response times under stress
- Cold start frequency and duration

### Failure Recovery Testing

- Network interruption and reconnection
- Upstash Redis timeout handling
- Partial sync failure recovery
- Conflict resolution edge cases

### Test Coverage Requirements

- Minimum 80% code coverage for API routes
- 100% coverage for conflict resolution logic
- All error paths must have explicit test cases

## Rationale

### Why REST Over GraphQL?

**REST Chosen:**

- ✅ Simpler for CRUD operations
- ✅ Better caching with HTTP
- ✅ Well-supported by Vercel serverless
- ✅ Lower complexity for educational project

**GraphQL Rejected:**

- ❌ Overkill for simple todo operations
- ❌ Larger bundle size
- ❌ More difficult to cache effectively
- ❌ Added complexity

### Why Polling Over WebSockets?

**Polling with 5s Interval:**

- ✅ Sufficient for todo list use case
- ✅ Simpler implementation
- ✅ Better serverless compatibility
- ✅ Automatic reconnection

**WebSockets Rejected:**

- ❌ Connection management complexity
- ❌ Harder to scale with serverless
- ❌ Not needed for 5s update tolerance
- ⏭️ Can be added in future version if needed

## Consequences

### Positive

- **Simple REST**: Easy to understand and implement
- **Serverless-Optimized**: Works well with Vercel functions
- **Efficient Sync**: Incremental updates minimize data transfer
- **Flexible Versioning**: Can evolve API without breaking clients
- **Error Transparency**: Clear error messages for debugging
- **Rate Limiting**: Protects against abuse
- **Cacheable**: Standard HTTP caching works out of box
- **Testable**: Easy to write integration tests

### Negative

- **Polling Overhead**: Not truly real-time (5s interval)
- **Network Dependency**: Requires active connection for sync
- **Conflict Resolution**: Client must handle conflicts
- **Storage Costs**: Upstash Redis usage scales with users
- **Cold Starts**: Initial requests may be slow

### Neutral

- **REST vs GraphQL**: Trade-off of simplicity vs flexibility
- **Versioning Overhead**: Must maintain multiple API versions
- **Rate Limiting**: May frustrate power users in edge cases

## Implementation Notes

### Phase 1: Core API Routes

1. Implement `/api/v1/lists` (create, join, delete)
2. Add Upstash Redis storage integration
3. Create basic error handling middleware
4. Add rate limiting

### Phase 2: Sync Engine

1. Implement `/api/v1/lists/{listId}/sync`
2. Add conflict detection and resolution
3. Implement incremental sync logic
4. Add presence tracking endpoint

### Phase 3: Optimization

1. Add response caching with ETags
2. Implement compression
3. Optimize cold start performance
4. Add monitoring and logging

## References

- Issue #120: Design shared todo list data model and API schema
- ADR-013: Shared Lists Backend Architecture
- ADR-017: Shared Todo List Data Model Design
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Upstash Redis Documentation](https://upstash.com/docs/redis)
- [REST API Best Practices](https://restfulapi.net/)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [WCAG 2.2 AA Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [Accessibility Requirements](../ux/accessibility-requirements.md)

---

**This ADR defines the complete API schema for shared todo lists, optimized for Vercel serverless deployment
with performance, security, and accessibility built in from the start.**
