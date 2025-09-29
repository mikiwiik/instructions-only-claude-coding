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
7. **🚨 FEATURE BRANCH + PR WORKFLOW**: All work via feature branches and PRs with MANDATORY automerge - NEVER
   direct commits to main - only claim completion AFTER PR merged and verified with `gh issue view #X`
8. **🚨 ADRs BEFORE ARCHITECTURE**: Document significant technical decisions in `docs/adr/` before implementation
9. **🚨 DOCUMENT FOR HUMANS**: Always update README.md and relevant markdown files so humans can understand all
   changes and project evolution
10. **🚨 DOCUMENTATION QUALITY**: Keep all documentation comprehensive, up-to-date, and concise - eliminate outdated
    or verbose content immediately

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

- **Methodology**: [docs/core/framework.md](docs/core/framework.md)
- **Git Workflow**: [docs/core/workflows.md](docs/core/workflows.md)
- **Project Context**: [docs/core/project-context.md](docs/core/project-context.md)

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

**Issue Management**:

- **Priority Labels**: priority-1-critical through priority-4-low
- **Complexity Labels**: complexity-minimal through complexity-epic
- **Category Labels**: category-feature, category-infrastructure, category-documentation, category-dx
- **Label Guide**: [docs/reference/labels-and-priorities.md](docs/reference/labels-and-priorities.md)

## Reference Documentation

- **ADR Process**: [docs/adr/PROCESS.md](docs/adr/PROCESS.md)
- **Troubleshooting**: [docs/reference/troubleshooting.md](docs/reference/troubleshooting.md)
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
