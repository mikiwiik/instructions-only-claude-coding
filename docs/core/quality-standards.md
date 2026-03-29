# Quality Standards

This document is the authoritative reference for all quality standards in the project.

## The Fundamental Principle: Explicit and Verifiable Behavior

**Quality means behavior is known, documented, and verified.**

Before technical metrics matter, the system must have:

| Element          | Purpose                         | Location                                      |
| ---------------- | ------------------------------- | --------------------------------------------- |
| **Requirements** | Define WHAT we're building      | [requirements.md](../product/requirements.md) |
| **Issues**       | Trace work to requirements      | GitHub Issues                                 |
| **ADRs**         | Explain WHY decisions were made | [docs/adr/](../adr/)                          |
| **Tests**        | Verify behavior matches intent  | `app/__tests__/`                              |
| **PRs**          | Link changes to issues          | GitHub PRs with "Closes #X"                   |

**The Traceability Chain**:

```text
Requirement → Issue → PR → Code → Test → Verified Behavior
```

Technical quality standards (complexity, coverage, linting) exist to keep this chain **maintainable and trustworthy**.
Without explicit requirements and tests, code metrics are meaningless.

## Quality Philosophy

### Core Principles

1. **Explicit Over Implicit**: Document behavior, don't assume it
2. **Quality First**: Quality is non-negotiable, not a trade-off against velocity
3. **Prevention Over Detection**: Catch issues at development time, not in production
4. **Automation**: Enforce standards through tooling, not manual review

### Quality vs. Velocity

This project prioritizes sustainable velocity through quality:

- **Short-term**: Enforcement may slow initial implementation
- **Long-term**: Fewer bugs, easier maintenance, faster feature development
- **Trade-off**: We invest upfront in quality to reduce long-term costs

## Standards Hierarchy

Quality standards are prioritized by impact and enforcement level:

### Critical (P1) - Errors Block Commits/Builds

| Standard               | Threshold        | Enforcement     | Reference                                                         |
| ---------------------- | ---------------- | --------------- | ----------------------------------------------------------------- |
| TypeScript strict mode | No `any` types   | ESLint error    | [ADR-022](../adr/022-strict-typescript-type-safety.md)            |
| Cognitive complexity   | ≤15 per function | ESLint error    | [ADR-028](../adr/028-code-complexity-standards.md)                |
| Nesting depth          | ≤4 levels        | ESLint error    | [ADR-028](../adr/028-code-complexity-standards.md)                |
| Cyclomatic complexity  | ≤15 per function | ESLint error    | [ADR-028](../adr/028-code-complexity-standards.md)                |
| Accessibility          | WCAG 2.2 AA      | ESLint + manual | [Accessibility Requirements](../ux/accessibility-requirements.md) |

### High (P2) - Required for PR Approval

| Standard               | Threshold          | Enforcement     | Reference                                          |
| ---------------------- | ------------------ | --------------- | -------------------------------------------------- |
| Test coverage          | 80%+ line coverage | CI check        | [Testing Strategy](../testing/testing-strategy.md) |
| Critical path coverage | 100%               | Code review     | [Workflows](workflows.md)                          |
| ESLint                 | Zero warnings      | Pre-commit hook | [Workflows](workflows.md)                          |
| Prettier formatting    | Consistent         | Pre-commit hook | [Workflows](workflows.md)                          |

### Medium (P3) - Recommended Best Practices

| Standard            | Threshold  | Enforcement    | Reference                                                           |
| ------------------- | ---------- | -------------- | ------------------------------------------------------------------- |
| Function length     | ≤150 lines | ESLint warning | [Code Complexity](../guidelines/code-complexity-guidelines.md)      |
| Function parameters | ≤4 params  | ESLint warning | [Code Complexity](../guidelines/code-complexity-guidelines.md)      |
| Documentation       | Up-to-date | Code review    | [Documentation Standards](../guidelines/documentation-standards.md) |

### Low (P4) - Quality Enhancements

| Standard    | Threshold        | Enforcement  | Reference     |
| ----------- | ---------------- | ------------ | ------------- |
| Performance | Optimal patterns | Code review  | Manual review |
| Bundle size | Reasonable       | Manual check | Manual review |

## Quality Metrics

| Metric               | Target                 | Tool                |
| -------------------- | ---------------------- | ------------------- |
| Test line coverage   | 80%+                   | Jest                |
| Test branch coverage | 75%+                   | Jest                |
| Cognitive complexity | ≤15 per function       | SonarCloud + ESLint |
| Technical debt       | ≤30 min/issue          | SonarCloud          |
| Color contrast       | 4.5:1 (text), 3:1 (UI) | axe DevTools        |
| Touch target size    | ≥44px                  | Manual + tests      |
| CI pass rate         | 95%+                   | GitHub Actions      |

## Quality Enforcement

Pre-commit hooks (Husky + lint-staged) enforce ESLint, Prettier, TypeScript, and complexity rules.
CI pipeline validates build, lint, type-check, tests, and coverage thresholds.

For detailed gate configuration and commands, see [Workflows](workflows.md#quality-gates).
For tooling setup, see [Local Dev Setup](../setup/local-dev-setup.md).

## Definition of Done

A task is complete when:

1. **Code Quality**:
   - [ ] Zero ESLint errors or warnings
   - [ ] TypeScript strict mode compliance
   - [ ] Complexity thresholds met

2. **Testing**:
   - [ ] Unit tests for new functionality
   - [ ] Integration tests for component interactions
   - [ ] E2E tests for user flows (when applicable)
   - [ ] Coverage thresholds maintained

3. **Accessibility**:
   - [ ] WCAG 2.2 AA compliance verified
   - [ ] Keyboard navigation works
   - [ ] Touch targets meet size requirements

4. **Documentation**:
   - [ ] Code is self-documenting or has necessary comments
   - [ ] README/docs updated if behavior changes
   - [ ] ADR created for architectural decisions

5. **Process**:
   - [ ] PR created and approved
   - [ ] CI checks passing
   - [ ] Issue closed via PR merge

## Quality Commands

```bash
# Full validation
npm run lint && npm run type-check && npm test && npm run build

# Coverage report
npm test -- --coverage
```

See [Workflows](workflows.md#quality-commands) for complete command reference.

## Related Documentation

- **Development Workflow**: [workflows.md](workflows.md)
- **Project Management**: [project-management.md](../development/project-management.md)
- **Troubleshooting**: [troubleshooting.md](../reference/troubleshooting.md)

---

**Quality is everyone's responsibility.** This document defines the standards; enforcement is automated where possible
and verified through code review for everything else.
