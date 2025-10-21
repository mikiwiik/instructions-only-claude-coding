# TypeScript Standards and Best Practices

## Purpose

This guide establishes comprehensive TypeScript standards for the Todo App project. It provides practical
patterns, approved alternatives to problematic practices, and enforcement mechanisms that maintain type safety
throughout the codebase.

## Related Documentation

- **ADR-002**: TypeScript Adoption (foundation decision)
- **ADR-022**: Strict TypeScript Type Safety Enforcement (error-level enforcement)
- **ADR-009**: Pre-commit Linting Strategy (enforcement mechanism)
- **eslint.config.mjs**: Configuration enforcing these standards

## Core Principle

**Type safety is non-negotiable**. Using TypeScript means committing to compile-time type checking. The `any`
type defeats this purpose and is treated as an error, not a warning.

## The `any` Type Problem

### Why `any` is Prohibited

Using `any` type:

- **Bypasses type checking** - TypeScript compiler cannot catch errors
- **Eliminates autocomplete** - IDEs cannot provide intelligent suggestions
- **Hides bugs** - Runtime errors that could be caught at compile time
- **Creates technical debt** - Requires future cleanup when proper types are needed
- **Spreads type unsafety** - `any` propagates through the codebase

### Real-World Example from PR #241

**Problem Pattern**:

```typescript
// ❌ BAD - Uses 'any' as quick fix
let monitorCallback: ((args: any) => void) | null = null;

// Mock setup
const mockMonitor = jest.fn((callback: any) => {
  monitorCallback = callback;
  return cleanup;
});
```

**Issues**:

1. No type safety for callback arguments
2. Tests can pass with incorrect data structures
3. Refactoring becomes dangerous (no compiler errors)
4. Documentation value lost (what is `args`?)

**Proper Solution**:

```typescript
// ✅ GOOD - Proper interfaces
interface SourceData {
  todoId: string;
  index: number;
}

interface DropLocation {
  current: {
    dropTargets: Array<{ data: { index: number } }>;
  };
}

interface DropEvent {
  source: { data: SourceData };
  location: DropLocation;
}

let monitorCallback: ((args: DropEvent) => void) | null = null;

const mockMonitor = jest.fn((callback: (args: DropEvent) => void) => {
  monitorCallback = callback;
  return cleanup;
});
```

**Benefits**:

1. Compiler catches data structure errors
2. IDE autocomplete works correctly
3. Refactoring is safe (compiler errors guide changes)
4. Self-documenting code (interfaces show structure)

## Approved Alternatives to `any`

### 1. `unknown` Type

**Use when**: Type is genuinely unknown and requires runtime checking

```typescript
// ✅ GOOD - Forces type checking before use
function processApiResponse(response: unknown): User {
  if (isUser(response)) {
    return response;
  }
  throw new Error('Invalid user data');
}

function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value
  );
}
```

**Key difference from `any`**: Requires type guards before accessing properties.

### 2. Proper Interfaces and Types

**Use when**: Data structure is known (most common case)

```typescript
// ✅ GOOD - Define actual structure
interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

interface TodoListProps {
  items: TodoItem[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function TodoList({ items, onToggle, onDelete }: TodoListProps) {
  // Full type safety and autocomplete
}
```

### 3. Generics

**Use when**: Creating reusable, type-safe components

```typescript
// ✅ GOOD - Type-safe generic hook
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

// Usage with full type safety
const [todos, setTodos] = useLocalStorage<TodoItem[]>('todos', []);
```

### 4. `Record<K, V>` for Object Maps

**Use when**: Object with dynamic keys but known value types

```typescript
// ✅ GOOD - Type-safe object map
type TodoById = Record<string, TodoItem>;

const todosMap: TodoById = {
  'todo-1': {
    id: 'todo-1',
    text: 'Buy milk',
    completed: false,
    createdAt: new Date(),
  },
  'todo-2': {
    id: 'todo-2',
    text: 'Walk dog',
    completed: true,
    createdAt: new Date(),
  },
};

// ❌ BAD - Lost type safety
const todosMap: Record<string, any> = {
  /* ... */
};
```

