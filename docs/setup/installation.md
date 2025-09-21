# Installation and Development Environment Setup

This guide covers all necessary setup steps for developing and contributing to the Todo App project.

## Prerequisites

### Claude Code Subscription Setup

**Required for AI-assisted development:**

1. **Visit Claude Code**: <https://claude.com/product/claude-code>
2. **Create Account**: Login or create new Claude account
3. **Upgrade Subscription**: Upgrade to Monthly Pro plan at <https://claude.ai/upgrade/pro>
4. **Configure Claude Code**: Setup at <https://claude.ai/settings/claude-code>
5. **Follow Official Guide**: <https://docs.claude.com/en/docs/claude-code/overview#install-and-authenticate>

### Claude Code CLI Installation

```bash
# Install Claude Code CLI globally
npm install -g @anthropic-ai/claude-code

# Launch Claude Code (follow authentication prompts)
claude
```

### System Requirements

- **Node.js**: Version 22.x or higher
- **npm**: Version 10.x or higher
- **Git**: For version control
- **Modern Browser**: For development and testing

## Project Setup

### 1. Repository Setup

```bash
# Clone the repository
git clone https://github.com/mikiwiik/instructions-only-claude-coding.git
cd instructions-only-claude-coding

# Verify Node.js version meets requirements
node --version  # Should be 22.x or higher
npm --version   # Should be 10.x or higher
```

### 2. Dependency Installation

```bash
# Install project dependencies (uses exact versions from package-lock.json)
npm install
```

**Important**: This project tracks `package-lock.json` in git to ensure:

- **Reproducible Builds**: Exact same dependency versions across all environments
- **Security**: Locked versions prevent malicious updates
- **Team Consistency**: All developers get identical dependency trees
- **CI/CD Reliability**: Deterministic and predictable builds

### 3. Development Environment Verification

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests
npm run test

# Start development server
npm run dev
```

The development server will start at `http://localhost:3000`.

## Development Tools and Quality Assurance

### Pre-commit Hooks

The project uses Husky and lint-staged for automatic code quality enforcement:

```bash
# Pre-commit hooks are automatically installed with npm install
# They run automatically on every git commit and include:
# - ESLint for JavaScript/TypeScript linting
# - Prettier for code formatting
# - markdownlint for documentation formatting
```

**What happens on commit:**

1. **ESLint**: Checks code for errors and style violations
2. **Prettier**: Auto-formats code for consistency
3. **markdownlint**: Ensures documentation follows formatting standards
4. **Type Checking**: Verifies TypeScript compilation

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Create production build
npm run start        # Start production server

# Testing
npm run test         # Run test suite
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix ESLint issues
npm run lint:md      # Lint markdown files
npm run lint:md:fix  # Auto-fix markdown issues
npm run format       # Format code with Prettier
npm run format:check # Check if code needs formatting
npm run type-check   # TypeScript type checking
```

## Dependency Management Best Practices

### Package Lock File

**Always follow these practices:**

- **Commit Lock File**: Always commit `package-lock.json` changes with `package.json` updates
- **Never Edit Manually**: Let `npm install` manage package-lock.json automatically
- **Keep Synchronized**: When adding/removing dependencies, commit both files together
- **Trust the Lock**: The lock file takes precedence over package.json version ranges

### Adding Dependencies

```bash
# Add production dependency
npm install package-name

# Add development dependency
npm install --save-dev package-name

# Always commit both package.json and package-lock.json
git add package.json package-lock.json
git commit -m "feat: add package-name dependency"
```

## Troubleshooting Common Issues

### Node.js Version Issues

```bash
# Check current version
node --version

# If using nvm (Node Version Manager)
nvm install 22
nvm use 22
```

### Dependency Issues

```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Pre-commit Hook Issues

```bash
# Reinstall Husky hooks
npm run prepare

# Manually run what pre-commit hooks check
npm run lint
npm run format
npm run type-check
```

### Port Already in Use

```bash
# Kill process using port 3000
npx kill-port 3000

# Or run on different port
npm run dev -- --port 3001
```

## IDE Setup Recommendations

### VS Code Extensions

Recommended extensions for optimal development experience:

- **TypeScript and JavaScript Language Features** (built-in)
- **ESLint**: Real-time linting
- **Prettier**: Code formatting
- **Tailwind CSS IntelliSense**: Tailwind CSS autocomplete
- **Jest**: Test runner integration
- **markdownlint**: Markdown linting

### VS Code Settings

Add to your workspace `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.format.enable": true,
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## Next Steps

After completing installation:

1. **Review Architecture**: Check [`docs/architecture/overview.md`](../architecture/overview.md) for project structure
2. **Development Workflow**: Read [`docs/development/workflow.md`](../development/workflow.md) for coding standards
3. **Project Management**: See [`docs/development/project-management.md`](../development/project-management.md) for issue workflow
4. **Contributing**: Review [README.md](../../README.md) for contribution guidelines

## Support

- **Claude Code Documentation**: <https://docs.claude.com/en/docs/claude-code/>
- **Project Issues**: <https://github.com/mikiwiik/my-first-claude-code/issues>
- **Technical Decisions**: Review [ADRs](../adr/) for architectural context

---

This installation guide ensures a consistent development environment for all contributors to the Todo App project.
