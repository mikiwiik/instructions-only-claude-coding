# Development Documentation

This directory contains comprehensive guides for development practices, workflows, and project management in the Todo
App project.

**📊 Visual Overview**: See [Development Workflow Diagram](../diagrams/development-workflow.md) for a complete visual
representation of the development process.

**🎯 Strategic Context**: For the WHY behind our development practices, see:

- **[Development Principles](../core/principles.md)** - Philosophy and strategic importance of our 5 core principles
- **[Agentic Coding Framework](../core/framework.md)** - Complete instruction-only development methodology
- **[Git Workflows](../core/workflows.md)** - Git workflow, atomic commits, and PR protocol

## Quick Start

New to the project? Start here:

1. **[Development Environment Setup](dev-environment-setup.md)** - Configure your local development environment
2. **[Development Workflow](workflow.md)** - Learn the branch-based workflow, TDD practices, and quality standards
3. **[Project Management](project-management.md)** - Understand issue tracking and GitHub Projects workflow

## Core Documentation

### Development Workflow and Standards

**[workflow.md](workflow.md)** - Complete development workflow and code quality standards

- Branch-based development with pull requests
- Atomic commit strategy and conventional commit format
- TDD methodology (Red → Green → Refactor)
- Pre-commit hooks and quality gates
- Code complexity standards (ADR-027)
- TypeScript strict mode requirements
- Testing requirements and coverage thresholds
- Mermaid diagram guidelines

**Key Sections:**

- Development workflow overview
- Atomic commit strategy with AI attribution
- Test-driven development practices
- Code quality standards and enforcement
- Development commands reference

### Project Management

**[project-management.md](project-management.md)** - Issue tracking and GitHub Projects workflow

- GitHub Projects integration and automation
- Issue labeling system (priority, complexity, category)
- Status field workflow (Todo → In Progress → Done)
- Definition of Done criteria
- Task estimation guidelines
- Human and agent collaboration model

**Key Sections:**

- Issue lifecycle and status transitions
- Priority and complexity labels
- GitHub Projects views and workflows
- Automated status updates
- Issue management best practices

### Auto-Merge Workflow

**[auto-merge-workflow.md](auto-merge-workflow.md)** - Automated PR approval and merge process

- Automatic PR approval workflow
- Auto-merge configuration and requirements
- CI validation and quality gates
- Branch protection rules
- Streamlined development process

**Key Features:**

- Automatic approval when CI passes
- Auto-merge with rebase strategy
- Branch cleanup after merge
- Quality enforcement through automation

### Development Environment

**[dev-environment-setup.md](dev-environment-setup.md)** - Local environment configuration

- Claude Code settings management
- Dotfiles symlink strategy
- Settings sharing across projects
- Tool permissions configuration

**Topics:**

- Settings file location and structure
- Symlink setup for shared settings
- Permission management

### Slash Command Best Practices

**[slash-command-best-practices.md](slash-command-best-practices.md)** - Token-efficient command development

- Slash command design patterns
- Token limit considerations
- Command composition strategies
- Best practices for reliable execution

**Guidelines:**

- Token-efficient patterns
- Command composition strategies
- Error handling and debugging
- Performance optimization

## Documentation Organization

### By Role

**For Developers:**

1. [workflow.md](workflow.md) - Daily development practices
2. [project-management.md](project-management.md) - Issue tracking workflow
3. [dev-environment-setup.md](dev-environment-setup.md) - Local setup

**For Project Managers:**

1. [project-management.md](project-management.md) - Issue planning and tracking

**For AI Agents:**

1. [workflow.md](workflow.md) - Development standards and quality gates
2. [project-management.md](project-management.md) - Issue workflow and status updates
3. [slash-command-best-practices.md](slash-command-best-practices.md) - Command development

### By Task

**Setting Up a New Development Environment:**

1. [dev-environment-setup.md](dev-environment-setup.md) - Configure Claude Code settings
2. [workflow.md](workflow.md) - Review development workflow

**Starting Work on an Issue:**

1. [project-management.md](project-management.md) - Understand issue lifecycle
2. [workflow.md](workflow.md) - Follow TDD and commit practices
3. [auto-merge-workflow.md](auto-merge-workflow.md) - Create and merge PRs

**Creating a Pull Request:**

1. [workflow.md](workflow.md) - Review PR requirements and automerge protocol
2. [auto-merge-workflow.md](auto-merge-workflow.md) - Understand automatic approval
3. [project-management.md](project-management.md) - Verify issue closure

## Related Documentation

### Architecture and Design

- **[Architecture Overview](../architecture/overview.md)** - Technical architecture decisions
- **[Architecture Decision Records](../adr/)** - Significant technical decisions
- **[Architecture Flow Diagram](../diagrams/architecture-flow.md)** - Visual architecture overview

### Guidelines and Standards

- **[Accessibility Requirements](../guidelines/accessibility-requirements.md)** - WCAG 2.2 AA compliance
- **[Code Complexity Guidelines](../guidelines/code-complexity-guidelines.md)** - Refactoring patterns
- **[TypeScript Standards](../guidelines/typescript-standards.md)** - Type safety best practices

### Reference

- **[Labels and Priorities](../reference/labels-and-priorities.md)** - Issue labeling guide
- **[Troubleshooting Guide](../reference/troubleshooting.md)** - Common issues and solutions

## Contributing

All development follows the instruction-only methodology documented in [CLAUDE.md](../../CLAUDE.md). See
[workflow.md](workflow.md) for detailed contribution guidelines and quality standards.

## Questions?

- Check the [Troubleshooting Guide](../reference/troubleshooting.md) for common issues
- Review [workflow.md](workflow.md) for development standards
- See [Development Workflow Diagram](../diagrams/development-workflow.md) for visual process overview
