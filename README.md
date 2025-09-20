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