### 5. Union Types

**Use when**: Value can be one of several specific types

```typescript
// ✅ GOOD - Explicit union types
type TodoFilter = 'all' | 'active' | 'completed';
type SortOrder = 'asc' | 'desc';

interface FilterState {
  filter: TodoFilter;
  sortBy: 'createdAt' | 'text';
  sortOrder: SortOrder;
}

// Compiler prevents invalid values
const state: FilterState = {
  filter: 'all',
  sortBy: 'createdAt',
  sortOrder: 'asc',
};
```

### 6. Type Guards

**Use when**: Runtime type checking is needed

```typescript
// ✅ GOOD - Type guard for runtime safety
function isTodoItem(value: unknown): value is TodoItem {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'text' in value &&
    'completed' in value &&
    typeof (value as TodoItem).id === 'string' &&
    typeof (value as TodoItem).text === 'string' &&
    typeof (value as TodoItem).completed === 'boolean'
  );
}

function loadTodosFromStorage(): TodoItem[] {
  const stored = localStorage.getItem('todos');
  if (!stored) return [];

  const parsed: unknown = JSON.parse(stored);
  if (Array.isArray(parsed) && parsed.every(isTodoItem)) {
    return parsed;
  }

  return [];
}
```

### 7. Partial and Required Utility Types

**Use when**: Need subset of interface properties

```typescript
// ✅ GOOD - Utility types for flexibility
interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  tags?: string[];
}

// For updates (all properties optional)
type TodoUpdate = Partial<TodoItem>;

// For creation (without generated fields)
type TodoCreate = Omit<TodoItem, 'id' | 'createdAt'>;

function updateTodo(id: string, updates: TodoUpdate): void {
  // Only specified properties need to be provided
}

function createTodo(data: TodoCreate): TodoItem {
  return {
    ...data,
    id: generateId(),
    createdAt: new Date(),
  };
}
```

## Escape Hatch: `@ts-expect-error`

**Use when**: Explicit type bypass is necessary (rare cases)

```typescript
// ✅ ACCEPTABLE - With clear justification
// @ts-expect-error - Third-party library has incorrect types, issue reported: https://github.com/lib/issue/123
const result = externalLibrary.undocumentedMethod();

// ❌ BAD - No explanation
// @ts-expect-error
const result = someFunction();
```

**Requirements**:

1. Include comment explaining why it's necessary
2. Reference issue/ticket if waiting for fix
3. Keep scope minimal (single line, not entire function)
4. Plan to remove when proper fix is available

## Test Code Standards

**Critical**: Test code must maintain same type safety standards as production code.

### Test Isolation and Mock Cleanup

**Always restore mocked global objects** to maintain test isolation and prevent test pollution.

When using `Object.defineProperty` to mock global objects (window, global, etc.), you MUST:

1. **Save the original** before mocking
2. **Mark as configurable** to allow restoration
3. **Restore in afterAll()** to maintain test isolation

**Good Example**:

```typescript
// ✅ GOOD - Proper mock cleanup pattern
import { mockLocalStorage } from '../utils/test-utils';

const mockStorage = mockLocalStorage();
const originalLocalStorage = window.localStorage;

Object.defineProperty(window, 'localStorage', {
  value: mockStorage,
  writable: true,
  configurable: true, // ← Required for restoration
});

describe('My Test Suite', () => {
  afterAll(() => {
    // Restore original localStorage to maintain test isolation
    if (originalLocalStorage) {
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
        configurable: true,
      });
    } else {
      delete (window as { localStorage?: Storage }).localStorage;
    }
  });

  beforeEach(() => {
    mockStorage.clear();
  });

  // ... tests
});
```

**Bad Example**:

