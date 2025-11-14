# Testing Guidelines

## Purpose

This guide establishes comprehensive testing standards for the Todo App
project. It defines required testing utilities, security testing patterns,
and quality gates that ensure reliable, maintainable test code.

## Related Documentation

- **ADR-004**: Test-Driven Development Approach (TDD foundation)
- **ADR-009**: Pre-commit Linting Strategy (test enforcement)
- **ADR-027**: Code Complexity Standards (complexity in tests)
- **Test Utilities Reference**: [app/**tests**/README.md](../../app/__tests__/README.md)
- **TypeScript Standards**: [typescript-standards.md](typescript-standards.md)
- **Accessibility Requirements**: [accessibility-requirements.md](accessibility-requirements.md)

## Core Principles

### 1. Test-Driven Development (TDD)

**Write tests before implementation**. This ensures:

- Clear requirements understanding
- Testable code design
- Comprehensive coverage from the start
- Faster feedback loops

**TDD Cycle**:

1. **Red**: Write a failing test
2. **Green**: Write minimal code to pass
3. **Refactor**: Improve code while keeping tests green

### 2. React Testing Library Philosophy

**Test user behavior, not implementation details**:

```typescript
// ❌ BAD - Testing implementation
expect(component.state.isEditing).toBe(true);

// ✅ GOOD - Testing user-visible behavior
expect(screen.getByRole('textbox')).toBeInTheDocument();
```

**Query Priority**:

1. `getByRole` - Accessibility-focused (preferred)
2. `getByLabelText` - Form controls
3. `getByPlaceholderText` - Forms only
4. `getByText` - Non-interactive content
5. `getByTestId` - Last resort only

### 3. DRY Principle in Tests

**Always use test utilities** to eliminate duplication:

- Factory functions for test data
- Helper functions for common assertions
- Centralized constants for XSS payloads and test data

## Required Test Utilities

### Mandatory Utilities (Always Use These)

The project provides comprehensive test utilities in `app/__tests__/`.
**You MUST use these utilities** instead of manual implementations:

#### 1. Factory Functions (test-utils.tsx)

```typescript
import { createMockTodo, createMockSharedTodo } from '../utils/test-utils';

// ✅ GOOD - Use factory with overrides
const todo = createMockTodo({
  text: 'Buy milk',
  completed: true,
});

// ❌ BAD - Manual object creation
const todo = {
  id: '123',
  text: 'Buy milk',
  completed: true,
  createdAt: new Date(),
  completedAt: new Date(),
  deletedAt: null,
};
```

**Available Factories**:

- `createMockTodo()` - Standard Todo items
- `createMockSharedTodo()` - Collaborative todos with list/user IDs
- `createMockParticipant()` - Collaboration participants

#### 2. Mock Callbacks (mock-callbacks.ts)

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

// ✅ GOOD - Use callbacks object
expect(callbacks.mockOnToggle).toHaveBeenCalledWith('todo-1');

// ❌ BAD - Manual mock creation
const mockOnToggle = jest.fn();
const mockOnDelete = jest.fn();
beforeEach(() => {
  mockOnToggle.mockClear();
  mockOnDelete.mockClear();
});
```

**Available Functions**:

- `createMockCallbacks()` - Create all TodoItem callbacks
- `clearMockCallbacks()` - Clear call history
- `resetMockCallbacks()` - Reset including implementations
- `expectNoCallbacksCalled()` - Assert no callbacks invoked

#### 3. Render Helpers (render-helpers.tsx)

```typescript
import { renderTodoItem } from '../utils/render-helpers';

// ✅ GOOD - One line render
const { callbacks } = renderTodoItem(todo);

// ❌ BAD - Manual render boilerplate
const mockOnToggle = jest.fn();
const mockOnDelete = jest.fn();
const mockOnEdit = jest.fn();
const mockOnRestore = jest.fn();
render(
  <TodoItem
    todo={todo}
    onToggle={mockOnToggle}
    onDelete={mockOnDelete}
    onEdit={mockOnEdit}
    onRestore={mockOnRestore}
  />
);
```

**Available Functions**:

- `renderTodoItem()` - Render TodoItem with automatic callback setup
- `renderTodoItemWithProps()` - Render with additional custom props

#### 4. Test Constants (fixtures/test-constants.ts)

```typescript
import {
  TEST_UUIDS,
  XSS_PAYLOADS,
  TEST_DATES,
} from '../fixtures/test-constants';

