# 🤖 Agentic Coding Prototype - Complete Software Development Through AI Instruction

[![Build and Test](https://github.com/mikiwiik/instructions-only-claude-coding/actions/workflows/build.yml/badge.svg)](https://github.com/mikiwiik/instructions-only-claude-coding/actions/workflows/build.yml)

**🌐 Live Demo**: [Todo App on Vercel](https://instructions-only-claude-coding.vercel.app/)

## What is this TODO App?

A modern, accessible todo application with advanced features for managing your todos:

- **Todo Management**: Add, edit, delete, and toggle completion status for todos
- **Touch Gestures**: Swipe right to complete, swipe left to delete, long press to edit todos
- **Keyboard Support**: Full keyboard navigation and accessibility (WCAG 2.2 AA compliant)
- **Local Persistence**: Automatic saving of todos to browser storage
- **Responsive Design**: Optimized for mobile and desktop devices

Built with Next.js 14, TypeScript, and Tailwind CSS, demonstrating modern web development best practices.

## 📋 Product Vision & Requirements

This project is guided by a **[Product Requirements Document](docs/product/requirements.md)** that defines what we're
building and why. All issues and PRs trace back to these requirements, ensuring coherent product evolution whether
development is by human instruction or AI implementation.

## 🎯 Role Definition and Boundaries

> **Central Framework & Project Purpose**: This project demonstrates instruction-only development where humans
> provide strategic direction and AI handles complete implementation.

### Human Role: Strategic Architect & Product Owner

- Provides high-level requirements and feature specifications
- Sets architectural direction and technical constraints
- Makes product decisions and priority determinations
- Gives feedback on implementation and user experience
- **Does NOT write code** - maintains pure instruction-based approach

### AI Role: Complete Implementation Team

- Handles all code implementation with comprehensive testing strategies
- Manages test coverage and maintains CI/CD pipeline and deployment processes
- Creates and maintains all project documentation and ADRs
- Ensures code quality, linting, type safety, and professional standards
- **100% responsible for technical execution** via instruction interpretation

## Project Purpose

**This project demonstrates groundbreaking agentic coding methodology** - building complete, production-ready software
through pure instruction-based collaboration with Claude Code. This Todo application showcases how complex applications
can be developed with **zero manual coding**, where the human acts as architect/product manager and AI handles all
implementation.

### Core Innovation: Instruction-Only Development

This project proves that sophisticated software can be built entirely through strategic instruction rather than
traditional hand-coding. The methodology demonstrates:

- **Pure AI Implementation**: 100% AI-generated codebase following professional development practices
- **Role-Based Collaboration**: Human provides strategic direction, AI executes technical implementation
- **Complete Development Lifecycle**: From initial planning to production deployment via instruction
- **Enterprise-Quality Standards**: TDD, atomic commits, CI/CD, and architectural documentation maintained through AI instruction

## Agentic Development Methodology

### Instruction-Based Development Process

1. **Strategic Planning**: Human provides high-level feature requirements
2. **Technical Planning**: AI breaks down into implementation tasks with TodoWrite
3. **Test-Driven Implementation**: AI writes tests first, then implementation
4. **Quality Assurance**: AI runs all validation, testing, and quality checks
5. **Documentation**: AI maintains comprehensive project documentation
6. **Deployment**: AI handles production deployment through instruction

### Measurable Outcomes

- **100% AI-Generated Codebase**: Every line of code written by Claude Code
- **Professional Development Practices**: TDD, atomic commits, CI/CD maintained throughout
- **Complex Feature Implementation**: Advanced functionality (drag-and-drop, accessibility, responsive design) built via
  instruction
- **Production-Ready Quality**: Live deployment with full testing and quality assurance

### Learning Objectives

- **Agentic Coding Mastery**: Learn effective AI instruction patterns for complex software development
- **Role Separation Strategy**: Understand optimal human-AI collaboration for maximum productivity
- **Instruction-Based Architecture**: Experience building sophisticated applications through strategic direction
- **Quality Through AI**: Maintain enterprise standards using AI-driven development practices
- **Scalable Methodology**: Develop repeatable patterns for instruction-based software development

### Educational Impact

This project serves as a **template and reference** for:

- **Effective AI Instruction Techniques**: Proven patterns for complex software development
- **Agentic Workflow Design**: Role separation strategies for optimal human-AI collaboration
- **Quality Assurance Through AI**: Maintaining professional standards in AI-generated code
- **Innovation in Software Development**: Pushing boundaries of what's possible with current AI capabilities

> **Deep Dive**: See [Development Principles](docs/core/principles.md) for the strategic philosophy behind
> instruction-only development, and [Agentic Coding Framework](docs/core/framework.md) for comprehensive methodology
> details.

## Quick Start

### Prerequisites

- Node.js 22.x or higher
- npm 10.x or higher
- Claude Code Pro subscription

**Local Development Setup**: See [Local Dev Setup Guide](docs/setup/local-dev-setup.md) for Node.js, dependencies, and
environment configuration.

**Claude Code Setup**: Install Claude Code CLI and authenticate following the
[Claude Code section](docs/setup/local-dev-setup.md#claude-code-setup) in the setup guide.

### Installation

```bash
# Clone and install
git clone https://github.com/mikiwiik/instructions-only-claude-coding.git
cd instructions-only-claude-coding
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

**Development Commands**: See [Development Workflow](docs/development/workflow.md) for all available npm commands, quality
checks, and testing scripts.

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS
- **Testing**: Jest + React Testing Library (unit/integration), Playwright (E2E)
- **Development**: Test-Driven Development (TDD)
- **Code Quality**: SonarCloud for automated analysis
- **Mobile**: Touch gestures with accessibility-first design (WCAG 2.2 AA compliant)
- **Real-Time**: Server-Sent Events (SSE) for live synchronization
- **Deployment**: Vercel with GitHub Actions CI/CD

## Design & UX

**Targeted Platforms**: Mobile-first responsive design optimized for mobile breakpoints (< 640px) and desktop
(≥ 640px), with edge-to-edge layouts on mobile and contained layouts on desktop.

**Design Documentation**:

- **[UX Design Documentation](docs/ux/README.md)** - Complete UX design hub
- **[Layout & Spacing Reference](docs/ux/layout-and-spacing-reference.md)** - Breakpoints and spacing system
- **[Mobile UX Guidelines](docs/ux/mobile-ux-guidelines.md)** - Touch gestures and mobile patterns
- **[Accessibility Requirements](docs/ux/accessibility-requirements.md)** - WCAG 2.2 AA compliance

## Browser Support

| Environment | Browsers Tested                                         |
| ----------- | ------------------------------------------------------- |
| CI (E2E)    | Chromium                                                |
| Local Dev   | Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari |

The app targets modern evergreen browsers. See [Platform Support](docs/architecture/platform-support.md) for details.

## Development Status

**Current Workflow**: Branch-based development with automated PR workflow. All features developed on separate branches
with required approvals, automated merging, and continuous deployment.

See [Development Workflow](docs/development/workflow.md) for complete branch strategy, PR requirements, and CI/CD details.

## Documentation

### Quick Navigation

- **🚀 [Installation Guide](docs/setup/local-dev-setup.md)** - Complete development environment setup
- **📦 [Vercel Deployment Guide](docs/setup/vercel-deployment.md)** - Production deployment with Vercel
- **🔍 [SonarCloud Setup](docs/setup/sonarcloud-setup.md)** - Code quality analysis integration
- **💡 [SonarLint IDE Setup](docs/setup/sonarlint-ide-setup.md)** - Real-time code quality feedback in your IDE
- **⚙️ [Development Workflow](docs/development/workflow.md)** - Coding standards and practices
- **🧪 [E2E Testing Guide](docs/testing/e2e-testing-guide.md)** - Playwright E2E testing documentation
- **📊 [Project Management](docs/development/project-management.md)** - Issue tracking and planning
- **🏗️ [Architecture Overview](docs/architecture/overview.md)** - Technical architecture and decisions
- **🏗️ [Architecture Flow Diagram](docs/diagrams/architecture-flow.md)** - Visual architecture flow with Mermaid diagrams
- **👤 [User Flow Diagrams](docs/diagrams/user-flows.md)** - Complete user interaction flows and UX documentation
- **📊 [Development Workflow Diagram](docs/diagrams/development-workflow.md)** - Complete development process visualization

### Documentation Organization

- **[docs/setup/](docs/setup/)** - Installation and deployment guides
- **[docs/development/](docs/development/)** - Development workflow and project management
  ([Overview](docs/development/README.md))
- **[docs/architecture/](docs/architecture/)** - Technical architecture and design decisions
- **[docs/diagrams/](docs/diagrams/)** - Visual diagrams for architecture and user flows
- **[docs/adr/](docs/adr/)** - Architecture Decision Records
- **[docs/guidelines/](docs/guidelines/)** - Process guidelines and standards
- **[docs/core/quality-standards.md](docs/core/quality-standards.md)** - Comprehensive quality standards reference
- **[CLAUDE.md](CLAUDE.md)** - Essential guiding principles for instruction-only development

## Contributing

**Quick Start**: Review [installation guide](docs/setup/local-dev-setup.md), understand the
[development workflow](docs/development/workflow.md), browse [GitHub issues](https://github.com/mikiwiik/instructions-only-claude-coding/issues),
and follow TDD with branch-based development.

**Issue Management**: Priority labels (🔴 critical → 🟢 low) and complexity labels (🟢 minimal → 🔴 epic) guide
development planning. See [project management guide](docs/development/project-management.md).

**Custom Slash Commands**: The project includes custom slash commands (`/work-on`, `/select-next-issue`, `/quick-wins`,
`/create-pr`, `/export-closed-issues`) for enhanced workflow. Commands are defined in `.claude/commands/`.

## Features

- ✅ **Add/Edit/Delete Todos**: Complete todo management functionality
- ✅ **Toggle Completion**: Mark todos as complete/incomplete
- ✅ **Touch Gestures**: Swipe right to complete, swipe left to delete, long press to edit
- ✅ **Real-Time Sync**: Live updates across browser tabs and devices with SSE
- ✅ **Accessibility First**: WCAG 2.2 AA compliant with keyboard alternatives for all gestures
- ✅ **Local Persistence**: Browser localStorage for data persistence
- ✅ **Responsive Design**: Works on desktop and mobile devices
- ✅ **Type Safety**: Full TypeScript implementation
- ✅ **Test Coverage**: Comprehensive test suite (unit, integration, E2E)
- ✅ **CI/CD Pipeline**: Automated testing and deployment

### Real-Time Synchronization

The application features Server-Sent Events (SSE) based real-time synchronization:

- **Multi-Tab Sync**: Changes instantly propagate across all open browser tabs
- **Optimistic Updates**: Immediate UI feedback with automatic rollback on errors
- **Conflict Resolution**: Last-write-wins strategy with server timestamps
- **Connection Resilience**: Automatic reconnection with exponential backoff
- **Offline Support**: Queued updates sync when connection is restored

See [ADR-022: Real-Time Sync Architecture](docs/adr/022-realtime-sync-architecture.md) and
[ADR-023: Conflict Resolution](docs/adr/023-conflict-resolution.md) for technical details.

## Project Management

This project demonstrates professional development practices:

- **Issue-Driven Development**: All features begin with GitHub issues
- **Atomic Commits**: Clear, focused commit history
- **Code Quality**: Automated linting, formatting, and testing
- **Documentation**: Comprehensive project documentation
- **CI/CD**: Automated quality assurance and deployment

> **Quality Principle**: All behavior is explicit, documented, and verified through traceability:
> Requirement → Issue → PR → Code → Test. See [Quality Standards](docs/core/quality-standards.md).

## Support and Resources

- **Project Issues**: [GitHub Issues](https://github.com/mikiwiik/instructions-only-claude-coding/issues)
- **Architecture Decisions**: [ADR Index](docs/adr/README.md)
- **Claude Code Documentation**: [Official Docs](https://docs.claude.com/en/docs/claude-code/)
- **Development Guidelines**: [CLAUDE.md](CLAUDE.md) - 10 essential guiding principles for instruction-only development

---

**🤖 100% AI-Generated Through Strategic Instruction** - Pioneering agentic coding methodology where human strategy
meets AI implementation. This entire codebase demonstrates the future of software development through instruction-only
collaboration.
