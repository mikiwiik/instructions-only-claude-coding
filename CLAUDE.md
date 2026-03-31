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
6. **🚨 TDD + QUALITY GATES**: Tests first (unit, integration, E2E for user flows), zero ESLint warnings, strict
   TypeScript, comprehensive coverage before completion
   - **E2E-First for User-Facing Features**: Write E2E visibility test BEFORE implementing UI components
   - Prevents "integration gap" where components exist but aren't rendered on the page
   - See [E2E Feature Template](docs/testing/e2e-feature-template.md) for the pattern
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
   - See `docs/adr/PROCESS.md` for complete ADR evolution guidelines and `docs/adr/027-security-scanning-ci-cd-pipeline.md`
     for amendment pattern example
9. **🚨 DOCUMENT FOR HUMANS**: Always update README.md and relevant markdown files so humans can understand all
   changes and project evolution - this includes updating user flow diagrams ([docs/diagrams/user-flows.md](docs/diagrams/user-flows.md))
   when interaction patterns change and architecture docs ([docs/architecture/](docs/architecture/)) when adding new
   hooks, components, or system behaviors
10. **🚨 DOCUMENTATION QUALITY**: Keep all documentation comprehensive, up-to-date, and concise - eliminate outdated
    or verbose content immediately
11. **🚨 PINNED DEPENDENCIES**: All dependencies must use exact versions - see [ADR-037](docs/adr/037-pinned-dependency-policy.md)
    - **New Dependencies**: Always use latest stable version (`npm view <pkg> version` to check)
    - **npm packages**: No `^` or `~` prefixes (e.g., `"react": "19.2.3"` not `"^19.2.3"`)
    - **GitHub Actions**: SHA-pinned with version comment (e.g., `actions/checkout@abc123 # v4`)
    - **Enforcement**: Pre-commit hooks and CI validation block violations
    - **Updates**: Via Dependabot PRs only (manages both npm and github-actions ecosystems)
    - **🚨 NEVER delete package-lock.json**: Always use `npm install` to update incrementally —
      deleting and regenerating drops integrity (SHA) hashes, degrading supply chain security
