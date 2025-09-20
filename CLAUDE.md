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

### Atomic Commit Guidelines

**🔀 REQUIREMENT**: All code changes must follow atomic commit practices for improved code history, review, and debugging.

**📋 Full Guidelines**: See [`docs/guidelines/atomic-commits.md`](docs/guidelines/atomic-commits.md) for
comprehensive commit strategy and workflow details.

#### Atomic Commit Principles

- **One Logical Change**: Each commit represents a single, focused change
- **Self-Contained**: Every commit maintains a working state
- **Clear Purpose**: Commit message clearly explains the specific change
- **Issue Linking**: Reference related issue number in each commit

#### Conventional Commit Format

Use standardized commit message format:

```text
type(scope): description (#issue-number)

Optional body explaining the change in detail

Optional footer for breaking changes or issue closure
```

**Commit Types:**

- **feat**: New features
- **fix**: Bug fixes
- **test**: Adding or updating tests
- **docs**: Documentation updates
- **refactor**: Code refactoring without behavior changes
- **style**: Code style changes (formatting, missing semicolons)
- **chore**: Maintenance tasks (dependency updates, build changes)

#### Issue Linking Strategy

**Individual Commits:** Reference issue in each commit

```bash
git commit -m "feat(todo): add completedAt field to TodoItem interface (#33)"
git commit -m "test(todo): add timestamp tracking tests (#33)"
git commit -m "docs(todo): update README with completion feature (#33)"
```

**Final Commit:** Close issue with comprehensive summary

```bash
git commit -m "feat: complete todo completion timestamp tracking

Implements full completion timestamp functionality including:
- Data model updates with completedAt field
- State management for timestamp capture
- UI component for displaying completion history
- Comprehensive test coverage

Closes #33"
```

#### TDD Commit Pattern

Follow test-driven development commit sequence:

```bash
git commit -m "test: add failing test for feature X (#issue)"
git commit -m "feat: implement basic feature X functionality (#issue)"
git commit -m "refactor: extract utility functions for feature X (#issue)"
git commit -m "test: add edge cases for feature X (#issue)"
```

#### Development Workflow Integration

1. **Planning**: Break feature into logical atomic changes
2. **Implementation**: Make focused commits throughout development
3. **Testing**: Separate commits for test additions and updates
4. **Documentation**: Document changes in dedicated commits
5. **Integration**: Final commit summarizes and closes issue

#### Code Review Benefits

- **Focused Review**: Each commit addresses single concern
- **Logical Progression**: Reviewers follow development thinking
- **Selective Feedback**: Comments target specific changes
- **Rollback Precision**: Revert specific changes without losing others

#### Quality Assurance

- **Working State**: Each commit maintains compilation and basic functionality
- **Commit Size**: Prefer smaller, focused commits over large changes
- **Message Quality**: Clear, descriptive commit messages
- **Traceability**: Direct link from code changes to requirements

### Legacy Commit Practices

- **Co-author attribution**: Always include Claude Code co-authorship in commits
- **ADR updates**: Include ADR updates in relevant commits when applicable

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

### Documentation Maintenance

- **README Updates**: When implementing significant features or architectural changes, update README.md to reflect new
  capabilities and project status
- **Keep Purpose Clear**: Maintain the educational focus and learning objectives in documentation
- **Project Evolution**: Update project description as new features are added
- **Learning Context**: Ensure documentation supports the educational mission of the project

### Priority System Integration

**🏷️ REQUIREMENT**: All GitHub issues must be assigned appropriate priority labels for effective project management.

**📋 Full Guidelines**: See [`docs/guidelines/priority-system.md`](docs/guidelines/priority-system.md) for
comprehensive priority assessment criteria and workflows.

#### Quick Reference

- **priority-1-critical** 🔴: Blocking issues, immediate attention required
- **priority-2-high** 🟠: Important features, current sprint priority
- **priority-3-medium** 🟡: Standard features, next sprint scheduling
- **priority-4-low** 🟢: Nice-to-have features, backlog items

### Complexity-Based Effort Estimation

**🎯 REQUIREMENT**: All GitHub issues must be assigned complexity labels to enable accurate effort estimation in
Claude Code development.

**📋 Full Guidelines**: See [`docs/guidelines/complexity-estimation.md`](docs/guidelines/complexity-estimation.md)
for detailed complexity assessment criteria and development workflows.

#### Quick Reference

- **complexity-minimal** 🟢: Single file changes, quick fixes
- **complexity-simple** 🔵: Basic features, straightforward logic
- **complexity-moderate** 🟡: Multi-component changes, state management
- **complexity-complex** 🟠: Architecture changes, system design
- **complexity-epic** 🔴: Major overhauls, breaking changes

#### Combined Usage

Always assign both priority and complexity labels to enable effective planning:

- **High Priority + Low Complexity**: Quick wins and urgent fixes
- **High Priority + High Complexity**: Major features requiring immediate attention
- **Low Priority + Low Complexity**: Good filler work and maintenance tasks
- **Low Priority + High Complexity**: Learning opportunities and future preparation

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
