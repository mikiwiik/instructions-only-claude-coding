# SonarLint IDE Setup Guide

Complete guide for setting up SonarLint in your IDE to get real-time code quality feedback during development.

## Overview

**SonarLint** is an IDE extension that provides real-time code quality analysis as you type. When connected to
SonarCloud (Connected Mode), it applies the same rules and quality standards used in CI/CD, giving you instant feedback
before committing code.

### Benefits of SonarLint

- 🎯 **Real-time feedback** - See code quality issues while typing, not after CI fails
- 🚀 **Faster development** - Catch bugs, code smells, and security issues immediately
- 📚 **Learning tool** - Inline explanations help you understand best practices
- 🔄 **Consistent standards** - Same quality rules locally as in CI/CD pipeline
- 💡 **IDE integration** - Squiggly lines, quick fixes, and rule descriptions in your editor

### How It Complements CI/CD

SonarLint works alongside the existing SonarCloud CI/CD integration:

- **Local Development** (SonarLint) - Real-time analysis as you type
- **Pull Requests** (SonarCloud) - PR decorations and quality gate checks
- **Post-Merge** (SonarCloud) - Full project analysis on main branch

For SonarCloud CI/CD setup, see [SonarCloud Setup Guide](sonarcloud-setup.md).

## Project Configuration

**Organization**: `mikiwiik`
**Project Key**: `mikiwiik_instructions-only-claude-coding`
**Project URL**: <https://sonarcloud.io/project/overview?id=mikiwiik_instructions-only-claude-coding>

## VS Code Setup

### Step 1: Install Extension

1. Open VS Code
2. Go to **Extensions** (Cmd+Shift+X on macOS, Ctrl+Shift+X on Windows/Linux)
3. Search for **"SonarQube for IDE"** (formerly SonarLint)
4. Click **Install** on the extension by SonarSource
5. Reload VS Code if prompted

**Extension ID**: `SonarSource.sonarlint-vscode`
**Marketplace**: <https://marketplace.visualstudio.com/items?itemName=SonarSource.sonarlint-vscode>

### Step 2: Create SonarCloud Connection

1. Open the **SONARLINT** view in the VS Code Activity Bar (left sidebar)
2. Navigate to **CONNECTED MODE** section
3. Click **Add SonarCloud Connection**
4. Enter connection details:
   - **Connection Name**: `mikiwiik-sonarcloud` (or any friendly name)
   - **Organization Key**: `mikiwiik`

### Step 3: Generate User Token

You need a SonarCloud token for authentication:

1. Visit <https://sonarcloud.io/account/security/>
2. Sign in to SonarCloud
3. Under **Generate Tokens**:
   - **Token Name**: `SonarLint-[YourName]-[Device]` (e.g., `SonarLint-John-MacBook`)
   - **Type**: User Token
   - Click **Generate**
4. **Copy the token** (starts with `sqp_`)
   - ⚠️ **Important**: Save this token securely - it won't be shown again

### Step 4: Complete Connection Setup

1. Return to VS Code
2. Paste the token when prompted
3. Click **Save Connection**

### Step 5: Bind Project

1. In the **CONNECTED MODE** view, click **Add Project Binding**
2. Select your connection: `mikiwiik-sonarcloud`
3. Choose the workspace folder (if multiple folders open)
4. Select the remote project: `mikiwiik_instructions-only-claude-coding`
5. Confirm binding

SonarLint will create a `.sonarlint/` folder with binding configuration. This folder should be committed to version
control so teammates can use the same configuration.

### Step 6: Verify Setup

1. Open a TypeScript file in the project (e.g., `app/components/TodoList.tsx`)
2. Introduce a code issue (e.g., unused variable):

   ```typescript
   const unusedVariable = 'test'; // Should show squiggly line
   ```

3. You should see:
   - **Squiggly line** under the issue
   - **Problem** listed in the Problems panel (Cmd+Shift+M / Ctrl+Shift+M)
   - **Rule details** when hovering over the issue

4. Check the **SONARLINT** output panel:
   - View → Output → Select "SonarLint" from dropdown
   - Should show "Connected to SonarCloud"