// ✅ GOOD - Use constants
const todo = createMockTodo({
  id: TEST_UUIDS.TODO_1,
  createdAt: TEST_DATES.PAST_HOUR,
});

// ❌ BAD - Hardcoded values
const todo = createMockTodo({
  id: '550e8400-e29b-41d4-a716-446655440000',
  createdAt: new Date(Date.now() - 60 * 60 * 1000),
});
```

**Available Constants**:

- `TEST_UUIDS` - Standard UUIDs for todos, users, lists
- `XSS_PAYLOADS` - 40+ XSS attack vectors
- `SAFE_MARKDOWN` - Valid markdown test cases
- `TEST_DATES` - Standard timestamps
- `TEST_COLORS` - Participant colors

#### 5. Assertion Helpers (assertion-helpers.ts)

```typescript
import { expectNoXSS, expectNoEventHandlers } from '../utils/assertion-helpers';

// ✅ GOOD - Comprehensive assertions
renderTodoItem(maliciousTodo);
expectNoXSS();
expectNoEventHandlers();

// ❌ BAD - Manual assertions
const bodyHTML = document.body.innerHTML;
expect(bodyHTML).not.toContain('<script>');
expect(bodyHTML).not.toContain('javascript:');
expect(bodyHTML).not.toContain('alert(');
expect(document.querySelectorAll('script')).toHaveLength(0);
```

**Available Assertions**:

- `expectNoXSS()` - Assert no script injection
- `expectNoEventHandlers()` - Assert no inline event handlers
- `expectNoDangerousElements()` - Assert no dangerous HTML elements
- `expectComprehensiveXSSSafety()` - Complete XSS safety check
- `expectNoCSSInjection()` - Assert no CSS-based XSS
- `expectNoSVGInjection()` - Assert no SVG-based XSS

## Security Testing Standards

### XSS Prevention Testing

**All user-input rendering MUST have XSS tests**:

```typescript
import { XSS_PAYLOADS } from '../fixtures/test-constants';
import { expectNoXSS } from '../utils/assertion-helpers';

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

  it('should prevent protocol-based attacks', () => {
    const todo = createMockTodo({
      text: `[Link](${XSS_PAYLOADS.JAVASCRIPT_PROTOCOL})`,
    });
    renderTodoItem(todo);
    expectNoXSS();
  });
});
```

### Comprehensive XSS Attack Vectors

Test against multiple attack categories:

1. **Script Injection**: `XSS_PAYLOADS.SCRIPT_BASIC`, `SCRIPT_WITH_SRC`
2. **Event Handlers**: `ONERROR_IMG`, `ONCLICK_DIV`, `ONLOAD_BODY`
3. **Protocol Attacks**: `JAVASCRIPT_PROTOCOL`, `DATA_PROTOCOL`, `VBSCRIPT_PROTOCOL`
4. **HTML Injection**: `IFRAME_BASIC`, `OBJECT_DATA`, `EMBED_SRC`
5. **CSS Injection**: `STYLE_BACKGROUND_URL`, `STYLE_EXPRESSION`
6. **SVG Attacks**: `SVG_ONLOAD`, `SVG_SCRIPT`
7. **Encoded Attacks**: `HTML_ENTITY_ENCODED`, `URL_ENCODED`
8. **Case Variations**: `MIXED_CASE_SCRIPT`, `UPPERCASE_ONCLICK`

**See `app/__tests__/fixtures/test-constants.ts` for complete list**

### Edit Mode Security

**Test that malicious content is safe in edit mode**:

```typescript
it('should prevent XSS when editing malicious content', async () => {
  const user = userEvent.setup();
  const todo = createMockTodo({ text: XSS_PAYLOADS.SCRIPT_BASIC });
  renderTodoItem(todo);

  const editButton = screen.getByRole('button', { name: /edit todo/i });
  await user.click(editButton);

  // Even in edit mode, no script execution
  expect(document.querySelectorAll('script')).toHaveLength(0);

  // Raw text should be in textarea for editing
  const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
  expect(textarea.value).toContain(XSS_PAYLOADS.SCRIPT_BASIC);
});
```

## Component Testing Patterns

### Standard TodoItem Test Structure

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

  describe('Checkbox Interaction', () => {
    it('should toggle completion on checkbox click', async () => {
      const user = userEvent.setup();
      const todo = createMockTodo({ completed: false });
      renderTodoItem(todo, callbacks);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(callbacks.mockOnToggle).toHaveBeenCalledWith(todo.id);
      expect(callbacks.mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it('should not toggle deleted todos', async () => {
      const user = userEvent.setup();
      const todo = createMockTodo({ deletedAt: new Date() });
      renderTodoItem(todo, callbacks);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(callbacks.mockOnToggle).not.toHaveBeenCalled();
    });
  });

  describe('Edit Mode', () => {
    it('should enter edit mode on edit button click', async () => {
      const user = userEvent.setup();
      const todo = createMockTodo({ text: 'Original text' });
      renderTodoItem(todo, callbacks);

      const editButton = screen.getByRole('button', { name: /edit todo/i });
      await user.click(editButton);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /save edit/i })
      ).toBeInTheDocument();
    });

    it('should save edited text', async () => {
      const user = userEvent.setup();
      const todo = createMockTodo({ text: 'Original' });
      renderTodoItem(todo, callbacks);

      const editButton = screen.getByRole('button', { name: /edit todo/i });
      await user.click(editButton);

      const textarea = screen.getByRole('textbox');
      await user.clear(textarea);
      await user.type(textarea, 'Updated text');

      const saveButton = screen.getByRole('button', { name: /save edit/i });
      await user.click(saveButton);

      expect(callbacks.mockOnEdit).toHaveBeenCalledWith(
        todo.id,
        'Updated text'
      );
    });
  });
});
```

