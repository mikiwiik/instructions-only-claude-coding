# Claude Code Instructions

## 🚨 Essential Guiding Principles

**ALL AGENTS**: Follow defined workflows exactly - ask for clarification in ALL unclear situations before proceeding

1. **🚨 INSTRUCTION-ONLY DEVELOPMENT**: 100% AI implementation via natural language - humans provide strategy, AI handles
   all code execution
2. **🚨 PROFESSIONAL STANDARDS**: Enterprise-quality practices maintained entirely through AI - no manual coding
   intervention
3. **🚨 MANDATORY TodoWrite**: Use TodoWrite for ANY non-trivial task (3+ files, new features, architecture changes) -
   present plan before implementation
4. **🚨 AGENT-CENTRIC WORKFLOW**: Use specialized agents (`frontend-specialist`, `testing-specialist`,
   `quality-assurance`, `documentation-agent`) with 2-4 agents for complex features
5. **🚨 ATOMIC COMMITS + AI ATTRIBUTION**: Multiple small commits per feature, each with `🤖 Generated with AI Agent`
   and co-author attribution - limit bullet lists in commit messages to 2 items maximum to avoid commitlint parser bugs
   (see [Troubleshooting Guide](docs/reference/troubleshooting.md#commitlint-parser-bug))
6. **🚨 TDD + QUALITY GATES**: Tests first, zero ESLint warnings, strict TypeScript, comprehensive coverage before
   completion
7. **🚨 FEATURE BRANCH + PR WORKFLOW**: All work via feature branches and PRs with MANDATORY automerge using `--rebase`
   to preserve atomic commits - NEVER direct commits to main - only claim completion AFTER PR merged and verified with
   `gh issue view #X`
8. **🚨 ADRs BEFORE ARCHITECTURE**: Document significant technical decisions in `docs/adr/` before implementation
   - **ADR Immutability**: Once accepted and merged, ADRs are historical records and MUST NOT be retroactively modified
   - **Architectural Evolution**: Create NEW ADRs to document changes, don't edit existing ones
   - **Acceptable Edits**: Only typos, formatting, broken links, and status field updates
   - **Superseding/Amending**: Use "Status: Superseded by ADR-XXX" or "Amended by ADR-XXX" for architectural changes
   - **Verification Required**: Always run `./scripts/validate-adrs.sh` and check `ls docs/adr/0*.md | sort` before
     creating new ADRs
   - See `docs/adr/PROCESS.md` for complete ADR evolution guidelines and `docs/adr/026-security-scanning-ci-cd-pipeline.md`
     for amendment pattern example
9. **🚨 DOCUMENT FOR HUMANS**: Always update README.md and relevant markdown files so humans can understand all
   changes and project evolution - this includes updating user flow diagrams ([docs/diagrams/user-flows.md](docs/diagrams/user-flows.md))
   when interaction patterns change
10. **🚨 DOCUMENTATION QUALITY**: Keep all documentation comprehensive, up-to-date, and concise - eliminate outdated
    or verbose content immediately
11. **🚨 PINNED DEPENDENCIES**: All dependencies must use exact versions without range operators (`^`, `~`) for maximum
    security control, reproducible builds, and clear audit trails - updates via Dependabot PRs only
12. **🚨 PR APPROVAL PROTOCOL**: After creating PR, enable automerge with `--rebase` (mandatory per Principle #7), then
    report status to user - NEVER use `--admin`, `--force`, or bypass flags without explicit permission - task completion
    means PR merged and verified with `gh issue view #X`, NOT just PR created (see [PR Workflow](docs/core/workflows.md#pull-request-workflow))

---

Agent-centric development instructions for instruction-only todo application development.

## Agent Selection Guide

**Custom Project Agents** (configured in `.claude/agents/`):

- **Frontend**: `frontend-specialist` - React/TypeScript/Tailwind ([docs/agents/frontend-specialist.md](docs/agents/frontend-specialist.md))
- **Testing**: `testing-specialist` - TDD/React Testing Library ([docs/agents/testing-specialist.md](docs/agents/testing-specialist.md))
- **Quality**: `quality-assurance` - Code review/standards ([docs/agents/quality-assurance.md](docs/agents/quality-assurance.md))
- **Documentation**: `documentation-agent` - README/ADR updates ([docs/agents/documentation-agent.md](docs/agents/documentation-agent.md))

**Usage**: Agents have specialized prompts, tool restrictions, and coordination patterns optimized for todo application development.

**Complex Features**: Use 2-4 specialized agents with [coordination patterns](docs/agents/coordination-patterns.md).

## Framework and Workflows

- **Core Principles**: [docs/core/principles.md](docs/core/principles.md)
- **Methodology**: [docs/core/framework.md](docs/core/framework.md)
- **Git Workflow**: [docs/core/workflows.md](docs/core/workflows.md)
- **Architecture Overview**: [docs/architecture/overview.md](docs/architecture/overview.md)

## Task Planning Protocol

1. **Assessment**: Read requirements and identify affected components
2. **Task Breakdown**: Create comprehensive TodoWrite task list (required for 3+ files, new features, architecture)
3. **User Approval**: Present plan and wait for confirmation
4. **Implementation**: Track progress with in_progress/completed status
5. **Completion**: Ensure all tasks finished before claiming done

## Quality Standards

**Accessibility Requirements**:

- **🚨 WCAG 2.2 AA Compliance**: All implementations must meet WCAG 2.2 AA standards
- **Comprehensive Guide**: [docs/guidelines/accessibility-requirements.md](docs/guidelines/accessibility-requirements.md)
- **Key Requirements**: 44px touch targets, proper ARIA, keyboard navigation, screen reader support
- **Testing**: Accessibility tests required for all interactive components
- **Definition of Done**: Accessibility checklist mandatory in [project-management.md](docs/development/project-management.md)

**Code Complexity Standards**:

- **🚨 ADR-027 Compliance**: All code must meet complexity thresholds defined in [ADR-027](docs/adr/027-code-complexity-standards.md)
- **Cognitive Complexity**: ≤15 per function (enforced by ESLint + SonarCloud)
- **Nesting Depth**: ≤4 levels (enforced by ESLint `max-depth`)
- **Cyclomatic Complexity**: ≤15 per function (enforced by ESLint `complexity`)
- **Refactoring Patterns**: [docs/guidelines/code-complexity-guidelines.md](docs/guidelines/code-complexity-guidelines.md)
- **Pre-commit Enforcement**: ESLint blocks commits with complexity violations
- **Definition of Done**: Zero complexity ESLint errors required for PR approval

**Issue Management**:

- **Priority Labels**: priority-1-critical through priority-4-low
- **Complexity Labels**: complexity-minimal through complexity-epic
- **Category Labels**: category-feature, category-infrastructure, category-documentation, category-dx
- **Status Progression**: Icebox → Backlog → In Progress → Done (GitHub Projects)
- **Label Guide**: [docs/reference/labels-and-priorities.md](docs/reference/labels-and-priorities.md)
- **Project Management**: [docs/development/project-management.md](docs/development/project-management.md)
- **GitHub Projects Setup**: [docs/development/github-projects-setup.md](docs/development/github-projects-setup.md)

## Reference Documentation

- **Dev Environment Setup**: [docs/development/dev-environment-setup.md](docs/development/dev-environment-setup.md)
- **ADR Process**: [docs/adr/PROCESS.md](docs/adr/PROCESS.md)
- **User Flow Diagrams**: [docs/diagrams/user-flows.md](docs/diagrams/user-flows.md)
- **Architecture Flow**: [docs/diagrams/architecture-flow.md](docs/diagrams/architecture-flow.md)
- **Development Workflow**: [docs/diagrams/development-workflow.md](docs/diagrams/development-workflow.md)
- **Troubleshooting**: [docs/reference/troubleshooting.md](docs/reference/troubleshooting.md)
- **AI Attribution Strategy**: [docs/adr/015-ai-agent-attribution-strategy.md](docs/adr/015-ai-agent-attribution-strategy.md)
- **GitHub Projects Adoption**: [docs/adr/024-github-projects-adoption.md](docs/adr/024-github-projects-adoption.md)

## Project Structure

```text
docs/
├── agents/              # Agent-specific guidelines and coordination
├── core/                # Framework, workflows, project context
├── diagrams/            # Mermaid diagrams for architecture and user flows
├── reference/           # Labels, priorities, troubleshooting
└── adr/                 # Architecture Decision Records
```

---

**For detailed information, always reference the specialized documentation linked above.**
**This CLAUDE.md serves as the agent dispatcher and quick reference hub.**
