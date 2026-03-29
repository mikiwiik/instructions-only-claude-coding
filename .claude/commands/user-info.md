---
description: Display current git and GitHub user information
---

Check current user identity for git and GitHub:

1. **Git Configuration**: Display local git user name and email
2. **GitHub User**: Show current authenticated GitHub user via MCP

**Git User**:

```bash
git config user.name
git config user.email
```

**GitHub User Details** (via MCP — returns structured login, name, email, bio, etc.):

Use the `mcp__github__get_me` tool to retrieve the authenticated GitHub user profile. Display the login, name, and
email from the structured response.

> **Note**: `gh auth status` has no MCP equivalent — authentication is implicit when MCP tools work successfully.
> If MCP user lookup fails, fall back to `gh api user --jq '.login + " (" + .name + ")"'`.

This command helps verify which user identity is active for commits and GitHub operations, which is especially
important for AI agent attribution in this project.
