# ADR-034: LexoRank-Based Todo Ordering

## Status

Accepted

> **Note**: This ADR amends the technical implementation of ADR-012 (Todo Reordering UX Approach).
> The UX approach defined in ADR-012 remains unchanged; only the ordering data model is updated.

## Context

The todo reordering feature (ADR-012) currently syncs the entire todo array on every reorder operation.
This creates several problems:

1. **Inefficient payload size**: Reordering 1 todo in a list of 100 sends ~15KB instead of ~200B
2. **Concurrent editing conflicts**: Two users reordering simultaneously causes array-level conflicts
3. **Scalability concerns**: Payload grows linearly with list size

Additionally, a bug was observed where newly added todos don't respond to initial reorder button clicks,
suggesting stale closure issues in React hooks referencing old todo arrays.

## Decision

Adopt **LexoRank** algorithm for todo ordering with the following implementation:

### Data Model Changes

Add `sortOrder?: string` field to `Todo` and `SharedTodo` interfaces:

```typescript
export interface Todo {
  id: string;
  text: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  sortOrder?: string; // LexoRank string for ordering
}
```

### Algorithm

LexoRank assigns lexicographically sortable strings that can be inserted between any two existing values.
The format is `bucket|rank:` (e.g., `0|0i0000:`).

The `lexorank` library provides:

- `LexoRank.middle()` - Initial rank in middle of range (allows insertions before and after)
- `LexoRank.min()` / `LexoRank.max()` - Boundary ranks
- `rank1.between(rank2)` - Calculate rank between two existing ranks

> **Note**: Exact rank values depend on library output. Examples below are illustrative.

### Sorting Semantics

- **Active todos**: Sort by `sortOrder` ascending (lexicographic)
- **Completed todos**: Sort by `completedAt` descending (most recent first)
- **Deleted todos**: Sort by `deletedAt` descending (most recent first)
- **All view**: Active first (by sortOrder), then completed (by completedAt)

### Sync Operation

New `'reorder-single'` sync operation sends only the moved todo:

```typescript
{
  operation: 'reorder-single',
  data: { id: 'todo-id', sortOrder: '0|0i0000:' } // illustrative format
}
```

### Library Choice

Use `lexorank` npm package (version 1.0.5):

- Well-established algorithm from Jira
- TypeScript support
- Small bundle size (~2KB)
- No dependencies

## Consequences

### Positive

- **Minimal payload**: ~200B per reorder regardless of list size
- **Conflict-free concurrent editing**: Each user's reorder is independent
- **Simpler sync logic**: No need to track array indices
- **Performance**: O(1) reorder vs O(n) array rebuild
- **Industry standard**: Same approach used by Jira, Trello, Notion

### Negative

- **Migration required**: Existing todos need sortOrder assigned on first load
- **Additional dependency**: `lexorank` package (~2KB)
- **Rebalancing**: After ~10K inserts between same items, may need rebalancing (rare)

### Neutral

- **Optional field**: sortOrder is optional for backward compatibility
- **Learning curve**: Team needs to understand LexoRank concept

## Alternatives Considered

- **Fractional indexing**: Similar approach but less established tooling
- **Array indices**: Current approach - rejected due to payload size and conflicts
- **Timestamp-based**: Rejected - doesn't allow arbitrary positioning

## References

- [LexoRank Algorithm (Atlassian)](https://confluence.atlassian.com/jirakb/how-to-use-lexorank-ranking-for-custom-sortable-lists-1168856044.html)
- [ADR-012: Todo Reordering UX Approach](./012-todo-reordering-ux-approach.md)
- [GitHub Issue #397: LexoRank Optimization Epic](https://github.com/mikiwiik/instructions-only-claude-coding/issues/397)
- [lexorank npm package](https://www.npmjs.com/package/lexorank)