### Accessibility Testing

**All interactive components MUST have accessibility tests**:

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('TodoItem Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const todo = createMockTodo({ text: 'Test todo' });
    const { container } = renderTodoItem(todo);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have accessible button labels', () => {
    const todo = createMockTodo();
    renderTodoItem(todo);

    expect(
      screen.getByRole('button', { name: /edit todo/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /delete todo/i })
    ).toBeInTheDocument();
  });

  it('should have proper ARIA attributes', () => {
    const todo = createMockTodo({ completed: true });
    renderTodoItem(todo);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
  });
});
```

## Testing Standards

### Coverage Requirements

- **Minimum**: 80% overall coverage
- **Goal**: 90%+ for critical paths
- **Security**: 100% coverage for XSS prevention

**Run coverage**:

```bash
npm test -- --coverage
```

### Test Organization

```typescript
describe('Component/Feature Name', () => {
  // Setup
  beforeEach(() => {
    // Common setup
  });

  afterEach(() => {
    // Cleanup
  });

  describe('Sub-feature 1', () => {
    it('should do specific thing', () => {
      // Test case
    });

    it('should handle edge case', () => {
      // Edge case test
    });
  });

  describe('Sub-feature 2', () => {
    // More tests
  });
});
```

### Test Naming

**Use descriptive names that explain intent**:

```typescript
// ✅ GOOD - Clear intent
it('should prevent XSS injection through markdown links', () => {});
it('should toggle completion when checkbox is clicked', () => {});
it('should not delete completed todos without confirmation', () => {});

// ❌ BAD - Vague or technical
it('works correctly', () => {});
it('test case 1', () => {});
it('renders without crashing', () => {});
```

### Assertion Quality

**Be specific with assertions**:

```typescript
// ✅ GOOD - Specific assertions
expect(callbacks.mockOnToggle).toHaveBeenCalledWith('todo-123');
expect(callbacks.mockOnToggle).toHaveBeenCalledTimes(1);
expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true');

// ❌ BAD - Generic assertions
expect(callbacks.mockOnToggle).toHaveBeenCalled();
expect(screen.getByRole('checkbox')).toBeTruthy();
```

### Test Isolation

**Each test should be independent**:

```typescript
// ✅ GOOD - Clean state per test
beforeEach(() => {
  callbacks = createMockCallbacks();
});

