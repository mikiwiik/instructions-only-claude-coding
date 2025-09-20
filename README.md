# Todo App - My First Claude Code Project

[![Build and Test](https://github.com/mikiwiik/my-first-claude-code/actions/workflows/build.yml/badge.svg)](https://github.com/mikiwiik/my-first-claude-code/actions/workflows/build.yml)

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

### Development Workflow

#### Atomic Commit Strategy

The project follows professional atomic commit practices for improved code history and collaboration:

- **One Logical Change**: Each commit represents a single, focused change
- **Conventional Commits**: Standardized format with type prefixes (feat, fix, test, docs)
- **Issue Linking**: Every commit references the related GitHub issue (#issue-number)
- **Self-Contained**: Each commit maintains a working application state

**Example Commit Sequence:**

```bash
feat(todo): add completedAt field to TodoItem interface (#33)
test(todo): add timestamp tracking tests (#33)
docs(todo): update README with completion feature (#33)
feat: complete todo completion timestamp tracking

Closes #33
```

This approach enables:

- **Focused Code Review**: Individual logical changes are easier to review
- **Clear Development History**: Logical progression visible in git log
- **Precise Debugging**: Better git bisect and blame functionality
- **Selective Rollbacks**: Revert specific changes without losing entire features

#### Commit Message Format

```text
type(scope): description (#issue-number)

Optional body explaining the change

Optional footer for issue closure
```

**Commit Types:**

- **feat**: New features
- **fix**: Bug fixes
- **test**: Test additions/updates
- **docs**: Documentation changes
- **refactor**: Code refactoring
- **style**: Formatting changes
- **chore**: Maintenance tasks

#### GitHub Issue Linking

All commits related to GitHub issues MUST include appropriate linking keywords to automatically connect commits to issues
and enable automatic issue closure:

**Closing Keywords** (automatically close issues when PR is merged):

- `Closes #123` - Use for feature implementations
- `Fixes #123` - Use for bug fixes
- `Resolves #123` - Use for general issue resolution

**Linking Keywords** (reference without closing):

- `References #123` - Use for partial work or related changes
- `Related to #123` - Use for tangentially related commits

**Examples:**

```bash
# Feature implementation
feat: implement todo deletion functionality

Closes #15

# Bug fix
fix: resolve todo timestamp display issue in Safari

Fixes #23

# Partial work
test: add initial tests for todo filtering

References #18
```

**Benefits:**

- Issues automatically close when commits are pushed/merged
- Clear traceability between commits and issues
- Improved project tracking and development history
- Follows GitHub best practices for issue management

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

## 🚀 Production Deployment

### Live Demo

**🌐 Live Application**: [Todo App on Vercel](https://my-first-claude-code-fhhkrlt3f-miki-wiiks-projects.vercel.app/)

The Todo App is automatically deployed to Vercel and updated on every push to the main branch after CI passes.

### Vercel Deployment Setup

This project is configured for automatic deployment to Vercel with GitHub integration. Here's how to set up deployment for this or similar projects:

#### Prerequisites

- GitHub repository with the Todo App code
- Vercel account (free tier available)
- Completed GitHub Actions CI/CD pipeline

#### Step-by-Step Vercel Setup

1. **Create Vercel Account**
   ```bash
   # Visit https://vercel.com
   # Click "Continue with GitHub" to link your GitHub account
   # Complete the registration process
   ```

2. **Import Repository**
   ```bash
   # In Vercel Dashboard:
   # 1. Click "New Project"
   # 2. Find your GitHub repository "my-first-claude-code"
   # 3. Click "Import"
   ```

3. **Automatic Configuration**
   ```bash
   # Vercel automatically detects:
   # - Framework: Next.js
   # - Build Command: npm run build
   # - Output Directory: .next
   # - Node.js Version: 22.x (from package.json engines)
   ```

4. **Deploy**
   ```bash
   # Click "Deploy" button
   # Vercel will build and deploy your application
   # You'll receive a live URL (e.g., https://project-name.vercel.app)
   ```

#### Deployment Features

- **Automatic Deployments**: Every push to `main` triggers a new deployment
- **Preview Deployments**: Pull requests get their own preview URLs for testing
- **CI Integration**: Deployments wait for GitHub Actions CI to pass
- **Zero Configuration**: Next.js projects work out of the box
- **Custom Domains**: Free `.vercel.app` subdomain included

#### Environment Configuration

```bash
# No environment variables needed for this Todo App
# All data is stored in localStorage (client-side)
# Production build automatically optimized by Next.js
```

#### Deployment Workflow

```bash
# 1. Developer pushes code to GitHub
git push origin main

# 2. GitHub Actions CI runs (build, test, lint)
# 3. If CI passes, Vercel automatically deploys
# 4. Live site updates with new changes
# 5. Deployment URL remains consistent
```

#### Monitoring & Management

- **Vercel Dashboard**: Monitor deployments, view logs, manage domains
- **GitHub Integration**: Deployment status visible in commit history
- **Automatic Rollbacks**: Previous deployments can be promoted if needed
- **Analytics**: Basic traffic and performance metrics available

### Deployment Status

- ✅ **Production**: Deployed to Vercel with automatic updates
- ✅ **CI/CD Pipeline**: GitHub Actions → Vercel integration complete
- ✅ **Domain**: Free `.vercel.app` subdomain configured
- ✅ **SSL**: HTTPS enabled by default
- ✅ **Performance**: Optimized Next.js production build

### For Other Projects

To deploy your own Next.js project to Vercel:

1. **Ensure Compatibility**
   ```json
   // package.json should include:
   {
     "scripts": {
       "build": "next build",
       "start": "next start"
     },
     "engines": {
       "node": ">=18.0.0"
     }
   }
   ```

2. **Follow Setup Steps**: Use the same Vercel setup process outlined above
3. **Configure Environment Variables**: Add any required environment variables in Vercel dashboard
4. **Custom Domain**: Optional custom domain configuration available in Vercel settings

### Troubleshooting

**Common Issues:**

- **Build Failures**: Check GitHub Actions CI logs first
- **Environment Variables**: Ensure all required variables are set in Vercel dashboard
- **Node.js Version**: Verify `engines` field in package.json matches Vercel's Node.js version
- **Dependencies**: Ensure package-lock.json is committed for reproducible builds
