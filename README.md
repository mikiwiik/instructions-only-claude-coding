# Todo App - My First Claude Code Project

## Project Purpose

This Todo application serves as a **learning platform** for Claude Code development workflows and modern web
development practices. The primary goal is to demonstrate AI-assisted coding, TDD methodology, and collaborative
development patterns.

### Learning Objectives

- **Claude Code Collaboration**: Explore AI-assisted development workflows and best practices
- **Test-Driven Development**: Learn TDD methodology with comprehensive testing strategies
- **Modern Web Stack**: Practice with Next.js 14, TypeScript, and Tailwind CSS
- **Architectural Documentation**: Use ADRs to document technical decisions
- **GitHub Issues Workflow**: Experience issue-driven development and project management

### Educational Focus

This is a **learning project** designed to showcase:

- How to effectively collaborate with Claude Code
- Best practices for AI-assisted software development
- Structured approach to building applications with proper documentation
- Integration of testing, linting, and quality assurance tools

A Next.js Todo application built using Test-Driven Development (TDD) with Claude Code assistance.

## Development Status

**Current Development Branch**: `main`

- All development is currently done directly on the main branch
- Features are implemented, tested, and committed to main
- Each completed feature is pushed to remote to close GitHub issues

## Manual configurations done prior to using claude: setup subscription needed for claude code

- <https://claude.com/product/claude-code>
- Login
- Upgrade to Monthly Pro plan: <https://claude.ai/upgrade/pro>
- Setup claude code: <https://claude.ai/settings/claude-code>
- <https://docs.claude.com/en/docs/claude-code/overview#install-and-authenticate>

```bash
npm install -g @anthropic-ai/claude-code
claude
```

## Project Management

This project uses GitHub Issues for feature tracking and follows a structured development approach:

- Issues are created for each feature with detailed TDD requirements
- All major architectural decisions are documented as ADRs in `docs/adr/`
- Development follows Test-Driven Development methodology
- Pre-commit hooks ensure code quality with automatic linting and formatting
- Claude Code assistance is used throughout development

### Priority System

The project uses a standardized priority labeling system for effective issue management:

- **priority-1-critical** 🔴: Blocking issues, security vulnerabilities, broken core functionality
- **priority-2-high** 🟠: Important features, significant improvements, major bugs
- **priority-3-medium** 🟡: Standard features, minor improvements, non-critical bugs
- **priority-4-low** 🟢: Nice-to-have features, documentation updates, minor enhancements

#### Priority-Based Development

Development efforts are prioritized based on issue labels:

1. **Critical Priority**: Immediate attention, stop other work
2. **High Priority**: Primary development focus for current sprint
3. **Medium Priority**: Standard workflow, next sprint scheduling
4. **Low Priority**: Backlog items, learning opportunities

This system enables effective resource allocation, clear communication of urgency, and structured project planning as part
of the learning experience in project management workflows.

### Complexity-Based Effort Estimation

The project uses complexity labels to enable accurate effort estimation in Claude Code development:

- **complexity-minimal** 🟢: Single file changes, quick fixes, documentation updates
- **complexity-simple** 🔵: Basic features, straightforward logic, standard patterns
- **complexity-moderate** 🟡: Multi-component changes, state management, integration work
- **complexity-complex** 🟠: Architecture changes, system design, comprehensive testing
- **complexity-epic** 🔴: Major overhauls, breaking changes, foundational work

#### Combined Planning Approach

Issues are labeled with both priority and complexity for optimal development planning:

- **High Priority + Low Complexity**: Quick wins and urgent fixes
- **High Priority + High Complexity**: Major features requiring careful planning
- **Low Priority + Low Complexity**: Good filler work and maintenance tasks
- **Low Priority + High Complexity**: Learning opportunities and future preparation

This dual-labeling system reflects the cognitive load and architectural impact of work, enabling better estimation
than traditional time-based approaches in AI-assisted development workflows.

## Code Quality

The project enforces code quality through automated tools:

- **ESLint**: JavaScript/TypeScript linting with strict rules
- **Prettier**: Automatic code formatting
- **markdownlint**: Documentation formatting standards
- **Husky + lint-staged**: Pre-commit hooks prevent poorly formatted code from being committed

## Dependency Management

This project tracks `package-lock.json` in git for several critical reasons:

### Why package-lock.json is Tracked

- **Reproducible Builds**: Ensures exact same dependency versions across all environments (development, staging, production)
- **Security**: Locks specific versions, preventing malicious updates from compromising your application
- **Team Consistency**: All developers get identical dependency trees, eliminating "works on my machine" issues
- **CI/CD Reliability**: Build processes are deterministic and predictable

### Best Practices

- **Always commit** `package-lock.json` changes alongside `package.json` updates
- **Never manually edit** package-lock.json - let `npm install` manage it automatically
- **Keep in sync**: When adding/removing dependencies, commit both files together
- **Trust the lock**: The lock file takes precedence over package.json version ranges

### Installation

For development setup:

```bash
npm install  # Uses exact versions from package-lock.json
```

This ensures everyone gets the exact same dependency tree that was tested and verified.
