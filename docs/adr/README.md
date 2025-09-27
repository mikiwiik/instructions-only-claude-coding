# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for the Todo App project.
ADRs document important architectural decisions, their context, and consequences.

## What are ADRs?

Architecture Decision Records (ADRs) are short text documents that capture important architectural
decisions made during the project development. They help maintain a clear history of technical choices
and their rationale.

## ADR Format

Each ADR follows this structure:

- **Title**: Brief description of the decision
- **Status**: Proposed, Accepted, Deprecated, or Superseded
- **Context**: Situation requiring a decision
- **Decision**: What was chosen
- **Consequences**: Positive and negative outcomes

## Index of ADRs

| Number                                      | Title                                           | Status   | Date       |
| ------------------------------------------- | ----------------------------------------------- | -------- | ---------- |
| [001](001-nextjs-app-router.md)             | Use Next.js 14 with App Router                  | Accepted | 2025-09-20 |
| [002](002-typescript-adoption.md)           | Choose TypeScript for type safety               | Accepted | 2025-09-20 |
| [003](003-tailwind-css-styling.md)          | Select Tailwind CSS for styling                 | Accepted | 2025-09-20 |
| [004](004-test-driven-development.md)       | Implement Test-Driven Development approach      | Accepted | 2025-09-20 |
| [005](005-localstorage-persistence.md)      | Use localStorage for data persistence           | Accepted | 2025-09-20 |
| [006](006-testing-framework-choice.md)      | Choose React Testing Library + Jest for testing | Accepted | 2025-09-20 |
| [007](007-state-management-approach.md)     | Use custom hooks for state management           | Accepted | 2025-09-20 |
| [008](008-github-issues-workflow.md)        | GitHub Issues for project management            | Accepted | 2025-09-20 |
| [009](009-pre-commit-linting-strategy.md)   | Pre-commit linting strategy                     | Accepted | 2025-09-20 |
| [010](010-atomic-commit-strategy.md)        | Atomic commit strategy adoption                 | Accepted | 2025-09-20 |
| [011](011-github-actions-ci-cd.md)          | GitHub Actions for CI/CD Pipeline               | Accepted | 2025-09-20 |
| [012](012-todo-reordering-ux-approach.md)   | Todo Reordering UX Approach                     | Accepted | 2025-09-20 |
| [015](015-ai-agent-attribution-strategy.md) | AI Agent Attribution Strategy                   | Accepted | 2025-09-27 |

## Creating New ADRs

1. Use the [template](template.md) as a starting point
2. Number the ADR sequentially (next available number)
3. Use descriptive kebab-case filename: `###-decision-title.md`
4. Update this README index table
5. Follow the established format for consistency

## Process

**📋 Complete Process Documentation**: See [PROCESS.md](PROCESS.md) for detailed ADR requirements and guidelines.

- All major architectural decisions should be documented as ADRs
- ADRs should be created when making significant technical choices
- ADRs are immutable once accepted (create new ADR to supersede)
- All team members should review proposed ADRs before acceptance
