# ADR-029: Server-Only Architecture with Upstash Redis Backend

**Status**: Proposed
**Date**: 2025-11-22
**Deciders**: Development Team
**Supersedes**: [ADR-005: Use localStorage for data persistence](./005-localstorage-persistence.md)
**Amends**: [ADR-013: Shared Lists Backend Architecture](./013-shared-lists-backend-architecture.md) (removes hybrid approach)
**Technical Story**: [#121 - Setup Vercel backend infrastructure for shared todo lists](https://github.com/mikiwiik/instructions-only-claude-coding/issues/121)

## Summary

Migrate from localStorage-only persistence to server-backed storage using Upstash Redis (Redis) for all todo lists. This establishes the backend as the single source of truth, enabling multi-device access and future collaborative features.

## Context

### Current State (ADR-005)

- **Storage**: Browser localStorage only
- **Scope**: Single device, single browser
- **Persistence**: Client-side only, data loss risk if browser data cleared
- **Collaboration**: Not possible
- **Multi-device**: Not possible
- **Backend**: None

### Problems with localStorage-Only Approach

1. **Single-device limitation**: Users cannot access todos from different devices
2. **Data loss risk**: Clearing browser data loses all todos permanently
3. **No collaboration**: Cannot share lists with others
4. **No backup**: No server-side backup or recovery mechanism
5. **Educational limitation**: Backend development is a critical skill for web developers

### Desired State

- **Storage**: Upstash Redis (Redis-compatible) as single source of truth
- **Scope**: Multi-device access for all users
- **Persistence**: Server-side with automatic persistence
- **Collaboration**: Ready for future share URL implementation
- **Backend**: Full-stack application demonstrating modern architecture patterns

## Decision

### Core Architectural Decision

Migrate to **server-only architecture** where:

1. **All todos stored in Upstash Redis backend** (not localStorage)
2. **Single hardcoded list ID** (`"main-list"`) for now - unique per-user IDs deferred to future issue
3. **localStorage deprecated** - no longer used for persistence (future: caching only)
4. **Backend as single source of truth** - all operations go through API routes
5. **Optimistic updates** - immediate UI feedback with backend sync

### Technology Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Backend Storage** | Upstash Redis (Redis) | Zero-config Vercel integration, generous free tier, edge replication |
| **API Routes** | Next.js API Routes | Serverless, already set up, reuses existing infrastructure |
| **Persistence** | Server-side only | Single source of truth, enables multi-device |
| **Client State** | React useState + useEffect | Simple, fits existing patterns |

### URL Structure

For this implementation:
- **Root route** (`/`) - Loads hardcoded `"main-list"` from backend
- **Future** (separate issue): Unique URLs per user (`/list/[unique-id]`)

### Data Flow

```typescript
User Action → useTodos Hook → API Route → Upstash Redis → Response → UI Update

Example: Add Todo
1. User types todo text, clicks "Add"
2. useTodos.addTodo() creates todo object
3. Optimistic update: Add to local state immediately (instant UI feedback)
4. POST /api/shared/main-list/sync with operation="create"
5. API route stores in Upstash Redis
6. On success: Keep optimistic update
7. On error: Rollback local state, show error
```

### Migration Strategy

**For this implementation (single user)**:
- No automatic migration needed
- User manually clears localStorage: `localStorage.clear()`
- Fresh start with backend storage

**For future (multiple users)**:
- Detect existing localStorage data
- Offer migration to backend
- Store migration status
- (See future icebox issue for full spec)

## Rationale

### Why Server-Only (Not Hybrid)?

**Hybrid approach complexity:**
- Two storage systems to maintain
- Confusing UX: "Where are my todos?"
- Complex sync logic between local and server
- User must choose storage mode

**Server-only benefits:**
- **Simpler architecture**: One storage system
- **Clearer mental model**: Backend is always the source of truth
- **Future-ready**: Enables sharing, collaboration, backup
- **Better UX**: Cross-device access by default
- **Educational value**: Demonstrates full-stack development

### Why Upstash Redis?

**Alternatives considered:**
- **PostgreSQL**: Overkill for key-value storage, more complex
- **MongoDB**: Unnecessary document database for simple JSON
- **Supabase**: External dependency, additional service to manage
- **Firebase**: Google ecosystem lock-in, different auth model

**Upstash Redis advantages:**
- Zero-configuration integration with Vercel deployment
- Redis-compatible (industry-standard)
- Global edge replication
- Generous free tier (30GB storage, 100k requests/month)
- Seamless environment variable management
- Perfect for serverless Next.js architecture

### Why Not Keep localStorage?

**Educational project rationale:**
- Backend development is essential web dev skill
- Demonstrates real-world full-stack patterns
- Prepares for collaborative features
- Shows modern serverless architecture
- localStorage remains available for future "private mode" feature (icebox)

## Implementation Details

### Upstash Redis Setup

```bash
# Install package
npm install @upstash/redis --save-exact

# Environment variables (from Vercel dashboard)
UPSTASH_REDIS_REST_URL=https://...kv.vercel-storage.com
UPSTASH_REDIS_REST_TOKEN=...
```

### KVStore Implementation

```typescript
// app/lib/kv-store.ts
import { Redis } from '@upstash/redis';

export class KVStore {
  static async getList(listId: string) {
    return await kv.get(`shared:list:${listId}`);
  }

  static async setList(listId: string, todos: Todo[]) {
    await kv.set(`shared:list:${listId}`, { todos, lastModified: Date.now() });
  }
}
```

### useTodos Hook Refactor

```typescript
// app/hooks/useTodos.ts
const MAIN_LIST_ID = 'main-list';

export function useTodos() {
  // Fetch from backend on mount
  useEffect(() => {
    fetch(`/api/shared/${MAIN_LIST_ID}/sync`)
      .then(res => res.json())
      .then(data => setState({ todos: data.todos }));
  }, []);

  // All operations sync to backend
  const addTodo = async (text) => {
    // Optimistic update
    setState(prev => ({ todos: [newTodo, ...prev.todos] }));

    // Sync to backend
    await fetch(`/api/shared/${MAIN_LIST_ID}/sync`, {
      method: 'POST',
      body: JSON.stringify({ operation: 'create', data: newTodo })
    });
  };
}
```

### API Routes (Reused)

Existing API routes already support this:
- `GET /api/shared/[listId]/sync` - Fetch todos
- `POST /api/shared/[listId]/sync` - CRUD operations
- Now called with `listId="main-list"`

## Out of Scope (Future Issues)

This ADR explicitly **excludes**:

1. **localStorage caching** - Future optimization (icebox issue)
2. **Unique URLs per user** - Future enhancement (backlog issue)
3. **Private localStorage mode** - Future feature (icebox issue)
4. **Migration UI** - Not needed (single user, manual clear)
5. **Backup/export** - Future feature (icebox issue)
6. **Share URLs** - Covered by separate issue #123

## Consequences

### Positive

- ✅ **Multi-device access**: Access todos from any device with URL
- ✅ **Data persistence**: Server-side backup, no browser data loss
- ✅ **Future-ready**: Foundation for sharing and collaboration
- ✅ **Simpler architecture**: Single source of truth
- ✅ **Educational value**: Demonstrates full-stack development
- ✅ **Cost-effective**: Upstash Redis free tier sufficient
- ✅ **Modern patterns**: Serverless, edge functions, optimistic updates

### Negative

- ❌ **Requires backend**: Network required on first load
- ❌ **Vercel dependency**: Tied to Vercel ecosystem (acceptable for project)
- ❌ **Breaking change**: Existing localStorage data not automatically migrated
- ❌ **Privacy concern**: Data stored on server (mitigated by anonymous model)

### Neutral

- ⚪ **Learning curve**: Developers learn backend integration
- ⚪ **Setup required**: Upstash Redis must be configured (documented)
- ⚪ **Cost monitoring**: Need to track free tier usage (very low for this app)

## Breaking Changes

### For Users

1. **Clear localStorage**: Run `localStorage.clear()` in browser console before using updated app
2. **Fresh start**: No automatic migration of existing todos
3. **Network required**: App requires network connection to load todos

### For Developers

1. **Upstash Redis setup required**: Must configure Upstash Redis in dashboard
2. **Environment variables**: Must set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
3. **Local development**: Requires `.env.local` with Upstash Redis credentials

**Setup guide**: See `docs/deployment/upstash-setup.md`

## Related Decisions

### Supersedes
- **ADR-005**: localStorage persistence (no longer used for primary storage)

### Amends
- **ADR-013**: Shared Lists Backend Architecture (removes hybrid local+shared approach)

### Relates To
- **ADR-014**: Anonymous Sharing Architecture (enables future sharing features)
- **ADR-022**: Real-Time Sync Architecture (SSE now applies to all lists, not just shared)

### Enables Future
- **Issue #123**: Share URL generation (backed by this infrastructure)
- **Icebox**: localStorage caching layer (optimization on top of backend)
- **Icebox**: Private localStorage mode (opt-in local-only storage)
- **Icebox**: Backup and export features

## Success Metrics

### Technical Metrics
- ✅ All CRUD operations work through backend
- ✅ Data persists after browser refresh
- ✅ Data persists after localStorage clear
- ✅ API response times < 200ms
- ✅ Zero data loss in Upstash Redis

### User Experience Metrics
- ✅ Instant UI feedback (optimistic updates)
- ✅ Seamless cross-device access (with same URL)
- ✅ No breaking UX changes (same interface)
- ✅ Clear error messages on network failures

### Educational Metrics
- ✅ Demonstrates serverless architecture
- ✅ Shows backend integration patterns
- ✅ Illustrates optimistic UI updates
- ✅ Teaches Upstash Redis usage

## Implementation Timeline

**Completed in Issue #121:**
1. ✅ Install `@upstash/redis` package
2. ✅ Update `KVStore` to use Upstash Redis SDK
3. ✅ Refactor `useTodos` hook for backend API
4. ✅ Create Vercel configuration files
5. ✅ Document Upstash Redis setup process

**Future Issues:**
- Unique URL per user (backlog)
- localStorage caching (icebox)
- Private mode toggle (icebox)
- Backup/export features (icebox)

## References

- [Upstash Redis Documentation](https://upstash.com/docs/redis/overall/getstarted)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)
- [Optimistic UI Patterns](https://www.apollographql.com/docs/react/performance/optimistic-ui/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)

## Compliance

### Privacy Considerations

- Anonymous storage model (no user accounts)
- Minimal data collection (only todos and metadata)
- No personal identifiable information stored
- Users control their data through URL ownership
- Future: Add client-side encryption option

### Security Considerations

- Upstash Redis secured by environment variables
- API routes use Next.js serverless security
- Rate limiting handled by Vercel
- Future: Add access tokens for sensitive lists

## Alternatives Considered

### Alternative 1: Keep localStorage + Add Backend (Hybrid)

**Pros:**
- Offline-first by default
- Privacy for local-only lists
- Gradual migration path

**Cons:**
- Complex: Two storage systems
- Confusing UX: "Where are my todos?"
- Sync conflicts to resolve
- More code to maintain

**Decision:** Rejected - Complexity outweighs benefits for educational project

### Alternative 2: localStorage with Optional Cloud Sync

**Pros:**
- localStorage remains primary
- Progressive enhancement
- User choice

**Cons:**
- Still dual storage systems
- Complex sync logic
- Deferred backend learning

**Decision:** Rejected - Delays backend education, complex architecture

### Alternative 3: Supabase Backend

**Pros:**
- Full database features
- Built-in auth
- Real-time subscriptions

**Cons:**
- External dependency
- More complex setup
- Different ecosystem from Vercel
- PostgreSQL overkill for key-value

**Decision:** Rejected - Upstash Redis better integrated, simpler

## Decision Makers

- **Primary**: Development team (AI + Human oversight)
- **Rationale**: Educational project prioritizing backend learning
- **Consultation**: Reviewed existing ADRs (005, 013, 014, 022)

## Approval

**Status**: Proposed (2025-11-22)
**Approver**: TBD (Project owner)
**Implementation**: Issue #121

---

**This ADR marks a fundamental shift in the application architecture from client-only to full-stack, enabling future collaborative features while maintaining simplicity and educational value.**
