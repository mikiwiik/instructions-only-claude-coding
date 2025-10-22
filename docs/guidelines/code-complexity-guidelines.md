# Code Complexity Guidelines

## Purpose

This guide provides practical patterns for writing and refactoring code to maintain manageable complexity levels. It
complements [ADR-027: Code Complexity Standards](../adr/027-code-complexity-standards.md) with concrete examples and
step-by-step refactoring techniques.

## Related Documentation

- **ADR-027**: Code Complexity Standards (formal decision and rationale)
- **TypeScript Standards**: Type safety patterns (docs/guidelines/typescript-standards.md)
- **TDD Standards**: Testing approaches (ADR-004)

## Complexity Metrics Overview

### Cognitive Complexity (Limit: 15)

**What It Measures**: How difficult code is to understand, focusing on human readability.

**Counts**:

- Control flow breaks (`if`, `else`, `switch`, `for`, `while`, `try/catch`)
- Nesting depth (nested conditions add extra points)
- Logical operators (`&&`, `||`)
- Recursion

**Example**:

```typescript
// ❌ Cognitive Complexity: 8
function processUser(user: User) {
  if (user.isActive) {
    // +1
    if (user.age >= 18) {
      // +2 (nested)
      if (user.hasPermission) {
        // +3 (nested deeper)
        return true;
      }
    }
  }
  return false;
}

// ✅ Cognitive Complexity: 3
function processUser(user: User) {
  if (!user.isActive) return false; // +1 (early return)
  if (user.age < 18) return false; // +1
  return user.hasPermission; // +1
}
```

### Cyclomatic Complexity (Limit: 15)

**What It Measures**: Number of independent execution paths (testing burden).

**Counts**: Decision points (`if`, `case`, `&&`, `||`, `?:`, loops).

**Example**:

```typescript
// ❌ Cyclomatic Complexity: 5 (needs 5 test cases)
function validateInput(
  value: string,
  type: 'email' | 'phone' | 'url'
): boolean {
  if (type === 'email') {
    // +1
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  } else if (type === 'phone') {
    // +1
    return /^\d{10}$/.test(value);
  } else if (type === 'url') {
    // +1
    return /^https?:\/\/.+/.test(value);
  }
  return false;
}

// ✅ Cyclomatic Complexity: 1 (needs 1 test per validator)
const validators: Record<string, (value: string) => boolean> = {
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  phone: (v) => /^\d{10}$/.test(v),
  url: (v) => /^https?:\/\/.+/.test(v),
};

function validateInput(
  value: string,
  type: 'email' | 'phone' | 'url'
): boolean {
  const validator = validators[type];
  return validator ? validator(value) : false;
}
```

### Nesting Depth (Limit: 4)

**What It Measures**: Maximum depth of nested control structures.

**Example**:

```typescript
// ❌ Nesting Depth: 5 levels
useEffect(() => {
  // Level 1
  if (enabled) {
    // Level 2
    eventSource.addEventListener('sync', (event) => {
      // Level 3
      try {
        // Level 4
        const data = JSON.parse(event.data);
        if (data.todos) {
          // Level 5 - VIOLATION
          onSync(data.todos);
        }
      } catch (error) {
        console.error(error);
      }
    });
  }
}, [enabled]);

// ✅ Nesting Depth: 3 levels (extracted handler)
const handleSync = (event: MessageEvent) => {
  // Standalone function
  try {
    const data = JSON.parse(event.data);
    if (data.todos) {
      onSync(data.todos);
    }
  } catch (error) {
    console.error(error);
  }
};

useEffect(() => {
  // Level 1
  if (enabled) {
    // Level 2
    eventSource.addEventListener('sync', handleSync); // Level 3
  }
}, [enabled]);
```

## Refactoring Patterns

### 1. Extract Functions

**When to Use**: Nested logic or repeated code blocks.

**Before** (Cognitive Complexity: 19):

