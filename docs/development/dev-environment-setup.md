# Development Environment Setup

## Claude Code Settings Sharing

### Overview

Claude Code tool permissions are managed through `settings.local.json`. We use dotfiles with symlinks to maintain a
single source of truth across all projects.

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

When setting up Claude Code on a new computer, transfer your existing settings from your old machine:

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

**Then checkout your repo and run the setup script:**

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

## Related Documentation

- [Project Workflows](../core/workflows.md)
- [CLAUDE.md](../../CLAUDE.md)
