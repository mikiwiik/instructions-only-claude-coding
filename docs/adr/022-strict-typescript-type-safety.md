# ADR-022: Strict TypeScript Type Safety Enforcement

## Status

Accepted

## Context

After adopting TypeScript (ADR-002), we configured ESLint to warn on explicit `any` types. However, PR #241 demonstrated that warnings are insufficient for maintaining type safety:

1. Commit 58efa73 introduced `any` types in test mocks to quickly fix coverage issues
2. ESLint warnings were visible but non-blocking in pre-commit hooks
3. CI passed because warnings don't fail builds
4. Code review caught the issue, requiring cleanup commit a41db44

**Core Problem**: Using `any` defeats TypeScript's value proposition of compile-time type safety. Warnings allow shortcuts that create technical debt and undermine the benefits of TypeScript adoption.

**Pattern Observed**:
```
Coverage failure → Pressure to fix quickly → any types as shortcut →
Warning (non-blocking) → Pre-commit passes → CI passes →
Manual code review catches → Follow-up fix required
```

This pattern demonstrates that warnings are too permissive for a fundamental type safety principle.

## Decision

Enforce strict TypeScript type safety by treating explicit `any` types as ESLint errors instead of warnings:

**Configuration Change** (`eslint.config.mjs`):
```javascript
'@typescript-eslint/no-explicit-any': 'error',  // Previously 'warn'
```

**Enforcement Scope**:
- All TypeScript/JavaScript files (production and test code)
- Pre-commit hooks will block commits containing `any`
- CI builds will fail if `any` types are introduced
- No exceptions for test code (tests must maintain same quality standards)

**Approved Alternatives** (instead of `any`):
- `unknown` - for truly unknown types (requires type guards)
- Proper interfaces - define actual structure
- Generics - for reusable type-safe code
- `Record<string, unknown>` - for object maps
- Type guards - for runtime type checking
- `// @ts-expect-error` with justification comment - explicit escape hatch

## Consequences

### Positive

- **Prevents type safety bypasses** - `any` cannot be accidentally committed
- **Catches errors earlier** - Type issues surface at development time, not code review
- **Reduces technical debt** - No follow-up commits needed to fix rushed implementations
- **Maintains TypeScript benefits** - Full type checking enforced throughout codebase
- **Equal quality standards** - Test code held to same rigor as production code
- **Faster code reviews** - Reviewers don't need to catch type safety issues
- **Better documentation** - Proper types serve as inline documentation

### Negative

- **Requires more initial effort** - Developers must define proper types instead of using `any`
- **Learning curve** - Team must learn TypeScript patterns for complex scenarios
- **Occasional friction** - Some edge cases require more thought to type correctly
- **Migration overhead** - If `any` types existed, they would need fixing before enforcement

### Neutral

- **Aligns with industry best practices** - Strict TypeScript is recommended standard
- **Consistent with ADR-002** - Logical extension of TypeScript adoption decision
- **Documentation support needed** - TypeScript standards guide helps team adapt
- **Escape hatch available** - `@ts-expect-error` allows explicit, justified exceptions

## Alternatives Considered

- **Keep warnings only**: Rejected - demonstrated to be insufficient in PR #241
- **Error in production, warn in tests**: Rejected - tests must maintain same quality standards
- **Allow any in specific directories**: Rejected - creates inconsistent quality standards
- **Manual code review enforcement**: Rejected - automation prevents errors more reliably
- **Gradual enforcement with exception list**: Rejected - codebase already clean, no migration needed

## References

- ADR-002: TypeScript Adoption (foundation decision)
- ADR-004: Test-Driven Development (test quality standards)
- ADR-009: Pre-commit linting strategy (enforcement mechanism)
- PR #241: Pragmatic drag-and-drop migration (motivating incident)
- Commit 58efa73: Example of `any` types introduced under pressure
- Commit a41db44: Required cleanup of `any` types
- [TypeScript Handbook - Type Checking](https://www.typescriptlang.org/docs/handbook/2/basic-types.html#any)
- [ESLint TypeScript Rules](https://typescript-eslint.io/rules/no-explicit-any/)
- `docs/guidelines/typescript-standards.md`: Comprehensive TypeScript best practices guide
