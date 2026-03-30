---
description: Create pull request following the agreed workflow in docs/core/workflows.md
---

Create a pull request for the current feature branch following the mandatory PR workflow.

**Current branch**: !`git branch --show-current`
**Commits on branch**: !`git log --oneline main..HEAD 2>/dev/null || echo "(unable to determine)"`

---

## Step 1: Pre-flight Checks

1. **Verify branch**: Confirm current branch follows `feature/XX-description` naming convention
2. **Extract issue number**: Parse from branch name (the `XX` in `feature/XX-description`)
3. **Verify pushed to remote**:
   - Run `git log origin/$(git branch --show-current)..HEAD 2>/dev/null`
   - If unpushed commits exist: `git push -u origin $(git branch --show-current)`

## Step 2: Create Pull Request (via MCP)

Use `mcp__github__create_pull_request` tool:
- `owner`: `mikiwiik`
- `repo`: `instructions-only-claude-coding`
- `title`: Descriptive title following conventional commit format
- `head`: Current branch name
- `base`: `main`
- `body`: PR description using this template:

```markdown
## Summary

[Brief description of changes]

## Implementation

[Key changes — max 2 bullets to avoid commitlint issues]

Closes #XX
```

**REQUIRED**: Include `Closes #XX` in PR body for automatic issue closure.

> **Fallback**: If MCP fails, use `gh pr create --title "..." --body "..."`.

## Step 3: Enable Automerge with Rebase (MANDATORY)

```bash
gh pr merge <PR_NUMBER> --auto --rebase
```

- **No MCP equivalent exists** for auto-merge — `gh` CLI is required
- `--rebase` preserves atomic commit history (per ADR-010)
- Automerge triggers when CI passes and approvals are received

## Step 4: Report Status & Session Naming

Report to user:
- ✅ PR URL and number
- ✅ Automerge enabled with rebase strategy
- ✅ Waiting for CI checks and required approvals

Suggest to the user: *"You may want to rename this session to `Issue #XX => PR #YY`"*

## Step 5: Verify Completion

**🛑 STOP and WAIT** for CI + approval to auto-merge.

Once PR is merged, verify via MCP `mcp__github__issue_read`:
- `owner`: `mikiwiik`, `repo`: `instructions-only-claude-coding`, `issue_number`: XX
- Confirm issue state is **CLOSED**

> **Fallback**: `gh issue view #XX --json state`

**Only claim completion after** PR merged and issue closed.

## Step 6: Post-Merge Local Cleanup

After confirming PR is merged:

1. **Switch to main and sync**:
   ```bash
   git checkout main && git pull
   ```

2. **Delete local feature branch** (safe delete — refuses if not fully merged):
   ```bash
   git branch -d <merged-branch-name>
   ```

3. **Prune stale remote tracking refs**:
   ```bash
   git remote prune origin
   ```

4. **Report cleanup**: "Deleted local branch `feature/XX-description`, pruned stale remote refs."

## 🚨 Forbidden Actions (Without Explicit User Permission)

**NEVER execute without user explicitly requesting:**
- `gh pr merge --admin` (bypass branch protection)
- `gh pr merge --force` (force merge)
- `git push --force` (rewrite history)
- `git push --force-with-lease` (conditional force push)
- Any command bypassing review requirements or branch protection

**When to ask user**: If CI checks are failing, branch protection is blocking, or any bypass is needed.