### Configuration File

SonarLint creates `.sonarlint/mikiwiik-sonarcloud-project-binding.json`:

```json
{
  "connectionId": "mikiwiik-sonarcloud",
  "projectKey": "mikiwiik_instructions-only-claude-coding"
}
```

**Commit this file** to share the configuration with your team.

## IntelliJ IDEA / WebStorm Setup

### Step 1: Install Plugin

1. Open **Settings/Preferences** (Cmd+, on macOS, Ctrl+Alt+S on Windows/Linux)
2. Go to **Plugins**
3. Search for **"SonarLint"**
4. Click **Install**
5. Restart IDE when prompted

**Plugin Page**: <https://plugins.jetbrains.com/plugin/7973-sonarlint>

### Step 2: Generate User Token

Generate a SonarCloud token (same as VS Code):

1. Visit <https://sonarcloud.io/account/security/>
2. **Token Name**: `SonarLint-[YourName]-IntelliJ` (e.g., `SonarLint-John-IntelliJ`)
3. Click **Generate** and copy the token (starts with `sqp_`)

### Step 3: Create SonarCloud Connection

1. Open **Settings/Preferences** → **Tools** → **SonarLint**
2. Under **SonarQube / SonarCloud connections**, click **+** (Add)
3. Select **SonarCloud**
4. Enter connection details:
   - **Connection Name**: `mikiwiik-sonarcloud`
   - **Organization Key**: `mikiwiik`
   - **User Token**: Paste the token from Step 2
5. Click **Next**, then **Finish**

### Step 4: Bind Project

1. Go to **Settings/Preferences** → **Tools** → **SonarLint** → **Project Settings**
2. Check **Bind project to SonarQube / SonarCloud**
3. Select connection: `mikiwiik-sonarcloud`
4. **Project key**: `mikiwiik_instructions-only-claude-coding`
5. Click **OK**

### Step 5: Verify Setup

1. Open a TypeScript file (e.g., `app/components/TodoList.tsx`)
2. Introduce a code issue (unused variable, etc.)
3. You should see:
   - **Warning highlights** in the editor
   - **Issues** in the SonarLint tool window (View → Tool Windows → SonarLint)
   - **Rule descriptions** when clicking on issues

4. Check the **SonarLint Log** tab:
   - View → Tool Windows → SonarLint → Log tab
   - Should show connection to SonarCloud

### Configuration Storage

IntelliJ stores binding configuration in `.idea/sonarlint/`:

- `.idea/sonarlint/connectedMode.xml` - Connection details
- `.idea/sonarlint/securityhotspotstore/` - Security analysis cache

**Note**: The `.idea/` folder is typically in `.gitignore`. Team members will need to configure their own bindings,
but the process is quick once tokens are generated.

## Other IDEs

### Eclipse

**Plugin**: SonarLint for Eclipse
**Installation**: Eclipse Marketplace → Search "SonarLint"
**Documentation**: <https://docs.sonarsource.com/sonarlint/eclipse/>

Setup follows similar pattern: Install plugin → Generate token → Create connection → Bind project.

### Sublime Text

**Package**: SonarLint LSP
**Installation**: Package Control → Install "SonarLint"
**Documentation**: <https://github.com/SonarSource/sonarlint-sublime>

Requires Language Server Protocol support.

### Vim / Neovim

**Plugin**: Available via LSP clients (e.g., coc-sonarlint, nvim-lspconfig)
**Documentation**: <https://github.com/SonarSource/sonarlint-language-server>

Advanced setup - requires manual LSP configuration.

## Understanding SonarLint Feedback

### Issue Severity Levels

- 🔴 **Blocker** - Critical bug that will cause application failure
- 🟠 **Critical** - High-impact bug or security vulnerability
- 🟡 **Major** - Medium-impact bug or code smell
- 🔵 **Minor** - Low-impact issue
- ⚪ **Info** - Suggestion for improvement

### Issue Types

- **🐛 Bug** - Code likely to cause unexpected behavior
- **🔒 Security Vulnerability** - Code with known security risks
- **🔓 Security Hotspot** - Security-sensitive code requiring review
- **💨 Code Smell** - Maintainability issue