afterEach(() => {
  clearMockCallbacks(callbacks);
});

// ❌ BAD - Shared state between tests
const callbacks = createMockCallbacks(); // Outside beforeEach
```

## TypeScript in Tests

**Maintain same type safety standards as production code**:

```typescript
// ✅ GOOD - Properly typed
const todo: Todo = createMockTodo({ text: 'Test' });
const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
expect(textarea.value).toBe('Test');

// ❌ BAD - Using 'any'
const todo: any = { text: 'Test' };
```

**See [TypeScript Standards](typescript-standards.md) for complete guidelines**

## Integration Testing

### Testing User Flows

```typescript
describe('Todo Lifecycle Integration', () => {
  it('should complete full CRUD lifecycle', async () => {
    const user = userEvent.setup();

    // Create
    const input = screen.getByRole('textbox', { name: /add new todo/i });
    await user.type(input, 'Buy milk');
    await user.keyboard('{Enter}');
    expect(screen.getByText('Buy milk')).toBeInTheDocument();

    // Update
    const editButton = screen.getByRole('button', { name: /edit todo/i });
    await user.click(editButton);
    const textarea = screen.getByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, 'Buy organic milk');
    const saveButton = screen.getByRole('button', { name: /save edit/i });
    await user.click(saveButton);
    expect(screen.getByText('Buy organic milk')).toBeInTheDocument();

    // Delete
    const deleteButton = screen.getByRole('button', { name: /delete todo/i });
    await user.click(deleteButton);
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await user.click(confirmButton);
    expect(screen.queryByText('Buy organic milk')).not.toBeInTheDocument();
  });
});
```

### Testing Collaborative Features

```typescript
import { TEST_UUIDS, TEST_COLORS } from '../fixtures/test-constants';
import {
  createMockSharedTodo,
  createMockParticipant,
} from '../utils/test-utils';

describe('Shared Todo Collaboration', () => {
  it('should sync updates across participants', () => {
    const todo = createMockSharedTodo({
      text: 'Collaborative task',
      listId: TEST_UUIDS.LIST_1,
      authorId: TEST_UUIDS.USER_1,
    });

    const participant = createMockParticipant({
      id: TEST_UUIDS.USER_2,
      color: TEST_COLORS.BLUE,
    });

    // Test collaboration logic
  });
});
```

## Quality Gates

### Pre-commit Checks

Tests run automatically before commits:

- ESLint on test files
- TypeScript type checking
- Test suite must pass
- No skipped tests (`.skip`) allowed

### CI/CD Pipeline

All PRs must pass:

- `npm test` - Full test suite
- `npm run type-check` - TypeScript compilation
- Coverage thresholds met
- No accessibility violations

### Definition of Done

A feature is NOT complete until:

- ✅ All tests pass
- ✅ Coverage meets thresholds
- ✅ No ESLint errors or warnings
- ✅ Accessibility tests pass
- ✅ Security tests pass (if applicable)
- ✅ Type checking passes

## Common Anti-Patterns

### 1. Testing Implementation Details

```typescript
// ❌ BAD - Testing state
expect(component.state.isEditing).toBe(true);

// ✅ GOOD - Testing behavior
expect(screen.getByRole('textbox')).toBeInTheDocument();
```

### 2. Not Using Utilities

```typescript
// ❌ BAD - Manual duplication
const mockOnToggle = jest.fn();
const mockOnDelete = jest.fn();
// ... 10 more lines

// ✅ GOOD - Use utilities
const callbacks = createMockCallbacks();
```

### 3. Hardcoded Test Data

```typescript
// ❌ BAD - Magic strings/numbers
const todo = createMockTodo({ id: '550e8400-e29b-41d4-a716-446655440000' });

// ✅ GOOD - Use constants
const todo = createMockTodo({ id: TEST_UUIDS.TODO_1 });
```

### 4. Incomplete XSS Testing

```typescript
// ❌ BAD - Only one attack vector
const malicious = '<script>alert("XSS")</script>';

