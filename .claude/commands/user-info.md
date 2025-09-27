---
description: Display current git and GitHub user information
---

Check current user identity for git and GitHub:

1. **Git Configuration**: Display local git user name and email
2. **GitHub Authentication**: Check GitHub CLI authentication status
3. **GitHub User**: Show current authenticated GitHub user

**Git User**:

```bash
git config user.name
git config user.email
```

**GitHub Status**:

```bash
gh auth status
```

**GitHub User Details**:

```bash
gh api user --jq '.login + " (" + .name + ")"'
```

This command helps verify which user identity is active for commits and GitHub operations, which is especially
important for AI agent attribution in this project.