### Viewing Rule Details

**VS Code**:

- Hover over the issue → Click **Show Rule Description**
- Opens detailed explanation with examples and remediation

**IntelliJ/WebStorm**:

- Click issue in SonarLint tool window → See rule details in right panel
- Includes description, examples, and how to fix

## Troubleshooting

### Connection Issues

**Symptom**: "Failed to connect to SonarCloud"

**Solutions**:

1. **Verify token**:
   - Check token hasn't expired
   - Generate new token at <https://sonarcloud.io/account/security/>
   - Update connection with new token

2. **Check organization key**:
   - Confirm `mikiwiik` is correct organization
   - Visit <https://sonarcloud.io/organizations/mikiwiik> to verify

3. **Network/Proxy**:
   - Ensure SonarCloud (<https://sonarcloud.io>) is accessible
   - Configure proxy settings in IDE if behind corporate firewall

### Missing Decorations

**Symptom**: No squiggly lines or issues shown

**Solutions**:

1. **Verify file is in scope**:
   - SonarLint analyzes files in bound project
   - Check file type is supported (TypeScript, JavaScript, etc.)

2. **Check binding**:
   - VS Code: SONARLINT → CONNECTED MODE → Verify binding shows
   - IntelliJ: Settings → Tools → SonarLint → Project Settings → Verify binding

3. **Refresh binding**:
   - VS Code: Right-click connection → **Update All Project Bindings**
   - IntelliJ: SonarLint tool window → Refresh icon

4. **Restart IDE**:
   - Sometimes connection requires IDE restart to activate

### Authentication Problems

**Symptom**: "Invalid token" or "Authentication failed"

**Solutions**:

1. **Generate new token**:
   - Visit <https://sonarcloud.io/account/security/>
   - Revoke old token (if shown)
   - Create new token
   - Update connection in IDE with new token

2. **Verify token permissions**:
   - Token must have permissions to access organization and project
   - If part of organization, ensure you have member access

### Wrong Rules Applied

**Symptom**: Different issues locally vs. CI/CD

**Solutions**:

1. **Update binding**:
   - SonarLint syncs quality profile from SonarCloud
   - Force update: Unbind and rebind project

2. **Check quality profile**:
   - Visit <https://sonarcloud.io/organizations/mikiwiik/quality_profiles>
   - Ensure project uses correct profile (default: Sonar way)

3. **Clear cache**:
   - VS Code: Command Palette → "SonarLint: Clear SonarLint Cache"
   - IntelliJ: File → Invalidate Caches → Restart

### Performance Issues

**Symptom**: Slow typing, IDE lag during analysis

**Solutions**:

1. **Adjust analysis scope**:
   - VS Code: Settings → SonarLint → Excluded Files
   - IntelliJ: Settings → Tools → SonarLint → File Exclusions
   - Exclude `node_modules/`, `.next/`, `coverage/` if not already excluded

2. **Disable specific rules**:
   - If certain rules are performance-heavy, disable locally
   - VS Code: Settings → SonarLint → Rules
   - IntelliJ: Settings → Tools → SonarLint → Rules

## Next Steps

- **Review Issues**: Check SonarLint panel for existing issues in codebase
- **Learn Rules**: Read rule descriptions to understand code quality standards
- **Configure Exclusions**: Adjust settings if needed for your workflow
- **Share Setup**: Help teammates configure SonarLint using this guide

## Additional Resources

- **SonarLint Documentation**: <https://docs.sonarsource.com/sonarlint/>
- **SonarCloud Rules**: <https://rules.sonarsource.com/>
- **SonarCloud Project**: <https://sonarcloud.io/project/overview?id=mikiwiik_instructions-only-claude-coding>
- **Community Support**: <https://community.sonarsource.com/>

## Related Documentation

- **[SonarCloud CI/CD Setup](sonarcloud-setup.md)** - Configure SonarCloud analysis in GitHub Actions
- **[Development Workflow](../development/workflow.md)** - Project coding standards and practices
- **[Installation Guide](installation.md)** - Development environment setup
