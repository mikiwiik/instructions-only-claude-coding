# ADR-030: Claude Code Environment Hooks for nvm Support

**Status**: Accepted
**Date**: 2025-12-07
**Deciders**: Development Team

## Summary

Configure Claude Code SessionStart hooks to automatically initialize nvm, ensuring npm/node/npx commands
work without manual intervention.

## Context

### Problem

Claude Code runs bash commands in non-interactive shells that don't source `~/.zshrc` or `~/.bashrc`.
When developers use nvm (Node Version Manager), npm/node/npx are not in PATH, causing:

- `npm: command not found`
- `npx: command not found` (breaks pre-commit hooks via husky)
- `node: command not found`

### Discovery

This issue was discovered during routine dependency updates when `npm audit` failed with
"command not found". The workaround required prefixing every command with `source ~/.nvm/nvm.sh &&`.

### Claude Code Hook System

Claude Code provides a hook system with:

- **SessionStart**: Runs once when Claude Code starts
- **CLAUDE_ENV_FILE**: A file that Claude Code sources before every bash command

This enables automatic environment setup without modifying system configuration.

## Decision

Implement a SessionStart hook in `.claude/settings.json` that writes nvm initialization to `CLAUDE_ENV_FILE`.

### Configuration

File: `.claude/settings.json` (committed to git, shared with all contributors)

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'export NVM_DIR=\"$HOME/.nvm\"; [ -s \"$NVM_DIR/nvm.sh\" ] && . \"$NVM_DIR/nvm.sh\"' >> \"$CLAUDE_ENV_FILE\""
          }
        ]
      }
    ]
  }
}
```

Note: `.gitignore` was updated to only ignore `settings.local.json` (personal tool permissions),
allowing `settings.json` to be committed for project-level hooks.

### How It Works

1. User starts Claude Code session
2. SessionStart hook executes
3. nvm initialization script appended to `CLAUDE_ENV_FILE`
4. Every subsequent bash command sources this file
5. npm/node/npx available automatically

## Rationale

### Why SessionStart Hook?

- **Automatic**: No manual intervention required
- **Project-level**: Shared via git, all contributors benefit
- **Non-invasive**: Doesn't modify user's shell configuration
- **Idempotent**: Safe to run multiple times (nvm script handles this)

### Why Not Alternatives?

| Alternative                | Reason Rejected               |
| -------------------------- | ----------------------------- |
| Manual prefixing           | Error-prone, repetitive       |
| Wrapper scripts            | Must remember to use them     |
| System PATH modification   | Invasive, affects other tools |
| User-level Claude settings | Not shared with team          |

## Consequences

### Positive

- All npm/node/npx commands work automatically
- Pre-commit hooks (husky) function correctly
- No manual intervention for nvm users
- Configuration shared via git repository
- Works on macOS and Linux

### Negative

- Requires Claude Code hook support (available)
- Small startup overhead (negligible)
- Developers without nvm see harmless warning (silent if nvm not present)

### Neutral

- Developers still need nvm installed
- Configuration stored in `.claude/settings.json`

## Implementation

### Files Created/Modified

| File                         | Change                                                        |
| ---------------------------- | ------------------------------------------------------------- |
| `.claude/settings.json`      | New file with SessionStart hook                               |
| `.gitignore`                 | Un-ignore `settings.json` (only ignore `settings.local.json`) |
| `CLAUDE.md`                  | Document environment setup                                    |
| `docs/setup/installation.md` | Add troubleshooting section                                   |

### Verification

After implementation:

```bash
# Start fresh Claude Code session, then:
npm --version    # Should work without prefixing
node --version   # Should work without prefixing
git commit       # Pre-commit hooks should work
```

## References

- [Claude Code Hooks Documentation](https://docs.claude.com/en/docs/claude-code/hooks)
- [nvm GitHub Repository](https://github.com/nvm-sh/nvm)
