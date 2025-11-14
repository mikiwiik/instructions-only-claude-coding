#!/bin/bash
# Setup script for Claude Code settings symlink
#
# PURPOSE:
#   Creates a symlink from .claude/settings.local.json to ~/dotfiles/.claude/settings.local.json
#   This enables shared Claude Code tool permissions across all projects.
#
# USAGE:
#   cd /path/to/project
#   ~/dotfiles/setup-claude-settings.sh
#
# ONE-TIME SETUP:
#   1. Create dotfiles directory:
#      mkdir -p ~/dotfiles/.claude
#
#   2. Copy your settings to dotfiles (if you have existing settings):
#      cp .claude/settings.local.json ~/dotfiles/.claude/settings.local.json
#
#   3. Or create new settings:
#      cat > ~/dotfiles/.claude/settings.local.json << 'EOF'
#      {
#        "permissions": {
#          "allow": ["Bash(git:*)", "Bash(gh:*)", "Bash(npm:*)"],
#          "deny": [],
#          "ask": []
#        }
#      }
#      EOF
#
# BEHAVIOR:
#   - Validates ~/dotfiles/.claude/settings.local.json exists
#   - Creates .claude/ directory if missing
#   - Creates symlink if not present
#   - Reports if symlink already exists
#   - ERRORS if regular file exists (requires manual merge/removal)
#
# UPDATING SETTINGS:
#   Edit ~/dotfiles/.claude/settings.local.json
#   Changes apply automatically to all projects via symlinks

set -e

DOTFILES_SETTINGS="$HOME/dotfiles/.claude/settings.local.json"
PROJECT_SETTINGS=".claude/settings.local.json"

# Check if dotfiles settings exist
if [ ! -f "$DOTFILES_SETTINGS" ]; then
  echo "❌ Error: $DOTFILES_SETTINGS not found"
  echo "Please create your dotfiles Claude settings first:"
  echo "  mkdir -p ~/dotfiles/.claude"
  echo "  cp .claude/settings.local.json ~/dotfiles/.claude/settings.local.json"
  exit 1
fi

# Create .claude directory if needed
if [ ! -d ".claude" ]; then
  mkdir .claude
  echo "✅ Created .claude directory"
fi

# Create symlink (error if file already exists)
if [ -L "$PROJECT_SETTINGS" ]; then
  echo "✅ Symlink already exists: $PROJECT_SETTINGS"
elif [ -f "$PROJECT_SETTINGS" ]; then
  echo "❌ Error: $PROJECT_SETTINGS already exists as a regular file"
  echo "Please manually review and remove it before running this script:"
  echo "  1. Review your current settings: cat $PROJECT_SETTINGS"
  echo "  2. Merge any unique settings into: $DOTFILES_SETTINGS"
  echo "  3. Remove the file: rm $PROJECT_SETTINGS"
  echo "  4. Re-run this script"
  exit 1
else
  ln -s "$DOTFILES_SETTINGS" "$PROJECT_SETTINGS"
  echo "✅ Symlink created: $PROJECT_SETTINGS"
fi
