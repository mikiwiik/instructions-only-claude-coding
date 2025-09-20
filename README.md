# Todo App - My First Claude Code Project

[![Build and Test](https://github.com/mikiwiik/my-first-claude-code/actions/workflows/build.yml/badge.svg)](https://github.com/mikiwiik/my-first-claude-code/actions/workflows/build.yml)

**🌐 Live Demo**: [Todo App on Vercel](https://my-first-claude-code-fhhkrlt3f-miki-wiiks-projects.vercel.app/)

## Project Purpose

This Todo application serves as a **learning platform** for Claude Code development workflows and modern web development practices. The primary goal is to demonstrate AI-assisted coding, TDD methodology, and collaborative development patterns.

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

## Quick Start

### Prerequisites

- Node.js 22.x or higher
- npm 10.x or higher
- Claude Code Pro subscription ([setup guide](docs/setup/installation.md))

### Installation

```bash
# Clone and install
git clone https://github.com/mikiwiik/my-first-claude-code.git
cd my-first-claude-code
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

### Available Commands

```bash
npm run dev          # Start development server
npm run build        # Create production build
npm run test         # Run test suite
npm run lint         # Run code linting
npm run type-check   # TypeScript type checking
```

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS
- **Testing**: Jest + React Testing Library
- **Development**: Test-Driven Development (TDD)
- **Deployment**: Vercel with GitHub Actions CI/CD

## Development Status

**Current Workflow**: Branch-based development with pull requests

- Features developed on separate branches (`feature/issue-number-description`)
- Pull requests used for code review and CI validation
- Main branch maintains stable, tested code
- Automatic deployment to production after successful CI

## Documentation

### Quick Navigation

- **🚀 [Installation Guide](docs/setup/installation.md)** - Complete development environment setup
- **📦 [Deployment Guide](docs/setup/deployment.md)** - Production deployment with Vercel
- **⚙️ [Development Workflow](docs/development/workflow.md)** - Coding standards and practices
- **📊 [Project Management](docs/development/project-management.md)** - Issue tracking and planning
- **🏗️ [Architecture Overview](docs/architecture/overview.md)** - Technical architecture and decisions

### Documentation Organization

- **[docs/setup/](docs/setup/)** - Installation and deployment guides
- **[docs/development/](docs/development/)** - Development workflow and project management
- **[docs/architecture/](docs/architecture/)** - Technical architecture and design decisions
- **[docs/adr/](docs/adr/)** - Architecture Decision Records
- **[docs/guidelines/](docs/guidelines/)** - Process guidelines and standards
- **[CLAUDE.md](CLAUDE.md)** - Claude Code development guidelines

## Contributing

### Getting Started

1. **Review Documentation**: Start with the [installation guide](docs/setup/installation.md)
2. **Understand Workflow**: Read the [development workflow](docs/development/workflow.md)
3. **Check Issues**: Browse [GitHub issues](https://github.com/mikiwiik/my-first-claude-code/issues) for tasks
4. **Follow Standards**: Adhere to project [coding standards](docs/development/workflow.md)

### Development Process

1. **Create Branch**: `feature/issue-number-description`
2. **Follow TDD**: Write tests first, then implementation
3. **Maintain Quality**: Pre-commit hooks ensure code quality
4. **Create PR**: Submit pull request for review
5. **CI Validation**: Ensure all checks pass before merge

### Issue Management

The project uses GitHub Issues with priority and complexity labels:

- **Priority**: `priority-1-critical` 🔴 to `priority-4-low` 🟢
- **Complexity**: `complexity-minimal` 🟢 to `complexity-epic` 🔴

See [project management guide](docs/development/project-management.md) for detailed workflows.

## Features

- ✅ **Add/Edit/Delete Todos**: Complete todo management functionality
- ✅ **Toggle Completion**: Mark todos as complete/incomplete
- ✅ **Local Persistence**: Browser localStorage for data persistence
- ✅ **Responsive Design**: Works on desktop and mobile devices
- ✅ **Type Safety**: Full TypeScript implementation
- ✅ **Test Coverage**: Comprehensive test suite
- ✅ **CI/CD Pipeline**: Automated testing and deployment

## Project Management

This project demonstrates professional development practices:

- **Issue-Driven Development**: All features begin with GitHub issues
- **Atomic Commits**: Clear, focused commit history
- **Code Quality**: Automated linting, formatting, and testing
- **Documentation**: Comprehensive project documentation
- **CI/CD**: Automated quality assurance and deployment

## Support and Resources

- **Project Issues**: [GitHub Issues](https://github.com/mikiwiik/my-first-claude-code/issues)
- **Architecture Decisions**: [ADR Index](docs/adr/README.md)
- **Claude Code Documentation**: [Official Docs](https://docs.claude.com/en/docs/claude-code/)
- **Development Guidelines**: [CLAUDE.md](CLAUDE.md)

---

**Built with Claude Code** - Demonstrating AI-assisted development workflows and modern web development practices.