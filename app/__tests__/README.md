# Test Utilities Reference

## Purpose

This directory contains the test suite for the Todo App, organized with
reusable utilities to eliminate duplication and ensure consistent testing
patterns. All utilities follow strict TypeScript standards and React Testing
Library best practices.

## Directory Structure

```text
__tests__/
├── components/          # Component unit tests
├── hooks/              # Custom hook tests
├── integration/        # Integration and lifecycle tests
├── security/           # Security and XSS tests
├── types/              # Type validation tests
├── fixtures/           # Test data constants
│   └── test-constants.ts
└── utils/              # Reusable test utilities
    ├── assertion-helpers.ts
    ├── mock-callbacks.ts
    ├── render-helpers.tsx
    └── test-utils.tsx
```

## Quick Start

### Basic TodoItem Test

```typescript
import { createMockTodo } from '../utils/test-utils';
import { renderTodoItem } from '../utils/render-helpers';

describe('TodoItem', () => {
  it('should render a todo item', () => {
    const todo = createMockTodo({ text: 'Buy milk' });
    const { callbacks } = renderTodoItem(todo);

    expect(screen.getByText('Buy milk')).toBeInTheDocument();
  });
});
```

### Security Test

```typescript
import { XSS_PAYLOADS } from '../fixtures/test-constants';
import { createMockTodo } from '../utils/test-utils';
import { renderTodoItem } from '../utils/render-helpers';
import { expectNoXSS } from '../utils/assertion-helpers';

it('should prevent XSS injection', () => {
  const todo = createMockTodo({ text: XSS_PAYLOADS.SCRIPT_BASIC });
  renderTodoItem(todo);
  expectNoXSS();
});
```

## Utility Files

### fixtures/test-constants.ts

**Purpose**: Single source of truth for all test data

**Exports**:

- `TEST_UUIDS` - Standard UUIDs for consistent test data
- `XSS_PAYLOADS` - Comprehensive XSS attack vectors (40+ payloads)
- `SAFE_MARKDOWN` - Valid markdown test cases
- `TEST_DATES` - Standard timestamps for lifecycle tests
- `TEST_COLORS` - Common colors for participant tests

**Example**:

```typescript
import { TEST_UUIDS, XSS_PAYLOADS } from '../fixtures/test-constants';

const todo = createMockTodo({
  id: TEST_UUIDS.TODO_1,
  text: XSS_PAYLOADS.SCRIPT_BASIC,
});
```

**Used in**: 40+ test files

### utils/mock-callbacks.ts

**Purpose**: Centralized mock callback creation and management

**Exports**:

- `createMockCallbacks()` - Create standard TodoItem callback mocks
- `clearMockCallbacks()` - Clear all mocks between tests
- `resetMockCallbacks()` - Reset mocks including implementations
- `expectNoCallbacksCalled()` - Verify no callbacks were invoked

**Example**:

```typescript
import {
  createMockCallbacks,
  clearMockCallbacks,
} from '../utils/mock-callbacks';

let callbacks: TodoItemCallbacks;

beforeEach(() => {
  callbacks = createMockCallbacks();
});

afterEach(() => {
  clearMockCallbacks(callbacks);
});

it('should call onToggle', () => {
  // ... interact with component
  expect(callbacks.mockOnToggle).toHaveBeenCalledWith('todo-1');
});
```

**Replaces**: 10+ lines of repetitive mock setup per test file

**Used in**: 54+ test locations

### utils/render-helpers.tsx

**Purpose**: Simplified component rendering with automatic callback setup

**Exports**:

- `renderTodoItem()` - Render TodoItem with automatic callbacks
- `renderTodoItemWithProps()` - Render with additional custom props

**Example**:

```typescript
import { renderTodoItem } from '../utils/render-helpers';

it('should render correctly', () => {
  const todo = createMockTodo({ text: 'Test' });
  const { callbacks } = renderTodoItem(todo);

  // Component is rendered with all callbacks automatically set up
  expect(screen.getByText('Test')).toBeInTheDocument();
});

// Custom callback implementation
const customOnToggle = jest.fn(() => console.log('toggled'));
const { callbacks } = renderTodoItem(todo, { mockOnToggle: customOnToggle });
```

