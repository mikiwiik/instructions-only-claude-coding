# ADR-027: Code Complexity Standards

## Status

Accepted

**Note**: Once accepted, this ADR should not be modified except for:

- Minor corrections (typos, formatting, broken links)
- Status updates when superseded or amended
- Adding links to newer ADRs that reference this one

For architectural changes or evolution, create a new ADR that references this one. See
[PROCESS.md](PROCESS.md#adr-immutability-and-evolution) for complete immutability guidelines.

## Context

SonarCloud analysis identified 5 high severity maintainability issues (90 minutes technical debt) related to code
complexity in the todo application. These violations indicate functions and components that are difficult to understand,
test, and maintain:

1. **useSharedTodoSync.ts** (lines 50, 58, 73): Deep nesting >4 levels in EventSource event handlers
2. **TodoItem.tsx** (line 106): Cognitive complexity 19 (limit 15) in main component
3. **ConfirmationDialog.tsx** (line 65): Cognitive complexity 31 (limit 15) in keyboard handler

The project currently lacks formal code complexity standards and ESLint enforcement, leading to gradual complexity
accumulation without automated detection. As the codebase grows with features like shared lists, real-time sync, and
mobile gestures, maintaining manageable complexity becomes critical for long-term maintainability.

**Key Problems**:

- No defined complexity thresholds in project standards
- ESLint configured without complexity rules
- Developers lack guidelines on when/how to refactor complex code
- SonarCloud catches issues post-commit rather than pre-commit

## Decision

Adopt comprehensive code complexity standards with multi-layered enforcement:

### Cognitive Complexity Limit: 15

**Definition**: Cognitive complexity measures how difficult code is to understand by counting control flow breaks
(if/else, loops, nested logic) with penalty for nesting depth.

**Rationale**:

- Aligned with SonarCloud default threshold
- Industry-standard limit for maintainable functions
- Enforced by both ESLint and SonarCloud

### Nesting Depth Limit: 4 Levels

**Definition**: Maximum depth of nested control structures (if/for/while/try blocks).

**Rationale**:

- Aligned with SonarCloud rule S2004
- Forces extraction of helper functions for deep logic
- Improves testability and readability

### Cyclomatic Complexity Limit: 15

**Definition**: Number of linearly independent paths through code (counts decision points).

**Rationale**:

- Complementary metric to cognitive complexity
- Indicates testing burden (number of test cases needed)
- ESLint `complexity` rule enforcement

### Function Size Guidelines

**Soft Limits** (warnings, not errors):

- `max-lines-per-function`: 150 lines
- `max-params`: 4 parameters
- `max-statements`: 30 statements per function

**Rationale**: Encourages extraction without blocking commits for borderline cases.

### Enforcement Mechanisms

1. **ESLint Pre-commit** (Primary Gate)
   - Complexity rules enforced at error level
   - Blocks commits with violations
   - Immediate feedback during development

2. **SonarCloud CI** (Secondary Gate)
   - Comprehensive analysis on each PR
   - Tracks technical debt metrics
   - Catches edge cases ESLint may miss

3. **Code Review Guidelines**
   - Reviewers check for complexity patterns
   - Suggest refactoring opportunities
   - Ensure quality over speed

### Refactoring Patterns

**When Complexity Exceeds Limits**:

1. **Extract Functions**: Move nested logic to named helper functions
2. **Extract Custom Hooks**: Move stateful logic to reusable hooks (React)
3. **Decompose Components**: Split large components into sub-components
4. **Simplify Conditionals**: Use early returns, guard clauses, lookup tables
5. **Use Type Guards**: Replace complex type checking with type guard functions

**Detailed Patterns**: See `docs/guidelines/code-complexity-guidelines.md` for practical examples.

## Consequences

### Positive

- **Maintainability**: Complex code identified and refactored systematically
- **Testability**: Simpler functions easier to test with fewer test cases needed
- **Onboarding**: New developers understand code faster with clear, focused functions
- **Technical Debt Prevention**: Automated detection prevents complexity accumulation
- **Consistent Standards**: Clear thresholds remove subjective "too complex" debates
- **Early Detection**: Pre-commit enforcement catches issues before merge

### Negative

- **Initial Refactoring Burden**: 5 high severity violations require immediate attention
- **Learning Curve**: Developers must understand complexity metrics and refactoring patterns
- **False Positives**: Occasionally legitimate code may exceed limits (use `eslint-disable` with justification)
- **Build Time**: ESLint complexity analysis adds minimal overhead (~5-10ms per file)

### Neutral

- **Code Volume**: May increase total lines of code due to extracted functions (positive trade-off for clarity)
- **Subjective Limits**: Thresholds based on industry standards but adjustable if proven too restrictive
- **Documentation Maintenance**: Guidelines require updates as new patterns emerge

## Alternatives Considered

### Alternative 1: SonarCloud-Only Enforcement

**Description**: Rely solely on SonarCloud analysis without ESLint complexity rules.

**Rejected Because**:

- **Late Feedback**: Issues discovered only in CI after commit
- **No Pre-commit Gate**: Developers can merge violations before SonarCloud runs
- **Slower Iteration**: Requires commit/push/wait cycle to check complexity

### Alternative 2: Stricter Limits (Complexity 10, Nesting 3)

**Description**: Use more aggressive thresholds for complexity and nesting.

**Rejected Because**:

- **Industry Standard**: Limit 15 is widely adopted (SonarCloud, Google Style Guides)
- **Pragmatic Balance**: Too strict limits force artificial decomposition
- **Migration Cost**: Would require refactoring more existing code unnecessarily

### Alternative 3: Manual Code Review Only

**Description**: No automated enforcement, rely on reviewer judgment.

**Rejected Because**:

- **Inconsistent**: Different reviewers have different complexity tolerance
- **Human Error**: Easy to miss complexity issues in large PRs
- **Scalability**: Doesn't scale as codebase and team grow
- **Delayed Feedback**: Issues caught late in review cycle

## References

- **SonarCloud Rules**:
  - [S3776: Cognitive Complexity](https://rules.sonarsource.com/typescript/RSPEC-3776)
  - [S2004: Control Flow Nesting](https://rules.sonarsource.com/typescript/RSPEC-2004)
- **ESLint Rules**:
  - [complexity](https://eslint.org/docs/latest/rules/complexity)
  - [max-depth](https://eslint.org/docs/latest/rules/max-depth)
  - [max-lines-per-function](https://eslint.org/docs/latest/rules/max-lines-per-function)
- **Related ADRs**:
  - ADR-002: TypeScript Adoption (type safety foundation)
  - ADR-009: Pre-commit Linting Strategy (enforcement mechanism)
  - ADR-022: Strict TypeScript Type Safety (complementary quality standard)
- **Project Documentation**:
  - `docs/guidelines/code-complexity-guidelines.md`: Practical refactoring patterns
  - `docs/guidelines/typescript-standards.md`: Type safety standards
- **Issue**: GitHub Issue #259 - Fix SonarCloud High Severity Code Complexity Issues