```typescript
// ❌ BAD - No cleanup, leaks to other tests
Object.defineProperty(window, 'localStorage', {
  value: mockStorage,
  // Missing: writable, configurable
  // Missing: afterAll() cleanup
});
```

**Why This Matters**:

- **Test isolation**: Prevents one test file's mocks from affecting other test files
- **Deterministic tests**: Tests run in any order without side effects
- **Clean slate**: Each test file starts with a predictable environment
- **No flaky tests**: Avoids mysterious failures from leaked mocks

**Reference**: See `app/__tests__/hooks/useSharedTodos.test.ts` (lines 53-90) for the complete pattern.

### Mocking with Type Safety

```typescript
// ✅ GOOD - Properly typed mock
interface DragMonitorCallback {
  (args: { source: { data: SourceData }; location: DropLocation }): void;
}

let monitorCallback: DragMonitorCallback | null = null;

const mockMonitor = jest.fn((callback: DragMonitorCallback) => {
  monitorCallback = callback;
  return jest.fn(); // cleanup
});

// Usage in test
monitorCallback?.({
  source: { data: { todoId: '1', index: 0 } },
  location: {
    current: {
      dropTargets: [{ data: { index: 1 } }],
    },
  },
});
```

### Testing Unknown Data

```typescript
// ✅ GOOD - Test with proper type guards
describe('loadTodosFromStorage', () => {
  it('handles malformed data safely', () => {
    const invalidData: unknown = { invalid: 'structure' };
    localStorage.setItem('todos', JSON.stringify(invalidData));

    const result = loadTodosFromStorage();

    expect(result).toEqual([]);
  });
});
```

## Common Patterns

### Event Handlers

```typescript
// ✅ GOOD - Properly typed event handlers
function TodoInput() {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // ...
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // ...
  };

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} />
    </form>
  );
}
```

### API Responses

```typescript
// ✅ GOOD - Type-safe API handling
interface ApiResponse<T> {
  data: T;
  error?: string;
  status: number;
}

async function fetchTodos(): Promise<TodoItem[]> {
  const response = await fetch('/api/todos');
  const json: unknown = await response.json();

  if (isApiResponse<TodoItem[]>(json)) {
    if (json.error) {
      throw new Error(json.error);
    }
    return json.data;
  }

  throw new Error('Invalid API response');
}

function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'data' in value &&
    'status' in value
  );
}
```

### React Props

```typescript
// ✅ GOOD - Comprehensive prop types
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children,
  className = '',
}: ButtonProps) {
  // Full type safety
}
```

## Enforcement

### ESLint Configuration

```javascript
// eslint.config.mjs
'@typescript-eslint/no-explicit-any': 'error',  // Enforced at error level
```

### Pre-commit Hooks

- ESLint runs on all staged files
- Errors (including `any` usage) block commits
- No warnings are acceptable for `any` type

### CI/CD Pipeline

- Build fails if `any` types are present
- Type checking runs in CI
- No bypassing type safety in any environment

## Migration Strategy

When encountering existing `any` types (should be rare in this codebase):

1. **Identify the actual type** - What data structure is actually used?
2. **Create proper interface** - Define the structure explicitly
3. **Update all usages** - Replace `any` with proper type
4. **Add tests** - Verify type safety works correctly
5. **Commit atomically** - Separate commit for type safety improvement

## Resources

### TypeScript Documentation

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Type Guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

### ESLint TypeScript

- [no-explicit-any Rule](https://typescript-eslint.io/rules/no-explicit-any/)
- [TypeScript ESLint Rules](https://typescript-eslint.io/rules/)

### React TypeScript

- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [React TypeScript Guide](https://www.typescriptlang.org/docs/handbook/react.html)

## Summary

**Golden Rule**: If you're reaching for `any`, stop and ask:

1. What is the actual type of this data?
2. Can I define an interface?
3. Is `unknown` + type guard more appropriate?
4. Am I just avoiding proper typing?

**Type safety is an investment** - it takes slightly more effort upfront but prevents bugs, improves
maintainability, and serves as living documentation.