**Replaces**: ~10 lines of TodoItem render boilerplate per test

**Used in**: 30+ test files

### utils/assertion-helpers.ts

**Purpose**: Comprehensive security and XSS assertion patterns

**Exports**:

- `expectNoXSS()` - Assert no script injection present
- `expectNoEventHandlers()` - Assert no inline event handlers
- `expectNoDangerousElements()` - Assert no dangerous HTML elements
- `expectComprehensiveXSSSafety()` - Complete XSS safety check
- `expectNoCSSInjection()` - Assert no CSS-based XSS
- `expectNoSVGInjection()` - Assert no SVG-based XSS

**Example**:

```typescript
import { expectNoXSS, expectNoEventHandlers } from '../utils/assertion-helpers';

it('should prevent XSS attacks', () => {
  const maliciousTodo = createMockTodo({
    text: '<script>alert("XSS")</script>',
  });
  renderTodoItem(maliciousTodo);

  expectNoXSS();
  expectNoEventHandlers();
});
```

**Replaces**: 5-15 lines of repetitive XSS assertions per test

**Used in**: 30+ XSS security tests

### utils/test-utils.tsx

**Purpose**: Factory functions for creating test data

**Exports**:

- `createMockTodo()` - Create mock Todo with defaults
- `createMockSharedTodo()` - Create mock SharedTodo with list/user IDs
- `createMockParticipant()` - Create mock Participant with color
- `setupLocalStorageMock()` - Mock localStorage with cleanup
- `mockLocalStorage()` - Create mock Storage implementation

**Example**:

```typescript
import { createMockTodo, createMockSharedTodo } from '../utils/test-utils';

// Simple todo with overrides
const todo = createMockTodo({
  text: 'Buy milk',
  completed: true,
});

// Shared todo with collaboration metadata
const sharedTodo = createMockSharedTodo({
  listId: TEST_UUIDS.LIST_1,
  authorId: TEST_UUIDS.USER_1,
});
```

**Used in**: 100+ test locations

## Common Patterns

### Pattern: TodoItem Component Test

```typescript
import { createMockTodo } from '../utils/test-utils';
import {
  createMockCallbacks,
  clearMockCallbacks,
} from '../utils/mock-callbacks';
import { renderTodoItem } from '../utils/render-helpers';

describe('TodoItem', () => {
  let callbacks: TodoItemCallbacks;

  beforeEach(() => {
    callbacks = createMockCallbacks();
  });

  afterEach(() => {
    clearMockCallbacks(callbacks);
  });

  it('should toggle completion', async () => {
    const user = userEvent.setup();
    const todo = createMockTodo({ text: 'Test', completed: false });
    renderTodoItem(todo, callbacks);

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(callbacks.mockOnToggle).toHaveBeenCalledWith(todo.id);
  });
});
```

### Pattern: XSS Security Test

```typescript
import { XSS_PAYLOADS } from '../fixtures/test-constants';
import { createMockTodo } from '../utils/test-utils';
import { renderTodoItem } from '../utils/render-helpers';
import { expectNoXSS, expectNoEventHandlers } from '../utils/assertion-helpers';

describe('XSS Prevention', () => {
  it('should prevent script injection', () => {
    const todo = createMockTodo({ text: XSS_PAYLOADS.SCRIPT_BASIC });
    renderTodoItem(todo);
    expectNoXSS();
  });

  it('should prevent event handler injection', () => {
    const todo = createMockTodo({ text: XSS_PAYLOADS.ONERROR_IMG });
    renderTodoItem(todo);
    expectNoEventHandlers();
  });
});
```

### Pattern: Integration Test with Shared State

```typescript
import { TEST_UUIDS, TEST_COLORS } from '../fixtures/test-constants';
import {
  createMockSharedTodo,
  createMockParticipant,
} from '../utils/test-utils';

describe('Shared Todo Integration', () => {
  it('should sync updates across participants', () => {
    const todo = createMockSharedTodo({
      text: 'Shared task',
      listId: TEST_UUIDS.LIST_1,
      authorId: TEST_UUIDS.USER_1,
    });

    const participant = createMockParticipant({
      id: TEST_UUIDS.USER_2,
      color: TEST_COLORS.BLUE,
    });

    // ... test collaboration logic
  });
});
```

