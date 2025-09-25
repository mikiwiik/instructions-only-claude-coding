# Claude Code Instructions

Agent-centric development instructions for instruction-only todo application development.

## Agent Selection Guide

### Specialized Agents

- **Frontend Tasks**: Use frontend-specialist → [docs/agents/frontend-specialist.md](docs/agents/frontend-specialist.md)
- **Testing Work**: Use testing-specialist → [docs/agents/testing-specialist.md](docs/agents/testing-specialist.md)
- **Code Review**: Use quality-assurance → [docs/agents/quality-assurance.md](docs/agents/quality-assurance.md)
- **Documentation**: Use documentation-agent → [docs/agents/documentation-agent.md](docs/agents/documentation-agent.md)

### Multi-Agent Coordination

- **Parallel Execution**: See [docs/agents/coordination-patterns.md](docs/agents/coordination-patterns.md)
- **Complex Features**: Use 2-3 specialized agents for comprehensive implementation

## Framework and Workflows

### Core Development Framework

- **Methodology**: See [docs/core/framework.md](docs/core/framework.md)
- **Git Workflow**: See [docs/core/workflows.md](docs/core/workflows.md)
- **Project Context**: See [docs/core/project-context.md](docs/core/project-context.md)

### Quick Reference

- **ADRs**: Document architectural decisions before implementation
- **TDD**: Tests first, implementation second
- **Atomic Commits**: One logical change per commit with issue linking
- **Feature Branches**: All work via PRs, never direct commits to main

## Task Planning Protocol

**🚨 CRITICAL REQUIREMENT**: Use TodoWrite for non-trivial changes (3+ files, new features, architecture changes).

### Process

1. **Assessment**: Read requirements and identify affected components
2. **Task Breakdown**: Create comprehensive TodoWrite task list
3. **User Approval**: Present plan and wait for confirmation
4. **Implementation**: Track progress with in_progress/completed status
5. **Completion**: Ensure all tasks finished before claiming done

## Quality Standards

### Automated Quality Gates

- **ESLint**: Zero errors/warnings (pre-commit hooks)
- **TypeScript**: Strict mode, no `any` types
- **Prettier**: Consistent formatting (pre-commit hooks)
- **Tests**: TDD approach, comprehensive coverage

### Issue Management

- **Priority Labels**: priority-1-critical through priority-4-low
- **Complexity Labels**: complexity-minimal through complexity-epic
- **Category Labels**: category-feature, category-infrastructure, category-documentation, category-dx
- **Label Guide**: See [docs/reference/labels-and-priorities.md](docs/reference/labels-and-priorities.md)

## Reference Documentation

### Lookup Information

- **Labels & Priorities**: [docs/reference/labels-and-priorities.md](docs/reference/labels-and-priorities.md)
- **Troubleshooting**: [docs/reference/troubleshooting.md](docs/reference/troubleshooting.md)

### Process Documentation

- **ADR Process**: [docs/adr/PROCESS.md](docs/adr/PROCESS.md)
- **IPL Guidelines**: [docs/ipl/README.md](docs/ipl/README.md)

## Project Structure

```text
docs/
├── agents/              # Agent-specific guidelines and coordination
├── core/                # Framework, workflows, project context
├── reference/           # Labels, priorities, troubleshooting
├── adr/                 # Architecture Decision Records
└── ipl/                 # Issue Prompt Logs
```

---

**For detailed information, always reference the specialized documentation linked above.**
**This CLAUDE.md serves as the agent dispatcher and quick reference hub.**