// ✅ GOOD - Test multiple vectors
const attacks = [
  XSS_PAYLOADS.SCRIPT_BASIC,
  XSS_PAYLOADS.ONERROR_IMG,
  XSS_PAYLOADS.JAVASCRIPT_PROTOCOL,
  XSS_PAYLOADS.SVG_ONLOAD,
];
```

### 5. Missing Cleanup

```typescript
// ❌ BAD - No afterEach cleanup
const callbacks = createMockCallbacks();
// Tests run, mocks accumulate calls

// ✅ GOOD - Clear between tests
afterEach(() => {
  clearMockCallbacks(callbacks);
});
```

## Migration from Legacy Tests

When updating old tests:

1. **Replace manual mocks** with `createMockCallbacks()`
2. **Replace manual renders** with `renderTodoItem()`
3. **Replace hardcoded UUIDs** with `TEST_UUIDS.*`
4. **Replace inline XSS strings** with `XSS_PAYLOADS.*`
5. **Replace manual XSS assertions** with `expectNoXSS()`

**Before** (25+ lines):

```typescript
const mockOnToggle = jest.fn();
const mockOnDelete = jest.fn();
const mockOnEdit = jest.fn();
const mockOnRestore = jest.fn();

beforeEach(() => {
  mockOnToggle.mockClear();
  mockOnDelete.mockClear();
  mockOnEdit.mockClear();
  mockOnRestore.mockClear();
});

it('should prevent XSS', () => {
  const malicious = '<script>alert("XSS")</script>';
  const todo = { id: '123', text: malicious, completed: false, /* ... */ };
  render(
    <TodoItem
      todo={todo}
      onToggle={mockOnToggle}
      onDelete={mockOnDelete}
      onEdit={mockOnEdit}
      onRestore={mockOnRestore}
    />
  );
  expect(document.body.innerHTML).not.toContain('<script>');
  expect(document.body.innerHTML).not.toContain('alert(');
});
```

**After** (5 lines):

```typescript
import { XSS_PAYLOADS } from '../fixtures/test-constants';
import {
  createMockCallbacks,
  clearMockCallbacks,
} from '../utils/mock-callbacks';
import { renderTodoItem } from '../utils/render-helpers';
import { expectNoXSS } from '../utils/assertion-helpers';

let callbacks: TodoItemCallbacks;

beforeEach(() => {
  callbacks = createMockCallbacks();
});

afterEach(() => {
  clearMockCallbacks(callbacks);
});

it('should prevent XSS', () => {
  const todo = createMockTodo({ text: XSS_PAYLOADS.SCRIPT_BASIC });
  renderTodoItem(todo, callbacks);
  expectNoXSS();
});
```

**Result**: 80% line reduction, improved maintainability

## Resources

### Testing Libraries

- [React Testing Library](https://testing-library.com/react)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [jest-axe (Accessibility)](https://github.com/nickcolley/jest-axe)
- [user-event](https://testing-library.com/docs/user-event/intro)

### Project Documentation

- [Test Utilities Reference](../../app/__tests__/README.md)
- [TypeScript Standards](typescript-standards.md)
- [Accessibility Requirements](accessibility-requirements.md)
- [Code Complexity Guidelines](code-complexity-guidelines.md)

### XSS Prevention

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

## Summary

**Golden Rules**:

1. **TDD Always**: Write tests before implementation
2. **Use Utilities**: Never duplicate what utilities provide
3. **Test Behavior**: Focus on user interactions, not implementation
4. **Security First**: Comprehensive XSS testing for all user input
5. **Type Safety**: Maintain TypeScript standards in test code
6. **Accessibility**: Test WCAG compliance for all components
7. **Clean Tests**: Independent, isolated, well-named tests
8. **Coverage Matters**: Meet thresholds, focus on critical paths

**Quick Reference**:

- ✅ `createMockTodo()` - NOT manual object creation
- ✅ `createMockCallbacks()` - NOT individual `jest.fn()` calls
- ✅ `renderTodoItem()` - NOT manual `render(<TodoItem ... />)`
- ✅ `TEST_UUIDS.*` - NOT hardcoded UUID strings
- ✅ `XSS_PAYLOADS.*` - NOT inline XSS attack strings
- ✅ `expectNoXSS()` - NOT manual XSS assertions

**For detailed examples and all available utilities**, see [app/**tests**/README.md](../../app/__tests__/README.md).
