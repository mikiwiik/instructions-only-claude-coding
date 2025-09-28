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
   and co-author attribution
6. **🚨 TDD + QUALITY GATES**: Tests first, zero ESLint warnings, strict TypeScript, comprehensive coverage before
   completion
7. **🚨 FEATURE BRANCH + PR WORKFLOW**: All work via feature branches and PRs - NEVER direct commits to main - only
   claim completion AFTER PR merged and verified with `gh issue view #X`
8. **🚨 ADRs BEFORE ARCHITECTURE**: Document significant technical decisions in `docs/adr/` before implementation
9. **🚨 DOCUMENT FOR HUMANS**: Always update README.md and relevant markdown files so humans can understand all
   changes and project evolution
10. **🚨 DOCUMENTATION QUALITY**: Keep all documentation comprehensive, up-to-date, and concise - eliminate outdated
    or verbose content immediately

---

Agent-centric development instructions for instruction-only todo application development.

## Agent Selection Guide

### Specialized Agents

**Custom Project Agents** (configured in `.claude/agents/`):

- **Frontend Tasks**: Use `frontend-specialist` for React components, TypeScript interfaces, Tailwind styling
- **Testing Work**: Use `testing-specialist` for TDD, React Testing Library, Jest, comprehensive coverage
- **Code Review**: Use `quality-assurance` for linting, type checking, security, performance analysis
- **Documentation**: Use `documentation-agent` for README updates, ADRs, inline documentation

**Usage**: Custom agents are configured in YAML files under `.claude/agents/` directory. Each agent has specialized
system prompts, tool restrictions, and coordination patterns optimized for our todo application development.

### Agent Configuration

**Custom Agent Files**:

- `.claude/agents/frontend-specialist.yaml` - React/TypeScript/Tailwind specialist
- `.claude/agents/testing-specialist.yaml` - TDD/Testing specialist
- `.claude/agents/quality-assurance.yaml` - Code review/Quality specialist
- `.claude/agents/documentation-agent.yaml` - Documentation specialist

**Agent Features**:

- **Specialized Prompts**: Domain-specific expertise for todo application development
- **Tool Restrictions**: Security-focused tool access appropriate for each role
- **Coordination Patterns**: Defined workflows for agent collaboration
- **Project Context**: Understanding of Next.js 14, TypeScript, Tailwind, React Testing Library

### Multi-Agent Coordination

- **Coordination Patterns**: See [docs/agents/coordination-patterns.md](docs/agents/coordination-patterns.md) for workflows
- **Agent Documentation**: Individual agent guides in [docs/agents/](docs/agents/) directory
- **Complex Features**: Use 2-4 specialized agents for comprehensive implementation

**Quick Reference**:

- [frontend-specialist.md](docs/agents/frontend-specialist.md) - React/TypeScript/Tailwind guidance
- [testing-specialist.md](docs/agents/testing-specialist.md) - TDD and testing patterns
- [quality-assurance.md](docs/agents/quality-assurance.md) - Code review and standards
- [documentation-agent.md](docs/agents/documentation-agent.md) - Documentation best practices

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
- **AI Attribution**: All AI-assisted work must use dedicated agent account with proper attribution

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
- **AI Attribution Strategy**: [docs/adr/015-ai-agent-attribution-strategy.md](docs/adr/015-ai-agent-attribution-strategy.md)

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
