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
| Cognitive complexity   | ≤15 per function | ESLint error    | [ADR-027](../adr/027-code-complexity-standards.md)                |
| Nesting depth          | ≤4 levels        | ESLint error    | [ADR-027](../adr/027-code-complexity-standards.md)                |
| Cyclomatic complexity  | ≤15 per function | ESLint error    | [ADR-027](../adr/027-code-complexity-standards.md)                |
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

### Code Quality Metrics

| Metric               | Target        | Measurement              | Tool                |
| -------------------- | ------------- | ------------------------ | ------------------- |
| TypeScript coverage  | 100%          | Strict mode, no `any`    | ESLint              |
| Test line coverage   | 80%+          | `npm test -- --coverage` | Jest                |
| Test branch coverage | 75%+          | `npm test -- --coverage` | Jest                |
| ESLint violations    | 0             | `npm run lint`           | ESLint              |
| Cognitive complexity | ≤15           | Per function             | SonarCloud + ESLint |
| Technical debt       | ≤30 min/issue | SonarCloud analysis      | SonarCloud          |

### Accessibility Metrics

| Metric              | Target                 | Measurement       | Tool                   |
| ------------------- | ---------------------- | ----------------- | ---------------------- |
| Touch target size   | ≥44px                  | Visual inspection | Manual + tests         |
| Color contrast      | 4.5:1 (text), 3:1 (UI) | WCAG guidelines   | axe DevTools           |
| Keyboard navigation | 100% accessible        | Manual testing    | Screen readers         |
| ARIA compliance     | Complete               | ESLint a11y rules | eslint-plugin-jsx-a11y |

### Process Metrics

| Metric          | Target    | Measurement    |
| --------------- | --------- | -------------- |
| CI pass rate    | 95%+      | GitHub Actions |
| PR review time  | <24 hours | GitHub metrics |
| Bug escape rate | Minimal   | Issue tracking |

## Quality Assurance Process

### Pre-Development

1. **Requirements Review**: Verify issue has clear acceptance criteria
2. **Task Planning**: Break down with TodoWrite for non-trivial changes
3. **Design Review**: Consider accessibility and complexity upfront

### During Development

1. **TDD Approach**: Write failing tests before implementation
2. **Incremental Commits**: Small, atomic commits with clear messages
3. **Local Validation**: Run quality checks before committing

**Pre-Commit Checklist**:

```bash
npm run lint          # Zero errors/warnings
npm run type-check    # TypeScript validation
npm test              # All tests passing
```

### Post-Development

1. **Code Review**: PR review with quality checklist
2. **CI Validation**: Automated checks must pass
3. **Documentation**: Update docs if behavior changes

### Continuous

1. **SonarCloud Analysis**: Automated code quality analysis on PRs
2. **Dependency Updates**: Dependabot PRs for security updates
3. **Technical Debt Tracking**: Monitor and address accumulated debt

## Tooling and Automation

### Local Development

| Tool        | Purpose                  | Configuration       |
| ----------- | ------------------------ | ------------------- |
| ESLint      | Code linting, complexity | `eslint.config.mjs` |
| Prettier    | Code formatting          | `.prettierrc`       |
| TypeScript  | Type checking            | `tsconfig.json`     |
| Husky       | Git hooks                | `.husky/`           |
| lint-staged | Pre-commit validation    | `package.json`      |

### CI/CD Pipeline

| Tool           | Purpose                | Workflow                      |
| -------------- | ---------------------- | ----------------------------- |
| GitHub Actions | CI/CD automation       | `.github/workflows/build.yml` |
| Jest           | Unit/integration tests | `npm test`                    |
| Playwright     | E2E tests              | `npm run test:e2e`            |
| SonarCloud     | Code quality analysis  | PR analysis                   |

### IDE Integration

| Tool               | Purpose                    | Reference                                          |
| ------------------ | -------------------------- | -------------------------------------------------- |
| SonarLint          | Real-time quality feedback | [SonarLint Setup](../setup/sonarlint-ide-setup.md) |
| ESLint extension   | In-editor linting          | VS Code marketplace                                |
| Prettier extension | Auto-formatting            | VS Code marketplace                                |

## Quality Standards Index

Detailed implementation guides for each quality area:

### Type Safety

- **ADR**: [ADR-022: Strict TypeScript Type Safety](../adr/022-strict-typescript-type-safety.md)
- **Guide**: [TypeScript Standards](../guidelines/typescript-standards.md)
- **Enforcement**: ESLint `@typescript-eslint/no-explicit-any` as error

### Code Complexity

- **ADR**: [ADR-027: Code Complexity Standards](../adr/027-code-complexity-standards.md)
- **Guide**: [Code Complexity Guidelines](../guidelines/code-complexity-guidelines.md)
- **Enforcement**: ESLint `complexity`, `max-depth`, SonarCloud

### Accessibility

- **Guide**: [Accessibility Requirements](../ux/accessibility-requirements.md)
- **Testing**: [Accessibility Testing](../testing/accessibility-testing.md)
- **Enforcement**: ESLint jsx-a11y plugin, manual testing

### Documentation

- **Guide**: [Documentation Standards](../guidelines/documentation-standards.md)
- **ADR Process**: [ADR Process](../adr/PROCESS.md)
- **Enforcement**: Code review

### Testing

- **Strategy**: [Testing Strategy](../testing/testing-strategy.md)
- **E2E Guide**: [E2E Testing Guide](../testing/e2e-testing-guide.md)
- **Enforcement**: CI coverage thresholds

## Quality Enforcement

See [Workflows](workflows.md) for detailed pre-commit and CI/CD gate configuration.

**Summary**: Pre-commit hooks (Husky + lint-staged) enforce ESLint, Prettier, TypeScript, and complexity rules.
CI pipeline validates build, lint, type-check, tests, and coverage thresholds.

### Code Review Checklist

Reviewers verify:

- [ ] Code meets complexity standards (ADR-027)
- [ ] TypeScript types are correct (no `any`)
- [ ] Tests cover new functionality
- [ ] Accessibility requirements met
- [ ] Documentation updated if needed
- [ ] No security vulnerabilities introduced

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
