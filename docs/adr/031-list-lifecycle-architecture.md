# ADR-031: List Lifecycle Architecture

**Status**: Accepted
**Date**: 2025-12-26
**Deciders**: Development Team
**Part of**: #333 (Implement Unique List URLs and Per-User List Management)

## Summary

Introduce a two-tier list model where lists start as local/ephemeral and become shared/persistent only when
explicitly shared by the user. This enables per-user lists while keeping the anonymous collaboration model.

## Context

### Current State

The app currently uses a hardcoded `MAIN_LIST_ID = 'main-list'` that all users share. This was intentional
for the initial MVP but creates issues:

- All users see the same todos
- No personal workspace
- No way to have separate lists for different purposes

### Requirements

1. Users should have their own lists
2. Lists should be shareable via URL
3. Maintain anonymous collaboration (per ADR-014)
4. Clear mental model for users
5. Minimal backend complexity

### Key Insight

The question arose: when should a list be persisted to the backend?

Options considered:

1. **Always persist** - Every list saved to backend immediately
2. **Never persist locally** - Only backend storage
3. **Explicit sharing** - Local until user shares

## Decision

Implement a **two-tier list lifecycle** where sharing is the explicit trigger for persistence.

### List Types

```text
┌─────────────────┐          ┌─────────────────┐
│   LOCAL LIST    │  Share   │  SHARED LIST    │
│   (ephemeral)   │ ──────►  │  (persistent)   │
│   In-memory     │  action  │  Stored in KV   │
│   Not saved     │          │  Has URL        │
└─────────────────┘          └─────────────────┘
```

| Attribute      | Local List              | Shared List      |
| -------------- | ----------------------- | ---------------- |
| Storage        | In-memory (React state) | Vercel KV        |
| Persistence    | Session only            | Permanent        |
| URL            | None                    | `/list/[listId]` |
| Collaboration  | Single user             | Anyone with URL  |
| Real-time sync | None                    | SSE-based        |

### User Entry Flow

On app load (no active list):

1. **Create New List** → Creates local ephemeral list
2. **Open Existing List** → Shows:
   - Remembered lists (from localStorage)
   - Manual URL/ID entry field

### Sharing Model

- **Anonymous collaboration**: Anyone with URL can view/edit (per ADR-014)
- **No authentication required** initially
- **Sharing = persistence trigger**: The explicit "Share" action:
  1. Generates unique list ID (UUID)
  2. Saves todos to Vercel KV
  3. Returns shareable URL
  4. Enables real-time sync
  5. Adds to remembered lists

### Remembered Lists

localStorage tracks lists the user has accessed:

```typescript
interface RememberedList {
  listId: string;
  name?: string; // Optional user-given name
  lastAccessed: Date;
  isOwner: boolean; // Did this user create/share it?
}
```

This enables "Open Existing List" without authentication.

## Rationale

### Why Explicit Sharing?

| Approach             | Pros                                    | Cons                                     |
| -------------------- | --------------------------------------- | ---------------------------------------- |
| Always persist       | Simple mental model                     | Backend costs, unused lists accumulate   |
| Never local          | No data loss                            | Requires connection, no offline drafting |
| **Explicit sharing** | User controls persistence, clear intent | Two-tier model to understand             |

Explicit sharing was chosen because:

1. **User intent is clear** - Sharing is a conscious decision
2. **Backend efficiency** - Only shared lists consume storage
3. **Privacy by default** - Local lists never leave the device
4. **Supports drafting** - Users can experiment before sharing

### Why Anonymous Collaboration?

Per ADR-014, the app uses anonymous sharing to:

- Minimize data collection
- Simplify onboarding (no sign-up required)
- Enable quick collaboration
- Align with educational/demo purposes

Authentication can be added later for ownership features.

### Why localStorage for Remembered Lists?

- Simple, no backend required
- Per-device (intentional - see multi-device considerations)
- Graceful degradation if unavailable

## Consequences

### Positive

- Clear separation between private drafts and shared lists
- Users control when data leaves their device
- Backend only stores intentionally shared lists
- Shareable URLs enable collaboration
- No authentication complexity initially

### Negative

- Two-tier model may confuse some users initially
- Local lists lost if browser data cleared
- Multi-device access requires sharing first

### Neutral

- `main-list` remains accessible at `/list/main-list` (backward compatible)
- Future authentication can add ownership layer

## Implementation

### Components to Build

| Component             | Purpose                         |
| --------------------- | ------------------------------- |
| `LandingPage`         | Entry point with list selection |
| `ListPicker`          | Remembered lists + URL entry    |
| `ShareButton`         | Trigger sharing action          |
| `useTodos(listId?)`   | Hook supporting both modes      |
| `/list/[listId]`      | Dynamic route for shared lists  |
| `remembered-lists.ts` | localStorage management         |
| `list-manager.ts`     | Sharing/creation logic          |

### Migration

The existing `main-list` remains accessible:

- URL: `/list/main-list` works
- No data migration needed
- It becomes just another shared list

## Future Considerations

### Multi-Device Access

Currently, users on a new device won't see their remembered lists. Solutions:

1. **Share URL** - User bookmarks or shares URL to themselves
2. **Authentication** (future) - Sync remembered lists to account

### User Authentication

When/if authentication is added:

- Link remembered lists to account
- Add ownership/permission model
- Enable private shared lists

### List Naming

Users may want to name their lists. This can be added to:

- RememberedList metadata
- SharedList backend data

## Related

- ADR-014: Anonymous Sharing Architecture
- Issue #333: Implement Unique List URLs and Per-User List Management
- Issue #123: Share URL generation and access control
- Issue #125: Implement Shared List Collaboration Feature
