---
description: Create PR, enable automerge, verify merge, and clean up local branches
---

Create a pull request for the current feature branch following the mandatory PR workflow.

**Current branch**: !`git branch --show-current`
**Commits on branch**: !`git log --oneline main..HEAD 2>/dev/null || echo "(unable to determine)"`

---

## Step 1: Pre-flight Checks

1. **Verify branch** follows `feature/XX-description` naming convention
2. **Extract issue number** from branch name (the `XX` portion)
3. **Verify pushed to remote**:
   - Run `git log origin/$(git branch --show-current)..HEAD 2>/dev/null`
   - If unpushed commits exist: `git push -u origin $(git branch --show-current)`

## Step 2: Create Pull Request (via MCP)

Use `mcp__github__create_pull_request` tool:
- `owner`: `mikiwiik`, `repo`: `instructions-only-claude-coding`
- `title`: Descriptive title following conventional commit format
- `head`: Current branch name, `base`: `main`
- `body`: Use this structure:
  ```
  ## Summary
  [Brief description]
  Closes #XX
  ```

> **Fallback**: If MCP fails, use `gh pr create --title "..." --body "..."`.

## Step 3: Enable Automerge with Rebase (MANDATORY)

```bash
gh pr merge <PR_NUMBER> --auto --rebase
```

No MCP equivalent exists for auto-merge — `gh` CLI is required.
`--rebase` preserves atomic commit history (per ADR-010).

## Step 4: Report Status & Session Naming

Report to user: PR URL, automerge status, waiting for CI + approvals.

Suggest: *"You may want to rename this session to `Issue #XX => PR #YY`"*

## Step 5: Verify Completion

**STOP and WAIT** for CI + approval to auto-merge.

Once merged, verify via MCP `mcp__github__issue_read` that issue state is **CLOSED**.

> **Fallback**: `gh issue view #XX --json state`

Only claim completion after PR merged and issue closed.

## Step 6: Post-Merge Local Cleanup

After confirming PR is merged:

```bash
git checkout main && git pull && git branch -d <merged-branch-name> && git remote prune origin
```

Report: "Deleted local branch `feature/XX-description`, pruned stale remote refs."

## Forbidden Actions

See [workflows.md](../../docs/core/workflows.md#forbidden-actions-without-user-permission) — never use
`--admin`, `--force`, or bypass branch protection without explicit user permission.
