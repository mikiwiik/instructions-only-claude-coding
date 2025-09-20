# Claude Code Instructions

This file contains specific instructions for Claude Code when working on this Todo App project.

## Architecture Decision Records (ADRs)

**🚨 CRITICAL REQUIREMENT**: All major architectural changes and decisions MUST be documented as ADRs.

**📋 Process Documentation**: See [`docs/adr/PROCESS.md`](docs/adr/PROCESS.md) for complete ADR requirements and guidelines.

### Quick Reference

- **When**: Before any significant technical decision
- **Where**: `docs/adr/###-title.md` using the template
- **What**: Technology choices, architecture patterns, development practices
- **Why**: Maintain project knowledge and decision rationale

### Key Requirements

1. **Create ADR before implementation** - not after
2. **Use sequential numbering** - next available number
3. **Document alternatives considered** - show the thinking process
4. **Update ADR index** - maintain `docs/adr/README.md`
5. **Reference in commits** - link ADRs to related code changes

## Development Guidelines

### Testing Requirements

- **TDD Approach**: Write tests first, then implementation
- **Test Coverage**: Aim for comprehensive coverage of core functionality
- **Testing Strategy**: Unit tests for logic, integration tests for user workflows

### Code Quality

- **TypeScript**: Use strict typing, avoid `any` types
- **ESLint**: Follow established linting rules (automatically enforced via pre-commit hooks)
- **Prettier**: Maintain consistent code formatting (automatically applied via pre-commit hooks)
- **Markdown linting**: Documentation follows consistent formatting standards
- **Pre-commit hooks**: All code is automatically linted and formatted before commit
- **Comments**: Document complex logic and architectural decisions

### Commit Practices

- **Clear messages**: Describe what and why, not just what
- **Reference issues**: Link commits to GitHub issues when applicable
- **ADR updates**: Include ADR updates in relevant commits
- **Issue closure**: Use "Closes #X" or "Fixes #X" in commit messages to automatically close GitHub issues
- **Atomic commits**: Each commit should represent a complete, logical change
- **Co-author attribution**: Always include Claude Code co-authorship in commits

### Push Workflow

- **🚨 CRITICAL**: Always ask user for confirmation before pushing to remote
- **Local commits**: Continue committing locally without confirmation
- **User control**: Only push when user explicitly approves
- **Verify push success**: Confirm changes are visible on GitHub after user approval
- **Update remote tracking**: Ensure local branch tracks remote properly
- **Current branching**: All work is currently done directly on main branch

### Feature Completion Sequence

1. **Complete feature implementation** (write code, tests, documentation)
2. **Run tests and verify functionality** (ensure all tests pass)
3. **Commit changes with issue closure** (local commit with "Closes #X")
4. **🔴 ASK USER**: "Ready to push changes to remote? (y/n)"
5. **Push to remote repository** (only if user confirms)
6. **Verify GitHub issue was automatically closed** (after successful push)

### Push Confirmation Protocol

- **ALWAYS** ask before pushing: "Ready to push [feature name] to remote? This will close Issue #X"
- **NEVER** push without explicit user approval
- **WAIT** for user response before proceeding
- **RESPECT** user's decision if they decline to push
- **EXPLAIN** what will happen when pushing (issue closure, public visibility)

## Project Structure

```text
my-first-claude-code/
├── app/                    # Next.js app directory
│   ├── components/         # React components
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   └── __tests__/         # Component tests
├── docs/                  # Project documentation
│   └── adr/              # Architecture Decision Records
├── public/               # Static assets
├── CLAUDE.md            # This file - Claude Code instructions
├── README.md            # Project documentation
└── package.json         # Dependencies and scripts
```

## Current Architecture Decisions

Refer to existing ADRs in `docs/adr/` for current architectural decisions:

1. **Next.js 14 + App Router** - Web framework choice
2. **TypeScript** - Type safety and developer experience
3. **Tailwind CSS** - Styling approach
4. **Test-Driven Development** - Development methodology
5. **localStorage** - Data persistence strategy
6. **React Testing Library + Jest** - Testing framework
7. **Custom React Hooks** - State management approach
8. **GitHub Issues** - Project management workflow

## Prompt Logging

All Claude Code interactions are logged in `claude-prompts.log` for reference and learning purposes.

---

**Remember**: When in doubt about architectural decisions, create an ADR to document the thought
process and decision rationale. This maintains project knowledge and helps future development.
