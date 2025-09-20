# Todo App - My First Claude Code Project

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