```typescript
export default function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  // Gesture setup
  const swipeGesture = useSwipeGesture({
    onSwipeRight: () => {
      if (!todo.completedAt && !todo.deletedAt) {
        onToggle(todo.id);
      }
    },
    onSwipeLeft: () => {
      if (!todo.deletedAt) {
        handleDelete();
      }
    },
  });

  const longPressGesture = useLongPress({
    onLongPress: () => {
      if (!isEditing && onEdit && !todo.completedAt && !todo.deletedAt) {
        handleEdit();
      }
    },
    delay: 500,
  });

  // Rendering logic
  return (
    <li {...touchHandlers}>
      {/* Complex conditional rendering */}
      {todo.deletedAt ? (
        <DeletedActions todo={todo} onRestore={onRestore} onDelete={onDelete} />
      ) : (
        <ActiveActions todo={todo} onEdit={onEdit} onRestore={onRestore} />
      )}
    </li>
  );
}
```

**After** (Cognitive Complexity: 7 per function):

```typescript
// Extract gesture configuration
function useT odoGestures(
  todo: Todo,
  onToggle: (id: string) => void,
  onDelete: () => void,
  onEdit: () => void,
  isEditing: boolean
) {
  const swipeGesture = useSwipeGesture({
    onSwipeRight: () => {
      if (!todo.completedAt && !todo.deletedAt) {
        onToggle(todo.id);
      }
    },
    onSwipeLeft: () => {
      if (!todo.deletedAt) {
        onDelete();
      }
    },
  });

  const longPressGesture = useLongPress({
    onLongPress: () => {
      if (!isEditing && !todo.completedAt && !todo.deletedAt) {
        onEdit();
      }
    },
    delay: 500,
  });

  return { swipeGesture, longPressGesture };
}

// Simpler component
export default function TodoItem({ todo, onToggle, onDelete, onEdit }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { swipeGesture, longPressGesture } = useTodoGestures(
    todo,
    onToggle,
    () => setShowDeleteConfirm(true),
    () => setIsEditing(true),
    isEditing
  );

  return (
    <li {...combineGestureHandlers(swipeGesture, longPressGesture)}>
      {todo.deletedAt ? (
        <DeletedActions todo={todo} />
      ) : (
        <ActiveActions todo={todo} isEditing={isEditing} />
      )}
    </li>
  );
}
```

### 2. Extract Custom Hooks (React)

**When to Use**: Complex stateful logic or side effects.

**Before** (useSharedTodoSync.ts - Nesting Depth: 5):

```typescript
useEffect(() => {
  if (!enabled || !listId) return;

  const eventSource = new EventSource(`/api/shared/${listId}/subscribe`);

  eventSource.addEventListener('sync', (event) => {
    try {
      const data = JSON.parse(event.data);
      onSync(data.todos);
      setSyncState((prev) => ({ ...prev, status: 'synced' }));
    } catch (error) {
      console.error('Failed to parse sync event:', error);
    }
  });

  return () => eventSource.close();
}, [listId, enabled]);
```

**After** (Nesting Depth: 3):

```typescript
// Extracted event handlers
const handleSyncEvent = useCallback(
  (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      onSync(data.todos);
      setSyncState((prev) => ({
        ...prev,
        status: 'synced',
        lastSyncTime: data.lastModified,
      }));
    } catch (error) {
      console.error('Failed to parse sync event:', error);
    }
  },
  [onSync]
);

const handleConnectedEvent = useCallback(() => {
  setSyncState((prev) => ({
    ...prev,
    status: 'synced',
    lastSyncTime: Date.now(),
  }));
}, []);

const handleErrorEvent = useCallback(() => {
  setSyncState((prev) => ({ ...prev, status: 'error' }));
  eventSource.close();
  reconnectTimeoutRef.current = setTimeout(
    connect,
    Math.min(30000, 1000 * Math.pow(2, syncState.errors.length))
  );
}, [syncState.errors.length]);

useEffect(() => {
  if (!enabled || !listId) return;

  const eventSource = new EventSource(`/api/shared/${listId}/subscribe`);
  eventSource.addEventListener('connected', handleConnectedEvent);
  eventSource.addEventListener('sync', handleSyncEvent);
  eventSource.addEventListener('error', handleErrorEvent);

  return () => eventSource.close();
}, [listId, enabled, handleSyncEvent, handleConnectedEvent, handleErrorEvent]);
```

