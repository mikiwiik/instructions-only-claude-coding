# 🤖 Agentic Coding Prototype - Complete Software Development Through AI Instruction

[![Build and Test](https://github.com/mikiwiik/instructions-only-claude-coding/actions/workflows/build.yml/badge.svg)](https://github.com/mikiwiik/instructions-only-claude-coding/actions/workflows/build.yml)

**🌐 Live Demo**: [Todo App on Vercel](https://instructions-only-claude-coding.vercel.app/)

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

### Role-Based Interaction Patterns

#### Human Role: Strategic Architect & Product Owner

- Defines requirements, features, and acceptance criteria
- Sets architectural direction and technical constraints
- Provides feedback on implementation and user experience
- Makes product decisions and priority calls

#### AI Role: Complete Implementation Team

- Writes all code following TDD methodology
- Implements testing strategies and maintains test coverage
- Handles CI/CD pipeline configuration and deployment
- Creates comprehensive documentation and ADRs
- Manages code quality, linting, and type safety

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

## Quick Start

### Prerequisites

- Node.js 22.x or higher
- npm 10.x or higher
- Claude Code Pro subscription ([setup guide](docs/setup/installation.md))

### Authentication Setup

Claude Code supports two authentication methods for API access:

#### API Key Authentication (Recommended for Long Sessions)

- Prevents OAuth token expiration during extended development sessions
- No interruptions from 401 authentication errors
- Ideal for continuous workflow

**Configuration Steps:**

1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Navigate to Claude Code section on main page
3. Click "Create API key"
4. Add `export ANTHROPIC_API_KEY="your_api_key_here"` to `~/.zprofile` (or `~/.bashrc` for bash), replacing
   `your_api_key_here` with your actual API key
5. Run `/logout` in Claude Code to switch to API key authentication
6. Restart your terminal or run `source ~/.zprofile`

#### OAuth Authentication

- Quick setup for shorter sessions
- May require re-authentication every few hours
- Can cause 401 errors during long coding sessions

#### Troubleshooting 401 Authentication Errors

If you encounter 401 authentication errors during development:

1. Switch to API key authentication (recommended for long sessions)
2. Or re-authenticate with OAuth in Claude Code settings
3. Verify your API key/token has necessary permissions
4. Check token expiration in Anthropic Console

For detailed authentication documentation, see [Claude Code Authentication Guide](https://docs.claude.com/en/docs/claude-code/).

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

### Available Commands

```bash
npm run dev          # Start development server
npm run build        # Create production build
npm run test         # Run test suite
npm run lint         # Run code linting
npm run type-check   # TypeScript type checking
```

### Performance Monitoring

The application includes **Vercel Speed Insights** for real-time Core Web Vitals monitoring:

- **Access Metrics**: Visit your [Vercel Dashboard](https://vercel.com/dashboard) → Project → Analytics
- **Core Web Vitals**: Monitor LCP, FID, CLS performance metrics from real users
- **Optimization Tracking**: Measure impact of performance improvements over time
- **Real User Monitoring**: Actual user experience data across devices and networks

Speed Insights automatically collects performance data when the app is deployed to Vercel.

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS
- **Testing**: Jest + React Testing Library
- **Development**: Test-Driven Development (TDD)
- **Code Quality**: SonarCloud for automated analysis
- **Analytics**: Vercel Speed Insights for Core Web Vitals monitoring
- **Mobile**: Touch gestures with accessibility-first design (WCAG 2.2 AA compliant)
- **Deployment**: Vercel with GitHub Actions CI/CD

## Development Status

**Current Workflow**: Branch-based development with automated PR workflow

- Features developed on separate branches (`feature/issue-number-description`)
- Pull requests require 1 approver and passing CI checks (enforced by branch protection)
- Automerge enabled for streamlined workflow after requirements met
- Automatic branch deletion keeps repository clean
- Main branch maintains stable, tested code
- Automatic deployment to production after successful CI

## Documentation

### Quick Navigation

- **🚀 [Installation Guide](docs/setup/installation.md)** - Complete development environment setup
- **📦 [Deployment Guide](docs/setup/deployment.md)** - Production deployment with Vercel
- **🔍 [SonarCloud Setup](docs/setup/sonarcloud-setup.md)** - Code quality analysis integration
- **⚙️ [Development Workflow](docs/development/workflow.md)** - Coding standards and practices
- **📊 [Project Management](docs/development/project-management.md)** - Issue tracking and planning
- **🏗️ [Architecture Overview](docs/architecture/overview.md)** - Technical architecture and decisions
- **🏗️ [Architecture Flow Diagram](docs/diagrams/architecture-flow.md)** - Visual architecture flow with Mermaid diagrams

### Documentation Organization

- **[docs/setup/](docs/setup/)** - Installation and deployment guides
- **[docs/development/](docs/development/)** - Development workflow and project management
- **[docs/architecture/](docs/architecture/)** - Technical architecture and design decisions
- **[docs/adr/](docs/adr/)** - Architecture Decision Records
- **[docs/guidelines/](docs/guidelines/)** - Process guidelines and standards
- **[CLAUDE.md](CLAUDE.md)** - Essential 10-line framework for instruction-only development

## Contributing

### Getting Started

1. **Review Documentation**: Start with the [installation guide](docs/setup/installation.md)
2. **Understand Workflow**: Read the [development workflow](docs/development/workflow.md)
3. **Check Issues**: Browse [GitHub issues](https://github.com/mikiwiik/instructions-only-claude-coding/issues) for tasks
4. **Follow Standards**: Adhere to project [coding standards](docs/development/workflow.md)

### Development Process

1. **Create Branch**: `feature/issue-number-description`
2. **Follow TDD**: Write tests first, then implementation
3. **Maintain Quality**: Pre-commit hooks ensure code quality
4. **Create PR**: Submit pull request for review
5. **Enable Automerge**: Streamlined workflow with `gh pr merge --auto --squash`
6. **CI Validation**: Automatic merge after approval and passing checks

### Issue Management

The project uses GitHub Issues with priority and complexity labels:

- **Priority**: `priority-1-critical` 🔴 to `priority-4-low` 🟢
- **Complexity**: `complexity-minimal` 🟢 to `complexity-epic` 🔴

See [project management guide](docs/development/project-management.md) for detailed workflows.

### Custom Slash Commands

The project includes custom slash commands for enhanced development workflow:

- **`/work-on <issue-number>`** - Start working on specific GitHub issue with full workflow setup
- **`/select-next-issue [filter]`** - Get strategic recommendations for next issue to work on
- **`/quick-wins`** - Find high-value, low-effort development opportunities
- **`/parallel-work <issue-number>`** - Set up coordinated parallel agent execution for complex issues
- **`/create-pr`** - Create pull request with automerge following the agreed workflow (docs/core/workflows.md)

These commands are defined in `.claude/commands/` and integrate with the project's development methodology.

## Features

- ✅ **Add/Edit/Delete Todos**: Complete todo management functionality
- ✅ **Toggle Completion**: Mark todos as complete/incomplete
- ✅ **Touch Gestures**: Swipe right to complete, swipe left to delete, long press to edit
- ✅ **Accessibility First**: WCAG 2.2 AA compliant with keyboard alternatives for all gestures
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

- **Project Issues**: [GitHub Issues](https://github.com/mikiwiik/instructions-only-claude-coding/issues)
- **Architecture Decisions**: [ADR Index](docs/adr/README.md)
- **Claude Code Documentation**: [Official Docs](https://docs.claude.com/en/docs/claude-code/)
- **Development Guidelines**: [CLAUDE.md](CLAUDE.md) - 10 essential guiding principles for instruction-only development

---

**🤖 100% AI-Generated Through Strategic Instruction** - Pioneering agentic coding methodology where human strategy
meets AI implementation. This entire codebase demonstrates the future of software development through instruction-only
collaboration.
