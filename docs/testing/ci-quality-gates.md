# CI Quality Gates

This document describes the quality enforcement mechanisms in our CI pipeline that prevent code quality degradation.

## ESLint Soft Warnings Approach

### The Problem

ESLint rules can be configured as either `error` (blocking) or `warn` (non-blocking). Some rules like
`max-lines-per-function` are intentionally set to `warn` to allow borderline cases without blocking commits. However,
this creates an enforcement gap where warnings accumulate over time without being addressed.

**Per [ADR-027](../adr/027-code-complexity-standards.md):**

> `max-lines-per-function` is set to `warn` to "encourage extraction without blocking commits for borderline cases."

### The Solution: `--max-warnings 1`

We use ESLint's `--max-warnings` flag in CI to create a "soft limit" that:

- Allows 1 warning (grace period for borderline cases)
- Fails CI if 2+ warnings accumulate (prevents warning debt)

```yaml
# .github/workflows/build.yml
- name: Run linting
  run: npm run lint -- --max-warnings 1
```

### Behavior Matrix

| Warnings | CI Result | Interpretation                          |
| -------- | --------- | --------------------------------------- |
| 0        | Pass      | Ideal state                             |
| 1        | Pass      | Soft limit - acceptable temporarily     |
| 2+       | Fail      | Warning accumulation - must be resolved |

### Why This Approach?

**Flexibility without accumulation:**

- Developers can merge borderline cases (1 warning allowed)
- New warnings beyond the first must be fixed before merge
- Prevents the "broken windows" effect where warnings pile up

**Catches all ESLint warnings generically:**

- Works for any rule set to `warn`
- No need for rule-specific threshold checks
- Simple, maintainable configuration

**Complements SonarCloud:**

ESLint and SonarCloud have different coverage:

| Metric             | ESLint      | SonarCloud |
| ------------------ | ----------- | ---------- |
| Cognitive Complex  | `error` ≤15 | S3776      |
| Cyclomatic         | `error` ≤15 | S2904      |
| Max Nesting Depth  | `error` ≤4  | S2004      |
| **Function Lines** | `warn` ≤150 | None       |
| **Max Params**     | `warn` ≤4   | None       |

SonarCloud has NO equivalent for function length - it uses cognitive complexity instead. The soft warnings approach
ensures ESLint-only rules are still enforced.

## How to Resolve CI Failures

When CI fails due to ESLint warnings exceeding the limit:

1. Run `npm run lint` locally to identify warnings
2. Refactor code to address the warnings (see [Code Complexity Guidelines](../guidelines/code-complexity-guidelines.md))
3. Common refactoring patterns:
   - Extract helper functions/hooks
   - Move constants outside functions
   - Extract utility modules
4. Push fixes and re-run CI

### Example: Function Length Warning

```bash
$ npm run lint

app/hooks/useTodos.ts
  20:1  warning  Function has too many lines (176). Maximum allowed is 150  max-lines-per-function
```

**Resolution:** Extract reusable logic into separate hooks or utility functions.

## Local Development

To check your code against the CI threshold locally:

```bash
# Check with same threshold as CI
npm run lint -- --max-warnings 1

# See all warnings (without failure threshold)
npm run lint
```

## Pre-commit Hooks

Pre-commit hooks run ESLint on staged files. Since hooks don't use `--max-warnings`, warnings won't block local commits.
This is intentional - the CI is the final gate that prevents warning accumulation.

## Related Documentation

- [ADR-027: Code Complexity Standards](../adr/027-code-complexity-standards.md)
- [Code Complexity Guidelines](../guidelines/code-complexity-guidelines.md)
- [ADR-009: Pre-commit Linting Strategy](../adr/009-pre-commit-linting-strategy.md)