### 3. Decompose Components

**When to Use**: Large components with multiple responsibilities.

**Before**:

```typescript
function TodoItem({ todo, ...props }: TodoItemProps) {
  // ... all logic and rendering in one component (500+ lines)
  return (
    <li>
      {/* Checkbox */}
      {/* Content */}
      {/* Actions */}
      {/* Delete confirmation dialog */}
    </li>
  );
}
```

**After**:

```typescript
// Main component (orchestration)
function TodoItem({ todo, ...props }: TodoItemProps) {
  return (
    <li>
      <TodoCheckbox todo={todo} onToggle={props.onToggle} />
      <TodoContent todo={todo} isEditing={isEditing} />
      <TodoActions todo={todo} actions={props} />
      <TodoDeleteDialog isOpen={showDeleteConfirm} onConfirm={handleConfirm} />
    </li>
  );
}

// Sub-components (focused responsibilities)
function TodoCheckbox({ todo, onToggle }: CheckboxProps) { /* ... */ }
function TodoContent({ todo, isEditing }: ContentProps) { /* ... */ }
function TodoActions({ todo, actions }: ActionsProps) { /* ... */ }
function TodoDeleteDialog({ isOpen, onConfirm }: DialogProps) { /* ... */ }
```

### 4. Simplify Conditionals

#### Pattern: Early Returns (Guard Clauses)

```typescript
// ❌ Nested conditions
function canEditTodo(todo: Todo, user: User): boolean {
  if (user.isAuthenticated) {
    if (todo.ownerId === user.id) {
      if (!todo.deletedAt) {
        if (!todo.completedAt) {
          return true;
        }
      }
    }
  }
  return false;
}

// ✅ Early returns
function canEditTodo(todo: Todo, user: User): boolean {
  if (!user.isAuthenticated) return false;
  if (todo.ownerId !== user.id) return false;
  if (todo.deletedAt) return false;
  if (todo.completedAt) return false;
  return true;
}
```

#### Pattern: Lookup Tables

```typescript
// ❌ Long switch/if-else chain
function getStatusColor(status: TodoStatus): string {
  if (status === 'pending') return 'gray';
  else if (status === 'active') return 'blue';
  else if (status === 'completed') return 'green';
  else if (status === 'deleted') return 'red';
  else return 'gray';
}

// ✅ Lookup table
const STATUS_COLORS: Record<TodoStatus, string> = {
  pending: 'gray',
  active: 'blue',
  completed: 'green',
  deleted: 'red',
};

function getStatusColor(status: TodoStatus): string {
  return STATUS_COLORS[status] ?? 'gray';
}
```

### 5. Use Type Guards

**When to Use**: Complex type checking logic.

**Before**:

```typescript
function processTodo(item: unknown): Todo | null {
  if (
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    'text' in item &&
    'completed' in item &&
    typeof (item as Todo).id === 'string' &&
    typeof (item as Todo).text === 'string' &&
    typeof (item as Todo).completed === 'boolean'
  ) {
    return item as Todo;
  }
  return null;
}
```

**After**:

```typescript
function isTodo(value: unknown): value is Todo {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'text' in value &&
    'completed' in value &&
    typeof (value as Todo).id === 'string' &&
    typeof (value as Todo).text === 'string' &&
    typeof (value as Todo).completed === 'boolean'
  );
}

function processTodo(item: unknown): Todo | null {
  return isTodo(item) ? item : null;
}
```

### 6. Extract Focus Trap Logic (Accessibility)

**Before** (ConfirmationDialog.tsx - Complexity: 31):

```typescript
useEffect(() => {
  if (!isOpen) return;

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        onClose();
        break;
      case 'Tab': {
        event.preventDefault();
        const focusableElements =
          dialogRef.current?.querySelectorAll(/* ... */);
        if (focusableElements && focusableElements.length > 0) {
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[
            focusableElements.length - 1
          ] as HTMLElement;
          if (event.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
            } else {
              const currentIndex = Array.from(focusableElements).indexOf(
                document.activeElement as HTMLElement
              );
              if (currentIndex > 0) {
                (focusableElements[currentIndex - 1] as HTMLElement).focus();
              }
            }
          } else {
            // ... similar logic for forward tab
          }
        }
        break;
      }
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [isOpen, onClose]);
```

