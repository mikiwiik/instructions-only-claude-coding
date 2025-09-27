# ADR-013: Shared Lists Backend Architecture and Multi-Device Sync

**Status**: Approved
**Date**: 2025-09-27
**Deciders**: Claude Code Development Team
**Technical Story**: [#85 - Scope backend persistence and multi-device sync architecture](https://github.com/mikiwiik/instructions-only-claude-coding/issues/85)

## Summary

Define the backend architecture for implementing shared todo lists with real-time synchronization across multiple devices, while avoiding user authentication complexity and maintaining the educational value of the codebase.

## Context

The Todo App currently uses localStorage for data persistence, limiting users to single-device usage. To enable sharing and multi-device access, we need to implement backend persistence with real-time synchronization while maintaining the project's focus on simplicity and educational value.

### Current State

- **Storage**: localStorage only
- **Scope**: Single device, single user
- **Persistence**: Browser-dependent, data loss risk
- **Collaboration**: None
- **Architecture**: Client-side only with Next.js frontend

### Desired State

- **Storage**: Cloud-based with local fallback
- **Scope**: Multi-device, multi-user collaboration
- **Persistence**: Reliable cloud storage with data retention
- **Collaboration**: Real-time shared todo lists
- **Architecture**: Full-stack with serverless backend

## Decision

### Core Architecture Decision: Vercel-Native Serverless Stack

We will implement a **Vercel-native serverless architecture** using:

1. **Backend**: Next.js API Routes (serverless functions)
2. **Storage**: Vercel KV (Redis-compatible)
3. **Real-time**: Server-Sent Events (SSE) with polling fallback
4. **Authentication**: Anonymous sharing (no user accounts)
5. **Deployment**: Vercel edge deployment with global distribution

### Technology Stack Selection

| Component | Choice | Alternatives Considered | Rationale |
|-----------|--------|------------------------|-----------|
| **Backend** | Next.js API Routes | Supabase, Firebase, Custom Node.js | Keeps everything in Next.js stack, serverless scaling |
| **Database** | Vercel KV (Redis) | PostgreSQL, MongoDB, Supabase | Zero config, edge replication, perfect for real-time |
| **Real-time** | Server-Sent Events | WebSockets, Pusher, Polling | Simple, reliable, no external dependencies |
| **Authentication** | Anonymous sharing | NextAuth, Clerk, Auth0, Supabase Auth | Avoids complexity, maintains educational focus |
| **Hosting** | Vercel | Railway, AWS, Google Cloud | Integrated ecosystem, free tier, educational use |

### Data Architecture

#### Shared List Data Model

```typescript
interface SharedList {
  id: string;              // UUID for sharing
  name: string;            // Display name
  todos: SharedTodo[];     // Todo items
  createdAt: Date;
  updatedAt: Date;
  lastSyncAt: Date;
  participantIds: string[]; // Anonymous participants
  accessToken?: string;     // Optional security
}

interface SharedTodo extends Todo {
  listId: string;           // Reference to SharedList
  authorId?: string;        // Anonymous participant ID
  lastModifiedBy?: string;  // Last editor
  syncVersion: number;      // Conflict resolution
}
```

#### API Design

```
/api/shared/
├── create              # POST - Create shared list
├── [listId]/
│   ├── index          # GET - Fetch list data
│   ├── sync           # POST - Sync operations
│   ├── join           # POST - Join as participant
│   └── subscribe      # GET - SSE real-time updates
```

### Real-Time Synchronization Strategy

1. **Optimistic Updates**: Immediate UI response with rollback on conflicts
2. **Conflict Resolution**: Last-write-wins with timestamp comparison
3. **Operation Queue**: Client-side queue for offline support
4. **Event Broadcasting**: SSE for real-time change distribution

### Anonymous Sharing Model

- **No User Accounts**: Eliminates authentication complexity
- **Share URLs**: `https://app.vercel.app/shared/[listId]?token=[optional]`
- **Participant IDs**: Auto-generated anonymous identifiers
- **Access Control**: URL-based with optional access tokens

## Implementation Strategy

### Phase 1: Foundation (Week 1)

- Data model design and API schema
- Vercel KV setup and basic API routes
- localStorage to shared list conversion

### Phase 2: Core Functionality (Week 2-3)

- Real-time synchronization with SSE
- Share URL generation and access control
- Basic conflict resolution

### Phase 3: Enhanced Features (Week 4)

- Collaborative UI with participant indicators
- Advanced conflict resolution
- Offline support and sync queues

### Phase 4: Optimization (Week 5)

- Performance optimization
- Enhanced security measures
- Analytics and monitoring

## Migration and Compatibility Strategy

### Backward Compatibility

- Existing `useTodos()` calls work unchanged
- localStorage remains as fallback storage
- Progressive enhancement approach

### Data Migration

```typescript
// Migration flow
localStorage todos → SharedList creation → Share URL generation
```

### Hybrid Usage

- Users can maintain both local and shared lists
- Conversion between local ↔ shared available
- No forced migration required

## Security and Privacy Considerations

### Anonymous Security Model

- No personal data collection or storage
- Share URLs as the primary access control
- Optional access tokens for additional security
- No persistent user tracking

### Data Protection

- HTTPS for all communications
- Secure random ID generation
- Rate limiting on API endpoints
- Automatic cleanup of inactive lists

## Cost Analysis

### Vercel Free Tier Coverage

- **Vercel KV**: 30GB storage, 100k requests/month
- **API Routes**: 100GB-hrs execution time
- **Bandwidth**: 100GB/month
- **Expected Cost**: $0 for development, $0-20/month for moderate usage

### Scaling Considerations

- Vercel KV scales automatically
- Serverless functions scale to zero
- Pay-per-use model aligns with usage
- Free tier sufficient for educational use

## Alternatives Considered

### Backend Options

1. **Supabase**: More features but external dependency
2. **Firebase**: Google ecosystem but vendor lock-in
3. **Custom Node.js**: More control but higher complexity
4. **PlanetScale**: Great for SQL but overkill for this use case

### Authentication Options

1. **NextAuth.js**: Industry standard but adds complexity
2. **Clerk**: Great UX but monthly costs
3. **Auth0**: Enterprise-grade but overpowered
4. **Custom JWT**: Full control but security complexity

### Real-Time Options

1. **WebSockets**: More responsive but connection complexity
2. **Pusher**: Professional service but external dependency
3. **Polling**: Simpler but higher latency and API usage

## Consequences

### Positive

- **Simplicity**: Maintains educational focus with minimal complexity
- **Cost-Effective**: Stays within free tiers for educational use
- **Scalable**: Serverless architecture scales automatically
- **Integrated**: All components work seamlessly with Vercel
- **Fast Development**: Leverages existing Next.js knowledge

### Negative

- **Vendor Lock-in**: Tied to Vercel ecosystem
- **Limited Authentication**: No user accounts limits advanced features
- **Real-time Limitations**: SSE less responsive than WebSockets
- **Security Constraints**: Anonymous model has security limitations

### Neutral

- **Learning Opportunity**: Demonstrates serverless architecture patterns
- **Migration Path**: Clear upgrade path to authenticated system later
- **Technology Demonstration**: Shows modern full-stack development

## Compliance and Documentation Requirements

### Architecture Decision Records

- ADR-014: Shared Todo List Data Model Design
- ADR-015: API Schema Design for Shared Lists
- ADR-016: Vercel Backend Infrastructure Architecture
- ADR-017: Real-Time Communication Strategy
- ADR-018: Real-Time Synchronization Architecture
- ADR-019: Conflict Resolution Strategy
- ADR-020: Share URL Security Architecture
- ADR-021: Anonymous Access Control Strategy

### Security Documentation

- Threat model for anonymous sharing
- Access control implementation details
- Data retention and cleanup policies
- Rate limiting and abuse prevention

## Related Decisions

- **ADR-007**: State Management with useTodos Hook (to be updated)
- **ADR-008**: Component Architecture and Design System (to be updated)
- **Future ADR**: User Authentication Architecture (separate scoping)

## Implementation Issues

- [#120 - Design shared todo list data model and API schema](https://github.com/mikiwiik/instructions-only-claude-coding/issues/120)
- [#121 - Setup Vercel backend infrastructure for shared todo lists](https://github.com/mikiwiik/instructions-only-claude-coding/issues/121)
- [#122 - Implement real-time synchronization for shared todo lists](https://github.com/mikiwiik/instructions-only-claude-coding/issues/122)
- [#123 - Implement share URL generation and access control](https://github.com/mikiwiik/instructions-only-claude-coding/issues/123)
- [#124 - Implement collaborative UI/UX features for shared lists](https://github.com/mikiwiik/instructions-only-claude-coding/issues/124)
- [#125 - Extend useTodos hook for shared list state management](https://github.com/mikiwiik/instructions-only-claude-coding/issues/125)

---

**This ADR establishes the foundational architecture for shared todo lists while maintaining the project's educational focus and avoiding authentication complexity.**