## Testing Standards

### Required Utilities

**ALWAYS use these utilities** instead of manual implementations:

- ✅ `createMockTodo()` - NOT manual object creation
- ✅ `createMockCallbacks()` - NOT individual `jest.fn()` calls
- ✅ `renderTodoItem()` - NOT manual `render(<TodoItem ... />)`
- ✅ `TEST_UUIDS.*` - NOT hardcoded UUID strings
- ✅ `XSS_PAYLOADS.*` - NOT inline XSS attack strings
- ✅ `expectNoXSS()` - NOT manual XSS assertions

### Why Use Utilities?

1. **Consistency**: All tests use same patterns and data
2. **Maintainability**: Update one place, fix all tests
3. **Readability**: Clear intent with descriptive names
4. **Type Safety**: Full TypeScript support with autocomplete
5. **Reduced Duplication**: DRY principle across test suite
6. **Security**: Comprehensive XSS coverage with battle-tested payloads

### Anti-Patterns to Avoid

```typescript
// ❌ BAD - Manual mock setup
const mockOnToggle = jest.fn();
const mockOnDelete = jest.fn();
const mockOnEdit = jest.fn();
beforeEach(() => {
  mockOnToggle.mockClear();
  mockOnDelete.mockClear();
  mockOnEdit.mockClear();
});

// ✅ GOOD - Use createMockCallbacks
let callbacks: TodoItemCallbacks;
beforeEach(() => {
  callbacks = createMockCallbacks();
});
afterEach(() => {
  clearMockCallbacks(callbacks);
});
```

```typescript
// ❌ BAD - Hardcoded XSS payload
const maliciousInput = '<script>alert("XSS")</script>';

// ✅ GOOD - Use XSS_PAYLOADS constant
const maliciousInput = XSS_PAYLOADS.SCRIPT_BASIC;
```

```typescript
// ❌ BAD - Manual component render
render(
  <TodoItem
    todo={todo}
    onToggle={mockOnToggle}
    onDelete={mockOnDelete}
    onEdit={mockOnEdit}
    onRestore={mockOnRestore}
  />
);

// ✅ GOOD - Use renderTodoItem helper
const { callbacks } = renderTodoItem(todo);
```

## Related Documentation

- **Testing Guidelines**: [docs/guidelines/testing-guidelines.md](../../docs/guidelines/testing-guidelines.md)
- **TypeScript Standards**: [docs/guidelines/typescript-standards.md](../../docs/guidelines/typescript-standards.md)
- **Accessibility Testing**: [docs/guidelines/accessibility-requirements.md](../../docs/guidelines/accessibility-requirements.md)
- **TDD Approach**: [docs/adr/004-test-driven-development-approach.md](../../docs/adr/004-test-driven-development-approach.md)

## Contributing

When adding new test utilities:

1. **Add to appropriate file**: fixtures for data, utils for functions
2. **Include JSDoc comments**: Document purpose, parameters, examples
3. **Export interfaces**: Make TypeScript types available
4. **Add example usage**: Include in this README
5. **Update usage count**: Note how many tests benefit from utility

## Summary

**Before utilities** (typical test setup):

- 10+ lines of mock setup
- 5+ lines of render boilerplate
- Hardcoded test data
- Repetitive XSS assertions
- **Total: ~25 lines of duplication per test file**

**After utilities** (modern approach):

- 2 lines for callback setup (`createMockCallbacks()`)
- 1 line for rendering (`renderTodoItem()`)
- Centralized test data (`TEST_UUIDS`, `XSS_PAYLOADS`)
- Single-line assertions (`expectNoXSS()`)
- **Total: ~5 lines, 80% reduction**

**Impact**:

- 722 lines of reusable utilities
- Used across 100+ test locations
- Eliminates 20.13% code duplication
- Improves test maintainability and readability
