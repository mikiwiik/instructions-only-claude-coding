# SonarLint IDE Setup Guide

Get real-time code quality feedback in your IDE with SonarLint connected to SonarCloud.

## Overview

**SonarLint** provides real-time code quality analysis as you type. When connected to SonarCloud (Connected Mode), it
applies the same rules and quality standards used in CI/CD, giving you instant feedback before committing code.

### Benefits

- 🎯 **Real-time feedback** - See code quality issues while typing, not after CI fails
- 🚀 **Faster development** - Catch bugs, code smells, and security issues immediately
- 📚 **Learning tool** - Inline explanations help you understand best practices
- 🔄 **Consistent standards** - Same quality rules locally as in CI/CD pipeline

### How It Complements CI/CD

- **Local Development** (SonarLint) - Real-time analysis as you type
- **Pull Requests** (SonarCloud) - PR decorations and quality gate checks
- **Post-Merge** (SonarCloud) - Full project analysis on main branch

For SonarCloud CI/CD setup, see [SonarCloud Setup Guide](sonarcloud-setup.md).

## Project-Specific Configuration

Use these values when setting up SonarLint for this project:

- **Organization**: `mikiwiik`
- **Project Key**: `mikiwiik_instructions-only-claude-coding`
- **SonarCloud URL**: <https://sonarcloud.io>

## Getting Started with Your IDE

### Generate SonarCloud Token

Before setting up any IDE, generate a user token for authentication:

1. Visit <https://sonarcloud.io/account/security/>
2. Create a new token:
   - **Token Name**: `SonarLint-[YourName]-[Device]` (e.g., `SonarLint-John-MacBook`)
   - **Type**: User Token
3. **Copy and save the token** (starts with `sqp_`) - it won't be shown again

### VS Code

**Official Setup Guide**: <https://docs.sonarsource.com/sonarlint/vs-code/team-features/connected-mode-setup/>

**Quick Summary**:

1. Install extension: Search "SonarQube for IDE" in VS Code Extensions
2. Add SonarCloud connection using your token
3. Bind to project using the project-specific configuration above
4. Commit `.sonarlint/` folder to share configuration with team

**Extension Page**: <https://marketplace.visualstudio.com/items?itemName=SonarSource.sonarlint-vscode>

### IntelliJ IDEA / WebStorm

**Official Setup Guide**: <https://docs.sonarsource.com/sonarlint/intellij/team-features/connected-mode/>

**Quick Summary**:

1. Install plugin: Search "SonarQube for IDE" in Settings → Plugins
2. Add SonarCloud connection using your token
3. Bind project to `mikiwiik_instructions-only-claude-coding`
4. Configuration is stored in `.idea/sonarlint/` (typically gitignored)

**Plugin Page**: <https://plugins.jetbrains.com/plugin/7973-sonarqube-for-ide>

### Other IDEs

SonarLint is also available for Eclipse, Sublime Text, and Vim/Neovim. See the
[official SonarLint documentation](https://docs.sonarsource.com/sonarlint/) for setup guides.

## Troubleshooting

### Verify Configuration

Ensure you're using the correct project values:

- **Organization**: `mikiwiik`
- **Project Key**: `mikiwiik_instructions-only-claude-coding`

### Common Issues

**Connection failures**: Verify token at <https://sonarcloud.io/account/security/>

**Missing decorations**: Check that project binding is configured correctly

**Different rules than CI/CD**: SonarLint syncs quality profile from SonarCloud - try unbinding and rebinding

For detailed troubleshooting, see the [official SonarLint troubleshooting guides](https://docs.sonarsource.com/sonarlint/).

## Resources

- **[Official SonarLint Documentation](https://docs.sonarsource.com/sonarlint/)** - Comprehensive setup and usage
  guides
- **[SonarCloud Project Dashboard](https://sonarcloud.io/project/overview?id=mikiwiik_instructions-only-claude-coding)**
  - View analysis results
- **[SonarCloud Rules](https://rules.sonarsource.com/)** - Explore quality rules and explanations
- **[SonarCloud CI/CD Setup](sonarcloud-setup.md)** - Configure SonarCloud in GitHub Actions
