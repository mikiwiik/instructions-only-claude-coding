# Auto-Merge Workflow Documentation

## Overview

This repository uses GitHub's built-in auto-merge feature combined with automatic PR approval to streamline
the development workflow while maintaining code quality through CI validation.

## How It Works

### 1. Automatic PR Approval

- Manual approval is required for standard PRs to satisfy branch protection rules
- Dependabot PRs automatically enable auto-merge via the `dependabot-auto-merge.yml` workflow
- All PRs must have 1 approval before merge (configured in branch protection)

### 2. GitHub Auto-Merge

- After creating a PR, auto-merge can be enabled using `gh pr merge --auto`
- The PR will automatically merge when:
  - CI checks pass (Build and Test workflow)
  - PR has required approval (provided by auto-approve workflow)
  - Branch is up to date with main

### 3. Complete Workflow

```bash
# 1. Create feature branch
git checkout -b feature/XX-description

# 2. Make changes and commit
git add .
git commit -m "feat: implement feature X

Closes #XX"

# 3. Push branch
git push -u origin feature/XX-description

# 4. Create PR
gh pr create --title "Feature: Description" --body "Closes #XX"

# 5. Enable auto-merge with rebase
gh pr merge --auto --rebase

# PR will merge automatically when CI passes!
```

### 4. Dependabot Auto-Merge

Dependabot PRs are fully automated:

- When Dependabot creates a PR, the `dependabot-auto-merge.yml` workflow runs
- Auto-merge with rebase is automatically enabled
- PR merges when CI passes and approval is obtained
- No manual intervention required

This preserves atomic commits from Dependabot while ensuring all changes pass CI before merge.

## Benefits

1. **Zero Manual Overhead**: No need to manually approve or merge PRs
2. **CI Protection**: Code only merges if all tests pass
3. **Audit Trail**: Every change has a PR record
4. **Branch Protection**: Direct pushes to main are blocked
5. **Automatic Issue Closure**: Issues close when PR merges

## Configuration Requirements

### Repository Settings

- ✅ Auto-merge enabled: Settings → General → "Allow auto-merge"
- ✅ Branch protection with 1 approval required
- ✅ Required status checks (Build and Test)

### Workflow Files

- `.github/workflows/dependabot-auto-merge.yml` - Automatically enables auto-merge for Dependabot PRs
- `.github/workflows/build.yml` - CI workflow that must pass before merge

## Troubleshooting

### Auto-merge not working?

1. Check that auto-merge is enabled in repository settings
2. Verify CI is passing with `gh pr checks`
3. Ensure PR has approval (should be automatic)
4. Check if branch needs updating with `gh pr view`

### PR stuck in "Waiting for status checks"?

- CI may be running, wait for completion
- Check Actions tab for workflow status
- Use `gh run list` to see running workflows

### Manual fallback

If auto-merge fails, you can always merge manually:

```bash
gh pr merge --rebase
```

## Security Considerations

- Dependabot auto-merge only enables merge automation, approval still required
- All code still goes through CI validation before merge
- Branch protection prevents direct pushes to main
- Force pushes and deletions are blocked
- Dependabot PRs use rebase strategy to preserve atomic commits