12. **🚨 PR APPROVAL PROTOCOL**: After creating PR, enable automerge with `--rebase` (mandatory per Principle #7), then
    report status to user - NEVER use `--admin`, `--force`, or bypass flags without explicit permission - task completion
    means PR merged and verified with `gh issue view #X`, NOT just PR created (see [PR Workflow](docs/core/workflows.md#pull-request-workflow))
13. **🚨 REQUIREMENT TRACEABILITY**: All issues/PRs must trace to requirements in
    [docs/product/requirements.md](docs/product/requirements.md) - new issues checked against existing requirements, PRs
    validated against requirements they fulfill

---

## Environment Setup

This project uses Claude Code hooks to automatically initialize nvm for npm commands. The hook is configured in
`.claude/settings.json` and runs on session start via `CLAUDE_ENV_FILE`.

**Manual fallback** (if hooks don't work): `source ~/.nvm/nvm.sh && npm install`

See [ADR-032](docs/adr/032-claude-code-environment-hooks.md) for details.

### GitHub MCP Server

This project uses GitHub's official MCP server for native GitHub API integration in Claude Code. The configuration
is in `.mcp.json` (project scope, shared via git).

**Setup**: Token is passed via a shell alias (`claude` → `GITHUB_PERSONAL_ACCESS_TOKEN="$(gh auth token)" claude`).
See [Local Dev Setup](docs/setup/local-dev-setup.md#github-mcp-server-setup) for details.

See [ADR-038](docs/adr/040-github-mcp-server.md) for the decision record.

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

- **Principles & Methodology**: [docs/core/principles.md](docs/core/principles.md)
- **Git Workflow**: [docs/core/workflows.md](docs/core/workflows.md)
- **Architecture Overview**: [docs/architecture/overview.md](docs/architecture/overview.md)

## Task Planning Protocol

1. **Assessment**: Read requirements and identify affected components
2. **Task Breakdown**: Create comprehensive TodoWrite task list (required for 3+ files, new features, architecture)
3. **User Approval**: Present plan and wait for confirmation
4. **Implementation**: Track progress with in_progress/completed status
5. **Completion**: Ensure all tasks finished before claiming done

## Epic Workflow

For `complexity-complex` or `complexity-epic` issues, propose splitting into an epic with sub-issues:

1. **Recognize scope**: If work spans 3+ related issues or has dependencies, propose an epic structure to the user
2. **Create sub-issues**: Break into focused, independently-deliverable sub-issues with individual complexity labels
3. **Link sub-issues**: Use GraphQL `addSubIssue` mutation (get node IDs first, then link each sub-issue to parent)
4. **Document dependencies**: Use "Depends on #X" format in sub-issue descriptions
5. **Track progress**: Use GitHub Projects sub-issues and Epic Progress view for visibility

See [Working with Epics](docs/development/project-management.md#working-with-epics) for detailed guidance including
[Linking Sub-Issues via API](docs/development/project-management.md#linking-sub-issues-via-api).

## Quality Standards

- **🚨 All Standards**: [docs/core/quality-standards.md](docs/core/quality-standards.md) — thresholds, enforcement, and
  definition of done
- **🚨 Accessibility**: WCAG 2.2 AA required — [docs/ux/accessibility-requirements.md](docs/ux/accessibility-requirements.md)
- **🚨 Code Complexity**: ADR-028 thresholds enforced by ESLint + SonarCloud —
  [docs/adr/028-code-complexity-standards.md](docs/adr/028-code-complexity-standards.md)
- **Issue Management**: [docs/reference/labels-and-priorities.md](docs/reference/labels-and-priorities.md) |
  [docs/development/project-management.md](docs/development/project-management.md)

## Security Workflow

When AI agents encounter potential security issues:

1. **Do not commit** code containing vulnerabilities
2. **Flag immediately** to the human maintainer
3. **Document** the issue privately before proceeding

For vulnerability reports and security incidents, see [Security Workflow](docs/reference/security-workflow.md).

## Reference Documentation

- **Product Requirements**: [docs/product/requirements.md](docs/product/requirements.md)
- **Dev Environment Setup**: [docs/setup/local-dev-setup.md](docs/setup/local-dev-setup.md)
- **Testing Strategy**: [docs/testing/testing-strategy.md](docs/testing/testing-strategy.md)
- **ADR Process**: [docs/adr/PROCESS.md](docs/adr/PROCESS.md)
- **User Flow Diagrams**: [docs/diagrams/user-flows.md](docs/diagrams/user-flows.md)
- **Architecture Flow**: [docs/diagrams/architecture-flow.md](docs/diagrams/architecture-flow.md)
- **Development Workflow**: [docs/diagrams/development-workflow.md](docs/diagrams/development-workflow.md)
- **Troubleshooting**: [docs/reference/troubleshooting.md](docs/reference/troubleshooting.md)
- **Security Workflow**: [docs/reference/security-workflow.md](docs/reference/security-workflow.md)
- **AI Attribution Strategy**: [docs/adr/015-ai-agent-attribution-strategy.md](docs/adr/015-ai-agent-attribution-strategy.md)
- **GitHub Projects Adoption**: [docs/adr/025-github-projects-adoption.md](docs/adr/025-github-projects-adoption.md)

## Project Structure

```text
docs/
├── agents/              # Agent-specific guidelines and coordination
├── core/                # Principles, workflows, quality standards
├── diagrams/            # Mermaid diagrams for architecture and user flows
├── product/             # Product vision and requirements
├── reference/           # Labels, priorities, troubleshooting
├── testing/             # Testing strategy, guidelines, and checklists
└── adr/                 # Architecture Decision Records
```

---

**For detailed information, always reference the specialized documentation linked above.**
**This CLAUDE.md serves as the agent dispatcher and quick reference hub.**
