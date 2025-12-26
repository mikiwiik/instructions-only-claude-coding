# Local Development Environment Setup

This guide covers setting up your local development environment for the Todo App project. For development workflows and
practices, see [Development Documentation](../development/README.md).

## System Requirements

- **Node.js**: Version 22.x or higher
- **npm**: Version 10.x or higher
- **Git**: For version control
- **jq**: JSON processor used by Claude commands ([installation](#jq-installation))
- **Modern Browser**: For development and testing

## Claude Code Setup

### Subscription Setup

**Required for AI-assisted development:**

1. **Visit Claude Code**: <https://claude.com/product/claude-code>
2. **Create Account**: Login or create new Claude account
3. **Upgrade Subscription**: Upgrade to Monthly Pro plan at <https://claude.ai/upgrade/pro>
4. **Configure Claude Code**: Setup at <https://claude.ai/settings/claude-code>
5. **Follow Official Guide**: <https://docs.claude.com/en/docs/claude-code/overview#install-and-authenticate>

### CLI Installation

```bash
# Install Claude Code CLI globally
npm install -g @anthropic-ai/claude-code

# Launch Claude Code (follow authentication prompts)
claude
```

**Optional**: For shared settings across multiple projects, see
[Claude Code Settings Management](#claude-code-settings-management-optional).

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

### 2. Git User Configuration

Configure your Git identity for this repository to ensure commits are properly attributed to your GitHub account:

```bash
# Set your GitHub username and email for this repository
git config --local user.name "your-github-username"
git config --local user.email "your-github-username@users.noreply.github.com"

# Verify configuration
git config --local user.name
git config --local user.email
```

**Note**: Using GitHub's noreply email (`username@users.noreply.github.com`) links commits to your GitHub account
without exposing your personal email. This also ensures correct attribution in GitHub's contributor statistics.

### 3. Dependency Installation

```bash
# Install project dependencies (uses exact versions from package-lock.json)
npm install
```

**Important**: This project tracks `package-lock.json` in git to ensure:

- **Reproducible Builds**: Exact same dependency versions across all environments
- **Security**: Locked versions prevent malicious updates
- **Team Consistency**: All developers get identical dependency trees
- **CI/CD Reliability**: Deterministic and predictable builds

### 4. Development Environment Verification

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

## Upstash Redis Setup

The application requires Upstash Redis for backend storage. This is required for both local development and production.

### Quick Setup

1. Create an Upstash account at [console.upstash.com](https://console.upstash.com)
2. Create a Redis database
3. Copy the REST API credentials
4. Create `.env.local` in the project root:

```bash
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

For detailed instructions, see [Upstash Setup Guide](upstash-setup.md).

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

### jq Installation

`jq` is a command-line JSON processor used by project scripts (e.g., GitHub Projects status updates).

```bash
# macOS (Homebrew)
brew install jq
```

For other platforms, see the [jq download page](https://jqlang.github.io/jq/download/).

**Alternative**: For GitHub CLI specific tasks, you can use the built-in `--jq` flag instead of
installing jq (e.g., `gh api repos/:owner/:repo --jq '.name'`).

### Claude Code with nvm

Claude Code runs bash commands in non-interactive shells that don't source `~/.zshrc`. This project includes a
SessionStart hook (`.claude/settings.json`) that automatically sources nvm via Claude Code's `CLAUDE_ENV_FILE`
mechanism (automatically managed by Claude Code - no user configuration needed).

**No action required**: If you have nvm installed in the standard location (`~/.nvm`), the hook works automatically.
The hook is compatible with nvm 0.39.x and later versions installed via the official installation script.

If you still see `npm: command not found`:

1. **Restart Claude Code** to trigger the SessionStart hook
2. **Manual fallback**: `source ~/.nvm/nvm.sh && npm install`
3. **Verify hook**: Check `.claude/settings.json` contains the SessionStart hook

See [ADR-030](../adr/030-claude-code-environment-hooks.md) for technical details.

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

## Claude Code Settings Management (Optional)

This section is optional and intended for developers who work across multiple projects and want to share
Claude Code settings via dotfiles.

### Settings Sharing with Dotfiles

Claude Code tool permissions are managed through `settings.local.json`. Use dotfiles with symlinks to maintain
a single source of truth across all projects.

**Canonical location**: `~/dotfiles/.claude/settings.local.json`

**Per-project**: `.claude/settings.local.json` → symlink to dotfiles

### Setup

Run the setup script from the repo:

```bash
./scripts/setup-claude-settings.sh
```

The script handles:

- Validation of dotfiles settings existence
- `.claude/` directory creation
- Symlink creation with error handling
- Clear feedback and troubleshooting guidance

See the script itself for detailed documentation and error messages.

### Transferring Settings to a New Computer

**On old computer:**

```bash
pbcopy < ~/dotfiles/.claude/settings.local.json
```

**Transfer to new computer** (via Slack, email, secure messaging, etc.)

**On new computer:**

```bash
mkdir -p ~/dotfiles/.claude
pbpaste > ~/dotfiles/.claude/settings.local.json
```

Then checkout your repo and run the setup script:

```bash
./scripts/setup-claude-settings.sh
```

The symlink will be created automatically, and all your tool permissions will be preserved across machines.

### Updating Settings

Edit the canonical file to update all projects:

```bash
code ~/dotfiles/.claude/settings.local.json
```

Changes apply automatically to all projects via symlinks.

### Benefits

- Single source of truth for personal settings
- Automatic updates across all projects
- Reduced setup friction for new projects

## Next Steps

After completing installation:

1. **Review Architecture**: Check [`docs/architecture/overview.md`](../architecture/overview.md) for project structure
2. **Development Workflow**: Read [`docs/development/workflow.md`](../development/workflow.md) for coding standards
3. **Project Management**: See [`docs/development/project-management.md`](../development/project-management.md) for issue
   workflow
4. **Contributing**: Review [README.md](../../README.md) for contribution guidelines

## Support

- **Claude Code Documentation**: <https://docs.claude.com/en/docs/claude-code/>
- **Project Issues**: <https://github.com/mikiwiik/my-first-claude-code/issues>
- **Technical Decisions**: Review [ADRs](../adr/) for architectural context

---

This guide ensures a consistent local development environment for all contributors to the Todo App project.
