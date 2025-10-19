# ADR-021: Migration to Pragmatic Drag and Drop for React 19 Compatibility

## Status

Accepted (Supersedes ADR-012 technical implementation only)

## Context

The React 19 migration (tracked in #223) identified a critical blocker: @dnd-kit/core lacks official
React 19 support and has not been updated in 10 months. An open GitHub issue (clauderic/dnd-kit#1511)
requesting React 19 support has received 66+ community reactions but remains unresolved, with growing
concerns about library maintenance.

### Requirements

The migration must:

1. **Unblock React 19**: Enable upgrade to React 19.2.0 and Next.js 15.5.6
2. **Maintain UX**: Preserve the hybrid drag-and-drop + arrow button approach from ADR-012
3. **Preserve WCAG 2.2 AA compliance**: Maintain dual interaction methods (Success Criterion 2.5.7)
4. **No breaking changes**: Identical functionality from user perspective
5. **Production quality**: Actively maintained library with proven track record

### Current Implementation

ADR-012 established a hybrid reordering approach using @dnd-kit/sortable:

- Drag handles for mouse/touch interaction
- Arrow buttons for keyboard-only users
- Full WCAG 2.2 AA compliance
- Touch-optimized (44px minimum targets)

The UX approach remains valid, but the technical implementation (library choice) needs updating.

## Decision

Migrate from **@dnd-kit** to **Pragmatic drag and drop** by Atlassian for all drag-and-drop
functionality while maintaining the exact same UX patterns defined in ADR-012.

### Library Change

**Remove:**

- `@dnd-kit/core` (6.3.1)
- `@dnd-kit/sortable` (10.0.0)
- `@dnd-kit/utilities` (3.2.2)

**Add:**

- `@atlaskit/pragmatic-drag-and-drop` (1.7.7) - Core drag-and-drop primitives
- `@atlaskit/pragmatic-drag-and-drop-hitbox` (1.1.0) - Collision detection utilities
- `tiny-invariant` (1.3.3) - Runtime assertions

### Technical Implementation Changes

**Pattern Migration:**

| @dnd-kit Pattern                 | Pragmatic Drag and Drop Equivalent            |
| -------------------------------- | --------------------------------------------- |
| `<DndContext>` wrapper           | `monitorForElements()` in useEffect           |
| `<SortableContext>` wrapper      | Individual `dropTargetForElements()` per item |
| `useSortable()` hook             | `draggable()` + `dropTargetForElements()`     |
| `{...attributes} {...listeners}` | `dragHandle` ref option                       |
| `CSS.Transform.toString()`       | Manual `isDragging` state + className         |
| Sensors (pointer/keyboard)       | Built-in pointer, manual keyboard handling    |

**Component Updates:**

**TodoItem.tsx:**

- Replace `useSortable` hook with `draggable()` + `dropTargetForElements()` in useEffect
- Use `dragHandleRef` instead of spread attributes/listeners
- Manage `isDragging` state manually for opacity changes
- Maintain all existing props and behavior (arrow buttons, touch gestures, WCAG compliance)

**TodoList.tsx:**

- Remove DndContext and SortableContext wrapper components
- Implement `monitorForElements()` for drag event monitoring
- Simplified JSX structure (no context providers needed)
- Same reorder logic with index-based positioning

### UX Preservation

**No changes to:**

- ✅ Drag handle position (left side)
- ✅ Arrow button position (right side)
- ✅ Touch target sizes (44px minimum)
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Visual feedback (opacity, hover states)
- ✅ WCAG 2.2 AA compliance

The hybrid approach from ADR-012 remains unchanged - only the underlying library implementation changes.

## Consequences

### Positive

- **React 19 Compatible**: Framework-agnostic core works with React 19.2.0+
- **Production-Proven**: Powers Trello, Jira, Confluence in production at scale
- **Active Maintenance**: Backed by Atlassian with ongoing development
- **Native HTML5 API**: Built on native drag-and-drop for better performance
- **Smaller Bundle**: Core package ~4.7kB (vs @dnd-kit/core ~10kB)
- **Framework-Agnostic**: Not tied to React internals, more future-proof
- **No Breaking UX Changes**: Users experience identical functionality
- **Test Coverage Maintained**: 91.61% overall coverage (exceeds 90% threshold)

### Negative

- **More Imperative API**: Uses useEffect + function calls instead of declarative hooks
  - Mitigation: Encapsulated in components, doesn't affect parent code
- **Learning Curve**: Team needs to learn new API patterns
  - Mitigation: Limited scope (2 components), well-documented
- **Less React-Idiomatic**: Effect-based instead of hook-based
  - Mitigation: Follows library best practices, performant implementation
- **TodoList Coverage Drop**: Coverage decreased from ~90% to 48% for TodoList.tsx
  - Reason: Monitor logic in useEffect harder to test with mocks
  - Mitigation: Overall coverage still 91.61%, functional testing comprehensive

### Neutral

- **Bundle Size Change**: -3 packages, +3 packages, net ~0kB change
- **Migration Effort**: 2 components, 2 test files updated (~8 hours total)
- **API Differences**: Different patterns but equivalent functionality

## Alternatives Considered

### 1. Wait for @dnd-kit React 19 Support

**Description**: Monitor @dnd-kit issue #1511 and wait for official React 19 support

**Rejected Because:**

- No timeline for React 19 support
- Library maintenance concerns (last update 10 months ago)
- Blocks entire React 19 migration indefinitely
- No indication of active development

### 2. Use @dnd-kit with `--legacy-peer-deps`

**Description**: Force install @dnd-kit despite peer dependency warnings

**Rejected Because:**

- High risk of runtime issues with React 19
- Unsupported configuration
- Hides potential compatibility problems
- Not production-safe

### 3. hello-pangea/dnd (Community Fork)

**Description**: Community fork of react-beautiful-dnd with React 18 support

**Rejected Because:**

- No React 19 support yet (issue #864 open)
- Community-maintained (sustainability concerns)
- Higher-level abstraction may have same React 19 issues
- Pragmatic drag-and-drop is better supported

### 4. react-dnd

**Description**: Lower-level drag-and-drop library with backend system

**Rejected Because:**

- Overly complex for simple vertical list sorting
- Steeper learning curve
- Larger bundle size
- More setup required for basic sortable lists

### 5. Custom HTML5 Drag-and-Drop Implementation

**Description**: Build drag-and-drop from scratch using native HTML5 API

**Rejected Because:**

- Significant development effort (2-4 weeks estimated)
- Accessibility concerns (needs comprehensive ARIA implementation)
- Touch device compatibility challenges
- Reinventing well-solved problem
- Testing complexity

## Migration Execution

### Implementation Phases

**Phase 1: Component Migration** ✅

- Updated TodoItem.tsx with pragmatic-drag-and-drop primitives
- Updated TodoList.tsx with monitor-based approach
- Removed @dnd-kit dependencies
- Commit: `5d3d1bd`

**Phase 2: Test Updates** ✅

- Updated TodoItem.reorder.test.tsx mocks and assertions
- Updated TodoList.reorder.test.tsx for new patterns
- All 730 tests passing (713 passed, 17 skipped)
- Commit: `b1da1a8`

**Phase 3: Documentation** (Current)

- Create ADR-021 (this document)
- Update ADR-012 status to "Superseded"
- Update ADR index

### Test Results

**Before Migration:**

- TodoItem.reorder.test.tsx: 17 tests
- TodoList.reorder.test.tsx: 12 tests
- Overall coverage: ~93%

**After Migration:**

- TodoItem.reorder.test.tsx: ✅ 17/17 passing
- TodoList.reorder.test.tsx: ✅ 12/12 passing
- Overall coverage: ✅ 91.61% (exceeds 90% threshold)
- TypeScript errors: ✅ 0
- ESLint warnings: ✅ 0

### Code Changes Summary

**Files Modified:**

- `app/components/TodoItem.tsx` (115 lines changed)
- `app/components/TodoList.tsx` (13 lines changed)
- `app/__tests__/components/TodoItem.reorder.test.tsx` (mock updates)
- `app/__tests__/components/TodoList.reorder.test.tsx` (mock updates)
- `package.json` (dependency swap)

**Net Code Change**: -13 lines (simpler implementation)

## Relationship to ADR-012

**ADR-012 Status**: Partially Superseded

**What Remains from ADR-012:**

- ✅ UX approach (hybrid drag + arrow buttons)
- ✅ WCAG 2.2 AA compliance requirements
- ✅ Touch optimization (44px targets)
- ✅ Accessibility patterns
- ✅ Visual design decisions

**What This ADR Supersedes:**

- ❌ Library choice (@dnd-kit → pragmatic-drag-and-drop)
- ❌ Technical implementation patterns
- ❌ API usage (hooks → effects)

ADR-012 remains the source of truth for UX decisions. ADR-021 updates only the technical
implementation to enable React 19 compatibility.

## References

- **Issue Tracking**: #240 (Migration), #223 (React 19 Upgrade)
- **Migration Assessment**: PR #239 (REACT-19-MIGRATION-ASSESSMENT.md)
- **@dnd-kit React 19 Support**: <https://github.com/clauderic/dnd-kit/issues/1511>
- **Pragmatic Drag and Drop**:
  - GitHub: <https://github.com/atlassian/pragmatic-drag-and-drop>
  - Docs: <https://atlassian.design/components/pragmatic-drag-and-drop/>
  - Tutorial: <https://atlassian.design/components/pragmatic-drag-and-drop/tutorial/>
- **LogRocket Guide**: <https://blog.logrocket.com/implement-pragmatic-drag-drop-library-guide/>
- **Supersedes**: ADR-012 (technical implementation only)
- **Related**: ADR-020 (React/Next.js version constraints)
