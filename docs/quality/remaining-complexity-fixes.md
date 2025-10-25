# Remaining Code Complexity Fixes

**Status**: Documented for follow-up implementation
**Created**: 2025-10-22 (Issue #259 completion)
**Priority**: P2-High

## Overview

This document outlines the remaining 2 high-severity code complexity violations that were analyzed but not
completed in Issue #259. Complete implementation plans with TDD strategies have been developed and are ready
for execution.

## Completed in Issue #259

✅ **useSharedTodoSync.ts** (3 nesting violations)

- Reduced nesting depth from 5 to 3 levels
- Extracted event handlers using `useCallback`
- Committed in: `e76b06e`

✅ **ADR-027 + Guidelines + ESLint Configuration**

- Comprehensive complexity standards documented
- ESLint rules enforcing complexity limits
- Committed in: `1460245`

## Remaining Work

### 1. TodoItem.tsx Complexity Refactoring

**Current State**:

- **Cognitive Complexity**: 29 (limit: 15) ❌
- **Function Length**: 385 lines (limit: 150 warning) ⚠️
- **Location**: Line 106

**Problem**:
Main TodoItem component has high complexity due to:

- Gesture handling logic (swipe left/right)
- Multiple state management (editing, gestures, delete confirmation)
- Conditional rendering for different states
- Touch event handling

**Proposed Solution**:

#### Step 1: Extract `useTodoGestures` Hook

Create `app/hooks/useTodoGestures.ts`:

```typescript
export function useTodoGestures({
  onDelete,
  onComplete,
  swipeThreshold = 100,
}: UseTodoGesturesOptions): UseTodoGesturesReturn {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchOffset, setTouchOffset] = useState(0);
  const [showActions, setShowActions] = useState(false);

  // Handle touch start/move/end
  // Detect swipe direction and trigger callbacks
  // Manage gesture state
}
```

#### Step 2: Create Gesture Helper Utilities

Create `app/utils/gestureHelpers.ts`:

```typescript
export function combineTouchStartHandlers(
  gestureHandler: (e: React.TouchEvent) => void,
  additionalHandler?: (e: React.TouchEvent) => void
): (e: React.TouchEvent) => void

export function combineTouchMoveHandlers(...)
export function combineTouchEndHandlers(...)
```

#### Step 3: Refactor TodoItem Component

```typescript
export default function TodoItem({ todo, ...props }: TodoItemProps) {
  const gesture = useTodoGestures({
    onDelete: () => onDelete(todo.id),
    onComplete: () => onToggle(todo.id),
    swipeThreshold: 100,
  });

  // Simplified component using extracted hook
  return (
    <li
      onTouchStart={gesture.handleTouchStart}
      onTouchMove={gesture.handleTouchMove}
      onTouchEnd={gesture.handleTouchEnd}
    >
      {/* Simplified rendering */}
    </li>
  );
}
```

**Expected Outcome**:

- Cognitive complexity reduced from 29 to ≤15
- Function length reduced from 385 to ~250 lines
- Better testability (gesture logic tested in isolation)

**Test Strategy** (TDD):

1. Create `app/__tests__/hooks/useTodoGestures.test.tsx` with 15+ test cases
2. Create `app/__tests__/utils/gestureHelpers.test.ts` with 10+ test cases
3. Verify all existing TodoItem tests still pass (no regression)

**Effort**: ~2-3 hours
**Files Changed**: 3 new + 1 refactored

---

### 2. ConfirmationDialog.tsx Nesting Depth Reduction

**Current State**:

- **Nesting Depth**: 5 levels (limit: 4) ❌
- **Cognitive Complexity**: 31 (limit: 15) ❌
- **Location**: Line 65 (keyboard handler)

**Problem**:
Deep nesting in Tab key focus trap logic:

```typescript
switch (event.key) {
  case 'Tab': {                                    // Level 1
    event.preventDefault();
    const focusableElements = ...;
    if (focusableElements && focusableElements.length > 0) {  // Level 2
      if (event.shiftKey) {                        // Level 3
        if (document.activeElement === firstElement) {  // Level 4
          lastElement.focus();
        } else {
          const currentIndex = ...;
          if (currentIndex > 0) {                  // Level 5 ❌
            ...
          }
        }
      }
    }
  }
}
```

**Proposed Solution**:

#### Step 1: Extract `useFocusTrap` Hook

Create `app/hooks/useFocusTrap.ts`:

```typescript
export function useFocusTrap(dialogRef: RefObject<HTMLElement>) {
  const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
    // Find all focusable elements
  };

  const moveFocus = (
    elements: HTMLElement[],
    currentIndex: number,
    direction: 'forward' | 'backward'
  ): void => {
    // Move focus with wrapping
  };

  const handleTabKey = (
    event: KeyboardEvent,
    isShiftPressed: boolean
  ): void => {
    // Simplified Tab handling (max 3 levels)
  };

  return { handleTabKey, getFocusableElements };
}
```

#### Step 2: Extract `useDialogKeyboard` Hook

Create `app/hooks/useDialogKeyboard.ts`:

```typescript
export function useDialogKeyboard({
  isOpen,
  onClose,
  dialogRef,
}: UseDialogKeyboardOptions) {
  const { handleTabKey } = useFocusTrap(dialogRef);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key === 'Tab') {
        handleTabKey(event, event.shiftKey);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleTabKey]);
}
```

#### Step 3: Refactor ConfirmationDialog

```typescript
export function ConfirmationDialog({ isOpen, onClose, ...props }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Keyboard handling extracted to hook
  useDialogKeyboard({ isOpen, onClose: onCancel, dialogRef });

  // Simplified component (max 2-3 nesting levels)
  return (
    <div ref={dialogRef} role="dialog">
      {/* Content */}
    </div>
  );
}
```

**Expected Outcome**:

- Nesting depth reduced from 5 to ≤3
- Cognitive complexity reduced from 31 to ≤15 per function
- Better accessibility testing (focus trap logic isolated)

**Test Strategy** (TDD):

1. Create `app/__tests__/hooks/useFocusTrap.test.ts` with 12+ test cases
2. Create `app/__tests__/hooks/useDialogKeyboard.test.ts` with 8+ test cases
3. Verify all existing ConfirmationDialog tests still pass
4. Verify accessibility behavior unchanged (critical!)

**Effort**: ~2-3 hours
**Files Changed**: 2 new + 1 refactored

---

## Implementation Checklist

### TodoItem.tsx Refactoring

- [ ] Create `app/hooks/useTodoGestures.ts`
- [ ] Create `app/__tests__/hooks/useTodoGestures.test.tsx` (TDD - tests first!)
- [ ] Create `app/utils/gestureHelpers.ts`
- [ ] Create `app/__tests__/utils/gestureHelpers.test.ts` (TDD - tests first!)
- [ ] Refactor `app/components/TodoItem.tsx`
- [ ] Run all TodoItem test suites and verify pass
- [ ] Run ESLint and verify no complexity errors
- [ ] Commit: "refactor: reduce complexity in TodoItem component"

### ConfirmationDialog.tsx Refactoring

- [ ] Create `app/hooks/useFocusTrap.ts`
- [ ] Create `app/__tests__/hooks/useFocusTrap.test.ts` (TDD - tests first!)
- [ ] Create `app/hooks/useDialogKeyboard.ts`
- [ ] Create `app/__tests__/hooks/useDialogKeyboard.test.ts` (TDD - tests first!)
- [ ] Refactor `app/components/ConfirmationDialog.tsx`
- [ ] Run all ConfirmationDialog tests and verify pass
- [ ] Verify accessibility (focus trap, keyboard nav) unchanged
- [ ] Run ESLint and verify no complexity errors
- [ ] Commit: "refactor: extract focus trap logic in ConfirmationDialog"

### Final Verification

- [ ] Run full test suite: `npm test`
- [ ] Verify test coverage ≥90%: `npm test -- --coverage`
- [ ] Run ESLint: `npm run lint`
- [ ] Build verification: `npm run build`
- [ ] SonarCloud analysis (all 5 high severity issues resolved)

---

## Follow-Up Issue Template

### Issue Title

"Complete Code Complexity Refactoring (TodoItem + ConfirmationDialog)"

### Issue Description

```markdown
## Overview

Complete the code complexity refactoring started in #259 by addressing the remaining 2 high-severity violations in TodoItem.tsx and ConfirmationDialog.tsx.

## Remaining Violations

**TodoItem.tsx**:

- Cognitive complexity: 29 (limit 15) - Line 106
- Function length: 385 lines (warning 150)

**ConfirmationDialog.tsx**:

- Nesting depth: 5 levels (limit 4) - Line 65
- Cognitive complexity: 31 (limit 15) - Keyboard handler

## Implementation Plans

Complete implementation plans with TDD strategies are documented in:

- `docs/quality/remaining-complexity-fixes.md`

All test strategies, file structures, and refactoring patterns are defined and ready for execution.

## Acceptance Criteria

- [ ] TodoItem cognitive complexity ≤15
- [ ] ConfirmationDialog nesting depth ≤4
- [ ] All existing tests pass (no regression)
- [ ] New tests for extracted hooks (TDD approach)
- [ ] ESLint complexity rules pass
- [ ] SonarCloud reports 0 high-severity code complexity issues
- [ ] Accessibility unchanged (WCAG 2.2 AA compliance maintained)

## Estimated Effort

4-6 hours (2-3 hours per component)

## Related

- Parent: #259 (Fix SonarCloud High Severity Code Complexity Issues)
- ADR: docs/adr/027-code-complexity-standards.md
- Guidelines: docs/guidelines/code-complexity-guidelines.md
```

### Labels

- `priority-2-high`
- `complexity-moderate`
- `category-infrastructure`

---

## Success Metrics

**Current Status** (After #259 Partial Completion):

- ✅ useSharedTodoSync.ts: 3 violations fixed
- ❌ TodoItem.tsx: 1 violation remaining
- ❌ ConfirmationDialog.tsx: 1 violation remaining
- **Total**: 3/5 high severity issues resolved (60%)

**Target Status** (After Follow-up Issue):

- ✅ All 5 high severity code complexity issues resolved
- ✅ Zero ESLint complexity errors
- ✅ SonarCloud Maintainability Rating: A
- ✅ ADR-027 fully enforced across codebase

---

## References

- **Issue #259**: Initial complexity standards and useSharedTodoSync refactoring
- **ADR-027**: Code Complexity Standards
- **Guidelines**: docs/guidelines/code-complexity-guidelines.md
- **SonarCloud Analysis**: See Issue #259 comments for full analysis report
- **Agent Implementation Plans**: Available from Issue #259 parallel agent execution

---

**Last Updated**: 2025-10-22
**Status**: Ready for implementation
**Blocked By**: None (all dependencies resolved)
