# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for the Todo App project.
ADRs document important architectural decisions, their context, and consequences.

## What are ADRs?

Architecture Decision Records (ADRs) are short text documents that capture important architectural
decisions made during the project development. They help maintain a clear history of technical choices
and their rationale.

## Naming Convention

See [PROCESS.md](PROCESS.md#naming-convention) for detailed naming convention guidelines.

## ADR Format

Each ADR follows this structure:

- **Title**: Brief description of the decision
- **Status**: Proposed, Accepted, Deprecated, or Superseded
- **Context**: Situation requiring a decision
- **Decision**: What was chosen
- **Consequences**: Positive and negative outcomes

## Creating New ADRs

1. Use the [template](template.md) as a starting point
2. Number the ADR sequentially (next available number)
3. Use descriptive kebab-case filename: `###-decision-title.md`
4. Follow the established format for consistency

## Process

**📋 Complete Process Documentation**: See [PROCESS.md](PROCESS.md) for detailed ADR requirements and guidelines.

- All major architectural decisions should be documented as ADRs
- ADRs should be created when making significant technical choices
- ADRs are immutable once accepted (create new ADR to supersede)
- All team members should review proposed ADRs before acceptance

## ADR Index

| #                                              | Title                                | Status               | Date    |
| ---------------------------------------------- | ------------------------------------ | -------------------- | ------- |
| [001](001-nextjs-app-router.md)                | Use Next.js 14 with App Router       | Accepted             | 2025-01 |
| [012](012-todo-reordering-ux-approach.md)      | Todo Reordering UX Approach          | Partially Superseded | 2025-01 |
| [015](015-ai-agent-attribution-strategy.md)    | AI Agent Attribution Strategy        | Accepted             | 2025-01 |
| [020](020-react-nextjs-version-constraints.md) | React/Next.js Version Constraints    | Accepted             | 2025-01 |
| [021](021-pragmatic-drag-drop-migration.md)    | Migration to Pragmatic Drag and Drop | Accepted             | 2025-10 |

> **Note**: This is a summary index. See individual ADR files for complete documentation.