**After** (Complexity: 8 per hook):

```typescript
// Custom hook for focus trap
function useFocusTrap(containerRef: RefObject<HTMLElement>, isActive: boolean) {
  useEffect(() => {
    if (!isActive) return;

    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      event.preventDefault();
      const focusableElements = getFocusableElements(containerRef.current);
      if (focusableElements.length === 0) return;

      moveFocus(focusableElements, event.shiftKey);
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [containerRef, isActive]);
}

// Helper functions
function getFocusableElements(container: HTMLElement | null): HTMLElement[] {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll(
      'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  );
}

function moveFocus(elements: HTMLElement[], backward: boolean) {
  const currentIndex = elements.indexOf(document.activeElement as HTMLElement);
  let nextIndex: number;

  if (backward) {
    nextIndex = currentIndex <= 0 ? elements.length - 1 : currentIndex - 1;
  } else {
    nextIndex = currentIndex >= elements.length - 1 ? 0 : currentIndex + 1;
  }

  elements[nextIndex]?.focus();
}

// Simpler component
function ConfirmationDialog({ isOpen, onClose, onConfirm }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, isOpen);
  useEscapeKey(onClose, isOpen);

  // ... simplified rendering
}
```

## When to Refactor

### Immediate (Before Commit)

- Cognitive complexity > 15
- Nesting depth > 4 levels
- Cyclomatic complexity > 15
- ESLint errors block commit

### High Priority (Next Sprint)

- Cognitive complexity 12-15 (approaching limit)
- Functions > 100 lines
- Repeated complex logic (DRY violation)

### Low Priority (Technical Debt Backlog)

- Functions > 75 lines
- More than 3 parameters
- Long switch/if-else chains
- Complex boolean expressions

## Testing Strategy

### Test Extracted Functions First

```typescript
// ✅ Extract and test logic before refactoring component
describe('canEditTodo', () => {
  it('returns false for unauthenticated users', () => {
    expect(canEditTodo(todo, unauthenticatedUser)).toBe(false);
  });

  it('returns false for deleted todos', () => {
    expect(canEditTodo(deletedTodo, authenticatedUser)).toBe(false);
  });

  // ... comprehensive test cases
});
```

### Maintain Behavior Tests

```typescript
// Existing integration tests should still pass after refactoring
describe('TodoItem', () => {
  it('handles swipe gestures correctly', () => {
    // Test behavior, not implementation
    // Should pass before and after refactoring
  });
});
```

## ESLint Configuration

See updated `eslint.config.mjs` for complexity rule enforcement.

## Practical Checklist

Before Committing:

- [ ] Run ESLint: `npm run lint`
- [ ] Check SonarCloud preview (if available)
- [ ] Verify all tests pass: `npm test`
- [ ] Review functions > 50 lines for complexity
- [ ] Confirm cognitive complexity < 15 for new code

During Code Review:

- [ ] Check for deeply nested logic (>3 levels)
- [ ] Identify extraction opportunities
- [ ] Suggest custom hooks for stateful logic (React)
- [ ] Verify test coverage for complex functions

## Resources

- **SonarCloud**: [Cognitive Complexity White Paper](https://www.sonarsource.com/resources/cognitive-complexity/)
- **ESLint**: [Complexity Rules Documentation](https://eslint.org/docs/latest/rules/complexity)
- **Related Standards**:
  - ADR-027: Code Complexity Standards
  - docs/guidelines/typescript-standards.md: Type Safety
  - ADR-004: Test-Driven Development

## Summary

**Golden Rules**:

1. **Extract Early**: Don't wait for complexity violations, refactor when logic feels hard to understand
2. **Test First**: Write tests for extracted functions before refactoring
3. **Single Responsibility**: Each function should do one thing well
4. **Clear Names**: Extracted functions should have descriptive names explaining their purpose
5. **Consistent Patterns**: Follow established refactoring patterns in this codebase

Maintainable code is an investment in long-term velocity. Complexity refactoring improves onboarding, reduces bugs, and
increases confidence in making changes.
